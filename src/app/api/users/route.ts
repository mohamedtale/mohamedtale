import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, employeeId: true, name: true, email: true, phone: true, department: true, role: true, status: true, createdAt: true },
    });
    return NextResponse.json(users);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await prisma.user.create({
      data: { ...body, password: body.password || "changeme123" },
      select: { id: true, employeeId: true, name: true, email: true, phone: true, department: true, role: true, status: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
