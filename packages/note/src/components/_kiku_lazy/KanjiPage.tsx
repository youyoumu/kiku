import { For, onMount, Show } from "solid-js";
import {
  type KanjiData,
  useCardContext,
} from "#/components/shared/CardContext";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/types";
import { useNavigationTransition } from "#/util/hooks";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { ArrowLeftIcon } from "./Icons";
import { KanjiContextProvider, useKanjiContext } from "./KanjiContext";
import { capitalizeSmart } from "./util/general";

export default function KanjiPage() {
  const [$card, $setCard] = useCardContext();
  const [$general, $setGeneral] = useGeneralContext();

  return (
    <>
      <Show when={$card.query.selectedSimilarKanji}>
        <div class="flex flex-col items-center gap-2">
          <div class="text-lg text-base-content-calm">Similar Kanji</div>
          <div class="flex justify-center text-7xl font-secondary ">
            {$card.query.selectedSimilarKanji}
          </div>
        </div>
      </Show>

      <div class="flex flex-col gap-2 sm:gap-4 ">
        <For
          each={(() => {
            return $card.query.selectedSimilarKanji
              ? Object.entries(
                  $card.query.kanji[$card.query.selectedSimilarKanji].similar,
                )
              : Object.entries($card.query.kanji);
          })()}
        >
          {([kanji, data]) => {
            return (
              <KanjiContextProvider kanji={kanji}>
                <KanjiCollapsible data={data} />
              </KanjiContextProvider>
            );
          }}
        </For>
        <Show
          when={
            !$card.query.selectedSimilarKanji &&
            $card.query.sameReading &&
            $card.query.sameReading.length > 0
          }
        >
          <SameReadingCollapsible />
        </Show>
      </div>

      <div class="flex justify-center items-center">
        <Show when={$general.manifest}>
          <div class="text-base-content-faint text-sm">
            Updated at{" "}
            {new Date($general.manifest?.generatedAt ?? 0).toLocaleDateString()}
          </div>
        </Show>
      </div>
    </>
  );
}

