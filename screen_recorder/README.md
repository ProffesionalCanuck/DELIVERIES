# Activity Screen Recorder

Records **your own screen** to video files on your own computer, but **only
while the mouse or keyboard is being used** — so idle time isn't recorded. You
turn it on when you want (for example before bed) and off when you're done. It
can run **invisibly** (no window), and it saves everything locally — nothing is
ever uploaded.

It also writes a plain-text `activity_log.txt` listing the exact times activity
was recorded, and burns a date/time stamp into each video, so you can see when
things happened.

> It records the computer it runs on. Use it on a computer you own. It does
> **not** record which keys are pressed — it only notices activity to know when
> to record.

---

## Simple setup (Windows)

Do the steps in order. Copy-paste one command at a time.

### Step 1 — Install Python (one time)

Download Python from https://www.python.org/downloads/ and run the installer.
**Important:** on the first screen, tick the box **"Add python.exe to PATH"**,
then click Install.

### Step 2 — Install the pieces it needs (one time)

Open the **screen_recorder** folder in File Explorer. Click the address bar,
type `cmd`, and press Enter — a black window opens in this folder. Paste this
one line and press Enter:

```
pip install -r requirements.txt
```

Wait until it finishes, then close the black window.

### Step 3 — Test it once (recommended)

1. Double-click **`START recording (double-click).vbs`**. (Nothing visible
   happens — that's correct, it's running hidden.)
2. Move your mouse around for about 15 seconds.
3. Double-click **`STOP recording (double-click).vbs`**.
4. Open the folder **`ScreenRecordings`** inside your user folder
   (`C:\Users\YOUR-NAME\ScreenRecordings`). You should see a video file and an
   `activity_log.txt`. If you do, it works.

> If Step 1's "Add to PATH" box was missed, double-clicking START will silently
> do nothing. Redo Step 1 (re-run the installer → *Modify* → tick "Add to
> PATH"), or see "If double-click does nothing" below.

### Every night — start it

Double-click **`START recording (double-click).vbs`**. It's now recording
invisibly whenever the mouse/keyboard is used.

### Every morning — stop it and look

1. Double-click **`STOP recording (double-click).vbs`**.
2. Open `C:\Users\YOUR-NAME\ScreenRecordings`.
3. Open `activity_log.txt` to see the exact times there was activity overnight,
   and play the newest video files (sorted by date) to see what happened.

---

## Where things are saved

- Videos: `C:\Users\YOUR-NAME\ScreenRecordings\recording_YYYYMMDD_HHMMSS.mp4`
  (a new file each time activity starts after a pause).
- Timeline: `C:\Users\YOUR-NAME\ScreenRecordings\activity_log.txt`.

## If double-click STOP doesn't work

Any one of these also stops it:

- Press **Ctrl + Alt + Q** on the keyboard.
- Open **Task Manager** (Ctrl+Shift+Esc) → find **pythonw** → End task.

## If double-click START does nothing

Open the black `cmd` window in the folder (see Step 2) and run this to see the
error message:

```
python activity_recorder.py --headless --start-on
```

Press **Ctrl + C** in that window to stop it. (This way shows a window, so it's
only for testing.)

---

## Options (advanced)

Run from a command window with any of these:

```
python activity_recorder.py --help
```

| Option | What it does | Default |
| --- | --- | --- |
| `--output FOLDER` | Where to save videos | `~/ScreenRecordings` |
| `--fps N` | Frames per second (higher = smoother, bigger files) | `8` |
| `--idle-timeout S` | Pause after this many seconds of no activity | `5` |
| `--monitor N` | `0` = all screens, `1` = first monitor, etc. | `0` |
| `--headless` | No window at all; starts recording immediately | off |
| `--start-on` | Start already recording (window mode) | off |
| `--hotkey` | Global on/off key | `<ctrl>+<alt>+r` |
| `--quit-hotkey` | Global quit key | `<ctrl>+<alt>+q` |
| `--no-timestamp` | Don't stamp date/time into the video | stamped |
| `--no-log` | Don't write `activity_log.txt` | log on |

Running `python activity_recorder.py` with no options opens a small window with
an on/off button and a status light (grey = off, yellow = waiting, red =
recording, blue = paused).

## macOS / Linux

The program itself is cross-platform. The double-click `.vbs` files are
Windows-only; on macOS/Linux run `python3 activity_recorder.py --headless
--start-on` and stop it with Ctrl+Alt+Q or by creating the stop file. On macOS
you must grant **Screen Recording** and **Accessibility** permission (System
Settings → Privacy & Security). On Linux, an Xorg session works best, and you
may need `sudo apt install python3-tk` for the optional window.

## Responsible use

Record only a computer you own or are allowed to record. If you're gathering
this to show someone or to raise it with family, the date-stamped videos and
the `activity_log.txt` timeline are what make it credible. And the quickest way
to stop the access entirely is to set a login password and lock the screen
(Windows key + L) whenever you step away.
