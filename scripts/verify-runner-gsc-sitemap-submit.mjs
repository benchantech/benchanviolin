import fs from "node:fs";

const source=fs.readFileSync(new URL("./gsc-submit-sitemap.mjs",import.meta.url),"utf8");

for(const required of [
  'const SITE_URL="sc-domain:benchanviolin.com"',
  'const SITEMAP_URL="https://benchanviolin.com/sitemap.xml"',
  'const SCOPE="https://www.googleapis.com/auth/webmasters"',
  'method:"PUT"',
  '/webmasters/v3/sites/'
]){
  if(!source.includes(required)) throw new Error("missing required bounded sitemap-submit contract: "+required);
}

for(const forbidden of [
  'method:"DELETE"',
  'searchAnalytics/query',
  'urlInspection',
  'admin.googleapis.com'
]){
  if(source.includes(forbidden)) throw new Error("forbidden Search Console mutation surface: "+forbidden);
}

if((source.match(/method:"PUT"/g)||[]).length!==1) throw new Error("exactly one Search Console PUT must be present");
console.log("gsc sitemap-submit profile contract ok");
