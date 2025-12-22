import { createEffect, createUniqueId, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import type { AnkiNote } from "#/types";
import { useNavigationTransition } from "#/util/hooks";
import { KanjiContextProvider, useKanjiContext } from "./KanjiContext";
import { type ContextLabel, useKanjiPageContext } from "./KanjiPageContext";
import { capitalizeSentence } from "./util/general";

export function KanjiInfo() {
  const [$kanji, $setKanji] = useKanjiContext();

  return (
    <div class="flex flex-col text-xs sm:text-sm text-base-content-calm items-start z-10 relative">
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
                  <span class="border border-base-content-subtle-100 inline-flex">
                    <span class="px-0.5">{reading.reading}</span>
                    <span class="border-s border-base-300 px-0.5 bg-base-300 text-base-content-soft">
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
  );
}

export function KanjiInfoExtra(props: { inKanjiPage?: boolean }) {
  const [$kanji, $setKanji] = useKanjiContext();
  const KanjiKeywordComponent = props.inKanjiPage
    ? KanjiKeywordKanjiPage
    : KanjiKeyword;
  const [$checkbox, $setCheckbox] = createStore({
    visuallySimilar: true,
    composedOf: false,
    usedIn: false,
    meanings: false,
    related: false,
  });

  createEffect(() => {
    if ($checkbox.visuallySimilar) {
      $kanji.fetchNotes("visuallySimilar");
    }
    if ($checkbox.composedOf) {
      $kanji.fetchNotes("composedOf");
    }
    if ($checkbox.usedIn) {
      $kanji.fetchNotes("usedIn");
    }
    if ($checkbox.related) {
      $kanji.fetchNotes("related");
    }
  });

  return (
    <>
      <Show when={$kanji.kanjiInfo?.visuallySimilar.length}>
        <div class="collapse collapse-arrow rounded-none">
          <input
            type="checkbox"
            class="p-0"
            checked={$checkbox.visuallySimilar}
            on:change={(e) => {
              $setCheckbox("visuallySimilar", e.currentTarget.checked);
            }}
          />
          <div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start">
            <div class="font-bold text-base-content-calm">Visually Similar</div>
          </div>
          <div class="collapse-content p-0">
            <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
              <For each={$kanji.kanjiInfo?.visuallySimilar}>
                {(kanji) => {
                  return (
                    <KanjiContextProvider kanji={kanji}>
                      <KanjiKeywordComponent
                        noteList={$kanji.visuallySimilar}
                        nestedFocus={{
                          kanji: kanji,
                          noteId: undefined,
                        }}
                        contextLabel={{
                          text: $kanji.kanji,
                          type: "similar",
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
        <div class="collapse collapse-arrow rounded-none">
          <input
            type="checkbox"
            class="p-0"
            checked={$checkbox.composedOf}
            on:change={(e) => {
              $setCheckbox("composedOf", e.currentTarget.checked);
            }}
          />
          <div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start">
            <div class="font-bold text-base-content-calm">Composed of</div>
          </div>
          <div class="collapse-content p-0">
            <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
              <For each={$kanji.kanjiInfo?.composedOf}>
                {(kanji) => {
                  return (
                    <KanjiContextProvider kanji={kanji}>
                      <KanjiKeywordComponent
                        noteList={$kanji.composedOf}
                        nestedFocus={{
                          kanji: kanji,
                          noteId: undefined,
                        }}
                        contextLabel={{
                          text: $kanji.kanji,
                          type: "composedOf",
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
        <div class="collapse collapse-arrow rounded-none">
          <input
            type="checkbox"
            class="p-0"
            checked={$checkbox.usedIn}
            on:change={(e) => {
              $setCheckbox("usedIn", e.currentTarget.checked);
            }}
          />
          <div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start">
            <div class="font-bold text-base-content-calm">Used in</div>
          </div>
          <div class="collapse-content p-0">
            <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
              <For each={$kanji.kanjiInfo?.usedIn}>
                {(kanji) => {
                  return (
                    <KanjiContextProvider kanji={kanji}>
                      <KanjiKeywordComponent
                        noteList={$kanji.usedIn}
                        nestedFocus={{
                          kanji: kanji,
                          noteId: undefined,
                        }}
                        contextLabel={{
                          text: $kanji.kanji,
                          type: "usedIn",
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
        <div class="collapse collapse-arrow rounded-none">
          <input
            type="checkbox"
            class="p-0"
            checked={$checkbox.meanings}
            on:change={(e) => {
              $setCheckbox("meanings", e.currentTarget.checked);
            }}
          />
          <div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start">
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
        <div class="collapse collapse-arrow rounded-none">
          <input
            type="checkbox"
            class="p-0"
            checked={$checkbox.related}
            on:change={(e) => {
              $setCheckbox("related", e.currentTarget.checked);
            }}
          />
          <div class="collapse-title p-0 mb-1 after:text-base-content-calm text-start">
            <div class="font-bold text-base-content-calm">Related</div>
          </div>
          <div class="collapse-content p-0">
            <div class="flex gap-1 sm:gap-2 flex-wrap text-base-content-calm">
              <For each={$kanji.kanjiInfo?.related}>
                {(kanji) => {
                  return (
                    <KanjiContextProvider kanji={kanji}>
                      <KanjiKeywordComponent
                        noteList={$kanji.related}
                        nestedFocus={{
                          kanji: kanji,
                          noteId: undefined,
                        }}
                        contextLabel={{
                          text: $kanji.kanji,
                          type: "related",
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
    </>
  );
}

function KanjiKeyword(props: {
  noteList?: [string, AnkiNote[]][];
  nestedFocus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  contextLabel?: ContextLabel;
  onClick?: () => void;
}) {
  const [$kanji, $setKanji] = useKanjiContext();

  const keyword = () =>
    $kanji.kanjiInfo?.wkMeaning
      ? $kanji.kanjiInfo?.wkMeaning
      : $kanji.kanjiInfo?.keyword;
  const ready = () => !!props.noteList;

  return (
    <div
      class="inline-flex border border-base-content-subtle-100 transition-colors hover:border-base-content-subtle-200"
      classList={{
        "cursor-pointer": ready(),
        "text-base-content-calm": ready(),
        "text-base-content-soft": !ready(),
      }}
      on:click={props.onClick}
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

function KanjiKeywordKanjiPage(props: {
  noteList?: [string, AnkiNote[]][];
  nestedFocus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  contextLabel?: ContextLabel;
}) {
  const [$kanjiPage, $setKanjiPage] = useKanjiPageContext();
  const { navigate } = useNavigationTransition();

  const onClick = () => {
    navigate(
      () => {
        if (!props.noteList) return;
        $setKanjiPage("nestedContextLabel", props.contextLabel);
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
  };

  return <KanjiKeyword {...props} onClick={onClick} />;
}
