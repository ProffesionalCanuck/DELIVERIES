' Double-click this file to START recording, invisibly (no window shows up).
' It records your screen only while the mouse/keyboard is being used, and saves
' videos to the ScreenRecordings folder in your user account.
Option Explicit
Dim fso, sh, here, flag
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh  = CreateObject("WScript.Shell")
here = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = here
flag = here & "\stop_recording.flag"
If fso.FileExists(flag) Then fso.DeleteFile flag
' pythonw runs Python with no console window; 0 = hidden window.
sh.Run "pythonw """ & here & "\activity_recorder.py"" --headless --start-on", 0, False
