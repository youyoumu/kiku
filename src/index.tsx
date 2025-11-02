/* @refresh reload */
import { render } from "solid-js/web";
import { Back } from "./Back.tsx";
import { type AnkiFields, exampleFields } from "./types.ts";
import "./tailwind.css";

export function init({ ankiFields }: { ankiFields: AnkiFields }) {
  const root = document.getElementById("root");
  if (!root) throw new Error("root not found");

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = import.meta.env.DEV ? "/src/tailwind.css" : "_kiku.css";

  const shadow = root.attachShadow({ mode: "closed" });
  document.head.appendChild(link);
  shadow.appendChild(link.cloneNode());

  document.documentElement.setAttribute("data-theme", "coffee");
  root.setAttribute("data-theme", "coffee");

  render(() => <Back ankiFields={ankiFields} />, shadow);
}

if (import.meta.env.DEV) {
  init({ ankiFields: exampleFields });
}
