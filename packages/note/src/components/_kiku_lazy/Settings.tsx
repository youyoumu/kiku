import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  type CssVar,
  type DatasetProp,
  defaultConfig,
  type KikuConfig,
  rootDatasetConfigWhitelist,
} from "#/util/config";
import { type WebFont, webFonts } from "#/util/fonts";
import { daisyUIThemes } from "#/util/theme";
import {
  useAnkiField,
  useBreakpoint,
  useCardStore,
  useConfig,
} from "../shared/Context";
import {
  ArrowLeftIcon,
  ClipboardCopyIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  UndoIcon,
} from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";
import { capitalize } from "./util/general";
import {
  getTailwindFontSize,
  getTailwindFontSizeShort,
  type TailwindBreakpoint,
  type TailwindFontSizeLabel,
  type TailwindFontSizeLabelShort,
  tailwindFontSizeLabel,
  tailwindFontSizeLabelShort,
  tailwindFontSizeLabelShortMap,
} from "./util/tailwind";

function toDashed(str: string) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function toDatasetKey(str: string) {
  return `data-${str}`;
}

function toDatasetString(obj: Record<string, string | number>) {
  return Object.entries(obj)
    .map(([key, value]) => {
      const dashed = toDashed(key);
      return `${toDatasetKey(dashed)}="${value}"`;
    })
    .join("\n");
}

function toCssVarString(obj: Record<string, string>) {
  const txt = Object.entries(obj)
    .map(([key, value]) => {
      return `${key}: ${value.replaceAll("\n", "").replaceAll("'", '"')};`;
    })
    .join("\n");
  return txt;
}

