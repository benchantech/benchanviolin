"use client";

export type RoutingOutcome =
  | "governed_direct"
  | "governed_branch"
  | "governed_confirm"
  | "archive_fallback"
  | "no_results";

export type AnalyticsEventName =
  | "view_search_results"
  | "library_result_click"
  | "technical_branch_choice"
  | "video_start";

export type AnalyticsParams = {
  search_term?: string;
  result_count?: number;
  routing_outcome?: RoutingOutcome;
  route_id?: string;
  result_type?: string;
  result_id?: string;
  result_position?: number;
  branch_option?: string;
  segment_id?: string;
  video_id?: string;
};

const maxParamLength = 100;
const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const phonePattern = /(?:\+?\d[\s().-]*){7,}/;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: Record<string, string | number>) => void;
  }
}

function canSendAnalytics() {
  return typeof window !== "undefined" && process.env.NODE_ENV !== "test" && typeof window.gtag === "function";
}

export function normalizeAnalyticsString(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, maxParamLength);
}

export function isSafeAnalyticsSearchTerm(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return normalized.length >= 2 && normalized.length <= maxParamLength && !emailPattern.test(value) && !phonePattern.test(value);
}

function cleanString(value: string) {
  const normalized = normalizeAnalyticsString(value);
  return normalized || undefined;
}

function cleanParams(params: AnalyticsParams) {
  const cleaned: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      cleaned[key] = value;
      continue;
    }

    if (typeof value === "string") {
      const next = cleanString(value);
      if (next) cleaned[key] = next;
    }
  }

  return cleaned;
}

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (!canSendAnalytics()) return;
  window.gtag?.("event", eventName, cleanParams(params));
}

export function trackLibrarySearch(params: Required<Pick<AnalyticsParams, "search_term" | "result_count" | "routing_outcome">> &
  Pick<AnalyticsParams, "route_id">) {
  if (!isSafeAnalyticsSearchTerm(params.search_term)) return;
  trackEvent("view_search_results", params);
}

export function trackLibraryResultClick(
  params: Required<Pick<AnalyticsParams, "search_term" | "routing_outcome" | "result_type" | "result_id" | "result_position">> &
    Pick<AnalyticsParams, "route_id" | "segment_id" | "video_id">,
) {
  if (!isSafeAnalyticsSearchTerm(params.search_term)) return;
  trackEvent("library_result_click", params);
}
