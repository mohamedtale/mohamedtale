#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
import os

font_paths = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
]
for fp in font_paths:
    if os.path.exists(fp):
        pdfmetrics.registerFont(TTFont('ArabicFont', fp))
        break

FONT = 'ArabicFont'

def ar(text):
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

GOLD  = colors.HexColor('#C5A059')
NAVY  = colors.HexColor('#0F172A')
NAVY2 = colors.HexColor('#1E293B')
WHITE = colors.white
LIGHT = colors.HexColor('#F1F5F9')
GRAY  = colors.HexColor('#94A3B8')

doc = SimpleDocTemplate(
    'SYSTEM_REPORT.pdf',
    pagesize=A4,
    rightMargin=1.8*cm, leftMargin=1.8*cm,
    topMargin=1.8*cm,   bottomMargin=1.8*cm
)

def sty(size, color, align=TA_RIGHT, bold=False, space_before=6, space_after=4):
    return ParagraphStyle('s', fontName=FONT, fontSize=size, textColor=color,
        alignment=align, spaceBefore=space_before, spaceAfter=space_after, leading=size*1.6)

title_sty    = sty(18, WHITE,  TA_CENTER, space_before=10, space_after=6)
subtitle_sty = sty(12, GOLD,   TA_CENTER, space_before=4,  space_after=4)
h1_sty       = sty(12, GOLD,   TA_RIGHT,  space_before=10, space_after=4)
body_sty     = sty(9,  LIGHT,  TA_RIGHT,  space_before=2,  space_after=2)
note_sty     = sty(8,  GRAY,   TA_RIGHT,  space_before=1,  space_after=1)

W = 17.4*cm

def p(text, style):
    return Paragraph(ar(text), style)

def section(title):
    t = Table([[p(title, h1_sty)]], colWidths=[W])
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), NAVY2),
        ('LINEBELOW',     (0,0),(-1,-1), 2, GOLD),
        ('TOPPADDING',    (0,0),(-1,-1), 7),
        ('BOTTOMPADDING', (0,0),(-1,-1), 7),
        ('RIGHTPADDING',  (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(-1,-1), 10),
    ]))
    return t

def tbl(rows, widths=None):
    if widths is None:
        widths = [W]
    data = [[p(str(c), body_sty) for c in row] for row in rows]
    t = Table(data, colWidths=widths)
    style = [
        ('FONTNAME',      (0,0),(-1,-1), FONT),
        ('ALIGN',         (0,0),(-1,-1), 'RIGHT'),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS',(0,0),(-1,-1), [NAVY2, NAVY]),
        ('TEXTCOLOR',     (0,0),(-1,-1), LIGHT),
        ('GRID',          (0,0),(-1,-1), 0.3, colors.HexColor('#334155')),
        ('TOPPADDING',    (0,0),(-1,-1), 5),
        ('BOTTOMPADDING', (0,0),(-1,-1), 5),
        ('RIGHTPADDING',  (0,0),(-1,-1), 8),
        ('LEFTPADDING',   (0,0),(-1,-1), 8),
        ('BACKGROUND',    (0,0),(-1,0),  GOLD),
        ('TEXTCOLOR',     (0,0),(-1,0),  NAVY),
    ]
    t.setStyle(TableStyle(style))
    return t

def sp(h=0.25):
    return Spacer(1, h*cm)

story = []

# ── غلاف ──
cover = Table([
    [p('نظام إدارة شؤون الموظفين', title_sty)],
    [p('الجهاز التنفيذي لحفر وصيانة آبار المياه', subtitle_sty)],
    [sp(0.2)],
    [p('تقرير تفصيلي شامل لمتطلبات النظام', note_sty)],
], colWidths=[W])
cover.setStyle(TableStyle([
    ('BACKGROUND', (0,0),(-1,-1), NAVY),
    ('TOPPADDING', (0,0),(-1,-1), 18),
    ('BOTTOMPADDING', (0,0),(-1,-1), 18),
]))
story += [cover, sp(0.4)]

