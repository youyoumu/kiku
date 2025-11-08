// const tailwindBreakpoints = ["sm", "md", "lg", "xl", "2xl"];
const tailwindBreakpoints = ["sm"];
const sizes = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
  "text-6xl",
  "text-7xl",
  "text-8xl",
  "text-9xl",
];
const fields = ["expression", "pitch", "sentence", "misc-info", "hint"];

let css = `/* generated from script/generateTailwindFontSizeCss.ts */\n/* biome-ignore format: this looks nicer */\n@layer utilities {\n`;

// Base font size (no breakpoint)
for (const size of sizes) {
  const selectors = fields
    .map((field) => `[data-font-size-base-${field}="${size}"] .${field}`)
    .join(", ");
  css += `  ${selectors} { @apply ${size}; }\n`;
}

// Responsive variants
for (const bp of tailwindBreakpoints) {
  for (const size of sizes) {
    const selectors = fields
      .map(
        (field) => `[data-font-size-${bp}-${field}="${bp}:${size}"] .${field}`,
      )
      .join(", ");
    css += `  ${selectors} { @apply ${bp}:${size}; }\n`;
  }
}

css += `}\n`;
console.log(css);
console.log("✅ Generated src/generated/fontsize.css");
