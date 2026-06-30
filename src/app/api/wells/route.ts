import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "";
    let wells;
    if (search && status) {
      wells = await sql`SELECT * FROM "Well" WHERE (name ILIKE ${"%" + search + "%"} OR "wellId" ILIKE ${"%" + search + "%"} OR region ILIKE ${"%" + search + "%"}) AND status = ${status} ORDER BY "createdAt" DESC`;
    } else if (search) {
      wells = await sql`SELECT * FROM "Well" WHERE name ILIKE ${"%" + search + "%"} OR "wellId" ILIKE ${"%" + search + "%"} OR region ILIKE ${"%" + search + "%"} ORDER BY "createdAt" DESC`;
    } else if (status) {
      wells = await sql`SELECT * FROM "Well" WHERE status = ${status} ORDER BY "createdAt" DESC`;
    } else {
      wells = await sql`SELECT * FROM "Well" ORDER BY "createdAt" DESC`;
    }
    return NextResponse.json(wells);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    
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
