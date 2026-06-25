import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id } = await params;
    const wells = await sql`SELECT * FROM "Well" WHERE id = ${id}`;
    if (!wells.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(wells[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { id } = await params;
    const b = await req.json();
    const result = await sql`
      UPDATE "Well" SET
        name = COALESCE(${b.name ?? null}, name),
        region = COALESCE(${b.region ?? null}, region),
        status = COALESCE(${b.status ?? null}, status),
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
    await sql`DELETE FROM "Well" WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
