#!/usr/bin/env python3
"""Activity-triggered screen recorder.

Records *your own* screen to local video files, but only while there is
mouse or keyboard activity, so idle time is skipped. It can be turned off
and on from a button in the window or from a global hotkey.

Design notes / what this program is and is not:
  * It records the machine it runs on. Use it only on computers you own or
    administer, and with the knowledge of anyone whose activity might be
    captured. See README.md.
  * Mouse and keyboard input are used ONLY as an "is the user active?"
    signal. The program never records *which* keys are pressed -- it is not
    a keylogger.
  * Recordings are written to a local folder you choose. Nothing is sent
    over the network. "Private" here means local-only.
  * The window is a visible, on-top recording indicator by design. It is
    meant to be an obvious, user-controlled tool, not a hidden one.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import os
import platform
import subprocess
import sys
import threading
import time
from pathlib import Path

# ----------------------------------------------------------------------------
# Dependency imports with friendly messages
# ----------------------------------------------------------------------------
_MISSING = []
try:
    import numpy as np
except ImportError:  # pragma: no cover
    _MISSING.append("numpy")
try:
    import cv2
except ImportError:  # pragma: no cover
    _MISSING.append("opencv-python")
try:
    import mss
except ImportError:  # pragma: no cover
    _MISSING.append("mss")
try:
    from pynput import keyboard, mouse
except ImportError:  # pragma: no cover
    _MISSING.append("pynput")

if _MISSING:
    sys.stderr.write(
        "Missing required packages: %s\n"
        "Install them with:\n"
        "    pip install -r requirements.txt\n"
        "or\n"
        "    pip install %s\n" % (", ".join(_MISSING), " ".join(_MISSING))
    )
    sys.exit(1)


# States reported to the UI / console.
STATE_DISABLED = "disabled"        # toggle is OFF
STATE_ARMED = "armed"              # ON, waiting for activity
STATE_RECORDING = "recording"      # ON, activity present, capturing
STATE_IDLE = "idle"                # ON, but paused because no activity

STATE_LABELS = {
    STATE_DISABLED: "Off",
    STATE_ARMED: "On - waiting for activity",
    STATE_RECORDING: "● Recording",
    STATE_IDLE: "On - paused (no activity)",
}


def _timestamp() -> str:
    return _dt.datetime.now().strftime("%Y%m%d_%H%M%S")


def open_in_file_manager(path: Path) -> None:
    """Open a folder in the OS file manager (best effort)."""
    path = str(path)
    try:
        if platform.system() == "Windows":
            os.startfile(path)  # type: ignore[attr-defined]
        elif platform.system() == "Darwin":
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])
    except Exception as exc:  # pragma: no cover - platform dependent
        print("Could not open folder %s: %s" % (path, exc))


# ----------------------------------------------------------------------------
# Activity monitor
# ----------------------------------------------------------------------------
class ActivityMonitor:
    """Tracks the time of the most recent mouse/keyboard activity.

    Only the *timestamp* of activity is stored. Key identities are never
    recorded or inspected -- on_press simply notes that some key was used.
    """

    def __init__(self) -> None:
        self._last = time.monotonic()
        self._lock = threading.Lock()
        self._mouse_listener = None
        self._keyboard_listener = None

    # -- listener callbacks (kept intentionally minimal) --
    def _mark(self, *_args, **_kwargs) -> None:
        with self._lock:
            self._last = time.monotonic()

    def _on_key(self, _key) -> None:
        # Deliberately ignores which key was pressed; just marks activity.
        self._mark()

    def start(self) -> None:
        self._mouse_listener = mouse.Listener(
            on_move=self._mark, on_click=self._mark, on_scroll=self._mark
        )
        self._keyboard_listener = keyboard.Listener(on_press=self._on_key)
        self._mouse_listener.start()
        self._keyboard_listener.start()

    def stop(self) -> None:
        for listener in (self._mouse_listener, self._keyboard_listener):
            if listener is not None:
                try:
                    listener.stop()
                except Exception:
                    pass

    def seconds_since_activity(self) -> float:
        with self._lock:
            return time.monotonic() - self._last


# ----------------------------------------------------------------------------
# Recorder
# ----------------------------------------------------------------------------
class Recorder:
    """Captures the screen to segmented video files while active."""

    def __init__(
        self,
        output_dir: Path,
        fps: int = 8,
        idle_timeout: float = 5.0,
        monitor_index: int = 0,
        enabled: bool = False,
    ) -> None:
        self.output_dir = Path(output_dir).expanduser()
        self.fps = max(1, int(fps))
        self.idle_timeout = float(idle_timeout)
        self.monitor_index = int(monitor_index)

        self._enabled = threading.Event()
        if enabled:
            self._enabled.set()

        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._monitor = ActivityMonitor()

        # Stats/state for the UI (guarded by _stat_lock).
        self._stat_lock = threading.Lock()
        self._state = STATE_DISABLED
        self._current_file: Path | None = None
        self._segment_frames = 0
        self._segment_started_at: float | None = None
        self._total_segments = 0
        self._last_error: str | None = None

    # -- public toggle API --
    @property
    def enabled(self) -> bool:
        return self._enabled.is_set()

    def set_enabled(self, value: bool) -> None:
        if value:
            self._enabled.set()
        else:
            self._enabled.clear()

    def toggle(self) -> bool:
        self.set_enabled(not self.enabled)
        return self.enabled

    # -- stats accessors --
    def snapshot(self) -> dict:
        with self._stat_lock:
            seg_elapsed = (
                time.monotonic() - self._segment_started_at
                if self._segment_started_at is not None
                else 0.0
            )
            return {
                "state": self._state,
                "current_file": self._current_file,
                "segment_frames": self._segment_frames,
                "segment_elapsed": seg_elapsed,
                "total_segments": self._total_segments,
                "error": self._last_error,
                "output_dir": self.output_dir,
            }

    def _set_state(self, state: str) -> None:
        with self._stat_lock:
            self._state = state

    # -- lifecycle --
    def start(self) -> None:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self._monitor.start()
        self._thread = threading.Thread(target=self._run, name="capture", daemon=True)
        self._thread.start()

    def shutdown(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=5.0)
        self._monitor.stop()

    # -- capture helpers --
    def _grab_monitor(self, sct) -> dict:
        monitors = sct.monitors  # index 0 is the full virtual screen
        idx = self.monitor_index
        if idx < 0 or idx >= len(monitors):
            idx = 0
        return monitors[idx]

    def _new_writer(self, width: int, height: int):
        self.output_dir.mkdir(parents=True, exist_ok=True)
        filename = self.output_dir / ("recording_%s.mp4" % _timestamp())
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(str(filename), fourcc, float(self.fps), (width, height))
        if not writer.isOpened():
            # Fall back to a very widely supported AVI/XVID combo.
            filename = self.output_dir / ("recording_%s.avi" % _timestamp())
            fourcc = cv2.VideoWriter_fourcc(*"XVID")
            writer = cv2.VideoWriter(str(filename), fourcc, float(self.fps), (width, height))
        if not writer.isOpened():
            raise RuntimeError("Could not open a video writer (codec unavailable).")
        with self._stat_lock:
            self._current_file = filename
            self._segment_frames = 0
            self._segment_started_at = time.monotonic()
            self._total_segments += 1
        return writer

    def _close_writer(self, writer) -> None:
        if writer is not None:
            try:
                writer.release()
            except Exception:
                pass
        with self._stat_lock:
            self._current_file = None
            self._segment_started_at = None

    def _run(self) -> None:
        frame_interval = 1.0 / self.fps
        writer = None
        target_size = None

        with mss.mss() as sct:
            while not self._stop.is_set():
                loop_start = time.monotonic()

                if not self.enabled:
                    if writer is not None:
                        self._close_writer(writer)
                        writer = None
                    self._set_state(STATE_DISABLED)
                    time.sleep(0.15)
                    continue

                idle = self._monitor.seconds_since_activity()
                if idle > self.idle_timeout:
                    # No recent activity -> pause and finalize the segment.
                    if writer is not None:
                        self._close_writer(writer)
                        writer = None
                    self._set_state(STATE_IDLE)
                    time.sleep(0.2)
                    continue

                # Active: capture a frame.
                try:
                    monitor = self._grab_monitor(sct)
                    raw = sct.grab(monitor)
                    frame = np.asarray(raw)  # BGRA
                    frame = frame[:, :, :3]  # drop alpha -> BGR (what cv2 wants)

                    height, width = frame.shape[:2]
                    if writer is None:
                        target_size = (width, height)
                        writer = self._new_writer(width, height)
                    elif (width, height) != target_size:
                        # Resolution changed (e.g. monitor swap); start fresh.
                        self._close_writer(writer)
                        target_size = (width, height)
                        writer = self._new_writer(width, height)

                    writer.write(frame)
                    with self._stat_lock:
                        self._segment_frames += 1
                        self._last_error = None
                    self._set_state(STATE_RECORDING)
                except Exception as exc:  # keep the thread alive on transient errors
                    with self._stat_lock:
                        self._last_error = str(exc)
                    self._set_state(STATE_ARMED)
                    time.sleep(0.5)

                # Maintain target FPS.
                elapsed = time.monotonic() - loop_start
                remaining = frame_interval - elapsed
                if remaining > 0:
                    time.sleep(remaining)

        # Clean shutdown.
        if writer is not None:
            self._close_writer(writer)


# ----------------------------------------------------------------------------
# Global hotkey (optional)
# ----------------------------------------------------------------------------
class HotkeyToggle:
    """Registers a global hotkey that toggles the recorder on/off."""

    def __init__(self, combo: str, callback) -> None:
        self.combo = combo
        self.callback = callback
        self._listener = None

    def start(self) -> bool:
        try:
            self._listener = keyboard.GlobalHotKeys({self.combo: self.callback})
            self._listener.start()
            return True
        except Exception as exc:  # pragma: no cover - platform dependent
            print("Global hotkey unavailable (%s): %s" % (self.combo, exc))
            self._listener = None
            return False

    def stop(self) -> None:
        if self._listener is not None:
            try:
                self._listener.stop()
            except Exception:
                pass


# ----------------------------------------------------------------------------
# GUI
# ----------------------------------------------------------------------------
def run_gui(recorder: Recorder, hotkey_combo: str) -> None:
    import tkinter as tk
    from tkinter import filedialog, ttk

    root = tk.Tk()
    root.title("Activity Screen Recorder")
    root.attributes("-topmost", True)  # visible, on-top indicator by design
    try:
        root.minsize(430, 300)
    except Exception:
        pass

    main = ttk.Frame(root, padding=14)
    main.pack(fill="both", expand=True)

    # Toggle button + status dot.
    toggle_var = tk.StringVar()
    status_var = tk.StringVar()
    detail_var = tk.StringVar()
    file_var = tk.StringVar()

    header = ttk.Frame(main)
    header.pack(fill="x")
    dot = tk.Canvas(header, width=18, height=18, highlightthickness=0)
    dot_id = dot.create_oval(3, 3, 15, 15, fill="#888888", outline="")
    dot.pack(side="left", padx=(0, 8))
    ttk.Label(header, textvariable=status_var, font=("TkDefaultFont", 12, "bold")).pack(
        side="left"
    )

    def do_toggle() -> None:
        recorder.toggle()
        refresh()

    toggle_btn = ttk.Button(main, textvariable=toggle_var, command=do_toggle)
    toggle_btn.pack(fill="x", pady=(12, 6))

    ttk.Label(main, textvariable=detail_var).pack(anchor="w")
    ttk.Label(main, textvariable=file_var, foreground="#555555").pack(
        anchor="w", pady=(2, 8)
    )

    # Settings frame.
    settings = ttk.LabelFrame(main, text="Settings", padding=10)
    settings.pack(fill="x", pady=(4, 8))

    ttk.Label(settings, text="Frames/sec:").grid(row=0, column=0, sticky="w")
    fps_var = tk.IntVar(value=recorder.fps)
    fps_spin = ttk.Spinbox(settings, from_=1, to=30, width=6, textvariable=fps_var)
    fps_spin.grid(row=0, column=1, sticky="w", padx=(6, 16))

    ttk.Label(settings, text="Pause after idle (s):").grid(row=0, column=2, sticky="w")
    idle_var = tk.DoubleVar(value=recorder.idle_timeout)
    idle_spin = ttk.Spinbox(
        settings, from_=1, to=120, increment=1, width=6, textvariable=idle_var
    )
    idle_spin.grid(row=0, column=3, sticky="w", padx=(6, 0))

    def apply_settings(*_a) -> None:
        try:
            recorder.fps = max(1, int(fps_var.get()))
        except Exception:
            pass
        try:
            recorder.idle_timeout = float(idle_var.get())
        except Exception:
            pass

    fps_var.trace_add("write", apply_settings)
    idle_var.trace_add("write", apply_settings)

    # Output folder row.
    folder_row = ttk.Frame(main)
    folder_row.pack(fill="x", pady=(0, 6))

    def choose_folder() -> None:
        chosen = filedialog.askdirectory(initialdir=str(recorder.output_dir))
        if chosen:
            recorder.output_dir = Path(chosen)
            refresh()

    ttk.Button(folder_row, text="Change folder…", command=choose_folder).pack(
        side="left"
    )
    ttk.Button(
        folder_row, text="Open folder", command=lambda: open_in_file_manager(recorder.output_dir)
    ).pack(side="left", padx=(6, 0))

    hint = "Hotkey: %s toggles on/off" % hotkey_combo.replace("<", "").replace(">", "")
    ttk.Label(main, text=hint, foreground="#777777").pack(anchor="w", pady=(4, 0))
    ttk.Label(
        main,
        text="Records only while you are active. Saved locally; nothing is uploaded.",
        foreground="#777777",
        wraplength=400,
        justify="left",
    ).pack(anchor="w", pady=(2, 0))

    dot_colors = {
        STATE_DISABLED: "#888888",
        STATE_ARMED: "#e0a800",
        STATE_RECORDING: "#d9342b",
        STATE_IDLE: "#2b7bd9",
    }

    def refresh() -> None:
        snap = recorder.snapshot()
        state = snap["state"]
        status_var.set(STATE_LABELS.get(state, state))
        dot.itemconfig(dot_id, fill=dot_colors.get(state, "#888888"))
        toggle_var.set("Turn OFF" if recorder.enabled else "Turn ON")

        if snap["error"]:
            detail_var.set("Error: %s" % snap["error"])
        elif state == STATE_RECORDING:
            detail_var.set(
                "Segment: %d frames, %.0fs  |  total segments this run: %d"
                % (snap["segment_frames"], snap["segment_elapsed"], snap["total_segments"])
            )
        else:
            detail_var.set("Segments recorded this run: %d" % snap["total_segments"])

        cur = snap["current_file"]
        if cur is not None:
            file_var.set("Writing: %s" % Path(cur).name)
        else:
            file_var.set("Folder: %s" % snap["output_dir"])

    def tick() -> None:
        refresh()
        root.after(250, tick)

    def on_close() -> None:
        recorder.set_enabled(False)
        root.after(150, root.destroy)

    root.protocol("WM_DELETE_WINDOW", on_close)
    refresh()
    tick()
    root.mainloop()


# ----------------------------------------------------------------------------
# Headless mode
# ----------------------------------------------------------------------------
def run_headless(recorder: Recorder) -> None:
    last_state = None
    try:
        while True:
            snap = recorder.snapshot()
            if snap["state"] != last_state:
                last_state = snap["state"]
                msg = STATE_LABELS.get(last_state, last_state)
                cur = snap["current_file"]
                if cur is not None:
                    msg += "  ->  %s" % Path(cur).name
                print("[%s] %s" % (_dt.datetime.now().strftime("%H:%M:%S"), msg))
            time.sleep(0.4)
    except KeyboardInterrupt:
        print("\nStopping...")


# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------
def parse_args(argv=None) -> argparse.Namespace:
    default_dir = Path.home() / "ScreenRecordings"
    parser = argparse.ArgumentParser(
        description="Record your own screen, but only while you are active. "
        "Toggle on/off from the window or a global hotkey."
    )
    parser.add_argument(
        "-o", "--output", default=str(default_dir),
        help="Folder for recordings (default: %(default)s)",
    )
    parser.add_argument("--fps", type=int, default=8, help="Frames per second (default: 8)")
    parser.add_argument(
        "--idle-timeout", type=float, default=5.0,
        help="Seconds of no input before recording pauses (default: 5)",
    )
    parser.add_argument(
        "--monitor", type=int, default=0,
        help="Monitor index; 0 = all monitors combined (default: 0)",
    )
    parser.add_argument(
        "--hotkey", default="<ctrl>+<alt>+r",
        help="Global toggle hotkey in pynput format (default: <ctrl>+<alt>+r)",
    )
    parser.add_argument(
        "--start-on", action="store_true",
        help="Begin with recording enabled (default: starts OFF).",
    )
    parser.add_argument(
        "--headless", action="store_true",
        help="Run without a window (toggle via hotkey; Ctrl+C to quit).",
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)

    recorder = Recorder(
        output_dir=Path(args.output),
        fps=args.fps,
        idle_timeout=args.idle_timeout,
        monitor_index=args.monitor,
        enabled=args.start_on or args.headless,
    )
    recorder.start()

    hotkey = HotkeyToggle(args.hotkey, recorder.toggle)
    hotkey.start()

    print("Recordings folder: %s" % recorder.output_dir)
    print("Toggle hotkey: %s" % args.hotkey)

    try:
        if args.headless:
            run_headless(recorder)
        else:
            try:
                run_gui(recorder, args.hotkey)
            except Exception as exc:
                print("GUI unavailable (%s); falling back to headless mode." % exc)
                print("Press Ctrl+C to stop.")
                if not recorder.enabled:
                    recorder.set_enabled(True)
                run_headless(recorder)
    finally:
        hotkey.stop()
        recorder.shutdown()
        print("Stopped. Files saved in: %s" % recorder.output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
