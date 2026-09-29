import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {createSign} from "node:crypto";
import {loadLocalEnv} from "./load-local-env.mjs";

loadLocalEnv();

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

async function tokenFromServiceAccount(file){
  const credential=JSON.parse(fs.readFileSync(file,"utf8"));
  if(credential.type!=="service_account"||!credential.client_email||!credential.private_key) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not a service-account credential.");
  }
  const now=Math.floor(Date.now()/1000);
  const header=base64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const payload=base64url(JSON.stringify({
    iss:credential.client_email,
    scope:"https://www.googleapis.com/auth/analytics.readonly",
    aud:credential.token_uri||"https://oauth2.googleapis.com/token",
    iat:now,
    exp:now+3600
  }));
  const unsigned=header+"."+payload;
  const signer=createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion=unsigned+"."+base64url(signer.sign(credential.private_key));
  const body=new URLSearchParams({
    grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  });
  const response=await fetch(credential.token_uri||"https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body
  });
  const json=await response.json();
  if(!response.ok||!json.access_token) throw new Error("service-account token exchange failed: "+JSON.stringify(json));
  return json.access_token;
}

async function tokenFromAuthorizedUser(file){
  const credential=JSON.parse(fs.readFileSync(file,"utf8"));
  if(credential.type!=="authorized_user"||!credential.client_id||!credential.client_secret||!credential.refresh_token) {
    throw new Error("ADC credential is not an authorized-user credential.");
  }
  const body=new URLSearchParams({
    grant_type:"refresh_token",
    client_id:credential.client_id,
    client_secret:credential.client_secret,
    refresh_token:credential.refresh_token
  });
  const response=await fetch("https://oauth2.googleapis.com/token",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body
  });
  const json=await response.json();
  if(!response.ok||!json.access_token) throw new Error("authorized-user token refresh failed: "+JSON.stringify(json));
  return json.access_token;
}

async function accessToken(){
  if(process.env.GA4_ACCESS_TOKEN) return process.env.GA4_ACCESS_TOKEN;

  const explicit=process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if(explicit&&fs.existsSync(explicit)){
    const credential=JSON.parse(fs.readFileSync(explicit,"utf8"));
    if(credential.type==="service_account") return tokenFromServiceAccount(explicit);
    if(credential.type==="authorized_user") return tokenFromAuthorizedUser(explicit);
    throw new Error("unsupported GOOGLE_APPLICATION_CREDENTIALS type: "+String(credential.type));
  }

  const home=captainHome();
  const adc=home?path.join(home,".config","gcloud","application_default_credentials.json"):"";
  if(adc&&fs.existsSync(adc)) return tokenFromAuthorizedUser(adc);

  const gcloud=spawnSync("gcloud",["auth","application-default","print-access-token"],{
    encoding:"utf8",
    env:{...process.env,HOME:home||process.env.HOME}
  });
  if(gcloud.status===0&&gcloud.stdout.trim()) return gcloud.stdout.trim();

  throw new Error("No local GA4 credential available. Configure gcloud ADC or GOOGLE_APPLICATION_CREDENTIALS on the Captain Mac.");
}

export function requirePropertyId(){
  const propertyId=process.env.GA4_PROPERTY_ID;
  if(!propertyId||!/^\d+$/.test(propertyId)) throw new Error("GA4_PROPERTY_ID must be set to the numeric GA4 property ID.");
  return propertyId;
}

export async function runGa4Report(request){
  const propertyId=requirePropertyId();
  const token=await accessToken();
  const response=await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,{
    method:"POST",
    headers:{
      authorization:`Bearer ${token}`,
      "content-type":"application/json"
    },
    body:JSON.stringify(request)
  });
  const text=await response.text();
  let json;
  try{json=JSON.parse(text);}catch{json={raw:text};}
  if(!response.ok) throw new Error("GA4 runReport failed "+response.status+": "+JSON.stringify(json));
  return json;
}

export function rowsToObjects(report){
  const dimensions=(report.dimensionHeaders||[]).map(x=>x.name);
  const metrics=(report.metricHeaders||[]).map(x=>x.name);
  return (report.rows||[]).map(row=>{
    const out={};
    dimensions.forEach((name,index)=>{out[name]=row.dimensionValues?.[index]?.value??"";});
    metrics.forEach((name,index)=>{out[name]=Number(row.metricValues?.[index]?.value??0);});
    return out;
  });
}