# ── 1. بيانات الموظفين ──
story += [section('1. بيانات الموظفين'), sp(0.15)]
story += [p('الإدخال عبر 5 تبويبات أو استيراد جماعي من Excel', body_sty)]
story += [tbl([
    ['النوع', 'الحقل'],
    ['إلزامي', 'الاسم الرباعي'],
    ['إلزامي', 'الرقم الوظيفي'],
    ['إلزامي', 'الرقم الوطني'],
    ['إلزامي', 'تاريخ الميلاد (يحسب العمر تلقائياً)'],
    ['إلزامي', 'الجنس'],
    ['إلزامي', 'المسمى الوظيفي'],
    ['إلزامي', 'الإدارة / القسم / المكتب'],
    ['إلزامي', 'تاريخ التعيين وتاريخ المباشرة'],
    ['إلزامي', 'الدرجة الوظيفية (3-16) ونوعها (عادي/مربوط)'],
    ['إلزامي', 'نوع الموظف (إداري / غفارة)'],
    ['إلزامي', 'نوع التعاقد ورصيد الإجازة السنوية'],
    ['اختياري', 'فصيل الدم - الحالة الاجتماعية - الهاتف'],
    ['اختياري', 'المؤهل الدراسي - الراتب - ملف PDF'],
], [4*cm, 13*cm]), sp()]

# ── 2. الإجازات ──
story += [section('2. نظام الإجازات'), sp(0.15)]
story += [tbl([
    ['قواعد خاصة', 'المدة', 'النوع'],
    ['', 'رصيد خاص بكل موظف', 'سنوية'],
    ['بعد 60 يوم تنبيه إحالة للجنة طبية', '60 يوم / سنة', 'مرضية'],
    ['', '12 يوم / سنة', 'طارئة'],
    ['', 'بدون قيود', 'أمومة'],
    ['مرة واحدة في العمر فقط', 'شهر واحد', 'حج'],
    ['تحفظ في الملف الشخصي', 'شهرين الى سنة', 'بدون راتب'],
], [6*cm, 4.5*cm, 6.9*cm])]
story += [sp(0.1), tbl([
    ['قاعدة الخصم', 'نوع الموظف'],
    ['لا يخصم الجمعة والسبت وايام العطل الرسمية', 'إداري'],
    ['تخصم جميع الايام - اليوم الواحد = 3 ايام من الرصيد', 'غفارة'],
], [11*cm, 6*cm]), sp()]

# ── 3. الحضور والانصراف ──
story += [section('3. الحضور والانصراف (ZKTeco)'), sp(0.15)]
story += [p('استيراد ملف .dat مباشرة - اول بصمة = دخول - اخر بصمة = خروج', body_sty)]
story += [p('اعدادات الدوام تدخل يدوياً: 08:30 دخول - 14:30 خروج (قابلة للتغيير)', body_sty)]
story += [tbl([
    ['اللون', 'الحالة'],
    ['اخضر', 'حضور منتظم'],
    ['اصفر', 'تاخر'],
    ['برتقالي', 'خروج مبكر'],
    ['احمر', 'غياب'],
    ['ازرق', 'اجازة'],
    ['رمادي', 'عطلة رسمية'],
    ['بنفسجي', 'غفارة'],
    ['ذهبي', 'معدل يدوياً (مع سجل التعديل)'],
], [5*cm, 12*cm])]
story += [sp(0.1), p('تنبيهات: غياب اكثر من 3 ايام متتالية / تاخر اكثر من 5 مرات في الشهر', note_sty), sp()]

# ── 4 و 5 ──
story += [section('4. التكاليف والفحص الطبي'), sp(0.15)]
story += [p('التكليف: يجلب اسم الموظف تلقائياً ويظهر في شاشة الحضور تلقائياً', body_sty)]
story += [p('الفحص الطبي: يخصم من رصيد المرضية تلقائياً - تنبيه عند الوصول لـ 60 يوم', body_sty), sp()]

