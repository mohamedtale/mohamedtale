import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [total, active, maintenance, broken, reports, contracts] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM "Well"`,
      sql`SELECT COUNT(*) as count FROM "Well" WHERE status = 'فعال'`,
      sql`SELECT COUNT(*) as count FROM "Well" WHERE status = 'صيانة'`,
      sql`SELECT COUNT(*) as count FROM "Well" WHERE status = 'متعطل'`,
      sql`SELECT COUNT(*) as count FROM "Report"`,
      sql`SELECT COUNT(*) as count FROM "Contract"`,
    ]);
    return NextResponse.json({
      total: Number(total[0].count),
      active: Number(active[0].count),
      maintenance: Number(maintenance[0].count),
      broken: Number(broken[0].count),
      reports: Number(reports[0].count),
      contracts: Number(contracts[0].count),
    });
  } catch {
    return NextResponse.json({ total: 0, active: 0, maintenance: 0, broken: 0, reports: 0, contracts: 0 });
  }
}
