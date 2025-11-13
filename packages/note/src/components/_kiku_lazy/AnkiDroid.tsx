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
  const [config] = useConfig();
  if (config.ankiDroidEnableIntegration === "false") return;

  const ankiDroidAPI =
    typeof AnkiDroidJS === "undefined"
      ? undefined
      : new AnkiDroidJS({ version: "0.0.3", developer: "youyoumu" });

  let checkIconRef: SVGSVGElement | undefined;
  let xIconRef: SVGSVGElement | undefined;

  const [card] = useCardStore();
  const el$ = () => card.contentRef;
  const reverse = config.ankiDroidReverseSwipeDirection === "true";

  const THRESHOLD = 80;
  const DEADZONE = 10;
  const SCROLL_TOLERANCE = 15;

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let isScrolling = false;

  const [checkIconOffset, setCheckIconOffset] = createSignal(0);
  const [xIconOffset, setXIconOffset] = createSignal(0);
  const [progress, setProgress] = createSignal(0);

  function handleTouchStart(e: TouchEvent) {
    const el = el$();
    if (el === undefined) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    deltaX = 0;
    isScrolling = false;
    el.style.transition = "none";
  }

  function handleTouchMove(e: TouchEvent) {
    const el = el$();
    if (!el || isScrolling) return;

    const t = e.touches[0];
    const diffX = t.clientX - startX;
    const diffY = t.clientY - startY;

    // Detect vertical scroll intent
    if (
      Math.abs(diffY) > SCROLL_TOLERANCE &&
      Math.abs(diffY) > Math.abs(diffX)
    ) {
      isScrolling = true;
      return;
    }

    // Only start sliding after passing deadzone
    const abs = Math.abs(diffX);
    if (abs > DEADZONE) {
      deltaX = diffX;
      const direction = diffX > 0 ? 1 : -1;
      const progress = Math.min(abs / THRESHOLD, 1);
      setProgress(progress);
      const multiplier = easeOutQuad(Math.min(abs / THRESHOLD / 2, 1));
      const offset = multiplier * Math.min(abs, THRESHOLD);

      if (direction > 0) {
        requestAnimationFrame(() => {
          setXIconOffset(Math.abs(offset));
        });
      } else {
        requestAnimationFrame(() => {
          setCheckIconOffset(Math.abs(offset));
        });
      }
    }
  }

  function handleTouchEnd() {
    setCheckIconOffset(0);
    setXIconOffset(0);

    if (isScrolling) return;
    if (Math.abs(deltaX) >= THRESHOLD) {
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
  }

  createEffect(() => {
    const el = el$();
    if (el === undefined) return;
    if (card.side !== "back" || card.screen !== "main" || card.nested) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

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
              "bg-base-100 text-base-content-primary": progress() !== 1,
              "bg-error text-error-content": progress() === 1,
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
              "bg-base-100 text-base-content-primary": progress() !== 1,
              "bg-success text-success-content": progress() === 1,
            }}
          />
        </div>
      </Portal>
    </>
  );
}
