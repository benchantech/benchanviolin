import fs from "node:fs";

const files=[
  "scripts/ga4-rest-client.mjs",
  "scripts/ga4-site-overview.mjs",
  "scripts/ga4-searches.mjs",
  "scripts/ga4-routing-gaps.mjs"
];
for(const file of files){
  const source=fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
  if(source.includes("@google-analytics/data")) throw new Error(file+" must not require installed GA4 npm dependencies");
  for(const forbidden of [":batchRunReports",":runRealtimeReport","admin.googleapis.com","createProperty","updateProperty","deleteProperty"]){
    if(source.includes(forbidden)) throw new Error(file+" contains forbidden mutation-capable token: "+forbidden);
  }
}
const client=fs.readFileSync(new URL("./ga4-rest-client.mjs",import.meta.url),"utf8");
if(!client.includes(":runReport")) throw new Error("GA4 REST client must use read-only runReport endpoint");
if(!client.includes("analytics.readonly")) throw new Error("GA4 REST client must request analytics.readonly scope");
console.log("analytics profile read-only REST contract ok");
