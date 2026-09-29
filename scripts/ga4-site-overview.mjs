import {runGa4Report,rowsToObjects} from "./ga4-rest-client.mjs";

const range={startDate:"366daysAgo",endDate:"today"};

const [totals, pages, channels]=await Promise.all([
  runGa4Report({
    dateRanges:[range],
    metrics:[
      {name:"activeUsers"},
      {name:"sessions"},
      {name:"engagedSessions"},
      {name:"screenPageViews"}
    ]
  }),
  runGa4Report({
    dateRanges:[range],
    dimensions:[{name:"pagePath"}],
    metrics:[{name:"screenPageViews"},{name:"activeUsers"}],
    orderBys:[{metric:{metricName:"screenPageViews"},desc:true}],
    limit:"50"
  }),
  runGa4Report({
    dateRanges:[range],
    dimensions:[{name:"sessionDefaultChannelGroup"}],
    metrics:[{name:"sessions"},{name:"activeUsers"}],
    orderBys:[{metric:{metricName:"sessions"},desc:true}],
    limit:"25"
  })
]);

console.log(JSON.stringify({
  schemaVersion:1,
  source:"GA4",
  stage:"arrival_behavior",
  window:{start:"366daysAgo",end:"today"},
  totals:rowsToObjects(totals)[0]||{},
  topPages:rowsToObjects(pages),
  acquisitionChannels:rowsToObjects(channels)
},null,2));
