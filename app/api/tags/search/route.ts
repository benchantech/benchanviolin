import { NextResponse } from "next/server";
import {
  confirmTechnicalRoute,
  resolveTechnicalBranch,
  routeTechnicalQuestion,
} from "@/lib/benchanviolin-deterministic-router";
import { getRouteEvidence, getRouteNodeEvidence, searchLibrary } from "@/lib/tags";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const routeId = searchParams.get("routeId")?.trim() ?? "";
  const directRouteId = searchParams.get("route")?.trim() ?? "";
  const directNodeId = searchParams.get("node")?.trim() ?? "";
  const branchOption = searchParams.get("branchOption")?.trim() ?? "";
  const confirmRouteId = searchParams.get("confirmRouteId")?.trim() ?? "";

  if (directNodeId) {
    const results = await getRouteNodeEvidence(directNodeId);
    return NextResponse.json({
      kind: "DIRECT",
      authority: "governed",
      route: results[0]?.route_id ? confirmTechnicalRoute(results[0].route_id).route : undefined,
      results,
    });
  }

  if (directRouteId) {
    const governed = confirmTechnicalRoute(directRouteId);
    if (governed.kind !== "FALLBACK") {
      const results = await getRouteEvidence(directRouteId);
      return NextResponse.json({ ...governed, results });
    }
    return NextResponse.json(governed);
  }

  if (routeId && branchOption) {
    const governed = resolveTechnicalBranch(routeId, branchOption);
    if (governed.kind !== "FALLBACK") {
      const results = await getRouteEvidence(routeId, `${routeId}:${branchOption}`);
      return NextResponse.json({ ...governed, results });
    }
    return NextResponse.json(governed);
  }

  if (confirmRouteId) {
    const governed = confirmTechnicalRoute(confirmRouteId);
    if (governed.kind !== "FALLBACK") {
      const results = await getRouteEvidence(confirmRouteId);
      return NextResponse.json({ ...governed, results });
    }
    return NextResponse.json(governed);
  }

  if (!query) {
    return NextResponse.json({ kind: "FALLBACK", results: [] });
  }

  const governed = routeTechnicalQuestion(query);

  if (governed.kind !== "FALLBACK") {
    const results = governed.route?.routeId ? await getRouteEvidence(governed.route.routeId) : [];
    return NextResponse.json({ ...governed, results });
  }

  const results = await searchLibrary(governed.fallbackQuery ?? query);
  return NextResponse.json({ ...governed, results });
}
