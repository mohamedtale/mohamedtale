import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url);
    const wellId = url.searchParams.get("wellId");
    const reports = wellId
      ? await sql`SELECT * FROM "Report" WHERE "wellId" = ${wellId} ORDER BY "createdAt" DESC`
      : await sql`SELECT * FROM "Report" ORDER BY "createdAt" DESC`;
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    
    const d = await req.json();
    const result = await sql`
      INSERT INTO "Report" (id, title, type, status, author, reviewer, "wellId", "fileSize", content, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${d.title}, ${d.type}, ${d.status ?? 'مسودة'}, ${d.author}, ${d.reviewer ?? null}, ${d.wellId ?? null}, ${d.fileSize ?? null}, ${d.content ?? null}, now(), now())
      RETURNING *`;
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
