import { NextResponse } from "next/server";
import { searchLibrary } from "@/lib/tags";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchLibrary(query);
  return NextResponse.json({ results });
}
