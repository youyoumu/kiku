import type { JSX } from "solid-js/jsx-runtime";

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="max-w-4xl mx-auto overflow-auto px-4">
      <div
        class="flex flex-col gap-8"
        style={{
          "max-height": "calc(100vh - 4em)",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
