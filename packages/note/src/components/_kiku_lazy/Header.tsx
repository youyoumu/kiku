import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { useCardContext } from "#/components/shared/CardContext";
import { useThemeTransition } from "#/util/hooks";
import { nextTheme } from "#/util/theme";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useGeneralContext } from "../shared/GeneralContext";
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
  const [$card] = useCardContext();
  const [$config, $setConfig] = useConfigContext();
  const [$general] = useGeneralContext();
  const [startupTime, setStartupTime] = createSignal<number | null>(null);
  const changeTheme = useThemeTransition();

  onMount(() => {
    if (KIKU_STATE.startupTime)
      setStartupTime(Math.round(KIKU_STATE.startupTime));
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
        <Show when={!$card.nested}>
          <div class="relative">
            <BoltIcon
              class="size-5"
              classList={{
                "text-base-content-soft cursor-pointer": props.side === "back",
                "text-base-content-subtle-100": props.side === "front",
              }}
              on:click={props.onSettingsClick}
            ></BoltIcon>
            <Show when={$general.isThemeChanged}>
              <div class="status status-warning absolute top-0 right-0 translate-x-0.5 -translate-y-0.5"></div>
            </Show>
          </div>
          <Show when={$config.showTheme}>
            <div
              class="flex gap-2 items-center cursor-pointer"
              on:click={() => {
                changeTheme(nextTheme());
              }}
              on:touchend={(e) => e.stopPropagation()}
            >
              <PaintbrushIcon class="size-5 cursor-pointer text-base-content-soft"></PaintbrushIcon>
              <div class="text-base-content-soft text-sm">
                {capitalize($config.theme)}
              </div>
            </div>
          </Show>
          <Show when={$config.showStartupTime}>
            <div class="text-base-content-soft bg-warning/10 rounded-sm px-1 text-sm">
              {startupTime()}
              {startupTime() && "ms"}
            </div>
          </Show>
        </Show>
      </div>
      <div class="flex gap-2 items-center">
        <Switch>
          <Match
            when={
              !$card.nested &&
              $card.kanjiStatus === "loading" &&
              props.side === "back"
            }
          >
            <span class="loading loading-spinner loading-xs text-base-content-faint animate-fade-in-sm"></span>
          </Match>
          <Match
            when={
              !$card.nested &&
              $card.kanjiStatus === "error" &&
              props.side === "back"
            }
          >
            <div class="status status-error animate-ping"></div>
          </Match>
          <Match when={!$card.nested && props.onKanjiClick}>
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
  const { ankiFields } = useAnkiFieldContext<"back">();
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
