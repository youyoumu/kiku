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

function snapTo4(n: number) {
  return (n >> 2) << 2;
}

export default function UseAnkiDroid() {
  if (isServer) return;
  if (window.innerWidth > 768) return;
  if (typeof AnkiDroidJS === "undefined" && !import.meta.env.DEV) return;
  const [config] = useConfig();
  if (config.ankiDroidEnableIntegration === "false") return;
  KIKU_STATE.logger.info("Using AnkiDroid");

  const ankiDroidAPI =
    typeof AnkiDroidJS === "undefined"
      ? undefined
      : new AnkiDroidJS({ version: "0.0.3", developer: "youyoumu" });

  let checkIconRef: SVGSVGElement | undefined;
  let xIconRef: SVGSVGElement | undefined;

  const [card] = useCardStore();
  const el$ = () => card.contentRef;
  const reverse = config.ankiDroidReverseSwipeDirection === "true";

  const THRESHOLD = 60;
  const DEADZONE = 10;
  const SCROLL_TOLERANCE = 15;

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let isScrolling = false;
  let isSwiping = false;

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
    isSwiping = false;
  }

  function handleTouchMove(e: TouchEvent) {
    const el = el$();
    if (!el || isScrolling) return;

    const t = e.touches[0];
    const diffX = t.clientX - startX;
    const diffY = t.clientY - startY;

    if (Math.abs(diffY) > DEADZONE || Math.abs(diffX) > DEADZONE) {
      isSwiping = true;
    }
    if (card.side === "front") return;

    // Detect vertical scroll intent
    if (
      Math.abs(diffY) > SCROLL_TOLERANCE &&
      Math.abs(diffY) > Math.abs(diffX)
    ) {
      isScrolling = true;
      setCheckIconOffset(0);
      setXIconOffset(0);
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
          if (isScrolling) return;
          setXIconOffset(snapTo4(Math.abs(offset)));
          setCheckIconOffset(0);
        });
      } else {
        requestAnimationFrame(() => {
          if (isScrolling) return;
          setCheckIconOffset(snapTo4(Math.abs(offset)));
          setXIconOffset(0);
        });
      }
    }
  }

  function handleTouchEnd() {
    if (card.side === "front") {
      console.log("DEBUG[1056]: isSwiping=", isSwiping);
      if (isSwiping) return;
      ankiDroidAPI?.ankiShowAnswer();
    } else if (card.side === "back") {
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
  }

  createEffect(() => {
    const el = el$();
    if (el === undefined) return;
    if (card.screen !== "main" || card.nested) return;
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

  if (card.side === "front") return null;

  return (
    <>
      <Portal mount={KIKU_STATE.root}>
        <div
          class="absolute top-1/2 -translate-y-1/2 left-0 bg-error/30 flex justify-center items-center rounded-full transition-transform"
          style={{
            height: xIconOffset() > 0 ? `${48 + 24 * progress()}px` : undefined,
            width: xIconOffset() > 0 ? `${48 + 24 * progress()}px` : undefined,
            transform: `translateX(${(48 + 12 - xIconOffset()) * -1}px)`,
            opacity: `${progress() - 0.2}`,
          }}
        >
          <XIcon
            ref={xIconRef}
            class="size-12 rounded-full p-2 shadow-lg transition-colors"
            classList={{
              "bg-base-100 text-base-content-primary": progress() !== 1,
              "bg-error text-error-content": progress() === 1,
            }}
          />
        </div>
      </Portal>
      <Portal mount={KIKU_STATE.root}>
        <div
          class="absolute top-1/2 -translate-y-1/2 right-0 bg-success/30 flex justify-center items-center rounded-full transition-transform"
          style={{
            height:
              checkIconOffset() > 0 ? `${48 + 24 * progress()}px` : undefined,
            width:
              checkIconOffset() > 0 ? `${48 + 24 * progress()}px` : undefined,
            transform: `translateX(${48 + 12 - checkIconOffset()}px)`,
            opacity: `${progress() - 0.2}`,
          }}
        >
          <CheckIcon
            ref={checkIconRef}
            class="size-12 rounded-full p-2 transition-colors shadow-lg"
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
