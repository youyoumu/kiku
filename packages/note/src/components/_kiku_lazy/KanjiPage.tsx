import { createUniqueId, For, Match, onMount, Show, Switch } from "solid-js";
import { useCardContext } from "#/components/shared/CardContext";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/types";
import { useNavigationTransition } from "#/util/hooks";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useGeneralContext } from "../shared/GeneralContext";
import HeaderKanjiPage from "./HeaderKanjiPage";
import { ArrowLeftIcon } from "./Icons";
import { KanjiContextProvider, useKanjiContext } from "./KanjiContext";
import {
  KanjiPageContextProvider,
  useKanjiPageContext,
} from "./KanjiPageContext";
import { capitalizeSentence } from "./util/general";

export default function KanjiPage() {
  const [$card, $setCard] = useCardContext();
  return (
    <KanjiPageContextProvider
      noteList={$card.query.noteList}
      sameReading={$card.query.sameReading}
      focus={{
        kanji: $card.focus.kanji,
        noteId: $card.focus.noteId,
      }}
      id={$card.uniqueId}
    >
      <Page />
    </KanjiPageContextProvider>
  );
}

function Page() {
  const [$general, $setGeneral] = useGeneralContext();
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();

  return (
    <Switch>
      <Match when={$kanjiPage.nested}>
        <KanjiPageContextProvider
          noteList={$kanjiPage.nestedNoteList}
          sameReading={[]}
          focus={{
            kanji: $kanjiPage.nestedFocus.kanji,
            noteId: $kanjiPage.nestedFocus.noteId,
          }}
          selectedKanji={$kanjiPage.selectedKanji}
          id={$kanjiPage.nestedId}
        >
          <Page />
        </KanjiPageContextProvider>
      </Match>
      <Match when={!$kanjiPage.nested}>
        <HeaderKanjiPage />
        <Show when={$kanjiPage.selectedKanji}>
          <div class="flex flex-col items-center gap-2">
            {/* TODO: change text  */}
            <div class="text-lg text-base-content-calm">Similar Kanji</div>
            <div class="flex justify-center text-7xl font-secondary ">
              {$kanjiPage.selectedKanji?.kanji}
            </div>
          </div>
        </Show>

        <div class="flex flex-col gap-2 sm:gap-4 ">
          <For each={$kanjiPage.noteList}>
            {([kanji, data]) => {
              return (
                <KanjiContextProvider kanji={kanji} fetchNotes>
                  <KanjiCollapsible data={data} />
                </KanjiContextProvider>
              );
            }}
          </For>
          <Show
            when={$kanjiPage.sameReading && $kanjiPage.sameReading.length > 0}
          >
            <SameReadingCollapsible />
          </Show>
        </div>
        <div class="flex justify-center items-center">
          <Show when={$general.notesManifest}>
            <div class="text-base-content-faint text-sm">
              Updated at{" "}
              {new Date(
                $general.notesManifest?.generatedAt ?? 0,
              ).toLocaleDateString()}
            </div>
          </Show>
        </div>
      </Match>
    </Switch>
  );
}

