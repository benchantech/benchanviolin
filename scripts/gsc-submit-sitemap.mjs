import fs from "node:fs";
import path from "node:path";
import {createSign} from "node:crypto";

const SITE_URL="sc-domain:benchanviolin.com";
const SITEMAP_URL="https://benchanviolin.com/sitemap.xml";
const SCOPE="https://www.googleapis.com/auth/webmasters";

function base64url(value){
  const input=Buffer.isBuffer(value)?value:Buffer.from(value);
  return input.toString("base64").replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}

function captainHome(){
  if(process.env.BCT_CAPTAIN_HOME) return process.env.BCT_CAPTAIN_HOME;
  const marker=path.join("Library","Application Support","BenChanTech","BctRunner");
  const cwd=process.cwd();
  const index=cwd.indexOf(marker);
  if(index>0) return cwd.slice(0,index).replace(/[\\/]$/,"");
  return process.env.HOME||"";
}

function serviceAccountPath(){
  const explicit=process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if(explicit&&fs.existsSync(explicit)) return explicit;
  const home=captainHome();
  const documented=home?path.join(home,"credentials","benchanviolin-914529c4af97.json"):"";
  if(documented&&fs.existsSync(documented)) return documented;
  throw new Error("No local service-account key found for Search Console sitemap submission.");
}

async function accessToken(){
  const file=serviceAccountPath();
  const credential=JSON.parse(fs.readFileSync(file,"utf8"));
  if(credential.type!=="service_account"||!credential.client_email||!credential.private_key){
    throw new Error("Search Console submission requires the existing local service-account credential.");
  }

  const now=Math.floor(Date.now()/1000);
  const header=base64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const payload=base64url(JSON.stringify({
    iss:credential.client_email,
    scope:SCOPE,
    aud:credential.token_uri||"https://oauth2.googleapis.com/token",
    iat:now,
    exp:now+3600
  }));
  const unsigned=header+"."+payload;
  const signer=createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion=unsigned+"."+base64url(signer.sign(credential.private_key));

  const response=await fetch(credential.token_uri||"https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const json=await response.json();
  if(!response.ok||!json.access_token){
    throw new Error("Service-account token exchange failed: "+JSON.stringify(json));
  }
  return json.access_token;
}

const token=await accessToken();
const site=encodeURIComponent(SITE_URL);
const sitemap=encodeURIComponent(SITEMAP_URL);
const endpoint=`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps/${sitemap}`;

const submit=await fetch(endpoint,{
  method:"PUT",
  headers:{authorization:`Bearer ${token}`}
});
const submitText=await submit.text();
if(!submit.ok){
  throw new Error("Search Console sitemap submit failed "+submit.status+": "+submitText);
}

const list=await fetch(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps`,{
  headers:{authorization:`Bearer ${token}`}
});
const listText=await list.text();
let listJson;
try{listJson=JSON.parse(listText);}catch{listJson={};}
if(!list.ok){
  throw new Error("Search Console sitemap verification failed "+list.status+": "+listText);
}

const match=(listJson.sitemap||[]).find(item=>item.path===SITEMAP_URL)||null;
console.log(JSON.stringify({
  schemaVersion:1,
  source:"Google Search Console",
  action:"submit_sitemap",
  property:SITE_URL,
  sitemap:SITEMAP_URL,
  submitStatus:submit.status,
  confirmed:Boolean(match),
  lastSubmitted:match?.lastSubmitted||null,
  isPending:match?.isPending??null,
  warnings:match?.warnings??null,
  errors:match?.errors??null
},null,2));

if(!match) throw new Error("Sitemap submission returned success but was not present in the follow-up list.");
