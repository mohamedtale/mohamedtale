import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL;
  return NextResponse.json({
    DATABASE_URL: url ? `${url.substring(0, 30)}...` : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  });
}
