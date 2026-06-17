import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.report.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const data = await req.json();
  const report = await prisma.report.create({ data });
  return NextResponse.json(report, { status: 201 });
}
