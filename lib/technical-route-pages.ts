import {
  listTechnicalRouteDetails,
  type RoutePayload,
} from "@/lib/benchanviolin-deterministic-router";

export type TechnicalRouteDetail = ReturnType<typeof listTechnicalRouteDetails>[number];

const routeDetails = listTechnicalRouteDetails();
const routeById = new Map(routeDetails.map((route) => [route.id, route]));

export function getRouteSlug(routeId: string) {
  return routeId;
}

export function getRouteUrl(routeId: string) {
  return `/library/routes/${getRouteSlug(routeId)}`;
}

export function getBranchUrl(routeId: string, branchId: string) {
  return `${getRouteUrl(routeId)}/${branchId}`;
}

export function getTechnicalRoute(routeId: string) {
  return routeById.get(routeId) ?? null;
}

export function getTechnicalBranch(routeId: string, branchId: string) {
  const route = getTechnicalRoute(routeId);
  if (!route?.branch) return null;
  const branch = route.branch.options.find((option) => option.id === branchId);
  if (!branch) return null;

  const payload = branch.result as Partial<RoutePayload> & {
    summary?: string;
    firstAction?: string;
    searchTerms?: string[];
  };

  return {
    id: branch.id,
    label: branch.label,
    summary: payload.summary || route.summary,
    firstAction: payload.firstAction || route.firstAction,
    searchTerms: payload.searchTerms || route.searchTerms,
  };
}

export function listTechnicalRoutePages() {
  return routeDetails.map((route) => ({
    routeId: route.id,
    slug: getRouteSlug(route.id),
    title: route.label,
    domain: route.domain,
    hasBranch: Boolean(route.branch),
  }));
}

export function listTechnicalBranchPages() {
  return routeDetails.flatMap((route) =>
    route.branch
      ? route.branch.options.map((option) => ({
          routeId: route.id,
          slug: getRouteSlug(route.id),
          branchId: option.id,
          title: option.label,
          domain: route.domain,
        }))
      : [],
  );
}

export function relatedRoutesFor(route: TechnicalRouteDetail, limit = 4) {
  return routeDetails
    .filter((candidate) => candidate.id !== route.id && candidate.domain === route.domain)
    .sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function routeBoundary(route: TechnicalRouteDetail) {
  if (route.id === "shoulder-neck-pain") {
    return "Pain, numbness, tingling, or recurring discomfort belongs with the current teacher and an appropriate healthcare professional. Do not use this route to diagnose or push through symptoms.";
  }

  if (route.id === "bridge-soundpost-setup") {
    return "Bridge, soundpost, crack, or structural uncertainty belongs with a qualified violin shop or luthier. This page is for routing and vocabulary, not repair authorization.";
  }

  if (route.id === "tuning-instrument") {
    return "Instrument tuning is separate from learner intonation. Stop forcing a peg, fine tuner, bridge, or fitting that reaches a mechanical limit or feels unsafe.";
  }

  return "This route can help name an observable violin problem and choose a bounded test. It does not override the learner's current teacher or diagnose an individual player from a webpage.";
}
