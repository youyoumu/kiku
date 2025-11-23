import { useBreakpointContext } from "#/components/shared/BreakpointContext";
import { useCardContext } from "#/components/shared/CardContext";
import { useConfigContext } from "#/components/shared/ConfigContext";

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
