import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import type { AnkiNote } from "#/types";
import { useNavigationTransition, useThemeTransition } from "#/util/hooks";
import { nextTheme } from "#/util/theme";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useCardContext } from "../shared/CardContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useGeneralContext } from "../shared/GeneralContext";
import HeaderLayout from "./HeaderLayout";
import {
  ArrowLeftIcon,
  BoltIcon,
  CircleChevronDownIcon,
  PaintbrushIcon,
} from "./Icons";
import { capitalize } from "./util/general";

export default function HeaderMain(props: { onExitNested?: () => void }) {
  const [$card, $setCard] = useCardContext();
  const [$config, $setConfig] = useConfigContext();
  const [$general] = useGeneralContext();
  const { navigate, navigateBack } = useNavigationTransition();
  const [startupTime, setStartupTime] = createSignal<number | null>(null);
  const changeTheme = useThemeTransition();

  onMount(() => {
    if (KIKU_STATE.startupTime)
      setStartupTime(Math.round(KIKU_STATE.startupTime));
  });

  return (
    <HeaderLayout>
      <div class="flex gap-1 sm:gap-2 items-center animate-fade-in-sm">
        <Switch>
          <Match when={$card.nested}>
            <ArrowLeftIcon
              class="size-5 cursor-pointer text-base-content-soft"
              on:click={props.onExitNested}
            ></ArrowLeftIcon>
          </Match>
          <Match when={!$card.nested}>
            <div class="relative">
              <BoltIcon
                class="size-5"
                classList={{
                  "text-base-content-soft cursor-pointer":
                    $card.side === "back",
                  "text-base-content-subtle-100": $card.side === "front",
                }}
                on:click={() => {
                  navigate("settings", "forward", () =>
                    navigate("main", "back"),
                  );
                }}
              ></BoltIcon>
              <Show when={$general.isThemeChanged}>
                <div class="status status-warning absolute top-0 right-0 translate-x-0.5 -translate-y-0.5"></div>
              </Show>
            </div>
            <Show when={$config.showTheme}>
              <div
                class="flex gap-1 sm:gap-2 items-center cursor-pointer"
                on:click={() => {
                  changeTheme(nextTheme());
                }}
                on:touchend={(e) => e.stopPropagation()}
              >
                <PaintbrushIcon class="size-5 cursor-pointer text-base-content-soft"></PaintbrushIcon>
                <div class="text-base-content-soft text-xs sm:text-sm">
                  {capitalize($config.theme)}
                </div>
              </div>
            </Show>
            <Show when={$config.showStartupTime}>
              <div class="text-base-content-soft bg-warning/10 rounded-sm px-px sm:px-1 text-xs sm:text-sm">
                {startupTime()}
                {startupTime() && "ms"}
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
      <div class="flex gap-1 sm:gap-2 items-center">
        <Switch>
          <Match
            when={
              !$card.nested &&
              $card.query.status === "loading" &&
              $card.side === "back"
            }
          >
            <span class="loading loading-spinner loading-xs text-base-content-faint animate-fade-in-sm"></span>
          </Match>
          <Match
            when={
              !$card.nested &&
              $card.query.status === "error" &&
              $card.side === "back"
            }
          >
            <div class="status status-error animate-ping"></div>
          </Match>
          <Match when={!$card.nested}>
            <div class="text-base-content-soft cursor-pointer animate-fade-in-sm">
              <KanjiPageIndicator />
            </div>
          </Match>
        </Switch>
        <Show when={$card.side === "back"}>
          <Frequency />
        </Show>
      </div>
    </HeaderLayout>
  );
}

function KanjiPageIndicator() {
  const [$card, $setCard] = useCardContext();
  const { navigate } = useNavigationTransition();

  const length = () =>
    Object.entries($card.query.kanji).length +
    ($card.query.sameReading?.length ? 1 : 0);

  const onClick = (key: string | symbol) => {
    const isKanjiResult = Object.keys($card.query.kanji).length > 0;
    const isSameReadingResult = ($card.query.sameReading?.length ?? 0) > 0;
    if (isKanjiResult || isSameReadingResult) {
      $setCard("focus", { kanjiPage: key, noteId: undefined });
      const list = Object.entries($card.query.kanji).map(
        ([kanji, data]) => [kanji, data.shared] as [string, AnkiNote[]],
      );
      $setCard("query", "noteList", list);
      navigate("kanji", "forward", () => navigate("main", "back"));
    }
  };

  function KanjiIndicator() {
    return Object.entries($card.query.kanji).map(([kanji, data]) => {
      return (
        <div
          class="flex gap-px sm:gap-0.5 items-start hover:text-base-content transition-colors"
          on:click={() => {
            onClick(kanji);
          }}
        >
          <span>{kanji}</span>
          <span
            class="bg-base-content/5 leading-none text-xs sm:text-sm rounded-xs"
            classList={{
              "p-px": length() <= 4,
              "p-0": length() > 4,
            }}
          >
            {data.shared.length}
          </span>
        </div>
      );
    });
  }

  function SameReadingIndicator() {
    return (
      <div
        class="flex gap-px sm:gap-0.5 items-start hover:text-base-content transition-colors"
        on:click={() => {
          onClick($card.focus.SAME_READING);
        }}
      >
        <span>読</span>
        <span
          class="bg-base-content/5 leading-none text-xs sm:text-sm rounded-xs"
          classList={{
            "p-px": length() <= 4,
            "p-0": length() > 4,
          }}
        >
          {$card.query.sameReading?.length ?? 0}
        </span>
      </div>
    );
  }

  return (
    <div
      class="flex sm:gap-2 items-center flex-wrap"
      classList={{
        "gap-1": length() <= 4,
        "gap-0": length() > 4,
      }}
    >
      <KanjiIndicator />
      <Show when={$card.query.sameReading?.length}>
        <span>•</span>
        <SameReadingIndicator />
      </Show>
    </div>
  );
}

function Frequency() {
  const { ankiFields } = useAnkiFieldContext<"back">();
  return (
    <div class="flex gap-1 sm:gap-2 items-center animate-fade-in-sm relative hover:[&_#frequency]:block z-10">
      <div
        class="text-base-content-soft text-sm sm:text-base"
        innerHTML={ankiFields.FreqSort}
        classList={{
          hidden: ankiFields.FreqSort === "9999999",
        }}
      ></div>
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
