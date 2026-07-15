import { NextResponse } from "next/server";
import {
  confirmTechnicalRoute,
  resolveTechnicalBranch,
  routeTechnicalQuestion,
} from "@/lib/benchanviolin-deterministic-router";
import { searchLibrary } from "@/lib/tags";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const routeId = searchParams.get("routeId")?.trim() ?? "";
  const branchOption = searchParams.get("branchOption")?.trim() ?? "";
  const confirmRouteId = searchParams.get("confirmRouteId")?.trim() ?? "";

  if (routeId && branchOption) {
    return NextResponse.json(resolveTechnicalBranch(routeId, branchOption));
  }

  if (confirmRouteId) {
    return NextResponse.json(confirmTechnicalRoute(confirmRouteId));
  }

  if (!query) {
    return NextResponse.json({ kind: "FALLBACK", results: [] });
  }

  const governed = routeTechnicalQuestion(query);

  if (governed.kind !== "FALLBACK") {
    return NextResponse.json(governed);
  }

  const results = await searchLibrary(governed.fallbackQuery ?? query);
  return NextResponse.json({ ...governed, results });
}
