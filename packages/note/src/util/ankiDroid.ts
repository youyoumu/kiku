import { onCleanup } from "solid-js";

declare global {
  var AnkiDroidJS: {
    ankiDroidInvoke: (direction: "ease1" | "ease3") => void;
  };
}

export function useAnkiDroid(root: HTMLElement) {
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
    if (isAnimating) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    deltaX = 0;
    isScrolling = false;
    root.style.transition = "none";
  }

  function handleTouchMove(e: TouchEvent) {
    if (isAnimating || isScrolling) return;

    const t = e.touches[0];
    const diffX = t.clientX - startX;
    const diffY = t.clientY - startY;

    // Detect vertical scroll intent
    if (
      Math.abs(diffY) > scrollTolerance &&
      Math.abs(diffY) > Math.abs(diffX)
    ) {
      isScrolling = true;
      root.style.transform = "";
      return;
    }

    // only start sliding after passing deadzone
    if (Math.abs(diffX) > deadzone) {
      const direction = diffX > 0 ? 1 : -1;

      // 3 stages of slide thresholds
      const stage1 = threshold * 0.3; // small hint slide
      const stage2 = threshold * 0.6; // medium slide
      const stage3 = threshold; // full slide (will trigger)

      let stageValue = 0;

      const abs = Math.abs(diffX);
      if (abs < stage1)
        stageValue = 0; // barely moved
      else if (abs < stage2) stageValue = stage1;
      else if (abs < stage3) stageValue = stage2;
      else stageValue = stage3;

      const target = stageValue * direction;

      // add small smooth transition between steps
      root.style.transition = `transform ${duration}ms ease-out`;
      root.style.transform = `translateX(${target}px)`;

      deltaX = target;
    }
  }

  function handleTouchEnd() {
    if (isAnimating || isScrolling) return;

    if (Math.abs(deltaX) > threshold && typeof AnkiDroidJS !== "undefined") {
      if (deltaX > 0) {
        AnkiDroidJS.ankiDroidInvoke("ease3");
      } else {
        AnkiDroidJS.ankiDroidInvoke("ease1");
      }
    }

    snapBack();
  }

  function snapBack() {
    isAnimating = true;
    root.style.transition = `transform ${duration}ms ease-out`;
    root.style.transform = "translateX(0)";

    const timer = setTimeout(cleanup, duration + 100);
    const end = () => cleanup();

    function cleanup() {
      clearTimeout(timer);
      root.removeEventListener("transitionend", end);
      isAnimating = false;
      root.style.transition = "";
    }

    root.addEventListener("transitionend", end);
  }

  root.addEventListener("touchstart", handleTouchStart, { passive: true });
  root.addEventListener("touchmove", handleTouchMove, { passive: false });
  root.addEventListener("touchend", handleTouchEnd, { passive: true });

  onCleanup(() => {
    root.removeEventListener("touchstart", handleTouchStart);
    root.removeEventListener("touchmove", handleTouchMove);
    root.removeEventListener("touchend", handleTouchEnd);
  });
}
