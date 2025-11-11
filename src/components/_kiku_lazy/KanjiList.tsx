import { For, Show } from "solid-js";
import { useCardStore } from "../shared/Context";
import { ArrowLeftIcon } from "./Icons";

export default function KanjiList(props: {
  onBackClick?: () => void;
  onNextClick?: (noteId: number) => void;
}) {
  const [card, setCard] = useCardStore();

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
      <div class="flex justify-center expression font-secondary ">
        {card.selectedSimilarKanji}
      </div>
      <div class="flex flex-col gap-2 sm:gap-4 ">
        <For
          each={
            card.selectedSimilarKanji
              ? Object.entries(card.kanji[card.selectedSimilarKanji].similar)
              : Object.entries(card.kanji)
          }
        >
          {([kanji, data]) => {
            return (
              <div class="collapse bg-base-200 border border-base-300 animate-fade-in">
                <input type="checkbox" checked={!card.selectedSimilarKanji} />
                <div class="collapse-title justify-between flex items-center ps-2 sm:ps-4 pe-2 sm:pe-4 py-2 sm:py-4">
                  <div class="font-secondary expression">{kanji}</div>
                  <Show
                    when={
                      !card.selectedSimilarKanji &&
                      Object.keys(card.kanji[kanji].similar).length > 0
                    }
                  >
                    <div
                      class="flex gap-2 items-center btn z-10"
                      on:click={() => {
                        setCard("selectedSimilarKanji", kanji);
                      }}
                    >
                      <div class="text-base-content-calm">Similar</div>
                      <ArrowLeftIcon class="size-5 sm:size-8 text-base-content-soft rotate-180 cursor-pointer"></ArrowLeftIcon>
                    </div>
                  </Show>
                </div>
                <div class="collapse-content text-sm px-2 sm:px-4 pb-2 sm:pb-4">
                  <ul class="list bg-base-100 rounded-box shadow-md">
                    <For each={Array.isArray(data) ? data : data.shared}>
                      {(data) => {
                        return (
                          <>
                            <li class="p-4 pb-0 tracking-wide flex gap-2 items-end">
                              <div
                                class=" font-secondary sentence"
                                innerHTML={data.fields.Expression.value.replaceAll(
                                  kanji,
                                  `<span class="text-base-content-primary">${kanji}</span>`,
                                )}
                              ></div>
                              <div class="text-base-content-calm">
                                {new Date(data.noteId).toLocaleDateString()}
                              </div>
                            </li>

                            <li class="list-row">
                              <div></div>
                              <div
                                class="text-base sm:text-xl text-base-content-calm font-secondary"
                                innerHTML={data.fields.Sentence.value.replaceAll(
                                  kanji,
                                  `<span class="text-base-content-primary">${kanji}</span>`,
                                )}
                              ></div>
                              <div class="flex justify-center items-center">
                                <ArrowLeftIcon
                                  class="size-5 sm:size-8 text-base-content-soft rotate-180 cursor-pointer"
                                  on:click={() => {
                                    props.onNextClick?.(data.noteId);
                                  }}
                                ></ArrowLeftIcon>
                              </div>
                            </li>
                          </>
                        );
                      }}
                    </For>
                  </ul>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </>
  );
}
