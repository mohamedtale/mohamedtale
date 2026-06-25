import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const users = await sql`SELECT id, "employeeId", name, email, phone, department, role, status, "createdAt" FROM "User" ORDER BY "createdAt" ASC`;
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const d = await req.json();
    const result = await sql`
      INSERT INTO "User" (id, "employeeId", name, email, phone, department, role, status, password, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${d.employeeId}, ${d.name}, ${d.email}, ${d.phone ?? null}, ${d.department ?? null}, ${d.role ?? 'موظف'}, ${d.status ?? 'نشط'}, ${d.password ?? 'hashed'}, now(), now())
      RETURNING id, "employeeId", name, email, phone, department, role, status, "createdAt"`;
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
