import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const propertyId = process.env.GA4_PROPERTY_ID;

if (!propertyId || !/^\d+$/.test(propertyId)) {
  throw new Error("GA4_PROPERTY_ID must be set to the numeric GA4 property ID.");
}

const client = new BetaAnalyticsDataClient();
let response;

try {
  [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "searchTerm" }, { name: "customEvent:routing_outcome" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: "eventName",
              stringFilter: { matchType: "EXACT", value: "view_search_results" },
            },
          },
          {
            orGroup: {
              expressions: [
                {
                  filter: {
                    fieldName: "customEvent:routing_outcome",
                    stringFilter: { matchType: "EXACT", value: "archive_fallback" },
                  },
                },
                {
                  filter: {
                    fieldName: "customEvent:routing_outcome",
                    stringFilter: { matchType: "EXACT", value: "no_results" },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 50,
  });
} catch (error) {
  if (error.code === 3) {
    throw new Error(
      "GA4 rejected the report request. Confirm custom dimension routing_outcome exists and has propagated.",
    );
  }
  throw error;
}

const rows = (response.rows ?? []).map((row) => ({
  searchTerm: row.dimensionValues?.[0]?.value ?? "",
  routingOutcome: row.dimensionValues?.[1]?.value ?? "",
  eventCount: row.metricValues?.[0]?.value ?? "0",
  totalUsers: row.metricValues?.[1]?.value ?? "0",
}));

if (rows.length === 0) {
  console.log("No archive_fallback or no_results search events found in the last 30 days.");
} else {
  console.table(rows);
}
