import type { JSX } from "solid-js";
import { isMobile } from "../util/general";

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="max-w-4xl mx-auto overflow-auto px-4 gutter-stable">
      <div
        class="flex flex-col gap-6"
        style={{
          height: `calc(100vh - ${isMobile() ? "2em" : "4em"})`,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
