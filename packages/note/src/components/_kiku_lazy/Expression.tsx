import { arrow, computePosition, flip, shift } from "@floating-ui/dom";
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
      arrow: Record<string, HTMLDivElement | undefined>;
    };
  }>({
    el: {
      kanji: {},
      tooltip: {},
      arrow: {},
    },
  });

  function isValidExpressionFurigana() {
    if (ankiFields.ExpressionFurigana.includes("<ruby")) return false;
    if (!ankiFields.ExpressionFurigana.includes("[")) return false;
    return true;
  }

  if (!isValidExpressionFurigana()) return null;

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
      const arrowEl = $kanjiEl.el.arrow[char];
      if (kanji && tooltip && arrowEl) {
        computePosition(kanji, tooltip, {
          placement: bp.isAtLeast("sm") ? "bottom-start" : "bottom",
          middleware: [
            flip(),
            shift({ padding: 5 }),
            arrow({
              element: arrowEl,
            }),
          ],
        }).then(({ x, y, placement, middlewareData }) => {
          Object.assign(tooltip.style, {
            left: `${x}px`,
            top: `${y}px`,
          });

          const { x: arrowX, y: arrowY } = middlewareData.arrow ?? {
            x: 0,
            y: 0,
          };
          const staticSide =
            {
              top: "bottom",
              right: "left",
              bottom: "top",
              left: "right",
            }[placement.split("-")[0]] ?? "never";

          Object.assign(arrowEl.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            right: "",
            bottom: "",
            [staticSide]: "-4px",
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
                arrowRef={(el) => $setKanjiEl("el", "arrow", char + i, el)}
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

  function CharSpan(props: { char: string; i: number; j: number }) {
    const key = props.char + props.i + "-" + props.j;

    return (
      <span class="relative" ref={(el) => $setKanjiEl("el", "kanji", key, el)}>
        <KanjiContextProvider kanji={extractKanji(props.char)[0] ?? ""}>
          <KanjiTooltip
            arrowRef={(el) => $setKanjiEl("el", "arrow", key, el)}
            ref={(el) => $setKanjiEl("el", "tooltip", key, el)}
          />
        </KanjiContextProvider>
        {props.char}
      </span>
    );
  }

  return (
    <>
      {furiganaData.map((item, i) => {
        const chars = item.text.trim().split("");

        if (item.type === "ruby") {
          return (
            <ruby>
              {chars.map((char, j) => (
                <CharSpan char={char} i={i} j={j} />
              ))}

              {item.reading.trim() !== "" && <rt>{item.reading}</rt>}
            </ruby>
          );
        }

        return (
          <span>
            {chars.map((char, j) => (
              <CharSpan char={char} i={i} j={j} />
            ))}
          </span>
        );
      })}
    </>
  );
}

function KanjiTooltip(props: {
  ref: (ref: HTMLDivElement) => void;
  arrowRef: (ref: HTMLDivElement) => void;
}) {
  const [$kanji, $setKanji] = useKanjiContext();
  if (!$kanji.kanji) return null;

  return (
    <div
      class="absolute z-10 overflow-hidden hidden rounded-lg horizontal-tb"
      ref={props.ref}
    >
      <div
        ref={props.arrowRef}
        class="absolute bg-base-content-faint size-8 rotate-45 z-20 -translate-y-6"
      ></div>
      <div class="relative text-base bg-base-200/97 z-10 p-2 sm:p-4 border border-base-300 rounded-lg font-primary w-xs sm:w-md lg:w-lg shadow-lg max-h-[75svh] overflow-auto">
        <KanjiInfo />
        <div class="text-sm mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2">
          <KanjiInfoExtra />
        </div>
      </div>
    </div>
  );
}
