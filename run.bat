@echo off
title Furry Bot
cd %~dp0
:start
node . --expose-gc
goto start