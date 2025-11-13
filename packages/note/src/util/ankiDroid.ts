import { createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { useCardStore } from "#/components/shared/Context";

declare global {
  var AnkiDroidJS: {
    ankiDroidInvoke: (direction: "ease1" | "ease3") => void;
  };
}

export function useAnkiDroid() {
  if (isServer) return;
  if (window.innerWidth > 768) return;
  if (typeof AnkiDroidJS === "undefined" && !import.meta.env.DEV) return;

  const [card, setCard] = useCardStore();
  const el$ = () => card.contentRef;

  const threshold = 80; // how far before triggering swipe
  const deadzone = 20; // ignore small jitters
  const duration = 150; // ms snap duration
  const scrollTolerance = 15; // px vertical diff before assuming scroll

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let isAnimating = false;
  let isScrolling = false;

  function handleTouchStart(e: TouchEvent) {
    const el = el$();
    if (el === undefined) return;
    if (isAnimating) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    deltaX = 0;
    isScrolling = false;
    el.style.transition = "none";
  }

  function handleTouchMove(e: TouchEvent) {
    const el = el$();
    if (!el || isAnimating || isScrolling) return;

    const t = e.touches[0];
    const diffX = t.clientX - startX;
    const diffY = t.clientY - startY;

    // Detect vertical scroll intent
    if (
      Math.abs(diffY) > scrollTolerance &&
      Math.abs(diffY) > Math.abs(diffX)
    ) {
      isScrolling = true;
      el.style.transform = "";
      return;
    }

    // Only start sliding after passing deadzone
    if (Math.abs(diffX) > deadzone) {
      const direction = diffX > 0 ? 1 : -1;

      // 3 stages of slide thresholds
      const stage1 = threshold * 0.3;
      const stage2 = threshold * 0.6;
      const stage3 = threshold;

      let stageValue = 0;
      let stage: 0 | 1 | 2 | 3 = 0;

      const abs = Math.abs(diffX);
      if (abs < stage1) {
        stageValue = 0;
        stage = 0;
      } else if (abs < stage2) {
        stageValue = stage1;
        stage = 1;
      } else if (abs < stage3) {
        stageValue = stage2;
        stage = 2;
      } else {
        stageValue = stage3;
        stage = 3;
      }

      const target = stageValue * direction;

      // add small smooth transition between steps
      el.style.transition = `transform ${duration}ms ease-out`;
      el.style.transform = `translateX(${target}px)`;

      deltaX = target;

      // 💡 update store color only on stage ≥ 2
      if (stage >= 2) {
        setCard("slideDirection", direction > 0 ? "ease3" : "ease1");
      } else {
        setCard("slideDirection", undefined);
      }
    }
  }

  function handleTouchEnd() {
    if (isAnimating || isScrolling) return;

    if (Math.abs(deltaX) >= threshold) {
      if (deltaX > 0) {
        console.log("ease3");
        if (!import.meta.env.DEV) AnkiDroidJS.ankiDroidInvoke("ease3");
      } else {
        console.log("ease1");
        if (!import.meta.env.DEV) AnkiDroidJS?.ankiDroidInvoke("ease1");
      }
    }

    snapBack();
  }

  function snapBack() {
    const el = el$();
    if (el === undefined) return;
    isAnimating = true;
    el.style.transition = `transform ${duration}ms ease-out`;
    el.style.transform = "translateX(0)";

    const timer = setTimeout(cleanup, duration + 100);
    const end = () => cleanup();

    function cleanup() {
      const el = el$();
      if (el === undefined) return;
      clearTimeout(timer);
      el.removeEventListener("transitionend", end);
      isAnimating = false;
      el.style.transition = "";
    }

    el.addEventListener("transitionend", end);
  }

  createEffect(() => {
    const el = el$();
    if (el === undefined) return;
    if (card.side !== "back" || card.screen !== "main" || card.nested) return;
    el.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    el.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    el.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });

    onCleanup(() => {
      const el = el$();
      if (el === undefined) return;

      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    });
  });
}
