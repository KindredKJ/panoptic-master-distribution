import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { buildSystem } from "../runtime/system.mjs";
import { describePortZero } from "../port-zero/index.mjs";
import { geometry, cubeTopology, strata } from "../core/config.mjs";
import { verifyCubeTopology } from "../geometry/cube-topology.mjs";

const system=buildSystem();
const host=process.env.KBOX_HOST||"127.0.0.1";
const port=Number(process.env.KBOX_PORT||8788);
const expectedToken=process.env.KBOX_BOOTSTRAP_TOKEN||"";
if(!expectedToken) throw new Error("KBOX_BOOTSTRAP_TOKEN is required in .env.local");

function json(res,status,body){
  const payload=JSON.stringify(body,null,2);
  res.writeHead(status,{
    "content-type":"application/json; charset=utf-8",
    "content-length":Buffer.byteLength(payload),
    "x-content-type-options":"nosniff",
    "x-frame-options":"DENY",
    "referrer-policy":"no-referrer",
    "cache-control":"no-store"
  });
  res.end(payload);
}

function safeEqual(a,b){
  const aa=Buffer.from(a),bb=Buffer.from(b);
  return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);
}

function authenticated(req){
  const m=/^Bearer (.+)$/.exec(req.headers.authorization||"");
  return Boolean(m&&safeEqual(m[1],expectedToken));
}

async function body(req){
  const chunks=[]; let size=0;
  for await(const chunk of req){
    size+=chunk.length;
    if(size>1024*1024) throw new Error("BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  return chunks.length?JSON.parse(Buffer.concat(chunks).toString("utf8")):{};
}

const dashboard=fs.readFileSync(path.resolve(process.cwd(),"src/api/dashboard.html"),"utf8");

const server=http.createServer(async(req,res)=>{
  const requestId=crypto.randomUUID();
  try{
    const url=new URL(req.url,`http://${req.headers.host||"localhost"}`);
    const p=url.pathname;

    if(req.method==="GET"&&p==="/"){
      res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});
      return res.end(dashboard);
    }
    if(req.method==="GET"&&p==="/health"){
      return json(res,200,{ok:true,system:"Kindred Panoptic Master",portZero:describePortZero(),cube:verifyCubeTopology(),volumes:system.volumes.verifyIntegrity(),evidence:system.evidence.verify()});
    }

    if(p.startsWith("/v2/")&&!authenticated(req)) return json(res,401,{error:"UNAUTHENTICATED",requestId});

    if(req.method==="GET"&&p==="/v2/master") return json(res,200,system.panoptic.state());
    if(req.method==="GET"&&p==="/v2/origin") return json(res,200,describePortZero());
    if(req.method==="GET"&&p==="/v2/geometry") return json(res,200,geometry);
    if(req.method==="GET"&&p==="/v2/faces") return json(res,200,geometry.metaCube.faces);
    if(req.method==="GET"&&p==="/v2/edges") return json(res,200,cubeTopology.edges);
    if(req.method==="GET"&&p==="/v2/vertices") return json(res,200,cubeTopology.vertices);
    if(req.method==="GET"&&p==="/v2/strata") return json(res,200,strata);
    if(req.method==="GET"&&p==="/v2/adapters") return json(res,200,system.adapters.all());
    if(req.method==="GET"&&p==="/v2/volumes") return json(res,200,system.volumes.all());
    if(req.method==="GET"&&p==="/v2/topology") return json(res,200,system.volumes.topology());
    if(req.method==="GET"&&p==="/v2/topology/verify") return json(res,200,{cube:verifyCubeTopology(),volumes:system.volumes.verifyIntegrity(),evidence:system.evidence.verify()});
    if(req.method==="GET"&&p==="/v2/evidence") return json(res,200,system.evidence.all());
    if(req.method==="GET"&&p==="/v2/evidence/verify") return json(res,200,system.evidence.verify());
    if(req.method==="GET"&&p==="/v2/intents") return json(res,200,system.pipeline.all());
    if(req.method==="GET"&&p==="/v2/value-events") return json(res,200,system.retrobank.allValueEvents());

    if(req.method==="GET"&&p==="/v2/geometry/relationship"){
      return json(res,200,system.volumes.relationship(url.searchParams.get("a"),url.searchParams.get("b")));
    }

    if(req.method==="POST"&&p==="/v2/volumes"){
      const v=system.volumes.register(await body(req));
      system.evidence.append("volume.registered",v);
      return json(res,201,v);
    }
    if(req.method==="POST"&&p==="/v2/intents") return json(res,201,system.pipeline.submit(await body(req)));
    const approve=/^\/v2\/intents\/([^/]+)\/approve$/.exec(p);
    if(req.method==="POST"&&approve) return json(res,200,system.pipeline.approve(approve[1]));
    const execute=/^\/v2\/intents\/([^/]+)\/execute$/.exec(p);
    if(req.method==="POST"&&execute) return json(res,200,system.pipeline.execute(execute[1]));
    if(req.method==="POST"&&p==="/v2/value-events") return json(res,201,system.retrobank.recordVerifiedValue(await body(req)));

    return json(res,404,{error:"NOT_FOUND",requestId});
  }catch(error){
    return json(res,400,{error:error instanceof Error?error.message:"UNKNOWN_ERROR",requestId});
  }
});

server.listen(port,host,()=>{
  console.log("");
  console.log("KINDRED PANOPTIC MASTER ONLINE");
  console.log(`Dashboard: http://${host}:${port}/`);
  console.log(`Health:    http://${host}:${port}/health`);
  console.log("Port Zero: (0,0,0)");
  console.log("External execution: FAIL-CLOSED");
  console.log("");
});