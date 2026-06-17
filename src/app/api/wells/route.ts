import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const region = searchParams.get("region") || "";
    const wells = await prisma.well.findMany({
      where: {
        AND: [
          search ? { OR: [{ name: { contains: search } }, { wellId: { contains: search } }, { region: { contains: search } }] } : {},
          status ? { status } : {},
          region ? { region: { contains: region } } : {},
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { maintenance: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json(wells);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const well = await prisma.well.create({ data: body });
    return NextResponse.json(well);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
