import type { JSX } from "solid-js";

export function Layout(props: { children: JSX.Element }) {
  return (
    <div
      data-font-primary="true"
      class="max-w-4xl mx-auto overflow-auto p-2 sm:p-4 gutter-stable h-[calc(100vh-1rem)] sm:h-vh"
    >
      <div class="flex flex-col gap-6 ">{props.children}</div>
    </div>
  );
}
