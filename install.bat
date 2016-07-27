@echo off

set TFDIR=C:\Program Files (x86)\Steam\steamapps\common\Team Fortress 2\tf
set TFDD=%TFDIR%

echo Begin install > install.log
echo :: Welcome to nullifiedcat's tfscript installer!

:notfound
if exist "%TFDIR%\gameinfo.txt" goto found
echo Invalid directory %TFDIR% >> install.log
echo tf folder not found, please provide path to tf folder (Find instructions in README.md)
echo It should look like %TFDD%
set /P TFDIR="Path (you can paste with right-click): "
goto notfound

:found
echo Team Fortress 2 found! Installing script and sounds
robocopy tf "%TFDIR%" /E > nul
echo exec tfscript >> "%TFDIR%/cfg/autoexec.cfg"
echo Downloading dependencies
call npm install >> install.log
node configure "%TFDIR%"
echo :: tfscript by nullifiedcat is installed successfully
if not exist "data\uid.txt" echo. > data\uid.txt
echo !!! DO NOT FORGET TO PUT YOUR UID IN UID.TXT FILE !!!
pause
