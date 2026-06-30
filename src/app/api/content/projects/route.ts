import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    
    const projects = await sql`SELECT * FROM "PublicProject" WHERE visible = true ORDER BY "order" ASC`;
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    
    const b = await req.json();
    const result = await sql`
      INSERT INTO "PublicProject" (id, title, description, date, region, count, "imageUrl", "order", visible, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${b.title}, ${b.description ?? null}, ${b.date}, ${b.region}, ${b.count}, ${b.imageUrl ?? null}, ${b.order ?? 0}, ${b.visible ?? true}, now(), now())
      RETURNING *`;
    return NextResponse.json(result[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
