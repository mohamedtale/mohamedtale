@echo off
chcp 65001 > nul
echo جاري إيقاف النظام...
cd /d "%~dp0"
docker compose down
echo تم إيقاف النظام
pause
