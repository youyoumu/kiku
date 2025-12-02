import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../src/util/general";
import { getSsrTemplate } from "./ssr.js";
import { log } from "./util.js";

export async function validateVersion() {
  const projectRoot = join(import.meta.dirname, "..");
  const pkgJsonPath = join(projectRoot, "package.json");
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
  return actual;
}

async function main() {
  const version = `v${await validateVersion()}`;

  const frontSrcPath = join(import.meta.dirname, "../src/front.html");
  const frontDestPath = join(import.meta.dirname, "../dist/_kiku_front.html");
  const backSrcPath = join(import.meta.dirname, "../src/back.html");
  const backDestPath = join(import.meta.dirname, "../dist/_kiku_back.html");
  const styleSrcPath = join(import.meta.dirname, "../src/style.css");
  const styleDestPath = join(import.meta.dirname, "../dist/_kiku_style.css");
  const cssSrcPath = join(import.meta.dirname, "../dist/_kiku.css");
  const cssDestPath = join(import.meta.dirname, "../dist/_kiku.css");
  const pluginDestPath = join(import.meta.dirname, "../dist/_kiku_plugin.js");

  const [frontSrc, backSrc, styleSrc, cssSrc] = await Promise.all([
    readFile(frontSrcPath, "utf8"),
    readFile(backSrcPath, "utf8"),
    readFile(styleSrcPath, "utf8"),
    readFile(cssSrcPath, "utf8"),
  ]);

  const { frontSsrTemplate, backSsrTemplate, hydrationScript } =
    getSsrTemplate();

  log.yellow("Front SSR Template:");
  log.gray(frontSsrTemplate);
  log.yellow("Back SSR Template:");
  log.gray(backSsrTemplate);
  log.yellow("Hydration Script:");
  log.gray(hydrationScript);

  const frontTemplate = frontSrc
    .replace("__VERSION__", version)
    .replace("<!-- SSR_TEMPLATE -->", frontSsrTemplate)
    .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
  const backTemplate = backSrc
    .replace("__VERSION__", version)
    .replace("<!-- SSR_TEMPLATE -->", backSsrTemplate)
    .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
  const styleTemplate = styleSrc.replace("__VERSION__", version);
  const cssTemplate = cssSrc;

  await Promise.all([
    writeFile(frontDestPath, frontTemplate),
    writeFile(backDestPath, backTemplate),
    writeFile(styleDestPath, styleTemplate),
    writeFile(cssDestPath, cssTemplate),
    writeFile(pluginDestPath, "export const plugin = {}"),
  ]);
}
main()
  .catch((err) => {
    console.error("❌ Failed to generate template:", err);
    process.exit(1);
  })
  .then(() => {
    console.log("✅ Generated template");
  });
