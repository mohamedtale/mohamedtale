#!/bin/bash
# تشغيل نظام إدارة الموارد البشرية

echo "========================================="
echo "  نظام إدارة الموارد البشرية"
echo "  الجهاز التنفيذي لحفر وصيانة آبار المياه"
echo "========================================="
echo ""

# التحقق من وجود Docker
if ! command -v docker &> /dev/null; then
    echo "خطأ: Docker غير مثبت. يرجى تثبيت Docker أولاً."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "خطأ: Docker Compose غير مثبت."
    exit 1
fi

# تشغيل النظام
echo "جاري تشغيل النظام..."
cd "$(dirname "$0")"

if docker compose version &> /dev/null 2>&1; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ تم تشغيل النظام بنجاح"
    echo ""
    echo "افتح المتصفح على الرابط: http://localhost:3000"
    echo ""
    echo "لإيقاف النظام: ./stop.sh"
else
    echo "خطأ في تشغيل النظام. راجع السجلات بالأمر: docker compose logs"
fi
