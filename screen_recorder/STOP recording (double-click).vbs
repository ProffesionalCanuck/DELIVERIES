' Double-click this file to STOP recording.
' It signals the hidden recorder to finish and save everything.
Option Explicit
Dim fso, here
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
fso.CreateTextFile(here & "\stop_recording.flag", True).Close
