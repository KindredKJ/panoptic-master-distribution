import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "../core/paths.mjs";

export class FounderKeyStore {
  constructor(base = dataDir()) {
    this.dir = path.join(base,"authority");
    this.privatePath = path.join(this.dir,"founder-ed25519-private.pem");
    this.publicPath = path.join(this.dir,"founder-ed25519-public.pem");
    fs.mkdirSync(this.dir,{recursive:true});
    this.ensure();
  }

  ensure() {
    if (fs.existsSync(this.privatePath) && fs.existsSync(this.publicPath)) return;
    const {publicKey,privateKey} = crypto.generateKeyPairSync("ed25519");
    fs.writeFileSync(this.privatePath, privateKey.export({type:"pkcs8",format:"pem"}), {encoding:"utf8",mode:0o600});
    fs.writeFileSync(this.publicPath, publicKey.export({type:"spki",format:"pem"}), {encoding:"utf8",mode:0o644});
    try { fs.chmodSync(this.privatePath,0o600); } catch {}
  }

  privateKey() { return crypto.createPrivateKey(fs.readFileSync(this.privatePath,"utf8")); }
  publicKey() { return crypto.createPublicKey(fs.readFileSync(this.publicPath,"utf8")); }

  fingerprint() {
    const der = this.publicKey().export({type:"spki",format:"der"});
    return crypto.createHash("sha256").update(der).digest("hex");
  }
}