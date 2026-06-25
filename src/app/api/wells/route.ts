import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const wells = await sql`SELECT * FROM "Well" ORDER BY "createdAt" DESC`;
    return NextResponse.json(wells);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const d = await req.json();
    const result = await sql`
      INSERT INTO "Well" (id, "wellId", name, region, location, latitude, longitude, depth, type, status, "casingType", "pumpType", "waterQuality", cost, notes, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${d.wellId}, ${d.name}, ${d.region}, ${d.location ?? null}, ${d.latitude ?? null}, ${d.longitude ?? null}, ${d.depth ?? null}, ${d.type ?? 'مياه جوفية'}, ${d.status ?? 'فعال'}, ${d.casingType ?? null}, ${d.pumpType ?? null}, ${d.waterQuality ?? null}, ${d.cost ?? null}, ${d.notes ?? null}, now(), now())
      RETURNING *`;
    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
