import { computePosition } from "@floating-ui/dom";
import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { extractKanji } from "#/util/general";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useCardContext } from "../shared/CardContext";

export default function Expression() {
  const [$card, $setCard] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"back">();
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

  onMount(() => {
    const charEls = Object.entries($kanjiEl.el.kanji);
    charEls.forEach(([char, kanji], i) => {
      const tooltip = $kanjiEl.el.tooltip[char];
      if (kanji && tooltip) {
        computePosition(kanji, tooltip, {
          placement: "bottom",
        }).then(({ x, y }) => {
          Object.assign(tooltip.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      }
    });
  });

  return (
    <ruby>
      {ankiFields.Expression.split("").map((char, i) => (
        <span
          class="relative"
          ref={(el) => {
            $setKanjiEl("el", "kanji", char + i, el);
          }}
        >
          <KanjiTooltip
            char={char}
            ref={(el) => $setKanjiEl("el", "tooltip", char + i, el)}
          />
          {char}
        </span>
      ))}
      <rt>{ankiFields.ExpressionReading}</rt>
    </ruby>
  );
}

function KanjiTooltip(props: {
  char: string;
  ref: (ref: HTMLDivElement) => void;
}) {
  const kanji = extractKanji(props.char)[0];
  if (!kanji) return null;

  return (
    <div class="absolute text-base bg-base-300 z-10" ref={props.ref}>
      hello
    </div>
  );
}
