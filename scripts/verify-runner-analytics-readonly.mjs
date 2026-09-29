import fs from "node:fs";

const files=["scripts/ga4-searches.mjs","scripts/ga4-routing-gaps.mjs"];
for(const file of files){
  const source=fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
  if(!source.includes("client.runReport(")) throw new Error(file+" must use GA4 runReport");
  for(const forbidden of ["runRealtimeReport(","batchRunReports(","create","update","delete","insert","writeFile","appendFile"]){
    if(source.includes(forbidden)) throw new Error(file+" contains forbidden mutation-capable token: "+forbidden);
  }
}
console.log("analytics profile read-only contract ok");