export default function Settings(props: {
  onBackClick?: () => void;
  onCancelClick?: () => void;
}) {
  const bp = useBreakpoint();
  const [config] = useConfig();
  const [card, setCard] = useCardStore();

  onMount(async () => {
    //NOTE: move this to somewhere higher
    AnkiConnect.changePort(Number(config.ankiConnectPort));

    if (!bp.isAtLeast("sm")) return;
    await checkAnkiConnect();
  });

  async function checkAnkiConnect() {
    const version = await AnkiConnect.getVersion();
    if (version) {
      KIKU_STATE.logger.info("AnkiConnect version:", version);
      setCard("ankiConnectAvailable", true);
    }
  }

  const saveConfig = async () => {
    // biome-ignore format: this looks nicer
    const payload: KikuConfig = {
      kikuRoot: "true",
      theme: config.theme ? config.theme : defaultConfig.theme,
      webFontPrimary: config.webFontPrimary ? config.webFontPrimary : defaultConfig.webFontPrimary,
      systemFontPrimary: config.systemFontPrimary ? config.systemFontPrimary : defaultConfig.systemFontPrimary,
      useSystemFontPrimary: config.useSystemFontPrimary ? config.useSystemFontPrimary : defaultConfig.useSystemFontPrimary,
      webFontSecondary: config.webFontSecondary ? config.webFontSecondary : defaultConfig.webFontSecondary,
      systemFontSecondary: config.systemFontSecondary ? config.systemFontSecondary : defaultConfig.systemFontSecondary,
      useSystemFontSecondary: config.useSystemFontSecondary ? config.useSystemFontSecondary : defaultConfig.useSystemFontSecondary,
      showTheme: config.showTheme ? config.showTheme : defaultConfig.showTheme,
      showStartupTime: config.showStartupTime ? config.showStartupTime : defaultConfig.showStartupTime,
      ankiConnectPort: config.ankiConnectPort ? config.ankiConnectPort : defaultConfig.ankiConnectPort,
      ankiDroidEnableIntegration: config.ankiDroidEnableIntegration ? config.ankiDroidEnableIntegration : defaultConfig.ankiDroidEnableIntegration,
      ankiDroidReverseSwipeDirection: config.ankiDroidReverseSwipeDirection ? config.ankiDroidReverseSwipeDirection : defaultConfig.ankiDroidReverseSwipeDirection,
      fontSizeBaseExpression: config.fontSizeBaseExpression ? config.fontSizeBaseExpression : defaultConfig.fontSizeBaseExpression,
      fontSizeBasePitch: config.fontSizeBasePitch ? config.fontSizeBasePitch : defaultConfig.fontSizeBasePitch,
      fontSizeBaseSentence: config.fontSizeBaseSentence ? config.fontSizeBaseSentence : defaultConfig.fontSizeBaseSentence,
      fontSizeBaseMiscInfo: config.fontSizeBaseMiscInfo ? config.fontSizeBaseMiscInfo : defaultConfig.fontSizeBaseMiscInfo,
      fontSizeBaseHint: config.fontSizeBaseHint ? config.fontSizeBaseHint : defaultConfig.fontSizeBaseHint,
      fontSizeSmExpression: config.fontSizeSmExpression ? config.fontSizeSmExpression : defaultConfig.fontSizeSmExpression,
      fontSizeSmPitch: config.fontSizeSmPitch ? config.fontSizeSmPitch : defaultConfig.fontSizeSmPitch,
      fontSizeSmSentence: config.fontSizeSmSentence ? config.fontSizeSmSentence : defaultConfig.fontSizeSmSentence,
      fontSizeSmMiscInfo: config.fontSizeSmMiscInfo ? config.fontSizeSmMiscInfo : defaultConfig.fontSizeSmMiscInfo,
      fontSizeSmHint: config.fontSizeSmHint ? config.fontSizeSmHint : defaultConfig.fontSizeSmHint,
    };
    try {
      KIKU_STATE.logger.debug("Saving config:", payload);
      await AnkiConnect.saveConfig(payload);
      card.toast.success("Saved! Restart Anki to apply changes.");
    } catch (e) {
      card.toast.error(
        `Failed to save config: ${e instanceof Error ? e.message : ""}`,
      );
    }
  };

  return (
    <>
      <div class="flex flex-row justify-between items-center animate-fade-in">
        <div class="h-5">
          <ArrowLeftIcon
            class="h-full w-full cursor-pointer text-base-content-soft"
            on:click={props.onBackClick}
          ></ArrowLeftIcon>
        </div>
        <div class="flex flex-row gap-2 items-center">
          {card.ankiConnectAvailable && (
            <>
              <div class="text-sm">AnkiConnect is available</div>
              <div class="status status-success"></div>
            </>
          )}
          {!card.ankiConnectAvailable && (
            <>
              <RefreshCwIcon
                class="h-5 w-5 cursor-pointer text-base-content-soft"
                on:click={async () => {
                  try {
                    await checkAnkiConnect();
                  } catch {
                    card.toast.error("AnkiConnect is not available");
                  }
                }}
              />
              <div class="text-sm">AnkiConnect is not available</div>
              <div class="status status-error animate-ping"></div>
            </>
          )}
        </div>
      </div>
      <ThemeSettings />
      <FontSettings />
      <FontSizeSettings />
      <AnkiDroidSettings />
      <DebugSettings />
      <Portal mount={KIKU_STATE.root}>
        <div class="max-w-4xl mx-auto w-full relative">
          <div class="flex flex-row gap-2 justify-end animate-fade-in absolute bottom-0 right-0 mx-4 mb-4">
            <button class="btn" on:click={props.onCancelClick}>
              Back
            </button>
            <button
              class="btn"
              classList={{
                "btn-primary": card.ankiConnectAvailable,
                "btn-disabled bg-base-300 text-base-content-faint":
                  !card.ankiConnectAvailable,
              }}
              disabled={!card.ankiConnectAvailable}
              on:click={saveConfig}
            >
              Save
            </button>
          </div>
        </div>
      </Portal>
    </>
  );
}

