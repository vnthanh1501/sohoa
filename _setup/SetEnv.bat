@echo off
::Set up the environment variable for tesseract engine
	cd /d %~dp0
	setx PATH "%cd%\..\controllers\modules\tesseract;%PATH%" 
	setx TESSDATA_PREFIX "%cd%\..\controllers\modules\tesseract\tessdata"
echo ________________________________________________ 
echo The environment variables have been set!
echo You can open the program now by running 'DocumentDigitization.bat'
echo ________________________________________________ 
node CreateInitAdmin
pause