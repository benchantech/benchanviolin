import {runGa4Report,rowsToObjects} from "./ga4-rest-client.mjs";

let response;
try{
  response=await runGa4Report({
    dateRanges:[{startDate:"366daysAgo",endDate:"today"}],
    dimensions:[{name:"searchTerm"},{name:"customEvent:routing_outcome"}],
    metrics:[{name:"eventCount"},{name:"totalUsers"}],
    dimensionFilter:{
      andGroup:{
        expressions:[
          {filter:{fieldName:"eventName",stringFilter:{matchType:"EXACT",value:"view_search_results"}}},
          {orGroup:{expressions:[
            {filter:{fieldName:"customEvent:routing_outcome",stringFilter:{matchType:"EXACT",value:"archive_fallback"}}},
            {filter:{fieldName:"customEvent:routing_outcome",stringFilter:{matchType:"EXACT",value:"no_results"}}}
          ]}}
        ]
      }
    },
    orderBys:[{metric:{metricName:"eventCount"},desc:true}],
    limit:"100"
  });
}catch(error){
  throw new Error("GA4 routing-gap report failed. Confirm routing_outcome custom dimension exists and has propagated. "+error.message);
}

console.log(JSON.stringify({
  schemaVersion:1,
  source:"GA4",
  stage:"runtime_gap",
  eventName:"view_search_results",
  window:{start:"366daysAgo",end:"today"},
  rows:rowsToObjects(response)
},null,2));
