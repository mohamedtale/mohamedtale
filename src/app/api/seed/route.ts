import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  // Clear existing data
  await prisma.maintenanceLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.well.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contract.deleteMany();

  // Wells
  const wells = await Promise.all([
    prisma.well.create({ data: { wellId: "W-001", name: "بئر الزاوية الشمالي", region: "طرابلس", location: "الزاوية الشمالية", latitude: 32.75, longitude: 12.87, depth: 200, type: "مياه جوفية", status: "فعال", casingType: "PVC", cost: 59625 } }),
    prisma.well.create({ data: { wellId: "W-002", name: "بئر مصراتة المركزي", region: "مصراتة", location: "مصراتة المركز", latitude: 32.37, longitude: 15.09, depth: 180, type: "مياه جوفية", status: "فعال", casingType: "HDPE", cost: 52000 } }),
    prisma.well.create({ data: { wellId: "W-003", name: "بئر الزيان الزراعي", region: "بنغازي", location: "الزيان", latitude: 32.11, longitude: 20.06, depth: 150, type: "زراعي", status: "صيانة", casingType: "PVC", cost: 44000 } }),
    prisma.well.create({ data: { wellId: "W-004", name: "بئر سبها الغربي", region: "سبها", location: "سبها الغرب", latitude: 27.03, longitude: 14.42, depth: 250, type: "مياه جوفية", status: "فعال", casingType: "فولاذ", cost: 75000 } }),
    prisma.well.create({ data: { wellId: "W-005", name: "بئر الكفرة الجنوبي", region: "الكفرة", location: "الكفرة الجنوب", latitude: 24.18, longitude: 23.30, depth: 300, type: "مياه جوفية", status: "متعطل", casingType: "PVC", cost: 92000 } }),
  ]);

  // Reports
  await Promise.all([
    prisma.report.create({ data: { title: "تقرير فحص جودة المياه - بئر الزاوية الشمالي", type: "جودة المياه", status: "معتمد", author: "د. محمد الصقم", reviewer: "م. خالد أحمد", wellId: wells[0].id, fileSize: "2.4 MB" } }),
    prisma.report.create({ data: { title: "تقرير الصيانة الدورية - بئر مصراتة", type: "صيانة", status: "قيد المراجعة", author: "م. خالد أحمد", wellId: wells[1].id, fileSize: "1.8 MB" } }),
    prisma.report.create({ data: { title: "دراسة جيولوجية - منطقة سبها", type: "جيولوجيا", status: "مسودة", author: "د. فاطمة علي", wellId: wells[3].id, fileSize: "5.2 MB" } }),
    prisma.report.create({ data: { title: "تقرير الحفر والتجهيز - بئر بنغازي", type: "حفر", status: "معتمد", author: "م. أحمد سالم", reviewer: "د. محمد الصقم", wellId: wells[2].id, fileSize: "3.1 MB" } }),
  ]);

  // Maintenance logs
  await Promise.all([
    prisma.maintenanceLog.create({ data: { wellId: wells[0].id, type: "صيانة دورية", status: "مكتملة", description: "فحص شامل للمضخة ونظام التغليف", technician: "أحمد محمد", cost: 850, duration: "4 ساعات", priority: "متوسطة" } }),
    prisma.maintenanceLog.create({ data: { wellId: wells[1].id, type: "إصلاح طارئ", status: "مكتملة", description: "إصلاح عطل في المحرك الكهربائي", technician: "خالد أحمد", cost: 2850, duration: "6 ساعات", priority: "عالية" } }),
    prisma.maintenanceLog.create({ data: { wellId: wells[2].id, type: "صيانة دورية", status: "قيد التنفيذ", description: "فحص دوري وتنظيف الفلاتر", technician: "يوسف سالم", cost: 450, duration: "3 ساعات", priority: "متوسطة" } }),
    prisma.maintenanceLog.create({ data: { wellId: wells[4].id, type: "إصلاح طارئ", status: "متأخرة", description: "استبدال قطع تالفة في نظام الضخ", technician: "صالح حسن", cost: 1200, priority: "عالية" } }),
  ]);

  // Users
  await Promise.all([
    prisma.user.create({ data: { employeeId: "EMP-2024-001", name: "أحمد محمد الصغير", email: "ahmed@water.gov.ly", phone: "0912345678", department: "الإدارة العامة", role: "مدير النظام", status: "نشط", password: "hashed_password" } }),
    prisma.user.create({ data: { employeeId: "EMP-2024-002", name: "فاطمة علي الفيتوري", email: "fatima@water.gov.ly", phone: "0913456789", department: "التقنية الفنية", role: "موظف", status: "نشط", password: "hashed_password" } }),
    prisma.user.create({ data: { employeeId: "EMP-2024-003", name: "محمد خالد المبروك", email: "mohammed@water.gov.ly", phone: "0914567890", department: "الصيانة", role: "موظف", status: "نشط", password: "hashed_password" } }),
    prisma.user.create({ data: { employeeId: "EMP-2024-004", name: "سامي حسن الزنتاني", email: "sami@water.gov.ly", phone: "0915678901", department: "المالية", role: "زائر", status: "نشط", password: "hashed_password" } }),
    prisma.user.create({ data: { employeeId: "EMP-2024-005", name: "نور الدين عبدالله", email: "nour@water.gov.ly", phone: "0916789012", department: "المخابرات", role: "موظف", status: "قيد المراجعة", password: "hashed_password" } }),
  ]);

  // Contracts
  await Promise.all([
    prisma.contract.create({ data: { title: "عقد حفر آبار منطقة طرابلس", vendor: "شركة المياه الوطنية", value: 450000, wells: 15, startDate: new Date("2024-01-01"), endDate: new Date("2024-12-31"), status: "نشط" } }),
    prisma.contract.create({ data: { title: "عقد صيانة آبار بنغازي", vendor: "مؤسسة الحفر الليبية", value: 180000, wells: 8, startDate: new Date("2024-03-01"), endDate: new Date("2024-09-30"), status: "نشط" } }),
    prisma.contract.create({ data: { title: "عقد تركيب مضخات مصراتة", vendor: "شركة المضخات العربية", value: 95000, wells: 5, startDate: new Date("2024-02-15"), endDate: new Date("2024-06-15"), status: "مكتمل" } }),
  ]);

  return NextResponse.json({ success: true, message: "تم إدخال البيانات التجريبية بنجاح" });
}
