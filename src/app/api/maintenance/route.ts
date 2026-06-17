import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.maintenanceLog.findMany({
    include: { well: { select: { name: true, wellId: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const data = await req.json();
  const log = await prisma.maintenanceLog.create({ data });
  return NextResponse.json(log, { status: 201 });
}
