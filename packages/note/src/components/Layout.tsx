import { createSignal, type JSX, onMount } from "solid-js";
import { useCardStore } from "./shared/Context";

let counter = 0;

export function Layout(props: { children: JSX.Element }) {
  const [card] = useCardStore();
  if (card.nested) return props.children;
  const [layoutElement, setLayoutElement] = createSignal<HTMLDivElement>();
  const [offset, setOffset] = createSignal(0);

  if (KIKU_STATE.isAnkiWeb) {
    onMount(() => {
      const el = layoutElement();
      if (!el) return;
      function autoResize() {
        if (!el) return;
        const html = window.document.documentElement;
        const offset = html.scrollHeight - html.clientHeight;
        if (offset === 0) return;
        counter = counter + 1;
        if (counter > 100) return;
        setOffset(offset);
      }
      new ResizeObserver(autoResize).observe(el);
      autoResize();
    });
  }

  return (
    <div
      ref={setLayoutElement}
      class="max-w-4xl mx-auto overflow-auto p-2 sm:p-4 gutter-stable h-svh font-primary"
      style={{
        height: KIKU_STATE.isAnkiWeb
          ? `calc(100svh - ${offset()}px)`
          : undefined,
      }}
    >
      <div class="flex flex-col gap-6 ">{props.children}</div>
    </div>
  );
}
