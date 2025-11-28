import { createEffect } from "solid-js";
import { unwrap } from "solid-js/store";
import { useAnkiFieldContext } from "#/components/shared/AnkiFieldsContext";
import { useBreakpointContext } from "#/components/shared/BreakpointContext";
import { useCardContext } from "#/components/shared/CardContext";
import { useConfigContext } from "#/components/shared/ConfigContext";
import { useGeneralContext } from "#/components/shared/GeneralContext";
import { WorkerClient } from "#/worker/client";
import { env, extractKanji } from "./general";
import type { DaisyUITheme } from "./theme";

export function useViewTransition() {
  function startViewTransition(
    callback: () => void,
    {
      beforeCallback,
    }: {
      beforeCallback?: () => void;
    } = {},
  ) {
    if (document.startViewTransition && typeof pycmd === "undefined") {
      beforeCallback?.();
      return document.startViewTransition(callback);
    } else {
      callback();
    }
  }
  return startViewTransition;
}

export function useNavigationTransition() {
  const [$card, $setCard] = useCardContext();
  const bp = useBreakpointContext();
  const startViewTransition = useViewTransition();

  function navigate(
    destination: "main" | "settings" | "nested" | "kanji" | (() => void),
    direction: "back" | "forward",
  ) {
    const start = () => {
      if (typeof destination === "function") {
        destination();
      } else {
        $setCard("page", destination);
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
  const [$config, $setConfig] = useConfigContext();
  const startViewTransition = useViewTransition();
  const [$card, $setCard] = useCardContext();

  function changeTheme(theme: DaisyUITheme) {
    if ($card.kanjiStatus === "loading") {
      $setConfig("theme", theme);
    } else {
      startViewTransition(() => $setConfig("theme", theme), {
        beforeCallback() {
          document.documentElement.dataset.themeTransition = "true";
        },
      })?.finished.then(() => {
        document.documentElement.removeAttribute("data-theme-transition");
      });
    }
  }
  return changeTheme;
}

export function useKanji() {
  const [$config] = useConfigContext();
  const [$card, $setCard] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"back">();
  const [$general, $setGeneral] = useGeneralContext();

  let set = false;
  async function setKanji() {
    set = true;
    try {
      const kanjiList = extractKanji(
        ankiFields.ExpressionFurigana
          ? ankiFields["furigana:ExpressionFurigana"]
          : ankiFields.Expression,
      );
      const readingList = ankiFields.ExpressionReading
        ? [ankiFields.ExpressionReading]
        : [];
      const worker = new WorkerClient({
        env: env,
        config: unwrap($config),
        assetsPath: import.meta.env.DEV ? "" : KIKU_STATE.assetsPath,
        preferAnkiConnect:
          $config.preferAnkiConnect && !!KIKU_STATE.isAnkiDesktop,
      });
      const nex = await worker.nex;
      const { kanjiResult, readingResult } = await nex.querySharedAndSimilar({
        kanjiList,
        readingList,
        ankiFields,
      });
      if ($general.aborter.signal.aborted) return;

      $setCard("kanji", kanjiResult);
      $setCard("sameReadingNote", readingResult[ankiFields.ExpressionReading]);
      $setCard("kanjiStatus", "success");
      if (KIKU_STATE.worker) KIKU_STATE.worker.worker.terminate();
      KIKU_STATE.worker = worker;

      nex
        .manifest()
        .then((manifest) => $setGeneral("manifest", manifest))
        .catch(() => {
          KIKU_STATE.logger.warn("Failed to load manifest");
        });
    } catch (e) {
      $setCard("kanjiStatus", "error");
      KIKU_STATE.logger.error(
        "Failed to load kanji information:",
        e instanceof Error ? e.message : "",
      );
    }
  }

  createEffect(() => {
    if (!set && !$card.nested && $card.ready) {
      setKanji();
    }
  });
}
