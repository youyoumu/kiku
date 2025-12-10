import { computePosition, flip, shift } from "@floating-ui/dom";
import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { extractKanji } from "#/util/general";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useBreakpointContext } from "../shared/BreakpointContext";
import { useCardContext } from "../shared/CardContext";
import { KanjiContextProvider, useKanjiContext } from "./KanjiContext";
import { KanjiInfo, KanjiInfoExtra } from "./KanjiInfo";
import { parseFurigana } from "./util/parseFurigana";

export default function Expression() {
  const [$card, $setCard] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"back">();
  const bp = useBreakpointContext();
  const [$kanjiEl, $setKanjiEl] = createStore<{
    el: {
      kanji: Record<string, HTMLSpanElement | undefined>;
      tooltip: Record<string, HTMLSpanElement | undefined>;
    };
  }>({
    el: {
      kanji: {},
      tooltip: {},
    },
  });

  function showEl(el: HTMLElement) {
    el.style.display = "block";
    applyTooltip();
  }

  function hideEl(el: HTMLElement) {
    el.style.display = "";
  }

  function applyTooltip() {
    const charEls = Object.entries($kanjiEl.el.kanji);
    charEls.forEach(([char, kanji]) => {
      const tooltip = $kanjiEl.el.tooltip[char];
      if (kanji && tooltip) {
        computePosition(kanji, tooltip, {
          placement: bp.isAtLeast("sm") ? "bottom-start" : "bottom",
          middleware: [flip(), shift({ padding: 5 })],
        }).then(({ x, y }) => {
          Object.assign(tooltip.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      }
    });
  }

  onMount(() => {
    applyTooltip();
    const pairs: [string, (el: HTMLElement) => void][] = [
      ["mouseenter", showEl],
      ["mouseleave", hideEl],
      ["focus", showEl],
      ["blur", hideEl],
    ];

    pairs.forEach(([event, listener]) => {
      const charEls = Object.entries($kanjiEl.el.kanji);
      charEls.forEach(([char, kanji]) => {
        const tooltip = $kanjiEl.el.tooltip[char];
        if (kanji && tooltip) {
          kanji.addEventListener(event, () => {
            listener(tooltip);
          });
        }
      });
    });

    setTimeout(() => {
      $setCard("expressionReady", true);
    }, 100);
  });

  const furiganaData = parseFurigana(ankiFields.ExpressionFurigana);

  if (furiganaData.length === 0) {
    return (
      <ruby>
        {ankiFields.Expression.split("").map((char, i) => (
          <span
            class="relative"
            ref={(el) => {
              $setKanjiEl("el", "kanji", char + i, el);
            }}
          >
            <KanjiContextProvider kanji={extractKanji(char)[0] ?? ""}>
              <KanjiTooltip
                ref={(el) => $setKanjiEl("el", "tooltip", char + i, el)}
              />
            </KanjiContextProvider>
            {char}
          </span>
        ))}
        <rt>{ankiFields.ExpressionReading}</rt>
      </ruby>
    );
  }

  return (
    <>
      {furiganaData.map((item, i) => {
        if (item.type === "ruby") {
          return (
            <ruby>
              {item.text.split("").map((char, j) => (
                <span
                  class="relative"
                  ref={(el) =>
                    $setKanjiEl("el", "kanji", char + i + "-" + j, el)
                  }
                >
                  <KanjiContextProvider kanji={extractKanji(char)[0] ?? ""}>
                    <KanjiTooltip
                      ref={(el) =>
                        $setKanjiEl("el", "tooltip", char + i + "-" + j, el)
                      }
                    />
                  </KanjiContextProvider>
                  {char}
                </span>
              ))}
              <rt>{item.reading}</rt>
            </ruby>
          );
        }

        return (
          <span>
            {item.text.split("").map((char, j) => (
              <span
                class="relative"
                ref={(el) => $setKanjiEl("el", "kanji", char + i + "-" + j, el)}
              >
                <KanjiContextProvider kanji={extractKanji(char)[0] ?? ""}>
                  <KanjiTooltip
                    ref={(el) =>
                      $setKanjiEl("el", "tooltip", char + i + "-" + j, el)
                    }
                  />
                </KanjiContextProvider>
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

function KanjiTooltip(props: { ref: (ref: HTMLDivElement) => void }) {
  const [$kanji, $setKanji] = useKanjiContext();
  if (!$kanji.kanji) return null;

  return (
    <div
      class="absolute text-base bg-base-200/95 z-10 p-2 sm:p-4 border border-base-300 rounded-lg font-primary w-xs sm:w-md lg:w-lg shadow-lg hidden horizontal-tb"
      ref={props.ref}
    >
      <KanjiInfo />
      <div class="text-sm mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2">
        <KanjiInfoExtra />
      </div>
    </div>
  );
}
