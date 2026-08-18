import path from "node:path";

export function rootDir() {
  return process.cwd();
}

export function dataDir() {
  return path.resolve(rootDir(), process.env.KBOX_DATA_DIR || ".data");
}