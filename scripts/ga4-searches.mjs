import {runGa4Report,rowsToObjects} from "./ga4-rest-client.mjs";

let response;
try{
  response=await runGa4Report({
    dateRanges:[{startDate:"366daysAgo",endDate:"today"}],
    dimensions:[
      {name:"searchTerm"},
      {name:"customEvent:routing_outcome"},
      {name:"customEvent:route_id"}
    ],
    metrics:[{name:"eventCount"},{name:"totalUsers"}],
    dimensionFilter:{
      filter:{
        fieldName:"eventName",
        stringFilter:{matchType:"EXACT",value:"view_search_results"}
      }
    },
    orderBys:[{metric:{metricName:"eventCount"},desc:true}],
    limit:"100"
  });
}catch(error){
  throw new Error("GA4 search report failed. Confirm routing_outcome and route_id custom dimensions exist and have propagated. "+error.message);
}

console.log(JSON.stringify({
  schemaVersion:1,
  source:"GA4",
  stage:"behavior",
  eventName:"view_search_results",
  window:{start:"366daysAgo",end:"today"},
  rows:rowsToObjects(response)
},null,2));
