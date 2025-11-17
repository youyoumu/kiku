import { createEffect, createSignal, onMount } from "solid-js";
import {
  useAnkiField,
  useBreakpoint,
  useCardStore,
  useConfig,
} from "#/components/shared/Context";
import type { DaisyUITheme } from "./theme";

export function useSentenceField() {
  const [card] = useCardStore();
  const [sentences, setSentences] = createSignal<HTMLSpanElement[]>([]);

  onMount(() => {
    if (card.sentenceFieldRef) {
      const ruby = card.sentenceFieldRef.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }

    if (card.sentenceFieldRef) {
      const spans = Array.from(
        card.sentenceFieldRef.querySelectorAll("span"),
      ).filter((el) => el.parentNode === card.sentenceFieldRef);
      spans.forEach((span, index) => {
        span.dataset.index = index.toString();
      });
      KIKU_STATE.logger.info(
        "Number of detected spans on sentence:",
        spans.length,
      );
      setSentences(spans);
    }
  });

  createEffect(() => {
    const sentencesIndex =
      card.pictures.length > 1 ? card.pictureIndex : undefined;
    if (typeof sentencesIndex === "number") {
      sentences().forEach((span) => {
        span.style.display =
          span.dataset.index === sentencesIndex.toString() ? "block" : "none";
      });
    }
  });

  return [sentences, setSentences] as const;
}

export function usePictureField() {
  const [card, setCard] = useCardStore();
  const { ankiFields } = useAnkiField();
  onMount(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = ankiFields.Picture;
    const imgs = Array.from(tempDiv.querySelectorAll("img"));
    imgs.forEach((img) => {
      img.dataset.index = imgs.indexOf(img).toString();
    });
    setCard("pictures", imgs);
    if (card.pictureFieldRef) {
      card.pictureFieldRef.replaceChildren(...imgs);
    }
    KIKU_STATE.logger.info("Number of detected picture:", imgs.length);
  });
}

export function useViewTransition() {
  function startViewTransition(
    callback: () => void,
    {
      beforeCallback,
    }: {
      beforeCallback?: () => void;
    } = {},
  ) {
    if (document.startViewTransition) {
      beforeCallback?.();
      return document.startViewTransition(callback);
    } else {
      callback();
    }
  }
  return startViewTransition;
}

export function useNavigationTransition() {
  const [card, setCard] = useCardStore();
  const bp = useBreakpoint();
  const startViewTransition = useViewTransition();

  function navigate(
    destination: "main" | "settings" | "nested" | "kanji" | (() => void),
    direction: "back" | "forward",
  ) {
    const start = () => {
      if (typeof destination === "function") {
        destination();
      } else {
        setCard("page", destination);
      }
    };

    if (!bp.isAtLeast("sm")) {
      startViewTransition(start, {
        beforeCallback() {
          document.documentElement.dataset.transitionDirection = direction;
        },
      })?.finished.then(() => {
        document.documentElement.removeAttribute("data-transition-direction");
      });
    } else {
      start();
    }
  }

  return navigate;
}

export function useThemeTransition() {
  const [config, setConfig] = useConfig();
  const startViewTransition = useViewTransition();

  function changeTheme(theme: DaisyUITheme) {
    startViewTransition(() => setConfig("theme", theme), {
      beforeCallback() {
        document.documentElement.dataset.themeTransition = "true";
      },
    })?.finished.then(() => {
      document.documentElement.removeAttribute("data-theme-transition");
    });
  }
  return changeTheme;
}
