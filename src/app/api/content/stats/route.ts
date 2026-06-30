import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    
    const configs = await sql`SELECT key, value FROM "SiteConfig"`;
    const map: Record<string, string> = {};
    for (const c of configs) map[c.key] = c.value;
    return NextResponse.json(map, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: Request) {
  try {
    
    const body: Record<string, string> = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO "SiteConfig" (id, key, value, "updatedAt")
        VALUES (gen_random_uuid()::text, ${key}, ${value}, now())
        ON CONFLICT (key) DO UPDATE SET value = ${value}, "updatedAt" = now()`;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
