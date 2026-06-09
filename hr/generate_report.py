#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
import os

# Try to register Arabic font
font_paths = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
]

font_registered = False
for fp in font_paths:
    if os.path.exists(fp):
        try:
            pdfmetrics.registerFont(TTFont('Arabic', fp))
            font_registered = True
            break
        except:
            pass

FONT = 'Arabic' if font_registered else 'Helvetica'

doc = SimpleDocTemplate(
    'SYSTEM_REPORT.pdf',
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

GOLD = colors.HexColor('#C5A059')
NAVY = colors.HexColor('#0F172A')
NAVY2 = colors.HexColor('#1E293B')
WHITE = colors.white
LIGHT = colors.HexColor('#F8FAFC')
GRAY = colors.HexColor('#94A3B8')

styles = getSampleStyleSheet()

title_style = ParagraphStyle('title', fontName=FONT, fontSize=20, textColor=WHITE,
    alignment=TA_CENTER, spaceAfter=6, leading=28)
subtitle_style = ParagraphStyle('subtitle', fontName=FONT, fontSize=13, textColor=GOLD,
    alignment=TA_CENTER, spaceAfter=4, leading=18)
h1_style = ParagraphStyle('h1', fontName=FONT, fontSize=14, textColor=GOLD,
    alignment=TA_RIGHT, spaceBefore=14, spaceAfter=6, leading=20)
h2_style = ParagraphStyle('h2', fontName=FONT, fontSize=12, textColor=WHITE,
    alignment=TA_RIGHT, spaceBefore=10, spaceAfter=4, leading=16)
body_style = ParagraphStyle('body', fontName=FONT, fontSize=10, textColor=LIGHT,
    alignment=TA_RIGHT, spaceAfter=3, leading=16)
note_style = ParagraphStyle('note', fontName=FONT, fontSize=9, textColor=GRAY,
    alignment=TA_RIGHT, spaceAfter=3, leading=14)

def tbl(data, col_widths=None, header=True):
    t = Table(data, colWidths=col_widths, hAlign='RIGHT')
    style = [
        ('FONTNAME', (0,0), (-1,-1), FONT),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [NAVY2, NAVY]),
        ('TEXTCOLOR', (0,0), (-1,-1), LIGHT),
        ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor('#334155')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]
    if header:
        style += [
            ('BACKGROUND', (0,0), (-1,0), GOLD),
            ('TEXTCOLOR', (0,0), (-1,0), NAVY),
            ('FONTSIZE', (0,0), (-1,0), 10),
        ]
    t.setStyle(TableStyle(style))
    return t

def section_bg(text):
    t = Table([[Paragraph(text, h1_style)]], colWidths=[17*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), NAVY2),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-1), 2, GOLD),
    ]))
    return t

story = []

# ===== COVER =====
cover = Table([
    [Paragraph('نظام إدارة شؤون الموظفين', title_style)],
    [Paragraph('الجهاز التنفيذي لحفر وصيانة آبار المياه', subtitle_style)],
    [Spacer(1, 0.3*cm)],
    [Paragraph('تقرير تفصيلي شامل لمتطلبات النظام', note_style)],
    [Paragraph('إعداد: قسم شؤون الموظفين', note_style)],
], colWidths=[17*cm])
cover.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY),
    ('TOPPADDING', (0,0), (-1,-1), 20),
    ('BOTTOMPADDING', (0,0), (-1,-1), 20),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
]))
story.append(cover)
story.append(Spacer(1, 0.5*cm))

