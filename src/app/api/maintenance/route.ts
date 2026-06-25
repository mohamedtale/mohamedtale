import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const logs = await sql`
      SELECT m.*, w.name as "wellName", w."wellId" as "wellCode"
      FROM "MaintenanceLog" m
      LEFT JOIN "Well" w ON m."wellId" = w.id
      ORDER BY m."createdAt" DESC`;
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const d = await req.json();
    const result = await sql`
      INSERT INTO "MaintenanceLog" (id, "wellId", type, status, description, technician, cost, duration, parts, priority, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${d.wellId}, ${d.type}, ${d.status ?? 'قيد التنفيذ'}, ${d.description ?? null}, ${d.technician}, ${d.cost ?? null}, ${d.duration ?? null}, ${d.parts ?? null}, ${d.priority ?? 'متوسطة'}, now(), now())
      RETURNING *`;
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
