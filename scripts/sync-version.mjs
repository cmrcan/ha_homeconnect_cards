import { readFile, writeFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const sourcePath = "src/ha_homeconnect_cards.js";
const source = await readFile(sourcePath, "utf8");
const versionPattern = /const VERSION = "[^"\n]+";/;

if (!versionPattern.test(source)) {
  throw new Error(`Unable to find the card version in ${sourcePath}`);
}

const updated = source.replace(versionPattern, `const VERSION = "${packageJson.version}";`);
await writeFile(sourcePath, updated, "utf8");
console.log(`Synchronized ${sourcePath} to ${packageJson.version}`);