function ThemeSettings() {
  const [config, setConfig] = useConfig();

  return (
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="text-2xl font-bold">Theme</div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-4 p-2">
        {daisyUIThemes.map((theme) => {
          return (
            <div
              class="border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline-2 outline-offset-2"
              classList={{
                "outline-2": theme === config.theme,
              }}
              on:click={() => {
                setConfig("theme", theme);
              }}
            >
              <div class="bg-base-100 text-base-content w-full cursor-pointer">
                <div class="grid grid-cols-5 grid-rows-3" data-theme={theme}>
                  <div class="bg-base-200 col-start-1 row-span-2 row-start-1"></div>
                  <div class="bg-base-300 col-start-1 row-start-3"></div>
                  <div class="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2">
                    <div class="font-bold">{capitalize(theme)}</div>
                    <div class="flex flex-wrap gap-1">
                      <div class="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                        <div class="text-primary-content text-sm font-bold">
                          A
                        </div>
                      </div>
                      <div class="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                        <div class="text-secondary-content text-sm font-bold">
                          A
                        </div>
                      </div>
                      <div class="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                        <div class="text-accent-content text-sm font-bold">
                          A
                        </div>
                      </div>
                      <div class="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                        <div class="text-neutral-content text-sm font-bold">
                          A
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4">
        <legend class="fieldset-legend">Show Theme</legend>
        <label class="label">
          <input
            type="checkbox"
            checked={config.showTheme === "true"}
            class="toggle"
            on:change={(e) => {
              setConfig("showTheme", e.target.checked ? "true" : "false");
            }}
          />
        </label>
      </fieldset>
    </div>
  );
}

function FontSettings() {
  const [config, setConfig] = useConfig();

  return (
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="text-2xl font-bold">Font</div>
      <div>
        <div class="text-lg font-bold">Primary</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] rounded-box gap-4">
          <fieldset
            class="fieldset"
            classList={{
              hidden: config.useSystemFontPrimary === "true",
            }}
            on:change={(e) => {
              const target = e.target as HTMLSelectElement;
              setConfig("webFontPrimary", target.value as WebFont);
            }}
          >
            <legend class="fieldset-legend">Web Font</legend>
            <select class="select w-full">
              {webFonts.map((font) => {
                const dataSetProp: DatasetProp = {
                  "data-web-font-primary": font,
                  "data-use-system-font-primary": "false",
                  "data-font-scope": "local",
                };
                return (
                  <option
                    value={font}
                    selected={config.webFontPrimary === font}
                    {...dataSetProp}
                  >
                    <span class="font-primary">{font}</span>
                  </option>
                );
              })}
            </select>
          </fieldset>
          <fieldset
            class="fieldset"
            classList={{
              hidden: config.useSystemFontPrimary !== "true",
            }}
          >
            <legend class="fieldset-legend">
              System Font
              <UndoIcon
                class="h-4 w-4 cursor-pointer"
                classList={{
                  hidden:
                    config.systemFontPrimary ===
                    defaultConfig.systemFontPrimary,
                }}
                on:click={() => {
                  setConfig(
                    "systemFontPrimary",
                    defaultConfig.systemFontPrimary,
                  );
                }}
              />
            </legend>
            <input
              type="text"
              class="input w-full"
              placeholder={
                "'Inter', 'SF Pro Display', 'Liberation Sans', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', 'Meiryo', HanaMinA, HanaMinB, sans-serif"
              }
              value={config.systemFontPrimary}
              on:input={(e) => {
                setConfig(
                  "systemFontPrimary",
                  (e.target as HTMLInputElement).value,
                );
              }}
            />
          </fieldset>

          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4">
            <legend class="fieldset-legend">Use System Font</legend>
            <label class="label text-base-content-soft">
              <input
                type="checkbox"
                checked={config.useSystemFontPrimary === "true"}
                class="toggle"
                on:change={(e) => {
                  setConfig(
                    "useSystemFontPrimary",
                    e.target.checked ? "true" : "false",
                  );
                }}
              />
              {config.useSystemFontPrimary === "true"
                ? "Using System Font"
                : "Using Web Font"}
            </label>
          </fieldset>
        </div>
      </div>

      <div>
        <div class="text-lg font-bold">Secondary</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] rounded-box gap-4">
          <fieldset
            class="fieldset"
            classList={{
              hidden: config.useSystemFontSecondary === "true",
            }}
            on:change={(e) => {
              const target = e.target as HTMLSelectElement;
              setConfig("webFontSecondary", target.value as WebFont);
            }}
          >
            <legend class="fieldset-legend">Web Font</legend>
            <select class="select w-full">
              {webFonts.map((font) => {
                const dataSetProp: DatasetProp = {
                  "data-web-font-secondary": font,
                  "data-use-system-font-secondary": "false",
                  "data-font-scope": "local",
                };
                return (
                  <option
                    value={font}
                    selected={config.webFontSecondary === font}
                    {...dataSetProp}
                  >
                    <span class="font-secondary">{font}</span>
                  </option>
                );
              })}
            </select>
          </fieldset>
          <fieldset
            class="fieldset"
            classList={{
              hidden: config.useSystemFontSecondary !== "true",
            }}
          >
            <legend class="fieldset-legend">
              System Font
              <UndoIcon
                class="h-4 w-4 cursor-pointer"
                classList={{
                  hidden:
                    config.systemFontSecondary ===
                    defaultConfig.systemFontSecondary,
                }}
                on:click={() => {
                  setConfig(
                    "systemFontSecondary",
                    defaultConfig.systemFontSecondary,
                  );
                }}
              />
            </legend>
            <input
              type="text"
              class="input w-full"
              placeholder={
                "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif"
              }
              value={config.systemFontSecondary}
              on:input={(e) => {
                setConfig(
                  "systemFontSecondary",
                  (e.target as HTMLInputElement).value,
                );
              }}
            />
          </fieldset>

          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4">
            <legend class="fieldset-legend">Use System Font</legend>
            <label class="label text-base-content-soft">
              <input
                type="checkbox"
                checked={config.useSystemFontSecondary === "true"}
                class="toggle"
                on:change={(e) => {
                  setConfig(
                    "useSystemFontSecondary",
                    e.target.checked ? "true" : "false",
                  );
                }}
              />
              {config.useSystemFontSecondary === "true"
                ? "Using System Font"
                : "Using Web Font"}
            </label>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

function FontSizeSettings() {
  return (
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="text-2xl font-bold">Font Size</div>
      <div>
        <div class="text-lg font-bold">Mobile</div>
        {/* biome-ignore format: this looks nicer */}
        <div class="grid grid-cols-[repeat(auto-fit,minmax(25rem,1fr))] rounded-box gap-x-4 gap-y-2">
          <FontSizeSettingsFieldset configKey="fontSizeBaseExpression" label="Expression" />
          <FontSizeSettingsFieldset configKey="fontSizeBasePitch" label="Pitch" />
          <FontSizeSettingsFieldset configKey="fontSizeBaseSentence" label="Sentence" />
          <FontSizeSettingsFieldset configKey="fontSizeBaseMiscInfo" label="Misc Info" />
          <FontSizeSettingsFieldset configKey="fontSizeBaseHint" label="Hint" />
        </div>
      </div>
      <div>
        <div class="text-lg font-bold">Desktop</div>
        {/* biome-ignore format: this looks nicer */}
        <div class="grid grid-cols-[repeat(auto-fit,minmax(25rem,1fr))] rounded-box gap-x-4 gap-y-2">
          <FontSizeSettingsFieldset configKey="fontSizeSmExpression" label="Expression" />
          <FontSizeSettingsFieldset configKey="fontSizeSmPitch" label="Pitch" />
          <FontSizeSettingsFieldset configKey="fontSizeSmSentence" label="Sentence" />
          <FontSizeSettingsFieldset configKey="fontSizeSmMiscInfo" label="Misc Info" />
          <FontSizeSettingsFieldset configKey="fontSizeSmHint" label="Hint" />
        </div>
      </div>
    </div>
  );
}

function FontSizeSettingsFieldset(props: {
  configKey: keyof KikuConfig;
  label: string;
}) {
  const [config, setConfig] = useConfig();
  const breakpoint: TailwindBreakpoint | undefined = props.configKey.startsWith(
    "fontSizeBase",
  )
    ? undefined
    : "sm";

  const configValue = () => config[props.configKey];
  const fontSizeClass = () => {
    const label = tailwindFontSizeLabelShortMap[configValue()];
    return getTailwindFontSizeShort(label);
  };

  if (config.kikuRoot)
    return (
      <div class="w-full">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">
            {props.label}{" "}
            <UndoIcon
              class="h-4 w-4 cursor-pointer"
              classList={{
                hidden:
                  config[props.configKey] === defaultConfig[props.configKey],
              }}
              on:click={() => {
                setConfig(props.configKey, defaultConfig[props.configKey]);
              }}
            />
          </legend>

          <div class="tooltip">
            <div class="tooltip-content">
              <div class={`font-secondary ${fontSizeClass()}`}>あ</div>
            </div>
            <input
              on:change={(e) => {
                const target = e.target as HTMLInputElement;
                const value = tailwindFontSizeLabelShort[
                  Number(target.value)
                ] as TailwindFontSizeLabelShort;
                const tailwindFontSize = getTailwindFontSizeShort(
                  value,
                  breakpoint,
                );
                setConfig(props.configKey, tailwindFontSize);
              }}
              type="range"
              min="0"
              max={(tailwindFontSizeLabelShort.length - 1).toString()}
              value={(() => {
                const label = tailwindFontSizeLabelShortMap[configValue()];
                const index = tailwindFontSizeLabelShort
                  .indexOf(label)
                  .toString();
                return index;
              })()}
              class="range range-xs w-full "
              step="1"
            />
          </div>
          <div class="flex justify-between px-2 mt-1 text-xs">
            <For each={tailwindFontSizeLabelShort}>{(_) => <span>|</span>}</For>
          </div>
          <div class="flex justify-between px-2 mt-1 text-xs">
            <For each={tailwindFontSizeLabelShort}>
              {(label) => <span>{label}</span>}
            </For>
          </div>
        </fieldset>
      </div>
    );

  //NOTE: dead code, keep for a while
  return (
    <fieldset
      class="fieldset"
      on:change={(e) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value as TailwindFontSizeLabel;
        const tailwindFontSize = getTailwindFontSize(value, breakpoint);
        setConfig(props.configKey, tailwindFontSize);
      }}
    >
      <legend class="fieldset-legend">
        {props.label}{" "}
        <UndoIcon
          class="h-4 w-4 cursor-pointer"
          classList={{
            hidden: config[props.configKey] === defaultConfig[props.configKey],
          }}
          on:click={() => {
            setConfig(props.configKey, defaultConfig[props.configKey]);
          }}
        />
      </legend>
      <select class="select w-full">
        {tailwindFontSizeLabel.map((label) => {
          return (
            <option
              value={label}
              selected={
                config[props.configKey] ===
                getTailwindFontSize(label, breakpoint)
              }
            >
              {label}
            </option>
          );
        })}
      </select>
    </fieldset>
  );
}

function AnkiDroidSettings() {
  const [config, setConfig] = useConfig();

  return (
    <div class="flex flex-col gap-2 animate-fade-in">
      <div class="text-2xl font-bold">AnkiDroid</div>
      <div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-x-4 gap-y-2">
          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box">
            <legend class="fieldset-legend">Enable Integration</legend>
            <label class="label">
              <input
                type="checkbox"
                checked={config.ankiDroidEnableIntegration === "true"}
                class="toggle"
                on:change={(e) => {
                  setConfig(
                    "ankiDroidEnableIntegration",
                    e.target.checked ? "true" : "false",
                  );
                }}
              />
            </label>
          </fieldset>

          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box">
            <legend class="fieldset-legend">Reverse Swipe Direction</legend>
            <label class="label">
              <input
                type="checkbox"
                checked={config.ankiDroidReverseSwipeDirection === "true"}
                class="toggle"
                on:change={(e) => {
                  setConfig(
                    "ankiDroidReverseSwipeDirection",
                    e.target.checked ? "true" : "false",
                  );
                }}
              />
            </label>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

function DebugSettings() {
  const [config, setConfig] = useConfig();
  const [card] = useCardStore();
  const { ankiFields } = useAnkiField<"back">();
  const [kikuFiles, setKikuFiles] = createSignal<string>();

  createEffect(async () => {
    if (card.ankiConnectAvailable) {
      const files = await AnkiConnect.getKikuFiles();
      setKikuFiles(JSON.stringify(files, null, 2));
    }
  });

  const [logs, setLogs] = createSignal<string>();
  onMount(() => {
    const id = setInterval(() => {
      setLogs(KIKU_STATE.logger.get());
    }, 8000);
    onCleanup(() => {
      clearInterval(id);
    });
    setLogs(KIKU_STATE.logger.get());
  });

  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        card.toast.success("Copied to clipboard!");
      })
      .catch(() => {
        card.toast.error(
          "Copy to clipboard is not supported, you can select and CTRL+C manually.",
        );
      });
  }

  const [rootDatasetMismatches, setRootDatasetMismatches] = createSignal<
    Record<string, string>
  >({});
  function getRootDatasetMismatches() {
    const mismatches = Object.entries(config).filter(([key, value]) => {
      const rootDataValue = KIKU_STATE.rootDataset[key as keyof KikuConfig];
      return (
        String(rootDataValue).replaceAll('"', "'") !==
        value.toString().replaceAll('"', "'")
      );
    });
    const mismatches$ = mismatches.map(([key]) => {
      return [key, KIKU_STATE.rootDataset[key as keyof KikuConfig]];
    });

    const mismatches$2 = Object.fromEntries(mismatches$);
    return mismatches$2;
  }

  const [rootDataset, setRootDataset] = createSignal<Record<string, string>>(
    {},
  );
  function getRootDataset() {
    const dataset = Object.entries(config);
    const dataset$ = Object.fromEntries(
      dataset.map(([key, value]) => {
        return [key, value.toString().replaceAll('"', "'")];
      }),
    );
    return dataset$;
  }

  const [cssVarMismatches, setCssVarMismatches] = createSignal<
    Record<string, string>
  >({});
  function getCurrentCssVar() {
    const key1 = "--system-font-primary" as const;
    const key2 = "--system-font-secondary" as const;
    const cssVar: CssVar = {
      [key1]: window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(key1),
      [key2]: window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(key2),
    };
    return cssVar;
  }
  function getCssVarMismatches() {
    const mismatches: Array<[keyof CssVar, string]> = [];
    const cssVar = getCurrentCssVar();
    function trimFontFamiliy(str: string) {
      return str
        .replaceAll("\n", "")
        .split(",")
        .map((font) => font.trim().replaceAll('"', "'"))
        .join(", ");
    }
    const systemFontPrimaryConfigTrim = trimFontFamiliy(
      config.systemFontPrimary,
    );
    const systemFontPrimaryTrim = trimFontFamiliy(
      cssVar["--system-font-primary"],
    );
    const systemFontSecondaryConfigTrim = trimFontFamiliy(
      config.systemFontSecondary,
    );
    const systemFontSecondaryTrim = trimFontFamiliy(
      cssVar["--system-font-secondary"],
    );

    if (systemFontPrimaryConfigTrim !== systemFontPrimaryTrim) {
      mismatches.push([
        "--system-font-primary",
        cssVar["--system-font-primary"],
      ]);
    }
    if (systemFontSecondaryConfigTrim !== systemFontSecondaryTrim) {
      mismatches.push([
        "--system-font-secondary",
        cssVar["--system-font-secondary"],
      ]);
    }

    if (window.document.documentElement.getAttribute("data-theme") === "none")
      return {};
    return Object.fromEntries(mismatches);
  }

  const [cssVar, setCssVar] = createSignal<Record<string, string>>({});
  function getCssVar() {
    const cssVar: CssVar = {
      "--system-font-primary": config.systemFontPrimary,
      "--system-font-secondary": config.systemFontSecondary,
    };
    return cssVar;
  }

  createEffect(() => {
    ({ ...config });
    setRootDatasetMismatches(getRootDatasetMismatches());
    setRootDataset(getRootDataset());
    setCssVarMismatches(getCssVarMismatches());
    setCssVar(getCssVar());
  });

  return (
    <>
      <Show
        when={
          Object.keys(rootDatasetMismatches()).length > 0 &&
          Object.keys(rootDatasetMismatches()).some((key) =>
            rootDatasetConfigWhitelist.has(key as keyof KikuConfig),
          )
        }
      >
        <div role="alert" class="alert alert-warning">
          <TriangleAlertIcon />
          <span>
            Root Dataset mismatches, FOUC (Flash Of Unstyled Content) may occur.{" "}
            <br />
            <span class="text-xs">
              {Object.keys(rootDatasetMismatches())
                .filter((key) =>
                  rootDatasetConfigWhitelist.has(key as keyof KikuConfig),
                )
                .map((key) => toDatasetKey(toDashed(key)))
                .join(", ")}
            </span>
          </span>
        </div>

        <Show when={Object.keys(cssVarMismatches()).length > 0}>
          <div role="alert" class="alert alert-warning">
            <TriangleAlertIcon />
            <span>
              CSS Variables mismatches, FOUC (Flash Of Unstyled Content) may
              occur. <br />
              <span class="text-xs">
                {Object.keys(cssVarMismatches()).join(", ")}
              </span>
            </span>
          </div>
        </Show>
      </Show>
      <div class="pb-32">
        {/* NOTE: collapse arrow broke button color https://github.com/saadeghi/daisyui/issues/4209 */}
        <div class="collapse bg-base-100 border border-base-300">
          <input type="checkbox" />
          <div class="collapse-title text-lg font-bold">Debug</div>
          <div class="collapse-content text-sm">
            <div class="flex flex-col gap-4 animate-fade-in ">
              <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-x-4 gap-y-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">
                    AnkiConnect Port
                    <UndoIcon
                      class="h-4 w-4 cursor-pointer"
                      classList={{
                        hidden:
                          config.ankiConnectPort ===
                          defaultConfig.ankiConnectPort,
                      }}
                      on:click={() => {
                        setConfig(
                          "ankiConnectPort",
                          defaultConfig.ankiConnectPort,
                        );
                      }}
                    />
                  </legend>
                  <input
                    type="text"
                    class="input w-full"
                    placeholder={defaultConfig.ankiConnectPort}
                    value={config.ankiConnectPort}
                    on:input={(e) => {
                      let value = (e.target as HTMLInputElement).value;
                      value = value.replaceAll(/[^0-9]/g, "");
                      (e.target as HTMLInputElement).value = value;
                      setConfig("ankiConnectPort", value);
                    }}
                  />
                </fieldset>
                <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4">
                  <legend class="fieldset-legend">Show Startup Time</legend>
                  <label class="label">
                    <input
                      type="checkbox"
                      checked={config.showStartupTime === "true"}
                      class="toggle"
                      on:change={(e) => {
                        setConfig(
                          "showStartupTime",
                          e.target.checked ? "true" : "false",
                        );
                      }}
                    />
                  </label>
                </fieldset>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Expected Root Dataset</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(toDatasetString(rootDataset()));
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  <span class="opacity-25 select-none">{"<div\n"}</span>
                  {toDatasetString(rootDataset())}
                  <span class="opacity-25 select-none">{"\n>"}</span>
                </pre>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Current Root Dataset</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(toDatasetString(KIKU_STATE.rootDataset));
                    }}
                  />
                </div>

                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  <span class="opacity-25 select-none">{"<div\n"}</span>
                  {toDatasetString(KIKU_STATE.rootDataset)}
                  <span class="opacity-25 select-none">{"\n>"}</span>
                </pre>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Expected CSS Variable</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(toCssVarString(cssVar()));
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  <span class="opacity-25 select-none">{":root {\n"}</span>
                  {toCssVarString(cssVar())}
                  <span class="opacity-25 select-none">{"\n}"}</span>
                </pre>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Current CSS Variable</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(toCssVarString(getCurrentCssVar()));
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  <span class="opacity-25 select-none">{":root {\n"}</span>
                  {toCssVarString(getCurrentCssVar())}
                  <span class="opacity-25 select-none">{"\n}"}</span>
                </pre>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Config</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(JSON.stringify({ ...config }, null, 2));
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  {JSON.stringify({ ...config }, null, 2)}
                </pre>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Anki Fields</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(
                        JSON.stringify({ ...ankiFields }, null, 2),
                      );
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  {JSON.stringify({ ...ankiFields }, null, 2)}
                </pre>
              </div>
              <Show when={kikuFiles()}>
                <div class="flex flex-col gap-2">
                  <div class="flex gap-2 items-center">
                    <div class="text-lg">Kiku Files</div>
                    <ClipboardCopyIcon
                      class="size-5 text-base-content-calm cursor-pointer"
                      on:click={() => {
                        copyToClipboard(kikuFiles() ?? "");
                      }}
                    />
                  </div>
                  <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                    {kikuFiles()}
                  </pre>
                </div>
              </Show>
              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <div class="text-lg">Logs</div>
                  <ClipboardCopyIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      copyToClipboard(logs() ?? "");
                    }}
                  />

                  <RefreshCwIcon
                    class="size-5 text-base-content-calm cursor-pointer"
                    on:click={() => {
                      setLogs(KIKU_STATE.logger.get());
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto max-h-[90svh]">
                  {logs()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
