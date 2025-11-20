import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../src/util/general";

async function main() {
  const projectRoot = path.resolve(import.meta.dirname, "..");
  const pkgJsonPath = path.join(projectRoot, "package.json");
  const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));

  const declared = env.KIKU_VERSION;
  const actual = pkg.version;

  if (!actual) {
    console.error("❌ package.json has no version field.");
    process.exit(1);
  }

  if (declared !== actual) {
    console.error(
      `❌ Version mismatch:
  env.KIKU_VERSION = ${declared}
  package.json version = ${actual}`,
    );
    process.exit(1);
  }

  console.log(`✅ Version OK: ${declared}`);
}

main();
