import { createSignal, For, onMount, Show } from "solid-js";
import {
  type KanjiData,
  useCardContext,
} from "#/components/shared/CardContext";
import type { AnkiNote, Kanji } from "#/types";
import { useNavigationTransition } from "#/util/hooks";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { ArrowLeftIcon } from "./Icons";

export default function KanjiPage(props: {
  onBackClick: () => void;
  onNextClick: (noteId: number) => void;
}) {
  const [$card, $setCard] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"back">();

  const ExpressionFurigana = () => {
    if (ankiFields.Expression && ankiFields.ExpressionReading) {
      return (
        <ruby>
          {ankiFields.Expression}
          <rt>{ankiFields.ExpressionReading}</rt>
        </ruby>
      );
    }
    return ankiFields.ExpressionReading
      ? ankiFields.ExpressionReading
      : ankiFields.Expression;
  };

  return (
    <>
      <div class="flex flex-row justify-between items-center animate-fade-in">
        <div class="h-5">
          <ArrowLeftIcon
            class="h-full w-full cursor-pointer text-base-content-soft"
            on:click={props.onBackClick}
          ></ArrowLeftIcon>
        </div>
        <div class="flex flex-row gap-2 items-center"></div>
      </div>

      <Show when={$card.selectedSimilarKanji}>
        <div class="flex flex-col items-center gap-2">
          <div class="text-lg text-base-content-calm">Similar Kanji</div>
          <div class="flex justify-center text-7xl font-secondary ">
            {$card.selectedSimilarKanji}
          </div>
        </div>
      </Show>

      <div class="flex flex-col gap-2 sm:gap-4 ">
        <For
          each={(() => {
            return $card.selectedSimilarKanji
              ? Object.entries($card.kanji[$card.selectedSimilarKanji].similar)
              : Object.entries($card.kanji);
          })()}
        >
          {([kanji, data]) => {
            return (
              <KanjiCollapsible
                kanji={kanji}
                data={data}
                onNextClick={props.onNextClick}
              />
            );
          }}
        </For>
        <Show
          when={
            !$card.selectedSimilarKanji &&
            $card.sameReadingNote &&
            $card.sameReadingNote.length > 0
          }
        >
          <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
            <input type="checkbox" checked={true} />
            <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
              <span class="text-lg sm:text-2xl">
                <span class="text-base-content-calm">Same Reading</span>{" "}
                <span class="font-secondary">
                  (
                  <ExpressionFurigana />)
                </span>
              </span>
            </div>
            <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4">
              <ul class="list bg-base-100 rounded-box shadow-md">
                <For each={$card.sameReadingNote ?? []}>
                  {(data) => {
                    return (
                      <AnkiNoteItem
                        data={data}
                        onNextClick={props.onNextClick}
                        reading={ankiFields.ExpressionReading}
                      />
                    );
                  }}
                </For>
              </ul>
            </div>
          </div>
        </Show>
      </div>

      <div class="flex justify-center items-center">
        <Show when={$card.manifest}>
          <div class="text-base-content-faint text-sm">
            Updated at{" "}
            {new Date($card.manifest?.generatedAt ?? 0).toLocaleDateString()}
          </div>
        </Show>
      </div>
    </>
  );
}

