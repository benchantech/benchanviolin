import { NextResponse } from "next/server";
import { getSegmentsForTag } from "@/lib/segments";
import { getTagDetail } from "@/lib/tags";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const tag = await getTagDetail(slug);

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const segments = await getSegmentsForTag(slug);
  return NextResponse.json({ tag, segments });
}
