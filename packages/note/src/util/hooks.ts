import { createEffect } from "solid-js";
import { unwrap } from "solid-js/store";
import { useAnkiFieldContext } from "#/components/shared/AnkiFieldsContext";
import { useBreakpointContext } from "#/components/shared/BreakpointContext";
import { useCardContext } from "#/components/shared/CardContext";
import { useConfigContext } from "#/components/shared/ConfigContext";
import { useGeneralContext } from "#/components/shared/GeneralContext";
import { NexClient } from "#/worker/client";
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
    navigateBack?: () => void,
  ) {
    if (navigateBack) $setCard("navigateBack", (old) => [...old, navigateBack]);
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
  function navigateBack() {
    const last = $card.navigateBack[$card.navigateBack.length - 1];
    $setCard("navigateBack", (list) => list.slice(0, -1));
    last?.();
  }

  return { navigate, navigateBack };
}

export function useThemeTransition() {
  const [$config, $setConfig] = useConfigContext();
  const startViewTransition = useViewTransition();
  const [$card, $setCard] = useCardContext();

  function changeTheme(theme: DaisyUITheme) {
    if ($card.query.status === "loading") {
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
          ? $card.nested
            ? ankiFields.Expression
            : ankiFields["furigana:ExpressionFurigana"]
          : ankiFields.Expression,
      );
      const readingList = ankiFields.ExpressionReading
        ? [ankiFields.ExpressionReading]
        : [];
      const worker = new NexClient({
        env: env,
        config: unwrap($config),
        assetsPath: import.meta.env.DEV ? "" : KIKU_STATE.assetsPath,
        preferAnkiConnect:
          $config.preferAnkiConnect && !!KIKU_STATE.isAnkiDesktop,
      });
      const nex = await worker.nex;
      const { kanjiResult, readingResult } = await nex.queryShared({
        kanjiList,
        readingList,
        ankiFields: unwrap(ankiFields),
      });
      if ($general.aborter.signal.aborted) return;

      $setCard("query", {
        status: "success",
        kanji: kanjiResult,
        sameReading: readingResult[ankiFields.ExpressionReading],
      });
      KIKU_STATE.nexClient = worker;

      nex
        .notesManifest()
        .then((manifest) => $setGeneral("notesManifest", manifest))
        .catch(() => {
          KIKU_STATE.logger.warn("Failed to load manifest");
        });
    } catch (e) {
      $setCard("query", { status: "error" });
      KIKU_STATE.logger.error(
        "Failed to load kanji information:",
        e instanceof Error ? e.message : "",
      );
    }
  }

  createEffect(() => {
    if (!set && $card.ready) {
      setKanji();
    }
  });
}
