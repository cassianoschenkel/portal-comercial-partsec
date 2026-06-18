import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "portal-comercial-partsec",
    timestamp: new Date().toISOString(),
  });
}
