import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const reports = await prisma.report.findMany({
      where: {
        AND: [
          status ? { status } : {},
          type ? { type } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { well: { select: { name: true, wellId: true } } },
    });
    return NextResponse.json(reports);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const report = await prisma.report.create({ data: body });
    return NextResponse.json(report);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
