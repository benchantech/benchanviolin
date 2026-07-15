import { createRequire } from "node:module";

export type RouteKind = "DIRECT" | "BRANCH" | "CONFIRM" | "FALLBACK";

export type RoutePayload = {
  routeId: string;
  label: string;
  domain: string;
  summary: string;
  firstAction: string;
  verification: string;
  stopCondition: string;
  searchTerms: string[];
};

export type RouteResult = {
  kind: RouteKind;
  normalizedQuery: string;
  authority: "governed" | "archive";
  route?: RoutePayload;
  branch?: {
    prompt: string;
    options: { id: string; label: string }[];
  };
  candidates?: { routeId: string; label: string }[];
  fallbackQuery?: string;
  message?: string;
};

type RouterModule = {
  normalizeText(input: string): string;
  routeTechnicalQuestion(input: string): RouteResult;
  resolveTechnicalBranch(routeId: string, optionId: string): RouteResult;
  confirmTechnicalRoute(routeId: string): RouteResult;
  listTechnicalRoutes(): {
    id: string;
    label: string;
    domain: string;
    priority: number;
    searchTerms: string[];
    hasBranch: boolean;
  }[];
  listTechnicalRouteDetails(): {
    id: string;
    label: string;
    domain: string;
    priority: number;
    exact: string[];
    tokenGroups: string[][];
    exclude: string[];
    summary: string;
    firstAction: string;
    verification: string;
    stopCondition: string;
    searchTerms: string[];
    branch: null | {
      prompt: string;
      options: { id: string; label: string; result: Record<string, unknown> }[];
    };
  }[];
  validateTechnicalRouter(): {
    routeCount: number;
    exactPhraseCount: number;
    status: "valid";
  };
};

const require = createRequire(import.meta.url);
const router = require("./benchanviolin-deterministic-router.cjs") as RouterModule;

export const {
  normalizeText,
  routeTechnicalQuestion,
  resolveTechnicalBranch,
  confirmTechnicalRoute,
  listTechnicalRoutes,
  listTechnicalRouteDetails,
  validateTechnicalRouter,
} = router;
