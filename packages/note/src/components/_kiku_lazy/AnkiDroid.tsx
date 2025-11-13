import { createEffect, createSignal, onCleanup } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { useCardStore, useConfig } from "#/components/shared/Context";
import { CheckIcon, XIcon } from "./Icons";

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
function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

export default function AnkiDroid() {
  if (isServer) return;
  if (window.innerWidth > 768) return;
  if (typeof AnkiDroidJS === "undefined" && !import.meta.env.DEV) return;

  const ankiDroidAPI =
    typeof AnkiDroidJS === "undefined"
      ? undefined
      : new AnkiDroidJS({ version: "0.0.3", developer: "youyoumu" });

  let checkIconRef: SVGSVGElement | undefined;
  let xIconRef: SVGSVGElement | undefined;
  const [config] = useConfig();
  if (config.ankiDroidEnableIntegration === "false") return;

  const [card, setCard] = useCardStore();
  const el$ = () => card.contentRef;
  const reverse = config.ankiDroidReverseSwipeDirection === "true";

  const threshold = 80;
  const deadzone = 10;
  const scrollTolerance = 15;

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  const isAnimating = false;
  let isScrolling = false;

  const [checkIconOffset, setCheckIconOffset] = createSignal(0);
  const [xIconOffset, setXIconOffset] = createSignal(0);
  const [stage, setStage] = createSignal(0);
  const [progress, setProgress] = createSignal(0);

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

      setStage(stage);
      const target = stageValue * direction;

      const progress = Math.min(abs / threshold, 1);
      setProgress(progress);
      const multiplier = easeOutQuad(Math.min(abs / threshold / 2, 1));
      const offset = multiplier * Math.min(abs, threshold) * direction;

      if (direction > 0) {
        requestAnimationFrame(() => {
          setXIconOffset(Math.abs(offset));
        });
      } else {
        requestAnimationFrame(() => {
          setCheckIconOffset(Math.abs(offset));
        });
      }

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
    }
    setCheckIconOffset(0);
    setXIconOffset(0);
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

  return (
    <>
      <Portal mount={KIKU_STATE.root}>
        <div
          class="absolute top-1/2 -translate-y-1/2 left-0 bg-error/30 flex justify-center items-center rounded-full"
          style={{
            height: `${48 + 24 * progress()}px`,
            width: `${48 + 24 * progress()}px`,
            transform: `translateX(${(48 + 24 - xIconOffset()) * -1}px)`,
          }}
        >
          <XIcon
            ref={xIconRef}
            class="size-12 rounded-full p-2 shadow-lg transition-all"
            classList={{
              "bg-base-100 text-base-content-primary": stage() !== 3,
              "bg-error text-error-content": stage() === 3,
            }}
          />
        </div>
      </Portal>
      <Portal mount={KIKU_STATE.root}>
        <div
          class="absolute top-1/2 -translate-y-1/2 right-0 bg-success/30 flex justify-center items-center rounded-full"
          style={{
            height: `${48 + 24 * progress()}px`,
            width: `${48 + 24 * progress()}px`,
            transform: `translateX(${48 + 24 - checkIconOffset()}px)`,
          }}
        >
          <CheckIcon
            ref={checkIconRef}
            class="size-12 rounded-full p-2 transition-all shadow-lg"
            classList={{
              "bg-base-100 text-base-content-primary": stage() !== 3,
              "bg-success text-success-content": stage() === 3,
            }}
          />
        </div>
      </Portal>
    </>
  );
}
