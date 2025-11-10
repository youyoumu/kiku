import { For } from "solid-js";
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
      <For each={Object.entries(card.kanji)}>
        {([kanji, data]) => {
          return (
            <div class="collapse bg-base-100 border border-base-300">
              <input type="checkbox" />
              <div class="collapse-title text-7xl justify-center flex font-secondary">
                {kanji}
              </div>
              <div class="collapse-content text-sm">
                <div class="flex flex-col gap-4">
                  <div class="text-2xl font-bold">Shared</div>
                  <div>
                    <ul class="list bg-base-100 rounded-box shadow-md">
                      <For each={data.shared}>
                        {(data) => {
                          return (
                            <>
                              <li class="p-4 pb-0 tracking-wide flex gap-2 items-end">
                                <div
                                  class=" text-4xl font-secondary"
                                  innerHTML={data.fields.Expression.value}
                                ></div>
                                <div class="text-base-content-calm">
                                  {new Date(data.noteId).toLocaleDateString()}
                                </div>
                              </li>

                              <li class="list-row">
                                <div></div>
                                <div
                                  class="text-xl text-base-content-calm font-secondary"
                                  innerHTML={data.fields.Sentence.value}
                                ></div>
                                <ArrowLeftIcon
                                  class="size-10 text-base-content-soft rotate-180 cursor-pointer"
                                  on:click={() => {
                                    props.onNextClick?.(data.noteId);
                                  }}
                                ></ArrowLeftIcon>
                              </li>
                            </>
                          );
                        }}
                      </For>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </>
  );
}