function KanjiCollapsible(props: { data: KanjiData | AnkiNote[] }) {
  const [$card, $setCard] = useCardContext();
  const [$kanji, $setKanji] = useKanjiContext();
  const data = () => props.data;
  const navigate = useNavigationTransition();

  const theData = () => {
    const data$ = data();
    return Array.isArray(data$) ? data$ : data$.shared;
  };
  const focus = () => {
    if ($card.query.selectedSimilarKanji) return $card.focus.similarKanjiPage;
    return $card.focus.kanjiPage;
  };

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input type="checkbox" checked={focus() === $kanji.kanji} />
      <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
        <KanjiText />
        <Show
          when={
            !$card.query.selectedSimilarKanji &&
            Object.keys($card.query.kanji[$kanji.kanji].similar).length > 0
          }
        >
          <div
            class="flex gap-2 items-center btn btn-sm sm:btn-md z-10"
            on:click={() => {
              $setCard("focus", { kanjiPage: $kanji.kanji, noteId: undefined });
              navigate(
                () => $setCard("query", { selectedSimilarKanji: $kanji.kanji }),
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
              return <AnkiNoteItem data={data} />;
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

function SameReadingCollapsible() {
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

  let ref: HTMLDivElement | undefined;
  onMount(() => {
    if (ref) {
      if (
        $card.focus.kanjiPage === $card.focus.SAME_READING &&
        !$card.focus.noteId
      ) {
        ref.scrollIntoView({ block: "center" });
      }
    }
  });

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input
        type="checkbox"
        checked={$card.focus.kanjiPage === $card.focus.SAME_READING}
      />
      <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
        <span class="text-lg sm:text-2xl">
          <span class="text-base-content-calm" ref={ref}>
            Same Reading
          </span>{" "}
          <span class="font-secondary">
            (
            <ExpressionFurigana />)
          </span>
        </span>
      </div>
      <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4">
        <ul class="list bg-base-100 rounded-box shadow-md">
          <For each={$card.query.sameReading ?? []}>
            {(data) => {
              return (
                <AnkiNoteItem
                  data={data}
                  reading={ankiFields.ExpressionReading}
                  sameReadingSection
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
  reading?: string;
  sameReadingSection?: boolean;
}) {
  const data = () => props.data;
  const reading = () => props.reading;
  const navigate = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const [$kanji, $setKanji] = useKanjiContext();

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
    const kanji$ = $kanji.kanji;
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
    const kanji$ = $kanji.kanji;
    if (!kanji$) return data().fields.Sentence.value;

    return data().fields.Sentence.value.replaceAll(
      kanji$,
      `<span class="text-base-content-primary">${kanji$}</span>`,
    );
  };

  const onNextClick = (noteId: number) => {
    const shared = Object.values($card.query.kanji).flatMap(
      (data) => data.shared,
    );
    const similar = Object.values($card.query.kanji).flatMap((data) =>
      Object.values(data.similar).flat(),
    );
    const sameReading = $card.query.sameReading ?? [];
    const notes = [...shared, ...similar, ...sameReading];
    const note = notes.find((note) => note.noteId === noteId);
    if (!note) throw new Error("Note not found");
    const ankiFields: AnkiFields = {
      ...ankiFieldsSkeleton,
      ...Object.fromEntries(
        Object.entries(note.fields).map(([key, value]) => {
          return [key, value.value];
        }),
      ),
      Tags: note.tags.join(" "),
    };

    if (props.sameReadingSection) {
      $setCard("focus", { kanjiPage: $card.focus.SAME_READING });
    } else if ($card.query.selectedSimilarKanji) {
      $setCard("focus", { similarKanjiPage: $kanji.kanji });
    } else {
      $setCard("focus", { kanjiPage: $kanji.kanji });
    }
    $setCard("focus", { noteId: note.noteId });
    $setCard("nestedAnkiFields", ankiFields);
    navigate("nested", "forward");
  };

  let ref: HTMLDivElement | undefined;
  onMount(() => {
    if (ref && $card.focus.noteId === props.data.noteId) {
      ref.scrollIntoView({ block: "center" });
    }
  });

  return (
    <>
      <li class="p-4 pb-0 tracking-wide flex gap-2 items-start justify-between">
        <div class="flex gap-2 items-end">
          <div
            class=" font-secondary sentence"
            innerHTML={expressionInnerHtmlColorized()}
            ref={ref}
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
              onNextClick(data().noteId);
            }}
          ></ArrowLeftIcon>
        </div>
      </li>
    </>
  );
}

function KanjiText() {
  const [$card, $setCard] = useCardContext();
  const [$kanji, $setKanji] = useKanjiContext();

  const focus = () => {
    if ($card.query.selectedSimilarKanji) return $card.focus.similarKanjiPage;
    return $card.focus.kanjiPage;
  };
  let ref: HTMLDivElement | undefined;
  onMount(() => {
    if (ref && focus() === $kanji.kanji && !$card.focus.noteId) {
      ref.scrollIntoView({ block: "center" });
    }
  });

  return (
    <div class="flex gap-2 sm:gap-4 me-2">
      <div class="font-secondary expression" ref={ref}>
        {$kanji.kanji}
      </div>
      <div class="flex flex-col text-xs sm:text-sm text-base-content-calm">
        <div
          classList={{
            hidden: !$kanji.jpdbKanji?.keyword,
          }}
        >
          <span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2">
            <span>Keyword: </span>
            <span>
              {$kanji.jpdbKanji?.keyword
                .split(" ")
                .map((k) => capitalizeSmart(k))
                .join(" ")}
            </span>
          </span>
        </div>
        <div
          classList={{
            hidden: !$kanji.jpdbKanji?.frequency,
          }}
        >
          <span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2">
            <span>Frequency: </span>
            <span>{$kanji.jpdbKanji?.frequency}</span>
          </span>
        </div>
        <div
          classList={{
            hidden: !$kanji.jpdbKanji?.readings.length,
          }}
        >
          <span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5">
            <span>Reading: </span>
            <For each={$kanji.jpdbKanji?.readings}>
              {(reading) => {
                return (
                  <Show when={reading.percentage}>
                    <span class="border-[1px] border-base-300 inline-flex">
                      <span class="px-0.5">{reading.reading}</span>
                      <span class="border-s-[1px] border-base-300 px-0.5 bg-base-300 text-base-content-soft">
                        {reading.percentage}
                      </span>
                    </span>
                  </Show>
                );
              }}
            </For>
          </span>
        </div>
      </div>
    </div>
  );
}
