@echo off
npm list furrybot | grep -Po "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" > version.tmp
set /p NPM_VERSION= < version.tmp
del version.tmp
FOR /f "tokens=2 delims==" %%G in ('wmic os get localdatetime /value') do set datetime=%%G & SET BUILD=%datetime:~0,4%%datetime:~4,2%%datetime:~6,2%

set NEW_VERSION=%NPM_VERSION%-%BUILD%

echo Adding build number %BUILD% onto the version mumber %NPM_VERSION%
npm version %NEW_VERSION% --allow-same-version --no-git-tag-version
