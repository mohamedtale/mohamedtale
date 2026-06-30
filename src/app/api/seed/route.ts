import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // Create tables if not exist
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
    await sql`CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      "employeeId" TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      whatsapp TEXT,
      department TEXT,
      role TEXT NOT NULL DEFAULT 'موظف',
      status TEXT NOT NULL DEFAULT 'نشط',
      password TEXT NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS "Well" (
      id TEXT PRIMARY KEY,
      "wellId" TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      location TEXT,
      latitude FLOAT,
      longitude FLOAT,
      depth INT,
      type TEXT NOT NULL DEFAULT 'مياه جوفية',
      status TEXT NOT NULL DEFAULT 'فعال',
      "drillingDate" TIMESTAMP,
      "casingType" TEXT,
      "pumpType" TEXT,
      "waterQuality" TEXT,
      cost FLOAT,
      notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS "Report" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'مسودة',
      author TEXT NOT NULL,
      reviewer TEXT,
      "wellId" TEXT REFERENCES "Well"(id) ON DELETE SET NULL,
      "fileSize" TEXT,
      content TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "approvedAt" TIMESTAMP
    )`;
    await sql`CREATE TABLE IF NOT EXISTS "MaintenanceLog" (
      id TEXT PRIMARY KEY,
      "wellId" TEXT NOT NULL REFERENCES "Well"(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'قيد التنفيذ',
      description TEXT,
      technician TEXT NOT NULL,
      cost FLOAT,
      duration TEXT,
      parts TEXT,
      priority TEXT NOT NULL DEFAULT 'متوسطة',
      "scheduledAt" TIMESTAMP,
      "completedAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS "Contract" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      vendor TEXT NOT NULL,
      value FLOAT NOT NULL,
      wells INT NOT NULL DEFAULT 0,
      "startDate" TIMESTAMP NOT NULL,
      "endDate" TIMESTAMP NOT NULL,
      status TEXT NOT NULL DEFAULT 'نشط',
      notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS "PublicProject" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      region TEXT NOT NULL,
      count TEXT NOT NULL,
      "imageUrl" TEXT,
      "order" INT NOT NULL DEFAULT 0,
      visible BOOLEAN NOT NULL DEFAULT TRUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS "SiteConfig" (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      label TEXT,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`;

    // Clear existing data
    await sql`DELETE FROM "MaintenanceLog"`;
    await sql`DELETE FROM "Report"`;
    await sql`DELETE FROM "Well"`;
    await sql`DELETE FROM "User"`;
    await sql`DELETE FROM "Contract"`;

    // Wells
    const w1 = await sql`INSERT INTO "Well" (id, "wellId", name, region, location, latitude, longitude, depth, type, status, "casingType", cost, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'W-001', 'بئر الزاوية الشمالي', 'طرابلس', 'الزاوية الشمالية', 32.75, 12.87, 200, 'مياه جوفية', 'فعال', 'PVC', 59625, now(), now()) RETURNING id`;
    const w2 = await sql`INSERT INTO "Well" (id, "wellId", name, region, location, latitude, longitude, depth, type, status, "casingType", cost, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'W-002', 'بئر مصراتة المركزي', 'مصراتة', 'مصراتة المركز', 32.37, 15.09, 180, 'مياه جوفية', 'فعال', 'HDPE', 52000, now(), now()) RETURNING id`;
    const w3 = await sql`INSERT INTO "Well" (id, "wellId", name, region, location, latitude, longitude, depth, type, status, "casingType", cost, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'W-003', 'بئر الزيان الزراعي', 'بنغازي', 'الزيان', 32.11, 20.06, 150, 'زراعي', 'صيانة', 'PVC', 44000, now(), now()) RETURNING id`;
    const w4 = await sql`INSERT INTO "Well" (id, "wellId", name, region, location, latitude, longitude, depth, type, status, "casingType", cost, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'W-004', 'بئر سبها الغربي', 'سبها', 'سبها الغرب', 27.03, 14.42, 250, 'مياه جوفية', 'فعال', 'فولاذ', 75000, now(), now()) RETURNING id`;
    const w5 = await sql`INSERT INTO "Well" (id, "wellId", name, region, location, latitude, longitude, depth, type, status, "casingType", cost, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'W-005', 'بئر الكفرة الجنوبي', 'الكفرة', 'الكفرة الجنوب', 24.18, 23.30, 300, 'مياه جوفية', 'متعطل', 'PVC', 92000, now(), now()) RETURNING id`;

    // Reports
    await sql`INSERT INTO "Report" (id, title, type, status, author, reviewer, "wellId", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'تقرير فحص جودة المياه', 'جودة المياه', 'معتمد', 'د. محمد الصقم', 'م. خالد أحمد', ${w1[0].id}, '2.4 MB', now(), now())`;
    await sql`INSERT INTO "Report" (id, title, type, status, author, "wellId", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'تقرير الصيانة الدورية', 'صيانة', 'قيد المراجعة', 'م. خالد أحمد', ${w2[0].id}, '1.8 MB', now(), now())`;
    await sql`INSERT INTO "Report" (id, title, type, status, author, "wellId", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'دراسة جيولوجية - سبها', 'جيولوجيا', 'مسودة', 'د. فاطمة علي', ${w4[0].id}, '5.2 MB', now(), now())`;
    await sql`INSERT INTO "Report" (id, title, type, status, author, reviewer, "wellId", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'تقرير الحفر والتجهيز', 'حفر', 'معتمد', 'م. أحمد سالم', 'د. محمد الصقم', ${w3[0].id}, '3.1 MB', now(), now())`;

    // Maintenance
    await sql`INSERT INTO "MaintenanceLog" (id, "wellId", type, status, description, technician, cost, duration, priority, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${w1[0].id}, 'صيانة دورية', 'مكتملة', 'فحص شامل للمضخة', 'أحمد محمد', 850, '4 ساعات', 'متوسطة', now(), now())`;
    await sql`INSERT INTO "MaintenanceLog" (id, "wellId", type, status, description, technician, cost, duration, priority, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${w2[0].id}, 'إصلاح طارئ', 'مكتملة', 'إصلاح عطل في المحرك', 'خالد أحمد', 2850, '6 ساعات', 'عالية', now(), now())`;
    await sql`INSERT INTO "MaintenanceLog" (id, "wellId", type, status, description, technician, cost, duration, priority, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${w3[0].id}, 'صيانة دورية', 'قيد التنفيذ', 'فحص دوري وتنظيف الفلاتر', 'يوسف سالم', 450, '3 ساعات', 'متوسطة', now(), now())`;
    await sql`INSERT INTO "MaintenanceLog" (id, "wellId", type, status, description, technician, cost, priority, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${w5[0].id}, 'إصلاح طارئ', 'متأخرة', 'استبدال قطع تالفة', 'صالح حسن', 1200, 'عالية', now(), now())`;

    // Users with real hashed passwords
    const adminHash = await bcrypt.hash("admin123", 10);
    const userHash = await bcrypt.hash("user123", 10);
    await sql`INSERT INTO "User" (id, "employeeId", name, email, phone, department, role, status, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'EMP-2024-001', 'أحمد محمد الصغير', 'admin@water.gov.ly', '0912345678', 'الإدارة العامة', 'مدير النظام', 'نشط', ${adminHash}, now(), now())`;
    await sql`INSERT INTO "User" (id, "employeeId", name, email, phone, department, role, status, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'EMP-2024-002', 'فاطمة علي الفيتوري', 'fatima@water.gov.ly', '0913456789', 'التقنية الفنية', 'موظف', 'نشط', ${userHash}, now(), now())`;
    await sql`INSERT INTO "User" (id, "employeeId", name, email, phone, department, role, status, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'EMP-2024-003', 'محمد خالد المبروك', 'mohammed@water.gov.ly', '0914567890', 'الصيانة', 'موظف', 'نشط', ${userHash}, now(), now())`;
    await sql`INSERT INTO "User" (id, "employeeId", name, email, phone, department, role, status, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'EMP-2024-004', 'سامي حسن الزنتاني', 'sami@water.gov.ly', '0915678901', 'المالية', 'زائر', 'نشط', ${userHash}, now(), now())`;
    await sql`INSERT INTO "User" (id, "employeeId", name, email, phone, department, role, status, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'EMP-2024-005', 'نور الدين عبدالله', 'nour@water.gov.ly', '0916789012', 'المخابرات', 'موظف', 'قيد المراجعة', ${userHash}, now(), now())`;

    // Contracts
    await sql`INSERT INTO "Contract" (id, title, vendor, value, wells, "startDate", "endDate", status, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'عقد حفر آبار طرابلس', 'شركة المياه الوطنية', 450000, 15, '2024-01-01', '2024-12-31', 'نشط', now(), now())`;
    await sql`INSERT INTO "Contract" (id, title, vendor, value, wells, "startDate", "endDate", status, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'عقد صيانة آبار بنغازي', 'مؤسسة الحفر الليبية', 180000, 8, '2024-03-01', '2024-09-30', 'نشط', now(), now())`;
    await sql`INSERT INTO "Contract" (id, title, vendor, value, wells, "startDate", "endDate", status, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'عقد تركيب مضخات مصراتة', 'شركة المضخات العربية', 95000, 5, '2024-02-15', '2024-06-15', 'مكتمل', now(), now())`;

    return NextResponse.json({ success: true, message: "تم إدخال البيانات التجريبية بنجاح" });
  } catch (error: any) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: error.message, detail: error.detail || "", code: error.code || "" }, { status: 500 });
  }
}