story += [section('5. اذونات الخروج'), sp(0.15)]
story += [tbl([
    ['القيمة', 'البيان'],
    ['شخصي / عمل / طبي / طارئ', 'انواع الاذن'],
    ['2 اذن فقط في الشهر', 'الحد الاقصى لكل موظف'],
    ['يحسب تلقائياً بالدقائق', 'مدة الاذن'],
    ['لا يوجد', 'التاثير على الراتب او الاجازة'],
], [8*cm, 9*cm]), sp()]

# ── 6. العلاوات ──
story += [section('6. العلاوات والترقيات'), sp(0.15)]
story += [tbl([
    ['علاوات مطلوبة للترقية', 'الدرجة'],
    ['4 علاوات', '3 الى 9'],
    ['5 علاوات', '10'],
    ['4 علاوات', '11 الى 16'],
], [8*cm, 9*cm])]
story += [sp(0.1), p('نظام المربوط: ليس لجميع الموظفين - يختار عند ادخال بيانات الموظف', note_sty)]
story += [p('مثال: درجة 8 مربوط 4 يحتاج 4 علاوات اضافية للترقية لدرجة 9', note_sty), sp()]

# ── 7. التقاعد ──
story += [section('7. التقاعد والفصل والنقل'), sp(0.15)]
story += [tbl([
    ['النساء', 'الرجال', 'النوع'],
    ['60 سنة', '65 سنة', 'تقاعد اجباري'],
    ['من 55 سنة', 'من 55 سنة', 'تقاعد اختياري'],
], [5*cm, 5*cm, 7*cm])]
story += [sp(0.1), tbl([
    ['سبب انهاء الخدمة'],
    ['تقاعد اجباري'],
    ['تقاعد اختياري'],
    ['انتهاء عقد'],
    ['استقالة اعتبارية'],
    ['استقالة اختيارية'],
    ['انتهاء ندب'],
    ['نقل لجهة اخرى'],
], [W])]
story += [sp(0.1), p('النقل: وارد (يضاف للنظام) / صادر (يحذف + ارشيف) / داخلي (يتغير قسمه)', note_sty), sp()]

# ── 8. المراسلات ──
story += [section('8. نظام المراسلات'), sp(0.15)]
story += [tbl([
    ['انواع المراسلات'],
    ['بريد وارد - بريد صادر - طلبات'],
    ['قرارات داخلية وخارجية'],
    ['رسائل مهمش عليها - تاشيرات - اجازات'],
], [W])]
story += [sp(0.1), p('نظام تدفق العمل: موظف يقدم طلب - مدير يهمش - قانوني يهمش - مدير يقرر - تنفيذ', body_sty)]
story += [p('رقم الخطاب يدخل يدوياً من المحفوظات - خاص بشؤون الموظفين فقط', note_sty), sp()]

# ── 9. الارشيف ──
story += [section('9. الارشيف'), sp(0.15)]
story += [p('ارشيف الرسائل والوثائق: ربط مباشر بالماسح او رفع يدوي - بحث فوري', body_sty)]
story += [p('ارشيف الموظفين القدامى: ملف كامل لكل منتهية خدمته مع علامة السبب', body_sty), sp()]

# ── 10. كشف العاملين ──
story += [section('10. كشف العاملين'), sp(0.15)]
story += [tbl([
    ['حقول الكشف'],
    ['الاسم - الرقم الوظيفي - الرقم الوطني - المؤهل الدراسي'],
    ['تاريخ التعيين - تاريخ المباشرة - المسمى الوظيفي'],
    ['الادارة / القسم / المكتب - الدرجة والعلاوة الحالية'],
], [W])]
story += [sp(0.1), p('قوالب متعددة لكل جهة - فلترة وترتيب مرن - معاينة قبل الطباعة', body_sty)]
story += [p('تصدير: طباعة / PDF / Excel / Word - حفظ الكشوفات السابقة تلقائياً', body_sty), sp()]

