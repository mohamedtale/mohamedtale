import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contracts = await prisma.contract.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const data = await req.json();
  const contract = await prisma.contract.create({ data });
  return NextResponse.json(contract, { status: 201 });
}