# ===== MODULE 1 =====
story.append(section_bg('1. بيانات الموظفين'))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('البيانات الإلزامية والاختيارية عند إضافة موظف جديد:', h2_style))
story.append(tbl([
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
    ['اختياري', 'فصيل الدم / الحالة الاجتماعية / الهاتف'],
    ['اختياري', 'المؤهل الدراسي / الراتب / ملف PDF'],
], [4*cm, 13*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('مميزات الإدخال: شريط تقدم - حفظ مؤقت - تحقق من التكرار - استيراد من Excel', note_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 2 =====
story.append(section_bg('2. نظام الإجازات'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['قواعد خاصة', 'المدة', 'النوع'],
    ['', 'رصيد خاص بكل موظف', 'سنوية'],
    ['بعد 60 يوم → تنبيه إحالة للجنة طبية', '60 يوم / سنة', 'مرضية'],
    ['', '12 يوم / سنة', 'طارئة'],
    ['', 'بدون قيود', 'أمومة'],
    ['مرة واحدة في العمر فقط', 'شهر واحد', 'حج'],
    ['تُحفظ في الملف الشخصي', 'شهرين → سنة', 'بدون راتب'],
], [6*cm, 5*cm, 6*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['قاعدة الخصم', 'نوع الموظف'],
    ['لا يُخصم الجمعة والسبت + أيام العطل الرسمية', 'إداري'],
    ['تُخصم جميع الأيام - اليوم الواحد = 3 أيام من الرصيد', 'غفارة'],
], [10*cm, 7*cm]))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 3 =====
story.append(section_bg('3. الحضور والانصراف (ZKTeco)'))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('استيراد ملف .dat مباشرة - أول بصمة = دخول - آخر بصمة = خروج', body_style))
story.append(tbl([
    ['اللون', 'الرمز', 'الحالة'],
    ['أخضر', '✅', 'حضور منتظم'],
    ['أصفر', '🕐', 'تأخر'],
    ['برتقالي', '🚪', 'خروج مبكر'],
    ['أحمر', '❌', 'غياب'],
    ['أزرق', '🏖️', 'إجازة'],
    ['رمادي', '⚪', 'عطلة رسمية'],
    ['بنفسجي', '🌙', 'غفارة'],
    ['ذهبي', '✏️', 'معدّل يدوياً'],
], [4*cm, 3*cm, 10*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('تنبيهات: غياب أكثر من 3 أيام متتالية / تأخر أكثر من 5 مرات في الشهر', note_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 4+5 =====
story.append(section_bg('4. التكاليف والفحص الطبي'))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('التكليف: يجلب اسم الموظف تلقائياً - يظهر في شاشة الحضور تلقائياً', body_style))
story.append(Paragraph('الفحص الطبي: يخصم من رصيد المرضية تلقائياً - تنبيه عند الوصول لـ 60 يوم', body_style))

story.append(Spacer(1, 0.3*cm))
story.append(section_bg('5. أذونات الخروج'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['القيمة', 'البيان'],
    ['شخصي / عمل / طبي / طارئ', 'أنواع الإذن'],
    ['2 إذن فقط في الشهر', 'الحد الأقصى لكل موظف'],
    ['يحسب تلقائياً', 'مدة الإذن بالدقائق'],
    ['لا يوجد', 'التأثير على الراتب أو الإجازة'],
], [8*cm, 9*cm]))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 6 =====
story.append(section_bg('6. العلاوات والترقيات'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['علاوات مطلوبة للترقية', 'الدرجة'],
    ['4 علاوات', '3 إلى 9'],
    ['5 علاوات', '10'],
    ['4 علاوات', '11 إلى 16'],
], [8*cm, 9*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('نظام المربوط: ليس لجميع الموظفين - يُختار عند إدخال بيانات الموظف', note_style))
story.append(Paragraph('مثال: درجة 8 مربوط 4 → يحتاج 4 علاوات إضافية للترقية لدرجة 9', note_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 7 =====
story.append(section_bg('7. التقاعد والفصل والنقل'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['النساء', 'الرجال', 'النوع'],
    ['60 سنة', '65 سنة', 'تقاعد إجباري'],
    ['من 55 سنة', 'من 55 سنة', 'تقاعد اختياري'],
], [5*cm, 5*cm, 7*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['العلامة', 'سبب إنهاء الخدمة'],
    ['🔵', 'تقاعد إجباري'],
    ['🟢', 'تقاعد اختياري'],
    ['🟡', 'انتهاء عقد'],
    ['🔴', 'استقالة اعتبارية'],
    ['🟠', 'استقالة اختيارية'],
    ['⚪', 'انتهاء ندب'],
    ['🔄', 'نقل لجهة أخرى'],
], [3*cm, 14*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('النقل: وارد (يُضاف للنظام) / صادر (يُحذف + أرشيف) / داخلي (يتغير قسمه)', note_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 8 =====
story.append(section_bg('8. نظام المراسلات'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['النوع'],
    ['📥 بريد وارد'],
    ['📤 بريد صادر'],
    ['📋 طلبات'],
    ['📜 قرارات داخلية وخارجية'],
    ['✍️ رسائل مهمش عليها'],
    ['🔖 تأشيرات'],
    ['🏖️ إجازات'],
], [17*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('نظام تدفق العمل: موظف يقدم طلب → مدير يهمش → قانوني يهمش → مدير يقرر → تنفيذ', body_style))
story.append(Paragraph('رقم الخطاب يُدخل يدوياً من المحفوظات - خاص بشؤون الموظفين فقط', note_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 9 =====
story.append(section_bg('9. الأرشيف'))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('أرشيف الرسائل والوثائق: ربط مباشر بالماسح أو رفع يدوي - بحث فوري', body_style))
story.append(Paragraph('أرشيف الموظفين القدامى: ملف كامل لكل منتهية خدمته مع علامة السبب', body_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 10 =====
story.append(section_bg('10. كشف العاملين'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['حقول الكشف'],
    ['الاسم - الرقم الوظيفي - الرقم الوطني - المؤهل الدراسي'],
    ['تاريخ التعيين - تاريخ المباشرة - المسمى الوظيفي'],
    ['الإدارة / القسم / المكتب - الدرجة والعلاوة الحالية'],
], [17*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('قوالب متعددة لكل جهة - فلترة وترتيب مرن - معاينة قبل الطباعة', body_style))
story.append(Paragraph('تصدير: طباعة / PDF / Excel / Word - حفظ الكشوفات السابقة تلقائياً', body_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 11 =====
story.append(section_bg('11. التقارير'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['التقرير', '#'],
    ['المرشحون للترقية', '1'],
    ['المقبلون على التقاعد', '2'],
    ['من تنتهي عقودهم قريباً', '3'],
    ['الموظفون حسب الإدارة (متطور)', '4'],
    ['رصيد الإجازات لكل موظف', '5'],
    ['الموظفون في إجازة حالياً', '6'],
    ['العلاوات المستحقة هذا الشهر', '7'],
    ['تاريخ العلاوات لكل موظف', '8'],
    ['التقرير الشهري للمدير', '9'],
    ['التقرير السنوي للوزارة', '10'],
    ['التقرير الربع سنوي (الأهم والجوهر)', '11'],
], [13*cm, 4*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('التقرير الربع سنوي يُرسل لـ: مدير الشؤون الإدارية / مدير المراجعة الداخلية / المدير العام', body_style))
story.append(tbl([
    ['محتوى القسم', 'القسم'],
    ['إحصائيات الموظفين - توزيع - تغييرات - ذكور وإناث', 'الأول'],
    ['الإجازات بأنواعها وأيامها', 'الثاني'],
    ['العلاوات والترقيات', 'الثالث'],
    ['التقاعد والفصل والنقل بأنواعها', 'الرابع'],
    ['المراسلات مع مقارنة بالربع السابق', 'الخامس'],
], [12*cm, 5*cm]))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 12 =====
story.append(section_bg('12. نظام الصلاحيات'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['الصلاحيات', 'المسمى', 'المستوى'],
    ['كل شيء بدون قيود', 'مدير النظام', '1'],
    ['كل شيء ما عدا إعدادات النظام', 'مدير القسم', '2'],
    ['إضافة وتعديل بدون حذف', 'موظف أول', '3'],
    ['إضافة فقط', 'موظف', '4'],
    ['عرض بدون أي تعديل', 'قراءة فقط', '5'],
], [7*cm, 5*cm, 5*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph('كل شاشة يمكن تفعيلها أو تعطيلها لكل موظف بشكل مستقل', body_style))
story.append(Paragraph('سجل تدقيق كامل - قفل الحساب بعد 3 محاولات فاشلة', note_style))

story.append(Spacer(1, 0.3*cm))

# ===== MODULE 13 =====
story.append(section_bg('13. لوحة التحكم الرئيسية'))
story.append(Spacer(1, 0.2*cm))
story.append(tbl([
    ['المحتوى'],
    ['إجمالي الموظفين - في إجازة حالياً - طلبات معلقة - تنبيهات جديدة'],
    ['تنبيهات: علاوات مستحقة / مرشحون للترقية / اقتراب التقاعد'],
    ['الموظفون في إجازة ومن سيعودون هذا الأسبوع'],
    ['رسوم بيانية: توزيع الموظفين / أنواع التعاقد / مقارنة الإجازات'],
    ['تقويم شهري: عطل رسمية / إجازات / مواعيد استحقاق العلاوات'],
    ['آخر 10 نشاطات في النظام'],
], [17*cm]))

story.append(Spacer(1, 0.5*cm))

# ===== FOOTER =====
footer = Table([[
    Paragraph('نظام إدارة شؤون الموظفين | الجهاز التنفيذي لحفر وصيانة آبار المياه', note_style)
]], colWidths=[17*cm])
footer.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY2),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LINEABOVE', (0,0), (-1,0), 1.5, GOLD),
]))
story.append(footer)

doc.build(story)
print("✅ PDF generated: SYSTEM_REPORT.pdf")