function KanjiCollapsible(props: { data: AnkiNote[] }) {
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
  const [$kanji, $setKanji] = useKanjiContext();
  const data = () => props.data;

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input
        type="checkbox"
        checked={$kanjiPage.focus.kanji === $kanji.kanji}
      />
      <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
        <KanjiText />
        <Show when={$kanji.status === "loading"}>
          <div class="absolute top-0 right-2 sm:top-2 sm:right-4 loading loading-sm text-base-content-soft">
            test
          </div>
        </Show>
      </div>

      <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col gap-2">
        <Show when={$kanji.kanjiInfo?.visuallySimilar.length}>
          <div class="collapse collapse-arrow">
            <input type="checkbox" class="p-0" checked />
            <div class="collapse-title p-0 mb-1 after:text-base-content-calm">
              <div class="font-bold text-base-content-calm">Similar</div>
            </div>
            <div class="collapse-content p-0">
              <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
                <For each={$kanji.kanjiInfo?.visuallySimilar}>
                  {(kanji) => {
                    return (
                      <KanjiContextProvider kanji={kanji}>
                        <KanjiKeyword
                          noteList={$kanji.visuallySimilar}
                          nestedFocus={{
                            kanji: kanji,
                            noteId: undefined,
                          }}
                        />
                      </KanjiContextProvider>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <Show when={$kanji.kanjiInfo?.composedOf.length}>
          <div class="collapse collapse-arrow">
            <input type="checkbox" class="p-0" />
            <div class="collapse-title p-0 mb-1 after:text-base-content-calm">
              <div class="font-bold text-base-content-calm">Composed of</div>
            </div>
            <div class="collapse-content p-0">
              <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
                <For each={$kanji.kanjiInfo?.composedOf}>
                  {(kanji) => {
                    return (
                      <KanjiContextProvider kanji={kanji}>
                        <KanjiKeyword
                          noteList={$kanji.composedOf}
                          nestedFocus={{
                            kanji: kanji,
                            noteId: undefined,
                          }}
                        />
                      </KanjiContextProvider>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <Show when={$kanji.kanjiInfo?.usedIn.length}>
          <div class="collapse collapse-arrow ">
            <input type="checkbox" class="p-0" />
            <div class="collapse-title p-0 mb-1 after:text-base-content-calm">
              <div class="font-bold text-base-content-calm">Used in</div>
            </div>
            <div class="collapse-content p-0">
              <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
                <For each={$kanji.kanjiInfo?.usedIn}>
                  {(kanji) => {
                    return (
                      <KanjiContextProvider kanji={kanji}>
                        <KanjiKeyword
                          noteList={$kanji.usedIn}
                          nestedFocus={{
                            kanji: kanji,
                            noteId: undefined,
                          }}
                        />
                      </KanjiContextProvider>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <Show when={$kanji.kanjiInfo?.meanings.length}>
          <div class="collapse collapse-arrow">
            <input type="checkbox" class="p-0" />
            <div class="collapse-title p-0 mb-1 after:text-base-content-calm">
              <div class="font-bold text-base-content-calm">Meanings</div>
            </div>
            <div class="collapse-content p-0">
              <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
                <For each={$kanji.kanjiInfo?.meanings}>
                  {(meaning) => {
                    return (
                      <div class="border border-base-300 inline-flex px-1 bg-base-300">
                        {meaning}
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <Show when={$kanji.kanjiInfo?.related.length}>
          <div class="collapse collapse-arrow">
            <input type="checkbox" class="p-0" />
            <div class="collapse-title p-0 mb-1 after:text-base-content-calm">
              <div class="font-bold text-base-content-calm">Related</div>
            </div>
            <div class="collapse-content p-0">
              <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
                <For each={$kanji.kanjiInfo?.related}>
                  {(kanji) => {
                    return (
                      <KanjiContextProvider kanji={kanji}>
                        <KanjiKeyword
                          noteList={$kanji.related}
                          nestedFocus={{
                            kanji: kanji,
                            noteId: undefined,
                          }}
                        />
                      </KanjiContextProvider>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </Show>

        <ul class="list bg-base-100 rounded-box shadow-md">
          <For each={data()}>
            {(data) => {
              return <AnkiNoteItem data={data} />;
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

function KanjiKeyword(props: {
  noteList?: [string, AnkiNote[]][];
  nestedFocus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
}) {
  const [$kanji, $setKanji] = useKanjiContext();
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
  const { navigate } = useNavigationTransition();

  const keyword = () =>
    $kanji.kanjiInfo?.wkMeaning
      ? $kanji.kanjiInfo?.wkMeaning
      : $kanji.kanjiInfo?.keyword;

  return (
    <div
      class="inline-flex border border-base-300"
      classList={{
        "cursor-pointer": $kanji.status === "success",
      }}
      on:click={() => {
        navigate(
          () => {
            if (!props.noteList) return;
            $setKanjiPage("nestedId", createUniqueId());
            $setKanjiPage("nestedFocus", {
              kanji: props.nestedFocus.kanji,
              noteId: props.nestedFocus.noteId,
            });
            $setKanjiPage("nestedNoteList", props.noteList);
            $setKanjiPage("nested", true);
          },
          "forward",
          () => navigate(() => $setKanjiPage("nested", false), "back"),
        );
      }}
    >
      <div class=" px-1 text-lg sm:text-xl">{$kanji.kanji}</div>
      <Show when={keyword()}>
        <div class="bg-base-300 border-s border-base-300 px-1 text-base-content-soft flex items-center">
          {capitalizeSentence(keyword())}
        </div>
      </Show>
    </div>
  );
}

function SameReadingCollapsible() {
  const [$general] = useGeneralContext();
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
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
      if ($kanjiPage.focus.kanji === $general.SAME_READING) {
        ref.scrollIntoView({ block: "center" });
      }
    }
  });

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input
        type="checkbox"
        checked={$kanjiPage.focus.kanji === $general.SAME_READING}
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
          <For each={$kanjiPage.sameReading ?? []}>
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
  const { navigate } = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const [$general, $setGeneral] = useGeneralContext();
  //TODO: this will crash?
  const [$kanji, $setKanji] = useKanjiContext();
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();

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

  const onNextClick = () => {
    const ankiFields: AnkiFields = {
      ...ankiFieldsSkeleton,
      ...Object.fromEntries(
        Object.entries(data().fields).map(([key, value]) => {
          return [key, value.value];
        }),
      ),
      Tags: data().tags.join(" "),
    };

    if (props.sameReadingSection) {
      $setCard("focus", { kanji: $general.SAME_READING });
    } else {
      $setCard("focus", { kanji: $kanji.kanji });
    }
    $setCard("focus", { noteId: data().noteId });
    $setCard("nestedAnkiFields", ankiFields);
    navigate("nested", "forward", () => navigate("kanji", "back"));
  };

  let ref: HTMLDivElement | undefined;
  onMount(() => {
    if (ref && $kanjiPage.focus.noteId === props.data.noteId) {
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
              onNextClick();
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
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();

  let ref: HTMLDivElement | undefined;
  onMount(() => {
    if (
      ref &&
      $kanjiPage.focus.kanji === $kanji.kanji &&
      !$kanjiPage.focus.noteId
    ) {
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
            hidden: !$kanji.kanjiInfo?.keyword,
          }}
        >
          <span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2">
            <span>Keyword: </span>
            <span>{capitalizeSentence($kanji.kanjiInfo?.keyword)}</span>
          </span>
        </div>
        <div
          classList={{
            hidden: !$kanji.kanjiInfo?.frequency,
          }}
        >
          <span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2">
            <span>Frequency: </span>
            <span>{$kanji.kanjiInfo?.frequency}</span>
          </span>
        </div>
        <div
          classList={{
            hidden: !$kanji.kanjiInfo?.readings.length,
          }}
        >
          <span class="inline-flex flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5">
            <span>Reading: </span>
            <For each={$kanji.kanjiInfo?.readings}>
              {(reading) => {
                return (
                  <Show when={reading.percentage}>
                    <span class="border border-base-300 inline-flex">
                      <span class="px-0.5">{reading.reading}</span>
                      <span class="border border-base-300 px-0.5 bg-base-300 text-base-content-soft">
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
