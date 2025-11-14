import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { nextTheme } from "#/util/theme";
import { useAnkiField, useCardStore, useConfig } from "../shared/Context";
import {
  ArrowLeftIcon,
  BoltIcon,
  CircleChevronDownIcon,
  PaintbrushIcon,
} from "./Icons";
import { capitalize } from "./util/general";

export default function Header(props: {
  onSettingsClick?: () => void;
  onKanjiClick?: () => void;
  onBackClick?: () => void;
  side: "back" | "front";
}) {
  const [card] = useCardStore();
  const [config, setConfig] = useConfig();
  const [initDelay, setInitDelay] = createSignal<number | null>(null);

  onMount(() => {
    setTimeout(() => {
      if (KIKU_STATE.initDelay) setInitDelay(KIKU_STATE.initDelay);
    }, 200);
  });

  return (
    <>
      <div class="flex gap-2 items-center animate-fade-in-sm">
        <Show when={props.onBackClick}>
          <ArrowLeftIcon
            class="size-5 cursor-pointer text-base-content-soft"
            on:click={props.onBackClick}
          ></ArrowLeftIcon>
        </Show>
        <Show when={!card.nested}>
          <BoltIcon
            class="size-5"
            classList={{
              "text-base-content-soft cursor-pointer": props.side === "back",
              "text-base-content-subtle-100": props.side === "front",
            }}
            on:click={props.onSettingsClick}
          ></BoltIcon>
          <div
            class="flex gap-2 items-center cursor-pointer"
            on:click={() => {
              setConfig("theme", nextTheme());
            }}
            on:touchend={(e) => e.stopPropagation()}
          >
            <PaintbrushIcon class="size-5 cursor-pointer text-base-content-soft"></PaintbrushIcon>
            <div class="text-base-content-soft text-sm">
              {capitalize(config.theme)}
            </div>
          </div>

          <div class="text-base-content-soft bg-warning/10 rounded-sm px-1 text-sm">
            {initDelay()}
            {initDelay() && "ms"}
          </div>
        </Show>
      </div>
      <div class="flex gap-4 items-center">
        <Switch>
          <Match
            when={
              !card.nested &&
              card.kanjiStatus === "loading" &&
              props.side === "back"
            }
          >
            <span class="loading loading-spinner loading-xs text-base-content-faint animate-fade-in-sm"></span>
          </Match>
          <Match
            when={
              !card.nested &&
              card.kanjiStatus === "error" &&
              props.side === "back"
            }
          >
            <div class="status status-error animate-ping"></div>
          </Match>
          <Match when={!card.nested && props.onKanjiClick}>
            <div
              class="text-base-content-soft cursor-pointer animate-fade-in-sm"
              on:click={props.onKanjiClick}
            >
              漢字
            </div>
          </Match>
        </Switch>
        {props.side === "back" && <Frequency />}
      </div>
    </>
  );
}

function Frequency() {
  const { ankiFields } = useAnkiField<"back">();
  return (
    <div class="flex gap-2 items-center animate-fade-in-sm relative hover:[&_#frequency]:block z-10">
      <div class="text-base-content-soft" innerHTML={ankiFields.FreqSort}></div>
      {ankiFields.Frequency && (
        <>
          <CircleChevronDownIcon class="size-5 text-base-content-soft" />
          <div
            id="frequency"
            class="absolute top-0 translate-y-6 right-2 w-fit [&_li]:text-nowrap [&_li]:whitespace-nowrap bg-base-300/90 p-4 rounded-lg hidden"
            innerHTML={ankiFields.Frequency}
          ></div>
        </>
      )}
    </div>
  );
}
