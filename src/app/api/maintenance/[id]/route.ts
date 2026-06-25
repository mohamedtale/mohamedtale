import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id } = await params;
    const b = await req.json();
    const result = await sql`
      UPDATE "MaintenanceLog" SET
        status = COALESCE(${b.status ?? null}, status),
        description = COALESCE(${b.description ?? null}, description),
        "updatedAt" = now()
      WHERE id = ${id} RETURNING *`;
    return NextResponse.json(result[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id } = await params;
    await sql`DELETE FROM "MaintenanceLog" WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
