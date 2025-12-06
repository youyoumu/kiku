import { For, Show } from "solid-js";
import { useKanjiContext } from "./KanjiContext";
import { capitalizeSentence } from "./util/general";

export function KanjiInfo() {
  const [$kanji, $setKanji] = useKanjiContext();

  return (
    <div class="flex flex-col text-xs sm:text-sm text-base-content-calm items-start">
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
  );
}
