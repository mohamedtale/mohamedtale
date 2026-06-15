@echo off
chcp 65001 > nul
echo =========================================
echo   نظام إدارة الموارد البشرية
echo   الجهاز التنفيذي لحفر وصيانة آبار المياه
echo =========================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo خطأ: Docker غير مثبت. يرجى تثبيت Docker Desktop أولاً.
    pause
    exit /b 1
)

echo جاري تشغيل النظام...
cd /d "%~dp0"
docker compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo تم تشغيل النظام بنجاح
    echo.
    echo افتح المتصفح على الرابط: http://localhost:3000
    echo.
    start http://localhost:3000
) else (
    echo خطأ في تشغيل النظام.
)
pause
