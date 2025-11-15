import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSsrTemplate } from "./ssr.js";

async function main() {
  const frontSrcPath = join(import.meta.dirname, "../src/front.html");
  const frontDestPath = join(import.meta.dirname, "../dist/_kiku_front.html");
  const backSrcPath = join(import.meta.dirname, "../src/back.html");
  const backDestPath = join(import.meta.dirname, "../dist/_kiku_back.html");
  const styleSrcPath = join(import.meta.dirname, "../src/style.css");
  const styleDestPath = join(import.meta.dirname, "../dist/_kiku_style.css");
  const cssSrcPath = join(import.meta.dirname, "../dist/_kiku.css");
  const cssDestPath = join(import.meta.dirname, "../dist/_kiku.css");

  const [frontSrc, backSrc, styleSrc, cssSrc] = await Promise.all([
    readFile(frontSrcPath, "utf8"),
    readFile(backSrcPath, "utf8"),
    readFile(styleSrcPath, "utf8"),
    readFile(cssSrcPath, "utf8"),
  ]);

  const { frontSsrTemplate, backSsrTemplate, hydrationScript } =
    getSsrTemplate();

  const frontTemplate = frontSrc
    .replace("<!-- SSR_TEMPLATE -->", frontSsrTemplate)
    .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
  const backTemplate = backSrc
    .replace("<!-- SSR_TEMPLATE -->", backSsrTemplate)
    .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
  const styleTemplate = styleSrc;
  const cssTemplate = cssSrc;

  await Promise.all([
    writeFile(frontDestPath, frontTemplate),
    writeFile(backDestPath, backTemplate),
    writeFile(styleDestPath, styleTemplate),
    writeFile(cssDestPath, cssTemplate),
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
