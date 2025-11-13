import { createSignal, type JSX, onMount } from "solid-js";
import { useCardStore } from "./shared/Context";

let counter = 0;

export function Layout(props: { children: JSX.Element }) {
  const [card, setCard] = useCardStore();
  if (card.nested) return props.children;
  const [offset, setOffset] = createSignal(0);

  if (KIKU_STATE.isAnkiWeb) {
    onMount(() => {
      const el = card.layoutRef;
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
      ref={(ref) => setCard("layoutRef", ref)}
      class="max-w-4xl mx-auto overflow-auto gutter-stable h-svh font-primary transition-colors"
      classList={{
        "bg-base-300": card.slideDirection === undefined,
        "bg-error": card.slideDirection === "ease1",
        "bg-success": card.slideDirection === "ease3",
      }}
      style={{
        height: KIKU_STATE.isAnkiWeb
          ? `calc(100svh - ${offset()}px)`
          : undefined,
      }}
    >
      <div
        class="flex flex-col gap-6 p-2 sm:p-4 bg-base-100"
        ref={(ref) => setCard("contentRef", ref)}
      >
        {props.children}
      </div>
    </div>
  );
}
