import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { useCardContext } from "#/components/shared/CardContext";
import { useNavigationTransition, useThemeTransition } from "#/util/hooks";
import { nextTheme } from "#/util/theme";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useBreakpointContext } from "../shared/BreakpointContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useGeneralContext } from "../shared/GeneralContext";
import {
  ArrowLeftIcon,
  BoltIcon,
  CircleChevronDownIcon,
  PaintbrushIcon,
  RefreshCwIcon,
} from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";
import { capitalize } from "./util/general";

export default function Header(props: { onExitNested?: () => void }) {
  const [$card] = useCardContext();

  return (
    <div class="absolute top-0 left-0 w-full py-2 sm:py-4 px-1 sm:px-2 bg-base-100/90 backdrop-blur-xs">
      <div class="w-full max-w-4xl mx-auto px-1 sm:px-2 gutter-stable overflow-auto invisible-scrollbar">
        <div
          class="flex justify-between flex-row h-6 items-center min-h-6"
          classList={{
            hidden: $card.page === "nested",
          }}
        >
          <Switch>
            <Match when={$card.page === "main"}>
              <HeaderMain onExitNested={props.onExitNested} />
            </Match>
            <Match when={$card.page === "nested"}>{null}</Match>
            <Match when={$card.page === "settings"}>
              <HeaderSettings />
            </Match>
            <Match when={$card.page === "kanji"}>
              <HeaderKanjiPage />
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
}

function HeaderMain(props: { onExitNested?: () => void }) {
  const [$card] = useCardContext();
  const [$config, $setConfig] = useConfigContext();
  const [$general] = useGeneralContext();
  const navigate = useNavigationTransition();
  const [startupTime, setStartupTime] = createSignal<number | null>(null);
  const changeTheme = useThemeTransition();

  onMount(() => {
    if (KIKU_STATE.startupTime)
      setStartupTime(Math.round(KIKU_STATE.startupTime));
  });

  return (
    <>
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
                  navigate("settings", "forward");
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
    </>
  );
}

function KanjiPageIndicator() {
  const [$card, $setCard] = useCardContext();
  const navigate = useNavigationTransition();

  const length = () =>
    Object.entries($card.query.kanji).length +
    ($card.query.sameReading?.length ? 1 : 0);

  const onClick = (key: string | symbol) => {
    const isKanjiResult = Object.keys($card.query.kanji).length > 0;
    const isSameReadingResult = ($card.query.sameReading?.length ?? 0) > 0;
    if (isKanjiResult || isSameReadingResult) {
      $setCard("focus", { kanjiPage: key, noteId: undefined });
      navigate("kanji", "forward");
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

function HeaderSettings() {
  const [$general, $setGeneral] = useGeneralContext();
  const [$card] = useCardContext();
  const [$config, $setConfig] = useConfigContext();
  const bp = useBreakpointContext();
  const navigate = useNavigationTransition();

  async function checkAnkiConnect() {
    const version = await AnkiConnect.getVersion();
    if (version) {
      KIKU_STATE.logger.info("AnkiConnect version:", version);
      $setGeneral("isAnkiConnectAvailable", true);
    }
  }

  onMount(async () => {
    //NOTE: move this to somewhere higher
    AnkiConnect.changePort(Number($config.ankiConnectPort));

    if (!bp.isAtLeast("sm")) return;
    await checkAnkiConnect();
  });

  return (
    <>
      <div class="h-5">
        <ArrowLeftIcon
          class="h-full w-full cursor-pointer text-base-content-soft"
          on:click={() => navigate("main", "back")}
        ></ArrowLeftIcon>
      </div>
      <div class="flex flex-row gap-2 items-center">
        {$general.isAnkiConnectAvailable && (
          <>
            <div class="text-sm text-base-content-calm">
              AnkiConnect is available
            </div>
            <div class="status status-success"></div>
          </>
        )}
        {!$general.isAnkiConnectAvailable && (
          <>
            <RefreshCwIcon
              class="size-4 cursor-pointer text-base-content-soft"
              on:click={async () => {
                try {
                  await checkAnkiConnect();
                } catch {
                  $general.toast.error("AnkiConnect is not available");
                }
              }}
            />
            <div class="text-sm text-base-content-calm">
              AnkiConnect is not available
            </div>
            <div class="status status-error animate-ping"></div>
          </>
        )}
      </div>
    </>
  );
}

function HeaderKanjiPage() {
  const [$card, $setCard] = useCardContext();
  const navigate = useNavigationTransition();

  return (
    <div class="flex flex-row justify-between items-center">
      <div class="h-5">
        <ArrowLeftIcon
          class="h-full w-full cursor-pointer text-base-content-soft"
          on:click={() => {
            if ($card.query.selectedSimilarKanji) {
              navigate(
                () => $setCard("query", { selectedSimilarKanji: undefined }),
                "back",
              );
            } else {
              navigate("main", "back");
            }
          }}
        ></ArrowLeftIcon>
      </div>
      <div class="flex flex-row gap-2 items-center"></div>
    </div>
  );
}
