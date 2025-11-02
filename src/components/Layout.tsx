import type { JSX } from "solid-js/jsx-runtime";

export function Layout(props: { children: JSX.Element }) {
  const isMobile = document.body.clientWidth < 640;

  return (
    <div class="max-w-4xl mx-auto overflow-auto px-4">
      <div
        class="flex flex-col gap-6"
        style={{
          "max-height": `calc(100vh - ${isMobile ? "2em" : "4em"})`,
        }}
      >
        {props.children}
      </div>
    </div>
  );
}