# ── 11. التقارير ──
story += [section('11. التقارير'), sp(0.15)]
story += [tbl([
    ['التقرير', '#'],
    ['المرشحون للترقية', '1'],
    ['المقبلون على التقاعد', '2'],
    ['من تنتهي عقودهم قريباً', '3'],
    ['الموظفون حسب الادارة', '4'],
    ['رصيد الاجازات لكل موظف', '5'],
    ['الموظفون في اجازة حالياً', '6'],
    ['العلاوات المستحقة هذا الشهر', '7'],
    ['تاريخ العلاوات لكل موظف', '8'],
    ['التقرير الشهري للمدير', '9'],
    ['التقرير السنوي للوزارة', '10'],
    ['التقرير الربع سنوي (الاهم والجوهر)', '11'],
], [13*cm, 4*cm])]
story += [sp(0.1), p('التقرير الربع سنوي يرسل لـ: مدير الشؤون الادارية / مدير المراجعة الداخلية / المدير العام', body_sty)]
story += [tbl([
    ['محتوى القسم', 'القسم'],
    ['احصائيات الموظفين - توزيع - تغييرات - ذكور وإناث', 'الاول'],
    ['الاجازات بانواعها وايامها', 'الثاني'],
    ['العلاوات والترقيات', 'الثالث'],
    ['التقاعد والفصل والنقل بانواعها', 'الرابع'],
    ['المراسلات مع مقارنة بالربع السابق', 'الخامس'],
], [12*cm, 5*cm]), sp()]

# ── 12. الصلاحيات ──
story += [section('12. نظام الصلاحيات'), sp(0.15)]
story += [tbl([
    ['الصلاحيات', 'المسمى', 'المستوى'],
    ['كل شيء بدون قيود', 'مدير النظام', '1'],
    ['كل شيء ما عدا اعدادات النظام', 'مدير القسم', '2'],
    ['اضافة وتعديل بدون حذف', 'موظف اول', '3'],
    ['اضافة فقط', 'موظف', '4'],
    ['عرض بدون اي تعديل', 'قراءة فقط', '5'],
], [8*cm, 5*cm, 4*cm])]
story += [sp(0.1), p('كل شاشة يمكن تفعيلها او تعطيلها لكل موظف بشكل مستقل', body_sty)]
story += [p('سجل تدقيق كامل - قفل الحساب بعد 3 محاولات فاشلة', note_sty), sp()]

# ── 13. لوحة التحكم ──
story += [section('13. لوحة التحكم الرئيسية'), sp(0.15)]
story += [tbl([
    ['المحتوى'],
    ['اجمالي الموظفين - في اجازة حالياً - طلبات معلقة - تنبيهات جديدة'],
    ['تنبيهات: علاوات مستحقة / مرشحون للترقية / اقتراب التقاعد'],
    ['الموظفون في اجازة ومن سيعودون هذا الاسبوع'],
    ['رسوم بيانية: توزيع الموظفين - انواع التعاقد - مقارنة الاجازات'],
    ['تقويم شهري: عطل رسمية - اجازات - مواعيد استحقاق العلاوات'],
    ['آخر 10 نشاطات في النظام'],
], [W]), sp(0.4)]

# ── تذييل ──
footer = Table([[p('نظام ادارة شؤون الموظفين | الجهاز التنفيذي لحفر وصيانة آبار المياه', note_sty)]], colWidths=[W])
footer.setStyle(TableStyle([
    ('BACKGROUND',    (0,0),(-1,-1), NAVY2),
    ('LINEABOVE',     (0,0),(-1,0),  1.5, GOLD),
    ('TOPPADDING',    (0,0),(-1,-1), 8),
    ('BOTTOMPADDING', (0,0),(-1,-1), 8),
]))
story.append(footer)

doc.build(story)
print("تم انشاء التقرير: SYSTEM_REPORT.pdf")
