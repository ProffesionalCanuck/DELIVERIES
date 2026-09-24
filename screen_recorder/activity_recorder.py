#!/usr/bin/env python3
"""Activity-triggered screen recorder.

Records *your own* screen to local video files, but only while there is
mouse or keyboard activity, so idle time is skipped. Turn it off and on with
a global hotkey or the on-screen button, or run it invisibly in the
background (see --headless and the START/STOP double-click files).

What this program is and is not:
  * It records the machine it runs on. Use it only on a computer you own or
    administer. See README.md.
  * Mouse/keyboard input is used ONLY as an "is someone active?" signal. It
    never records which keys are pressed -- it is not a keylogger.
  * Recordings and the text log stay in a local folder you choose. Nothing is
    sent over the network.
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


STATE_DISABLED = "disabled"
STATE_ARMED = "armed"
STATE_RECORDING = "recording"
STATE_IDLE = "idle"

STATE_LABELS = {
    STATE_DISABLED: "Off",
    STATE_ARMED: "On - waiting for activity",
    STATE_RECORDING: "● Recording",
    STATE_IDLE: "On - paused (no activity)",
}


def _timestamp() -> str:
    return _dt.datetime.now().strftime("%Y%m%d_%H%M%S")


def open_in_file_manager(path) -> None:
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
    recorded or inspected.
    """

    def __init__(self) -> None:
        self._last = time.monotonic()
        self._lock = threading.Lock()
        self._mouse_listener = None
        self._keyboard_listener = None

    def _mark(self, *_args, **_kwargs) -> None:
        with self._lock:
            self._last = time.monotonic()

    def _on_key(self, _key) -> None:
        # Ignores which key was pressed; just marks that activity happened.
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
        output_dir,
        fps: int = 8,
        idle_timeout: float = 5.0,
        monitor_index: int = 0,
        timestamp_overlay: bool = True,
        log_events: bool = True,
        enabled: bool = False,
    ) -> None:
        self.output_dir = Path(output_dir).expanduser()
        self.fps = max(1, int(fps))
        self.idle_timeout = float(idle_timeout)
        self.monitor_index = int(monitor_index)
        self.timestamp_overlay = bool(timestamp_overlay)
        self.log_events = bool(log_events)

        self._enabled = threading.Event()
        if enabled:
            self._enabled.set()

        self._stop = threading.Event()
        self._thread = None
        self._monitor = ActivityMonitor()
        self._log_lock = threading.Lock()

        self._stat_lock = threading.Lock()
        self._state = STATE_DISABLED
        self._current_file = None
        self._segment_frames = 0
        self._segment_started_at = None
        self._total_segments = 0
        self._last_error = None

    @property
    def log_path(self):
        return self.output_dir / "activity_log.txt"

    # -- toggle API --
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

    # -- stats --
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

    def _log(self, msg: str) -> None:
        if not self.log_events:
            return
        line = "%s  %s\n" % (_dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), msg)
        try:
            with self._log_lock:
                self.output_dir.mkdir(parents=True, exist_ok=True)
                with open(self.log_path, "a", encoding="utf-8") as fh:
                    fh.write(line)
        except Exception:
            pass

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
        monitors = sct.monitors  # index 0 = full virtual screen
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
        self._log("activity detected - recording started -> %s" % filename.name)
        return writer

    def _close_writer(self, writer) -> None:
        if writer is not None:
            try:
                writer.release()
            except Exception:
                pass
        with self._stat_lock:
            cur = self._current_file
            frames = self._segment_frames
            started = self._segment_started_at
            self._current_file = None
            self._segment_started_at = None
        if cur is not None:
            secs = (time.monotonic() - started) if started else 0.0
            self._log(
                "recording stopped -> %s (%d frames, %.0fs)"
                % (Path(cur).name, frames, secs)
            )

    def _draw_timestamp(self, frame):
        """Burn a date/time stamp into the top-left of the frame (for evidence)."""
        text = _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        font = cv2.FONT_HERSHEY_SIMPLEX
        scale, thick = 0.6, 1
        (tw, th), base = cv2.getTextSize(text, font, scale, thick)
        x, y = 10, 12 + th
        cv2.rectangle(frame, (x - 6, y - th - 8), (x + tw + 6, y + base + 4), (0, 0, 0), -1)
        cv2.putText(frame, text, (x, y), font, scale, (255, 255, 255), thick, cv2.LINE_AA)
        return frame

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
                    if writer is not None:
                        self._close_writer(writer)
                        writer = None
                    self._set_state(STATE_IDLE)
                    time.sleep(0.2)
                    continue

                try:
                    monitor = self._grab_monitor(sct)
                    raw = sct.grab(monitor)
                    frame = np.asarray(raw)  # BGRA
                    # drop alpha -> BGR (cv2 order); copy so it is writable+contiguous
                    frame = np.ascontiguousarray(frame[:, :, :3])
                    if self.timestamp_overlay:
                        self._draw_timestamp(frame)

                    height, width = frame.shape[:2]
                    if writer is None:
                        target_size = (width, height)
                        writer = self._new_writer(width, height)
                    elif (width, height) != target_size:
                        self._close_writer(writer)
                        target_size = (width, height)
                        writer = self._new_writer(width, height)

                    writer.write(frame)
                    with self._stat_lock:
                        self._segment_frames += 1
                        self._last_error = None
                    self._set_state(STATE_RECORDING)
                except Exception as exc:
                    with self._stat_lock:
                        self._last_error = str(exc)
                    self._set_state(STATE_ARMED)
                    time.sleep(0.5)

                elapsed = time.monotonic() - loop_start
                remaining = frame_interval - elapsed
                if remaining > 0:
                    time.sleep(remaining)

        if writer is not None:
            self._close_writer(writer)


