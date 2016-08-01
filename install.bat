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
echo Team Fortress 2 found! Copying script files
robocopy tf "%TFDIR%" /E > nul
if exist "%TFDIR%\cfg\.tfse_installed" goto installed
echo exec tfscript >> "%TFDIR%\cfg\autoexec.cfg"
echo echo tfse_class scout >> "%TFDIR\cfg\scout.cfg"
echo echo tfse_class soldier >> "%TFDIR\cfg\soldier.cfg"
echo echo tfse_class pyro >> "%TFDIR\cfg\pyro.cfg"
echo echo tfse_class demoman >> "%TFDIR\cfg\demoman.cfg"
echo echo tfse_class heavyweapons >> "%TFDIR\cfg\heavyweapons.cfg"
echo echo tfse_class engineer >> "%TFDIR\cfg\engineer.cfg"
echo echo tfse_class medic >> "%TFDIR\cfg\medic.cfg"
echo echo tfse_class sniper >> "%TFDIR\cfg\sniper.cfg"
echo echo tfse_class spy >> "%TFDIR\cfg\spy.cfg"
echo "tfse configs generated" > "%TFDIR\cfg\.tfse_installed"

:installed
echo Downloading dependencies
call npm install >> install.log
node tfscript setup "%TFDIR%"
echo :: tfscript by nullifiedcat is installed successfully
if not exist "data\uid.txt" echo. > data\uid.txt
echo !!! DO NOT FORGET TO PUT YOUR UID IN uid.txt FILE !!!
pause
