import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSsrTemplate } from "./ssr.js";

async function main() {
  const frontSrcPath = join(import.meta.dirname, "../src/front.html");
  const frontDestPath = join(import.meta.dirname, "../dist/front.html");
  const backSrcPath = join(import.meta.dirname, "../src/back.html");
  const backDestPath = join(import.meta.dirname, "../dist/back.html");

  const [frontSrc, backSrc] = await Promise.all([
    readFile(frontSrcPath, "utf8"),
    readFile(backSrcPath, "utf8"),
  ]);

  let { frontTemplate, backTemplate, hydrationScript } = getSsrTemplate();

  frontTemplate = frontSrc
    .replace("<!-- SSR_TEMPLATE -->", frontTemplate)
    .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
  backTemplate = backSrc
    .replace("<!-- SSR_TEMPLATE -->", backTemplate)
    .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
  await Promise.all([
    writeFile(frontDestPath, frontTemplate),
    writeFile(backDestPath, backTemplate),
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
