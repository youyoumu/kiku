import { createEffect, createSignal, onMount } from "solid-js";
import { useCardStore } from "./shared/Context";

export default function UseAnkiWeb() {
  const [card] = useCardStore();
  const [offset, setOffset] = createSignal(0);
  let counter = 0;

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
        KIKU_STATE.logger.trace("Resizing layout:", offset);
        setOffset(offset);
      }
      new ResizeObserver(autoResize).observe(el);
      autoResize();
    });
  }

  createEffect(() => {
    const el = card.layoutRef;
    if (!el || !KIKU_STATE.isAnkiWeb) return;
    el.style.height = `calc(100svh - ${offset()}px)`;
  });

  return null;
}
