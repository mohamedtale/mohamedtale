import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    
    const { id } = await params;
    const b = await req.json();
    const result = await sql`
      UPDATE "Contract" SET
        title = COALESCE(${b.title ?? null}, title),
        status = COALESCE(${b.status ?? null}, status),
        vendor = COALESCE(${b.vendor ?? null}, vendor),
        "updatedAt" = now()
      WHERE id = ${id} RETURNING *`;
    return NextResponse.json(result[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    
    const { id } = await params;
    await sql`DELETE FROM "Contract" WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
