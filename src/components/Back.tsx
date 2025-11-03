import {
  BoltIcon,
  CircleChevronDownIcon,
  InfoIcon,
  PlayIcon,
} from "lucide-solid";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import type { AnkiBackFields } from "../types";
import { isMobile } from "../util/general";
import { Layout } from "./Layout";
import { Settings } from "./Settings";

export function Back(props: { ankiFields: AnkiBackFields }) {
  let sentenceEl: HTMLDivElement | undefined;
  let expressionAudioRef: HTMLDivElement | undefined;
  let sentenceAudioRef: HTMLDivElement | undefined;
  const [definitionPage, setDefinitionPage] = createSignal(
    props.ankiFields.SelectionText ? 0 : 1,
  );
  const [showSettings, setShowSettings] = createSignal(false);

  const tags = props.ankiFields.Tags.split(" ");

  onMount(() => {
    if (sentenceEl) {
      const ruby = sentenceEl.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }
  });

  const temp = document.createElement("div");
  temp.innerHTML = props.ankiFields.Picture ?? "";
  const img = temp.querySelector("img");

  const pages = [
    props.ankiFields.SelectionText,
    props.ankiFields.MainDefinition,
    props.ankiFields.Glossary,
  ];

  const availablePagesCount = pages.filter((page) => page?.trim()).length;

  return (
    <Layout>
      <Switch>
        <Match when={showSettings()}>
          <Settings
            onBackClick={() => setShowSettings(false)}
            onCancelClick={() => setShowSettings(false)}
          />
        </Match>
        <Match when={!showSettings()}>
          <div class="flex justify-between flex-row">
            <div class="relative h-5 ">
              <BoltIcon
                class="h-full w-full cursor-pointer text-base-content/50"
                on:click={() => setShowSettings(!showSettings())}
              ></BoltIcon>
            </div>
            <div class="flex gap-2 items-center relative hover:[&_>_#frequency]:block h-5">
              <div
                innerHTML={props.ankiFields.FreqSort}
                class="text-base-content/50"
              ></div>
              <Show when={props.ankiFields.Frequency}>
                <CircleChevronDownIcon class="h-full w-full text-base-content/50" />
                <div
                  id="frequency"
                  class="absolute z-10 top-0 translate-y-6 right-2 w-fit [&_li]:text-nowrap [&_li]:whitespace-nowrap bg-base-300/90 p-4 rounded-lg hidden"
                  innerHTML={props.ankiFields.Frequency}
                ></div>
              </Show>
            </div>
          </div>
          <div class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row">
            <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <div
                class="text-2xl sm:text-3xl"
                innerHTML={props.ankiFields["kana:ExpressionFurigana"]}
              ></div>
              <div
                class="text-5xl sm:text-6xl"
                innerHTML={props.ankiFields.Expression}
              ></div>
              <div class="text-3xl">{/* TODO: pitch  */}</div>
              <div class="flex gap-2 pt-4">
                <div
                  style={{
                    width: "0",
                    height: "0",
                    overflow: "hidden",
                  }}
                  ref={expressionAudioRef}
                  innerHTML={props.ankiFields.ExpressionAudio}
                ></div>
                <div
                  style={{
                    width: "0",
                    height: "0",
                    overflow: "hidden",
                  }}
                  ref={sentenceAudioRef}
                  innerHTML={props.ankiFields.SentenceAudio}
                ></div>
                <Show when={!isMobile()}>
                  <NotePlayIcon
                    on:click={() => {
                      expressionAudioRef?.querySelector("a")?.click();
                    }}
                  ></NotePlayIcon>
                  <NotePlayIcon
                    on:click={() => {
                      sentenceAudioRef?.querySelector("a")?.click();
                    }}
                  ></NotePlayIcon>
                </Show>
              </div>
            </div>
            <div class="sm:[&_img]:h-full [&_img]:rounded-lg [&_img]:object-contain [&_img]:h-48 [&_img]:mx-auto bg-base-200 rounded-lg">
              {img}
            </div>
          </div>
          <div class="flex sm:flex-col gap-8 flex-col-reverse">
            <div class="flex flex-col gap-4 items-center text-center">
              <div
                class="text-2xl sm:text-4xl [&_b]:text-primary"
                ref={sentenceEl}
                innerHTML={
                  props.ankiFields["furigana:SentenceFurigana"] ??
                  props.ankiFields["furigana:Sentence"]
                }
              ></div>
            </div>
            <Show when={availablePagesCount > 0}>
              <div>
                <Show when={availablePagesCount > 1}>
                  <div class="text-end text-base-content/50">
                    <Switch>
                      <Match when={definitionPage() === 0}>
                        Selection text
                      </Match>
                      <Match when={definitionPage() === 1}>
                        Main definition
                      </Match>
                      <Match when={definitionPage() === 2}>Glossary</Match>
                    </Switch>
                  </div>
                </Show>
                <div class="relative bg-base-200 p-4 border-s-4 text-base sm:text-xl rounded-lg [&_ol]:list-inside [&_ul]:list-inside">
                  <Switch>
                    <Match when={definitionPage() === 0}>
                      <div innerHTML={props.ankiFields.SelectionText}></div>
                    </Match>
                    <Match when={definitionPage() === 1}>
                      <div innerHTML={props.ankiFields.MainDefinition}></div>
                    </Match>
                    <Match when={definitionPage() === 2}>
                      <div innerHTML={props.ankiFields.Glossary}></div>
                    </Match>
                  </Switch>
                  <Show when={availablePagesCount > 1}>
                    <button
                      class="cursor-pointer w-8 h-full absolute top-0 left-0 hover:bg-base-content/10"
                      on:click={() => {
                        setDefinitionPage((prev) => {
                          let next = (prev - 1 + pages.length) % pages.length;
                          for (let i = 0; i < pages.length; i++) {
                            if (pages[next]?.trim()) break;
                            next = (next - 1 + pages.length) % pages.length;
                          }
                          return next;
                        });
                      }}
                    ></button>
                    <button
                      class="cursor-pointer w-8 h-full absolute top-0 right-0 hover:bg-base-content/10"
                      on:click={() => {
                        setDefinitionPage((prev) => {
                          let next = (prev + 1) % pages.length;
                          for (let i = 0; i < pages.length; i++) {
                            if (pages[next]?.trim()) break;
                            next = (next + 1) % pages.length;
                          }
                          return next;
                        });
                      }}
                    ></button>
                  </Show>
                </div>
              </div>
            </Show>
          </div>

          <Show when={props.ankiFields.MiscInfo}>
            <div class="flex gap-2 items-center justify-center bg-base-200 p-2 rounded-lg text-sm">
              <InfoIcon class="h-5 w-5" />
              <div innerHTML={props.ankiFields.MiscInfo}></div>
            </div>
          </Show>
          <div class="flex gap-4 items-center justify-center">
            <For each={tags}>
              {(tag) => {
                return (
                  <div class="badge badge-primary badge-sm opacity-75">
                    {tag}
                  </div>
                );
              }}
            </For>
          </div>

          <Show when={isMobile()}>
            <div class="absolute bottom-4 left-4 flex flex-col gap-2 items-center">
              <NotePlayIcon
                on:click={() => {
                  expressionAudioRef?.querySelector("a")?.click();
                }}
              ></NotePlayIcon>
              <NotePlayIcon
                on:click={() => {
                  sentenceAudioRef?.querySelector("a")?.click();
                }}
              ></NotePlayIcon>
            </div>
          </Show>
        </Match>
      </Switch>
    </Layout>
  );
}

function NotePlayIcon(props: { "on:click"?: () => void }) {
  return (
    <PlayIcon
      class="bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer"
      on:click={props["on:click"]}
    />
  );
}