# ----------------------------------------------------------------------------
# Global hotkeys (optional)
# ----------------------------------------------------------------------------
class GlobalHotkeys:
    """Registers global hotkeys from a {combo: callback} mapping."""

    def __init__(self, mapping: dict) -> None:
        self.mapping = mapping
        self._listener = None

    def start(self) -> bool:
        try:
            self._listener = keyboard.GlobalHotKeys(self.mapping)
            self._listener.start()
            return True
        except Exception as exc:  # pragma: no cover - platform dependent
            print("Global hotkeys unavailable: %s" % exc)
            self._listener = None
            return False

    def stop(self) -> None:
        if self._listener is not None:
            try:
                self._listener.stop()
            except Exception:
                pass


# ----------------------------------------------------------------------------
# Stop-flag watcher (lets a double-click STOP file end a hidden run)
# ----------------------------------------------------------------------------
def start_flag_watcher(stop_flag: Path, quit_event: threading.Event) -> threading.Thread:
    def _watch():
        while not quit_event.is_set():
            try:
                if stop_flag.exists():
                    try:
                        stop_flag.unlink()
                    except Exception:
                        pass
                    quit_event.set()
                    break
            except Exception:
                pass
            time.sleep(0.5)

    t = threading.Thread(target=_watch, name="stop-flag", daemon=True)
    t.start()
    return t


# ----------------------------------------------------------------------------
# GUI
# ----------------------------------------------------------------------------
def run_gui(recorder: Recorder, toggle_combo: str, quit_combo: str, quit_event) -> None:
    import tkinter as tk
    from tkinter import filedialog, ttk

    root = tk.Tk()
    root.title("Activity Screen Recorder")
    root.attributes("-topmost", True)
    try:
        root.minsize(440, 300)
    except Exception:
        pass

    main = ttk.Frame(root, padding=14)
    main.pack(fill="both", expand=True)

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

    settings = ttk.LabelFrame(main, text="Settings", padding=10)
    settings.pack(fill="x", pady=(4, 8))

    ttk.Label(settings, text="Frames/sec:").grid(row=0, column=0, sticky="w")
    fps_var = tk.IntVar(value=recorder.fps)
    ttk.Spinbox(settings, from_=1, to=30, width=6, textvariable=fps_var).grid(
        row=0, column=1, sticky="w", padx=(6, 16)
    )

    ttk.Label(settings, text="Pause after idle (s):").grid(row=0, column=2, sticky="w")
    idle_var = tk.DoubleVar(value=recorder.idle_timeout)
    ttk.Spinbox(
        settings, from_=1, to=120, increment=1, width=6, textvariable=idle_var
    ).grid(row=0, column=3, sticky="w", padx=(6, 0))

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

    folder_row = ttk.Frame(main)
    folder_row.pack(fill="x", pady=(0, 6))

    def choose_folder() -> None:
        chosen = filedialog.askdirectory(initialdir=str(recorder.output_dir))
        if chosen:
            recorder.output_dir = Path(chosen)
            refresh()

    ttk.Button(folder_row, text="Change folder…", command=choose_folder).pack(side="left")
    ttk.Button(
        folder_row, text="Open folder", command=lambda: open_in_file_manager(recorder.output_dir)
    ).pack(side="left", padx=(6, 0))

    keys = "Hotkeys: %s = on/off, %s = quit" % (
        toggle_combo.replace("<", "").replace(">", ""),
        quit_combo.replace("<", "").replace(">", ""),
    )
    ttk.Label(main, text=keys, foreground="#777777").pack(anchor="w", pady=(4, 0))
    ttk.Label(
        main,
        text="Records only while active. Saved locally; nothing is uploaded.",
        foreground="#777777",
        wraplength=410,
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
                "Segment: %d frames, %.0fs  |  segments this run: %d"
                % (snap["segment_frames"], snap["segment_elapsed"], snap["total_segments"])
            )
        else:
            detail_var.set("Segments recorded this run: %d" % snap["total_segments"])
        cur = snap["current_file"]
        file_var.set(
            ("Writing: %s" % Path(cur).name) if cur is not None
            else ("Folder: %s" % snap["output_dir"])
        )

    def tick() -> None:
        if quit_event is not None and quit_event.is_set():
            on_close()
            return
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
# Headless mode (no window)
# ----------------------------------------------------------------------------
def run_headless(recorder: Recorder, quit_event: threading.Event) -> None:
    last_state = None
    try:
        while not quit_event.is_set():
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
        pass


# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------
def parse_args(argv=None) -> argparse.Namespace:
    default_dir = Path.home() / "ScreenRecordings"
    default_flag = Path(__file__).resolve().with_name("stop_recording.flag")
    parser = argparse.ArgumentParser(
        description="Record your own screen, but only while you are active."
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
        "--no-timestamp", action="store_true",
        help="Do not burn a date/time stamp into the video.",
    )
    parser.add_argument(
        "--no-log", action="store_true",
        help="Do not write the activity_log.txt timeline.",
    )
    parser.add_argument(
        "--hotkey", default="<ctrl>+<alt>+r",
        help="Global on/off hotkey (default: <ctrl>+<alt>+r)",
    )
    parser.add_argument(
        "--quit-hotkey", default="<ctrl>+<alt>+q",
        help="Global quit hotkey (default: <ctrl>+<alt>+q)",
    )
    parser.add_argument(
        "--stop-flag", default=str(default_flag),
        help="If this file appears, the program stops (used by the STOP file).",
    )
    parser.add_argument(
        "--start-on", action="store_true",
        help="Begin with recording enabled (default: starts OFF).",
    )
    parser.add_argument(
        "--headless", action="store_true",
        help="Run without any window (start recording immediately; no console needed).",
    )
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)

    recorder = Recorder(
        output_dir=Path(args.output),
        fps=args.fps,
        idle_timeout=args.idle_timeout,
        monitor_index=args.monitor,
        timestamp_overlay=not args.no_timestamp,
        log_events=not args.no_log,
        enabled=args.start_on or args.headless,
    )
    recorder.start()

    # Clear any stale stop flag, then watch for a new one.
    quit_event = threading.Event()
    stop_flag = Path(args.stop_flag)
    try:
        if stop_flag.exists():
            stop_flag.unlink()
    except Exception:
        pass
    start_flag_watcher(stop_flag, quit_event)

    hotkeys = GlobalHotkeys(
        {args.hotkey: recorder.toggle, args.quit_hotkey: quit_event.set}
    )
    hotkeys.start()

    recorder._log("program launched (%s mode)" % ("headless" if args.headless else "window"))
    print("Recordings folder: %s" % recorder.output_dir)
    print("On/off hotkey: %s   Quit hotkey: %s" % (args.hotkey, args.quit_hotkey))

    try:
        if args.headless:
            run_headless(recorder, quit_event)
        else:
            try:
                run_gui(recorder, args.hotkey, args.quit_hotkey, quit_event)
            except Exception as exc:
                print("GUI unavailable (%s); running without a window." % exc)
                if not recorder.enabled:
                    recorder.set_enabled(True)
                run_headless(recorder, quit_event)
    finally:
        hotkeys.stop()
        recorder.shutdown()
        recorder._log("program stopped")
        print("Stopped. Files saved in: %s" % recorder.output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
