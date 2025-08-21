on run argv
	
	set userPath to POSIX path of (path to current user folder as text)
	
	set AppleScript's text item delimiters to "~/"
	
	set fileOne to item 1 of argv
	set newFileOne to userPath & second text item of fileOne
	set fileTwo to item 2 of argv
	set newFileTwo to userPath & second text item of fileTwo
	set mergedFile to item 3 of argv
	set pageNumbers to item 4 of argv
	
	--set newMergedFile to userPath & second text item of mergedFile
	--display dialog mergedFile
	--"/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py" -o PATH/TO/YOUR/MERGED/FILE.pdf /PATH/TO/ORIGINAL/1.pdf /PATH/TO/ANOTHER/2.pdf /PATH/TO/A/WHOLE/DIR/*.pdf
	--display dialog "'/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py' -o " & quoted form of mergedFile & " " & quoted form of newFileOne & " " & quoted form of newFileTwo
	if pageNumbers is "2" then
		do shell script "'/System/Library/Automator/Combine PDF Pages.action/Contents/Resources/join.py' -o " & quoted form of mergedFile & " " & quoted form of newFileOne & " " & quoted form of newFileTwo
	end if
end run