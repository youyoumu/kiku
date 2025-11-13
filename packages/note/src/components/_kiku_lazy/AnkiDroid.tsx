import { createEffect, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { useCardStore, useConfig } from "#/components/shared/Context";

type AnkiResponse<T = unknown> = {
  success: boolean;
  value?: T;
  error?: string;
};

interface AnkiDroidAPI {
  ankiGetNewCardCount(): Promise<AnkiResponse>;
  ankiGetLrnCardCount(): Promise<AnkiResponse>;
  ankiGetRevCardCount(): Promise<AnkiResponse>;
  ankiGetETA(): Promise<AnkiResponse>;
  ankiGetCardMark(): Promise<AnkiResponse>;
  ankiGetCardFlag(): Promise<AnkiResponse>;
  ankiGetNextTime1(): Promise<AnkiResponse>;
  ankiGetNextTime2(): Promise<AnkiResponse>;
  ankiGetNextTime3(): Promise<AnkiResponse>;
  ankiGetNextTime4(): Promise<AnkiResponse>;
  ankiGetCardReps(): Promise<AnkiResponse>;
  ankiGetCardInterval(): Promise<AnkiResponse>;
  ankiGetCardFactor(): Promise<AnkiResponse>;
  ankiGetCardMod(): Promise<AnkiResponse>;
  ankiGetCardId(): Promise<AnkiResponse>;
  ankiGetCardNid(): Promise<AnkiResponse>;
  ankiGetCardType(): Promise<AnkiResponse>;
  ankiGetCardDid(): Promise<AnkiResponse>;
  ankiGetCardLeft(): Promise<AnkiResponse>;
  ankiGetCardODid(): Promise<AnkiResponse>;
  ankiGetCardODue(): Promise<AnkiResponse>;
  ankiGetCardQueue(): Promise<AnkiResponse>;
  ankiGetCardLapses(): Promise<AnkiResponse>;
  ankiGetCardDue(): Promise<AnkiResponse>;
  ankiIsInFullscreen(): Promise<AnkiResponse>;
  ankiIsTopbarShown(): Promise<AnkiResponse>;
  ankiIsInNightMode(): Promise<AnkiResponse>;
  ankiIsDisplayingAnswer(): Promise<AnkiResponse>;
  ankiGetDeckName(): Promise<AnkiResponse>;
  ankiIsActiveNetworkMetered(): Promise<AnkiResponse>;
  ankiTtsFieldModifierIsAvailable(): Promise<AnkiResponse>;
  ankiTtsIsSpeaking(): Promise<AnkiResponse>;
  ankiTtsStop(): Promise<AnkiResponse>;
  ankiBuryCard(): Promise<AnkiResponse>;
  ankiBuryNote(): Promise<AnkiResponse>;
  ankiSuspendCard(): Promise<AnkiResponse>;
  ankiSuspendNote(): Promise<AnkiResponse>;
  ankiAddTagToCard(): Promise<AnkiResponse>;
  ankiResetProgress(): Promise<AnkiResponse>;
  ankiMarkCard(): Promise<AnkiResponse>;
  ankiToggleFlag(): Promise<AnkiResponse>;
  ankiSearchCard(): Promise<AnkiResponse>;
  ankiSearchCardWithCallback(): Promise<AnkiResponse>;
  ankiTtsSpeak(): Promise<AnkiResponse>;
  ankiTtsSetLanguage(): Promise<AnkiResponse>;
  ankiTtsSetPitch(): Promise<AnkiResponse>;
  ankiTtsSetSpeechRate(): Promise<AnkiResponse>;
  ankiEnableHorizontalScrollbar(): Promise<AnkiResponse>;
  ankiEnableVerticalScrollbar(): Promise<AnkiResponse>;
  ankiSetCardDue(): Promise<AnkiResponse>;
  ankiShowNavigationDrawer(): Promise<AnkiResponse>;
  ankiShowOptionsMenu(): Promise<AnkiResponse>;
  ankiShowToast(): Promise<AnkiResponse>;
  ankiShowAnswer(): Promise<AnkiResponse>;
  ankiAnswerEase1(): Promise<AnkiResponse>;
  ankiAnswerEase2(): Promise<AnkiResponse>;
  ankiAnswerEase3(): Promise<AnkiResponse>;
  ankiAnswerEase4(): Promise<AnkiResponse>;
  ankiSttSetLanguage(): Promise<AnkiResponse>;
  ankiSttStart(): Promise<AnkiResponse>;
  ankiSttStop(): Promise<AnkiResponse>;
  ankiAddTagToNote(): Promise<AnkiResponse>;
  ankiSetNoteTags(): Promise<AnkiResponse>;
  ankiGetNoteTags(): Promise<AnkiResponse>;
}

declare global {
  var AnkiDroidJS: {
    new (contract: { version: string; developer?: string }): AnkiDroidAPI;
    prototype: AnkiDroidAPI;
  };
}

function reverseEase(ease: "ease1" | "ease3") {
  return ease === "ease1" ? "ease3" : "ease1";
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - 2 ** (-10 * x);
}

export default function AnkiDroid() {
  if (isServer) return;
  if (window.innerWidth > 768) return;
  if (typeof AnkiDroidJS === "undefined" && !import.meta.env.DEV) return;

  const ankiDroidAPI =
    typeof AnkiDroidJS === "undefined"
      ? undefined
      : new AnkiDroidJS({ version: "0.0.3", developer: "youyoumu" });

  const [config] = useConfig();
  if (config.ankiDroidEnableIntegration === "false") return;

  const [card, setCard] = useCardStore();
  const el$ = () => card.contentRef;
  const reverse = config.ankiDroidReverseSwipeDirection === "true";

  const threshold = 120;
  const deadzone = 10;
  const duration = 150;
  const scrollTolerance = 15;

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
      const stage1 = threshold * 0;
      const stage2 = threshold * 0.99;
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

      const multiplier = easeOutExpo(abs / threshold / 50);
      const clamped = multiplier * Math.min(abs, threshold) * direction;

      el.style.transition = `transform ${duration}ms ease-out`;
      el.style.transform = `translateX(${clamped}px)`;

      deltaX = target;

      // 💡 update store color only on stage ≥ 2
      if (stage >= 2) {
        let ease: "ease1" | "ease3" = direction > 0 ? "ease3" : "ease1";
        if (reverse) ease = reverseEase(ease);
        setCard("slideDirection", ease);
      } else {
        setCard("slideDirection", undefined);
      }
    }
  }

  function handleTouchEnd() {
    if (isAnimating || isScrolling) return;

    if (Math.abs(deltaX) >= threshold) {
      let ease: "ease1" | "ease3" = deltaX > 0 ? "ease3" : "ease1";
      if (reverse) ease = reverseEase(ease);
      console.log(ease);
      if (!import.meta.env.DEV) {
        if (ease === "ease1") {
          ankiDroidAPI?.ankiAnswerEase1();
        } else if (ease === "ease3") {
          ankiDroidAPI?.ankiAnswerEase3();
        }
      }
      return;
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

  return null;
}
