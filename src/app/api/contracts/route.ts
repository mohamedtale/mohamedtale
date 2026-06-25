import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const contracts = await sql`SELECT * FROM "Contract" ORDER BY "createdAt" DESC`;
    return NextResponse.json(contracts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const d = await req.json();
    const result = await sql`
      INSERT INTO "Contract" (id, title, vendor, value, wells, "startDate", "endDate", status, notes, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${d.title}, ${d.vendor}, ${d.value}, ${d.wells ?? 0}, ${d.startDate}, ${d.endDate}, ${d.status ?? 'نشط'}, ${d.notes ?? null}, now(), now())
      RETURNING *`;
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
