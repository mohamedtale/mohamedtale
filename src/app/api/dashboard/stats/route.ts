import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, active, maintenance, broken, reports, contracts] = await Promise.all([
      prisma.well.count(),
      prisma.well.count({ where: { status: "فعال" } }),
      prisma.well.count({ where: { status: "صيانة" } }),
      prisma.well.count({ where: { status: "متعطل" } }),
      prisma.report.count(),
      prisma.contract.count(),
    ]);
    return NextResponse.json({ total, active, maintenance, broken, reports, contracts });
  } catch {
    return NextResponse.json({ total: 0, active: 0, maintenance: 0, broken: 0, reports: 0, contracts: 0 });
  }
}
