import { createEffect, createSignal, Match, onCleanup, Switch } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { useCardContext } from "#/components/shared/CardContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { CheckIcon, XIcon } from "./Icons";

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
  const [$config] = useConfigContext();
  if (!$config.ankiDroidEnableIntegration) return;
  KIKU_STATE.logger.info("Using AnkiDroid");

  const ankiDroidAPI =
    typeof AnkiDroidJS === "undefined"
      ? undefined
      : new AnkiDroidJS({ version: "0.0.3", developer: "youyoumu" });
  KIKU_STATE.ankiDroidAPI = ankiDroidAPI;

  let rightIconRef: SVGSVGElement | undefined;
  let leftIconRef: SVGSVGElement | undefined;

  const [$card] = useCardContext();
  const [$general] = useGeneralContext();
  const el$ = () => document.documentElement;
  const reverse = $config.ankiDroidReverseSwipeDirection;

  const THRESHOLD = 60;
  const DEADZONE = 10;
  const SCROLL_TOLERANCE = 15;

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let isScrolling = false;
  let isSwiping = false;
  let isTouching = false;

  const [rightIconOffset, setRightIconOffset] = createSignal(0);
  const [leftIconOffset, setLeftIconOffset] = createSignal(0);
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
    isTouching = true;
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
    if ($card.side === "front") return;

    // Detect vertical scroll intent
    if (
      Math.abs(diffY) > SCROLL_TOLERANCE &&
      Math.abs(diffY) > Math.abs(diffX)
    ) {
      isScrolling = true;
      setRightIconOffset(0);
      setLeftIconOffset(0);
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
          if (isScrolling || !isTouching) return;
          setLeftIconOffset(snapTo4(Math.abs(offset)));
          setRightIconOffset(0);
        });
      } else {
        requestAnimationFrame(() => {
          if (isScrolling || !isTouching) return;
          setRightIconOffset(snapTo4(Math.abs(offset)));
          setLeftIconOffset(0);
        });
      }
    }
  }

  function handleTouchEnd() {
    isTouching = false;
    if ($card.side === "front") {
      if (isSwiping) return;
      ankiDroidAPI?.ankiShowAnswer();
    } else if ($card.side === "back") {
      setRightIconOffset(0);
      setLeftIconOffset(0);

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
    if ($card.page !== "main" || $card.nested) return;
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

  if ($card.side === "front") return null;

  return (
    <Portal mount={$general.layoutRef}>
      <Icon
        ref={leftIconRef}
        side="left"
        color={reverse ? "error" : "success"}
        offset={leftIconOffset()}
        progress={progress()}
      />
      <Icon
        ref={rightIconRef}
        side="right"
        color={reverse ? "success" : "error"}
        offset={rightIconOffset()}
        progress={progress()}
      />
    </Portal>
  );
}

function Icon(props: {
  ref: SVGSVGElement | undefined;
  offset: number;
  side: "left" | "right";
  color: "success" | "error";
  progress: number;
}) {
  const direction = () => (props.side === "right" ? 1 : -1);
  const offset = () => props.offset;

  return (
    <div
      class="fixed top-1/2 -translate-y-1/2 flex justify-center items-center rounded-full transition-transform z-10"
      classList={{
        "bg-error/30": props.color === "error",
        "bg-success/30": props.color === "success",
      }}
      style={{
        left: props.side === "left" ? "0" : undefined,
        right: props.side === "right" ? "0" : undefined,
        height: offset() > 0 ? `${48 + 24 * props.progress}px` : undefined,
        width: offset() > 0 ? `${48 + 24 * props.progress}px` : undefined,
        transform: `translateX(${(48 + 12 - offset()) * direction()}px)`,
        opacity: `${props.progress - 0.2}`,
      }}
    >
      <Switch>
        <Match when={props.color === "error"}>
          <XIcon
            ref={props.ref}
            class="size-12 rounded-full p-2 shadow-lg transition-colors"
            classList={{
              "bg-base-100 text-base-content-primary": props.progress !== 1,
              "bg-error text-error-content": props.progress === 1,
            }}
          />
        </Match>
        <Match when={props.color === "success"}>
          <CheckIcon
            ref={props.ref}
            class="size-12 rounded-full p-2 shadow-lg transition-colors"
            classList={{
              "bg-base-100 text-base-content-primary": props.progress !== 1,
              "bg-success text-success-content": props.progress === 1,
            }}
          />
        </Match>
      </Switch>
    </div>
  );
}
