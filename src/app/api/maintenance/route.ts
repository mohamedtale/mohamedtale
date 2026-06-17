import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const logs = await prisma.maintenanceLog.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { well: { select: { name: true, wellId: true, region: true } } },
    });
    return NextResponse.json(logs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const log = await prisma.maintenanceLog.create({ data: body });
    return NextResponse.json(log);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
