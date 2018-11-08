@echo off
title Furry Bot
cd %~dp0
:start
node sharder.js --expose-gc
goto start