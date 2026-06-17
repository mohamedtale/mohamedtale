import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(contracts);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contract = await prisma.contract.create({
      data: {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        value: parseFloat(body.value),
        wells: parseInt(body.wells) || 0,
      },
    });
    return NextResponse.json(contract);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
