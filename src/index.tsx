/* @refresh reload */
import { render } from "solid-js/web";
import { Back } from "./Back.tsx";
import "./tailwind.css";

import { type AnkiFields, exampleFields } from "./types.ts";

const root = document.getElementById("root");
if (!root) throw new Error("root not found");
const shadow = root.attachShadow({ mode: "closed" });
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "/src/tailwind.css";
shadow.appendChild(link);

export function init({ ankiFields }: { ankiFields: AnkiFields }) {
	render(() => <Back ankiFields={ankiFields} />, shadow);
}

if (import.meta.env.DEV) {
	init({ ankiFields: exampleFields });
}

document.documentElement.setAttribute("data-theme", "coffee");
root.setAttribute("data-theme", "coffee");
