import type { JSX } from "solid-js";

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="max-w-4xl mx-auto overflow-auto px-2 sm:px-4 gutter-stable">
      <div class="flex flex-col gap-6 h-[calc(100vh-2em)] sm:h-[calc(100vh-4em)]">
        {props.children}
      </div>
    </div>
  );
}
