# Activity Screen Recorder

A small desktop tool that records **your own screen** to local video files,
but **only while you're actually active** (moving the mouse or typing). When
you stop for a while it pauses automatically, so you don't end up with hours
of an idle desktop. You can turn recording **off and on** at any time.

It's meant to be a straightforward, visible tool you run on a computer you own
or administer — for example to keep a private log of a work session, document
what you did while troubleshooting, or build a rolling record of activity on
your own machine.

## What it does (and deliberately doesn't do)

- **Activity-triggered.** A mouse/keyboard listener is used only as an
  "is the user active?" signal. When there's been no input for a few seconds
  (configurable), recording pauses; it resumes on the next movement or keypress.
- **Not a keylogger.** It records *that* you were active, never *which* keys
  you pressed. Key identities are ignored.
- **Local & private.** Video is written to a folder you choose on your own
  disk. Nothing is uploaded or sent over the network.
- **On/off control.** Toggle from the button in the window, or with a global
  hotkey (default `Ctrl+Alt+R`) even when the window isn't focused. It starts
  **off** by default.
- **Visible by design.** The window stays on top and shows a colored status
  dot so it's obvious when recording is active. It is not a hidden/stealth
  tool and intentionally has no features to conceal itself.

## Install

Requires Python 3.9+.

```bash
cd screen_recorder
pip install -r requirements.txt
# On Debian/Ubuntu also: sudo apt install python3-tk
```

## Run

```bash
python activity_recorder.py
```

Then click **Turn ON**. A red dot means it's recording; blue means it's on but
paused because you've been idle; yellow means it's armed and waiting.

### Useful options

```bash
python activity_recorder.py --output ~/Recordings   # where to save
python activity_recorder.py --fps 12                # frames per second (default 8)
python activity_recorder.py --idle-timeout 10       # pause after 10s idle (default 5)
python activity_recorder.py --monitor 1             # 0 = all screens, 1 = first monitor, ...
python activity_recorder.py --hotkey '<ctrl>+<alt>+s'
python activity_recorder.py --start-on              # begin recording immediately
python activity_recorder.py --headless              # no window; toggle via hotkey, Ctrl+C to quit
```

Recordings are named `recording_YYYYMMDD_HHMMSS.mp4` (a new file each time
activity resumes after a pause) and land in the output folder — by default
`~/ScreenRecordings`.

## Notes & permissions

- **macOS:** the first run will prompt for **Screen Recording** and
  **Accessibility** permissions (System Settings → Privacy & Security). Grant
  both to your terminal/Python, then restart the app.
- **Linux:** capture uses the X server. Under Wayland you may need an Xorg
  session (or an XWayland-compatible setup). Install `python3-tk` for the GUI.
- **Windows:** no extra setup; the standard Python installer includes tkinter.
- The global hotkey needs OS input permissions; if it can't be registered the
  app still works via the on-screen button and prints a note.

## Responsible use

Record only screens you own or are authorized to record, and make sure anyone
whose activity might be captured knows about it. Recording people without their
knowledge or consent can be illegal depending on where you are — this tool is
built to be overt and under your control, and it's on you to use it that way.
