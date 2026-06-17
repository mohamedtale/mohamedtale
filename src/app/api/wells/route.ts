import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wells = await prisma.well.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(wells);
}

export async function POST(req: Request) {
  const data = await req.json();
  const well = await prisma.well.create({ data });
  return NextResponse.json(well, { status: 201 });
}
