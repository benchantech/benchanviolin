import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const propertyId = process.env.GA4_PROPERTY_ID;
const daysArg = process.argv[2] ?? "30";
const days = Number.parseInt(daysArg, 10);

if (!propertyId || !/^\d+$/.test(propertyId)) {
  throw new Error("GA4_PROPERTY_ID must be set to the numeric GA4 property ID.");
}

if (!Number.isInteger(days) || days < 1 || days > 366) {
  throw new Error("Optional day count must be an integer from 1 to 366.");
}

const client = new BetaAnalyticsDataClient();
let response;

try {
  [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [
      { name: "searchTerm" },
      { name: "customEvent:routing_outcome" },
      { name: "customEvent:route_id" },
    ],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: { matchType: "EXACT", value: "view_search_results" },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 50,
  });
} catch (error) {
  if (error.code === 3) {
    throw new Error(
      "GA4 rejected the report request. Confirm custom dimensions routing_outcome and route_id exist and have propagated.",
    );
  }
  throw error;
}

const rows = (response.rows ?? []).map((row) => ({
  searchTerm: row.dimensionValues?.[0]?.value ?? "",
  routingOutcome: row.dimensionValues?.[1]?.value ?? "",
  routeId: row.dimensionValues?.[2]?.value ?? "",
  eventCount: row.metricValues?.[0]?.value ?? "0",
  totalUsers: row.metricValues?.[1]?.value ?? "0",
}));

if (rows.length === 0) {
  console.log(`No view_search_results events found in the last ${days} days.`);
} else {
  console.table(rows);
}
