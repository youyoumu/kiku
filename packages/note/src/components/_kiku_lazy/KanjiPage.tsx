import {
  createEffect,
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { useCardContext } from "#/components/shared/CardContext";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/types";
import { useNavigationTransition } from "#/util/hooks";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useGeneralContext } from "../shared/GeneralContext";
import HeaderKanjiPage from "./HeaderKanjiPage";
import { ArrowLeftIcon } from "./Icons";
import { KanjiContextProvider, useKanjiContext } from "./KanjiContext";
import { KanjiInfo, KanjiInfoExtra } from "./KanjiInfo";
import {
  KanjiPageContextProvider,
  useKanjiPageContext,
} from "./KanjiPageContext";

export default function KanjiPage() {
  const [$card, $setCard] = useCardContext();
  return (
    <KanjiPageContextProvider
      noteList={$card.query.noteList}
      sameReading={$card.query.sameReading}
      sameExpression={$card.query.sameExpression}
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
          sameExpression={[]}
          focus={{
            kanji: $kanjiPage.nestedFocus.kanji,
            noteId: $kanjiPage.nestedFocus.noteId,
          }}
          id={$kanjiPage.nestedId}
          contextLabel={$kanjiPage.nestedContextLabel}
        >
          <Page />
        </KanjiPageContextProvider>
      </Match>
      <Match when={!$kanjiPage.nested}>
        <HeaderKanjiPage />
        <Show when={$kanjiPage.contextLabel}>
          <div class="flex flex-col items-center gap-2">
            <div class="flex justify-center text-7xl font-secondary ">
              {$kanjiPage.contextLabel?.text}
            </div>
            <Switch>
              <Match when={$kanjiPage.contextLabel?.type === "similar"}>
                <div class="text-lg text-base-content-calm">
                  Visually Similar
                </div>
              </Match>
              <Match when={$kanjiPage.contextLabel?.type === "composedOf"}>
                <div class="text-lg text-base-content-calm">Composed of</div>
              </Match>
              <Match when={$kanjiPage.contextLabel?.type === "usedIn"}>
                <div class="text-lg text-base-content-calm">Used in</div>
              </Match>
              <Match when={$kanjiPage.contextLabel?.type === "related"}>
                <div class="text-lg text-base-content-calm">Related</div>
              </Match>
            </Switch>
          </div>
        </Show>

        <div class="flex flex-col gap-2 sm:gap-4 ">
          <For each={$kanjiPage.noteList}>
            {([kanji, data]) => {
              return (
                <KanjiContextProvider kanji={kanji}>
                  <KanjiCollapsible data={data} />
                </KanjiContextProvider>
              );
            }}
          </For>
          <Show
            when={$kanjiPage.sameReading && $kanjiPage.sameReading.length > 0}
          >
            <KanjiContextProvider kanji="">
              <SameReadingCollapsible mode="reading" />
            </KanjiContextProvider>
          </Show>
          <Show
            when={
              $kanjiPage.sameExpression && $kanjiPage.sameExpression.length > 0
            }
          >
            <KanjiContextProvider kanji="">
              <SameReadingCollapsible mode="expression" />
            </KanjiContextProvider>
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
  const [checked, setChecked] = createSignal(
    $kanjiPage.focus.kanji === $kanji.kanji,
  );

  createEffect(() => {
    if (checked()) $kanji.fetchNotes();
  });

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input
        type="checkbox"
        checked={checked()}
        onChange={(e) => {
          setChecked(e.currentTarget.checked);
        }}
      />
      <div
        class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4"
        on:click={() => {
          setChecked(!checked());
        }}
      >
        <KanjiText />
        <div class="flex gap-1 sm:gap-2 absolute top-2 right-2 sm:top-4 sm:right-4">
          <Show when={$kanji.status === "loading"}>
            <div class="loading loading-sm text-base-content-soft animate-fade-in-sm"></div>
          </Show>
          <div class="text-base-content-soft bg-base-300 px-1 rounded-xs animate-fade-in-sm text-sm sm:text-base">
            {data().length}
          </div>
        </div>
      </div>

      <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col gap-1 sm:gap-2">
        <KanjiInfoExtra inKanjiPage />
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

function SameReadingCollapsible(props: { mode: "reading" | "expression" }) {
  const [$general] = useGeneralContext();
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
  const { ankiFields } = useAnkiFieldContext<"back">();

  const symbol =
    props.mode === "reading" ? $general.SAME_READING : $general.SAME_EXPRESSION;

  const title = props.mode === "reading" ? "Same Reading" : "Same Expression";
  const list =
    props.mode === "reading"
      ? $kanjiPage.sameReading
      : $kanjiPage.sameExpression;

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
      if ($kanjiPage.focus.kanji === symbol) {
        ref.scrollIntoView({ block: "center" });
      }
    }
  });

  return (
    <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
      <input type="checkbox" checked={$kanjiPage.focus.kanji === symbol} />
      <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
        <span class="text-lg sm:text-2xl">
          <span class="text-base-content-calm" ref={ref}>
            {title}
          </span>{" "}
          <span class="font-secondary">
            (
            <ExpressionFurigana />)
          </span>
        </span>
      </div>
      <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4">
        <ul class="list bg-base-100 rounded-box shadow-md">
          <For each={list ?? []}>
            {(data) => {
              return (
                <AnkiNoteItem
                  data={data}
                  reading={ankiFields.ExpressionReading}
                  mode={props.mode}
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
  mode?: "reading" | "expression";
}) {
  const data = () => props.data;
  const reading = () => props.reading;
  const { navigate } = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const [$general, $setGeneral] = useGeneralContext();
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
      // TODO: I'm not sure how to handle if the note has multiple cards
      CardID: data().cards[0]?.toString() ?? "",
      Tags: data().tags.join(" "),
    };

    if (props.mode) {
      if (props.mode === "reading") {
        $setKanjiPage("focus", { kanji: $general.SAME_READING });
      } else {
        $setKanjiPage("focus", { kanji: $general.SAME_EXPRESSION });
      }
    } else {
      $setKanjiPage("focus", { kanji: $kanji.kanji });
    }
    $setKanjiPage("focus", { noteId: data().noteId });

    $setCard({ nestedAnkiFields: ankiFields });
    $setCard("nestedNoteId", data().noteId);
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
      <KanjiInfo />
    </div>
  );
}
