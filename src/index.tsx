/* @refresh reload */
import { render } from "solid-js/web";
import { Back } from "./Back.tsx";
import "./tailwind.css";
import tailwind from "./tailwind.css?inline";

import { type AnkiFields, exampleFields } from "./types.ts";

const root = document.getElementById("root");
if (!root) throw new Error("root not found");
const shadow = root.attachShadow({ mode: "closed" });
const sheet = new CSSStyleSheet();
sheet.replaceSync(tailwind.replaceAll(":root", ":host"));
shadow.adoptedStyleSheets = [sheet];

export function init({ ankiFields }: { ankiFields: AnkiFields }) {
	render(() => <Back ankiFields={ankiFields} />, shadow);
}

if (import.meta.env.DEV) {
	init({ ankiFields: exampleFields });
}

document.documentElement.setAttribute("data-theme", "coffee");
root.setAttribute("data-theme", "coffee");
