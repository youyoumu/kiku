/* @refresh reload */
import { render } from "solid-js/web";
import { Back } from "./Back.tsx";
import { type AnkiFields, exampleFields } from "./types.ts";
import "./tailwind.css";
import { Front } from "./Front.tsx";

export function init({
  ankiFields,
  side,
}: {
  ankiFields: AnkiFields;
  side: "front" | "back";
}) {
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

  if (side === "front") {
    render(() => <Front ankiFields={ankiFields} />, shadow);
  } else if (side === "back") {
    render(() => <Back ankiFields={ankiFields} />, shadow);
  }
}

if (import.meta.env.DEV) {
  init({ ankiFields: exampleFields, side: "back" });
}