function KanjiCollapsible(props: {
  kanji: string;
  onNextClick: (noteId: number) => void;
  data: KanjiData | AnkiNote[];
}) {
  const [$card, $setCard] = useCardContext();
  const kanji = () => props.kanji;
  const data = () => props.data;
  const navigate = useNavigationTransition();

  const theData = () => {
    const data$ = data();
    return Array.isArray(data$) ? data$ : data$.shared;
  };

  if (theData().length === 0) return null;

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input type="checkbox" checked={!$card.selectedSimilarKanji} />
      <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
        <KanjiText kanji={kanji()} />
        <Show
          when={
            !$card.selectedSimilarKanji &&
            Object.keys($card.kanji[kanji()].similar).length > 0
          }
        >
          <div
            class="flex gap-2 items-center btn btn-sm sm:btn-md z-10"
            on:click={() => {
              navigate(
                () => $setCard("selectedSimilarKanji", kanji()),
                "forward",
              );
            }}
          >
            <div class="text-base-content-calm">Similar</div>
            <ArrowLeftIcon class="size-5 sm:size-8 text-base-content-soft rotate-180 cursor-pointer"></ArrowLeftIcon>
          </div>
        </Show>
      </div>
      <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4">
        <ul class="list bg-base-100 rounded-box shadow-md">
          <For each={theData()}>
            {(data) => {
              return (
                <AnkiNoteItem
                  data={data}
                  kanji={kanji()}
                  onNextClick={props.onNextClick}
                />
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

function AnkiNoteItem(props: {
  data: AnkiNote;
  kanji?: string;
  reading?: string;
  onNextClick: (noteId: number) => void;
}) {
  const data = () => props.data;
  const kanji = () => props.kanji;
  const reading = () => props.reading;

  const leech = data().tags.includes("leech");
  const expressionInnerHtml = () => {
    if (
      data().fields.Expression.value &&
      data().fields.ExpressionReading.value
    ) {
      return `<ruby>${data().fields.Expression.value}<rt>${data().fields.ExpressionReading.value}</rt></ruby>`;
    }
    if (data().fields.Expression.value) return data().fields.Expression.value;
    return data().fields.ExpressionReading.value;
  };

  const expressionInnerHtmlColorized = () => {
    const kanji$ = kanji();
    const reading$ = reading();
    if (!kanji$ && !reading$) return expressionInnerHtml();

    if (kanji$) {
      return expressionInnerHtml().replaceAll(
        kanji$,
        `<span class="text-base-content-primary">${kanji$}</span>`,
      );
    }
    if (reading$) {
      return expressionInnerHtml().replaceAll(
        reading$,
        `<span class="text-base-content-primary">${reading$}</span>`,
      );
    }
  };

  const sentenceInnerHtmlColorized = () => {
    const kanji$ = kanji();
    if (!kanji$) return data().fields.Sentence.value;

    return data().fields.Sentence.value.replaceAll(
      kanji$,
      `<span class="text-base-content-primary">${kanji$}</span>`,
    );
  };

  return (
    <>
      <li class="p-4 pb-0 tracking-wide flex gap-2 items-start justify-between">
        <div class="flex gap-2 items-end">
          <div
            class=" font-secondary sentence"
            innerHTML={expressionInnerHtmlColorized()}
          ></div>
          <div class="text-base-content-calm">
            {new Date(data().noteId).toLocaleDateString()}
          </div>
        </div>
        {leech && <div class="status status-warning"></div>}
      </li>

      <li class="list-row">
        <div></div>
        <div
          class="text-base sm:text-xl text-base-content-calm font-secondary"
          innerHTML={sentenceInnerHtmlColorized()}
        ></div>
        <div class="flex justify-center items-center">
          <ArrowLeftIcon
            class="size-5 sm:size-8 text-base-content-soft rotate-180 cursor-pointer"
            on:click={() => {
              props.onNextClick?.(data().noteId);
            }}
          ></ArrowLeftIcon>
        </div>
      </li>
    </>
  );
}

function KanjiText(props: { kanji: string }) {
  const [$card] = useCardContext();
  const [kanji, setKanji] = createSignal<Kanji>();

  onMount(async () => {
    const nex = await $card.worker?.nex;
    if (nex) {
      const lookup = await nex.lookup(props.kanji);
      setKanji(lookup);
    }
  });

  return (
    <div class="flex gap-2 sm:gap-4 ">
      <div class="font-secondary expression">{props.kanji}</div>
      <div class="flex flex-col text-xs sm:text-sm text-base-content-calm leading-tight">
        <div
          classList={{
            hidden: !kanji()?.meanings.length,
          }}
        >
          <span>Meaning: </span>
          <span class="text-base-content-soft">
            {kanji()?.meanings.join(", ")}
          </span>
        </div>
        <div
          classList={{
            hidden: typeof kanji()?.level !== "number",
          }}
        >
          <span>Difficulty: </span>
          <span class="text-base-content-soft">
            {(kanji()?.level ?? 0) * 100}
          </span>
        </div>
        <div
          classList={{
            hidden: !kanji()?.onyomi.length,
          }}
        >
          <span>Onyomi: </span>
          <span class="text-base-content-soft">
            {kanji()?.onyomi.join(", ")}
          </span>
        </div>
        <div
          classList={{
            hidden: !kanji()?.kunyomi.length,
          }}
        >
          <span>Kunyomi: </span>
          <span class="text-base-content-soft">
            {kanji()?.kunyomi.join(", ")}
          </span>
        </div>
      </div>
    </div>
  );
}
