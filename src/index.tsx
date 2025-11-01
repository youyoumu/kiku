/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import tailwind from "./tailwind.css?inline";

const root = document.getElementById("root");
if (!root) throw new Error("root not found");
const shadow = root.attachShadow({ mode: "closed" });

const style = document.createElement("style");
style.textContent = tailwind;
shadow.appendChild(style);
render(() => <App />, shadow);
