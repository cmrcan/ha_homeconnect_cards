import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "src/ha_homeconnect_cards.js");
const targetPath = resolve(root, "dist/ha_homeconnect_cards.js");

const source = await readFile(sourcePath, "utf8");

if (!source.includes('customElements.define("homeconnect-card"')) {
  throw new Error("Source does not register custom:homeconnect-card");
}

const { code } = await transform(source, {
  format: "esm",
  legalComments: "eof",
  minify: true,
  target: "es2022",
});

await mkdir(dirname(targetPath), { recursive: true });
await writeFile(targetPath, code, "utf8");

console.log(
  `Built ${targetPath} (${Buffer.byteLength(source)} → ${Buffer.byteLength(code)} bytes)`,
);