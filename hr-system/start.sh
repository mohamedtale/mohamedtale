#!/bin/bash
# تشغيل نظام إدارة الموارد البشرية

echo "========================================="
echo "  نظام إدارة الموارد البشرية"
echo "  الجهاز التنفيذي لحفر وصيانة آبار المياه"
echo "========================================="
echo ""

cd "$(dirname "$0")"

# ── التحقق من Docker ──────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
    echo "❌  Docker غير مثبت."
    echo "    للتثبيت: https://docs.docker.com/engine/install/"
    exit 1
fi

COMPOSE_CMD=""
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌  Docker Compose غير مثبت."
    exit 1
fi

# ── إعداد ملف .env ────────────────────────────────────────────────────────
ENV_FILE="./backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "⚙️   إنشاء ملف الإعدادات لأول مرة..."
    cp ./backend/.env.example "$ENV_FILE"

    # توليد JWT_SECRET قوي تلقائياً
    if command -v node &> /dev/null; then
        JWT=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    elif command -v openssl &> /dev/null; then
        JWT=$(openssl rand -hex 64)
    else
        JWT=$(cat /dev/urandom | tr -dc 'a-f0-9' | fold -w 128 | head -n 1)
    fi

    sed -i "s/CHANGE_THIS_TO_A_STRONG_RANDOM_64_CHAR_SECRET/$JWT/" "$ENV_FILE"
    echo "✅  تم توليد مفتاح تشفير آمن تلقائياً"
fi

# تصدير JWT_SECRET لـ docker-compose
export JWT_SECRET=$(grep '^JWT_SECRET=' "$ENV_FILE" | cut -d'=' -f2-)

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "CHANGE_THIS_TO_A_STRONG_RANDOM_64_CHAR_SECRET" ]; then
    echo "❌  يرجى تعيين JWT_SECRET في الملف: $ENV_FILE"
    exit 1
fi

# ── الحصول على IP الجهاز ─────────────────────────────────────────────────
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$LOCAL_IP" ] && LOCAL_IP="localhost"

# ── تشغيل النظام ─────────────────────────────────────────────────────────
echo "🚀  جاري تشغيل النظام..."
echo ""

$COMPOSE_CMD up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✅  النظام يعمل بنجاح!"
    echo "========================================="
    echo ""
    echo "  🌐  الرابط المحلي:    http://localhost:3000"
    echo "  🌐  رابط الشبكة:     http://$LOCAL_IP:3000"
    echo ""
    echo "  👤  المستخدم:   admin"
    echo "  🔑  كلمة المرور: password"
    echo "  ⚠️   غيّر كلمة المرور فور الدخول!"
    echo ""
    echo "  لإيقاف النظام: ./stop.sh"
    echo "  لعرض السجلات:  docker compose logs -f"
    echo "========================================="
else
    echo ""
    echo "❌  فشل تشغيل النظام."
    echo "    راجع السجلات: $COMPOSE_CMD logs"
fi
