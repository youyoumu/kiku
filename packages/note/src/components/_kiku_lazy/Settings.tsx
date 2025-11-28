import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import { useCardContext } from "#/components/shared/CardContext";
import {
  defaultConfig,
  getCssVar,
  type KikuConfig,
  type RootDatasetKey,
  rootDatasetConfigWhitelist,
  type TailwindSize,
  tailwindFontSizeVar,
  tailwindSize,
} from "#/util/config";
import { type WebFont, webFonts } from "#/util/fonts";
import { env } from "#/util/general";
import { useNavigationTransition, useThemeTransition } from "#/util/hooks";
import { daisyUIThemes } from "#/util/theme";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { ClipboardCopyIcon, InfoIcon, RefreshCwIcon, UndoIcon } from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";
import { capitalize } from "./util/general";

function toDashed(str: string) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function toDatasetKey(str: string) {
  return `data-${str}`;
}

function toDatasetString(obj: Record<string, string | number | boolean>) {
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
      if (value === "") value = "undefined";
      return `${key}: ${value.replaceAll("\n", "").replaceAll("'", '"')};`;
    })
    .join("\n");
  return txt;
}

export default function Settings() {
  const [$config] = useConfigContext();
  const [$card, _$setCard] = useCardContext();
  const [$general, $setGeneral] = useGeneralContext();
  const navigate = useNavigationTransition();

  const saveConfig = async () => {
    try {
      KIKU_STATE.logger.debug("Saving config:", $config);
      await AnkiConnect.saveConfig($config);
      $card.toast.success("Saved! Restart Anki to apply changes.");
    } catch (e) {
      $card.toast.error(
        `Failed to save config: ${e instanceof Error ? e.message : ""}`,
      );
    }
  };

  return (
    <div>
      <GeneralSettings />
      <div class="divider"></div>
      <ThemeSettings />
      <div class="divider"></div>
      <FontSettings />
      <div class="divider"></div>
      <FontSizeSettings />
      <div class="divider"></div>
      <AnkiDroidSettings />
      <div class="divider"></div>
      <DebugSettings />
      <div class="divider"></div>
      <div class="pb-16"></div>
      <Portal mount={KIKU_STATE.root}>
        <div class="max-w-4xl mx-auto w-full relative">
          <div class="flex flex-row gap-2 justify-end animate-fade-in absolute bottom-0 right-0 mx-4 mb-4">
            <button class="btn" on:click={() => navigate("main", "back")}>
              Back
            </button>
            <button
              class="btn"
              classList={{
                "btn-primary": $general.isAnkiConnectAvailable,
                "btn-disabled bg-base-300 text-base-content-faint":
                  !$general.isAnkiConnectAvailable,
              }}
              disabled={!$general.isAnkiConnectAvailable}
              on:click={saveConfig}
            >
              Save
            </button>
          </div>
        </div>
      </Portal>
    </div>
  );
}

function GeneralSettings() {
  const [$config, $setConfig] = useConfigContext();

  return (
    <div class="flex flex-col gap-4 animate-fade-in relative">
      <div class="flex flex-col items-center text-base-content-faint justify-center">
        <div class="text-base-content-subtle-200 text-6xl">菊</div>
        <div class="text-sm">Kiku Note v{env.KIKU_VERSION}</div>
      </div>

      <div class="flex gap-2 items-center justify-between">
        <div class="text-2xl font-bold">General</div>
      </div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-4 p-2">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">
            Volume
            <div
              class="tooltip"
              data-tip="Controls the volume of audio played in the webview (Desktop only)."
            >
              <InfoIcon class="size-4 text-base-content-calm" />
            </div>
          </legend>

          <input
            on:change={(e) => {
              const value = e.target.value;
              $setConfig("volume", Number(value));
            }}
            type="range"
            min="0"
            max={"100"}
            value={$config.volume.toString()}
            class="range w-full "
            step="1"
          />
        </fieldset>
        <fieldset class="fieldset py-0">
          <legend class="fieldset-legend">Show Theme</legend>
          <label class="label">
            <input
              type="checkbox"
              checked={$config.showTheme}
              class="toggle"
              on:change={(e) => {
                $setConfig("showTheme", e.target.checked);
              }}
            />
          </label>
        </fieldset>
        <fieldset class="fieldset py-0">
          <legend class="fieldset-legend">
            Mobile Layout Alt
            <div
              class="tooltip"
              data-tip="Swap Sentence and Definition position on mobile"
            >
              <InfoIcon class="size-4 text-base-content-calm" />
            </div>
          </legend>
          <label class="label">
            <input
              type="checkbox"
              checked={$config.swapSentenceAndDefinitionOnMobile}
              class="toggle"
              on:change={(e) => {
                $setConfig(
                  "swapSentenceAndDefinitionOnMobile",
                  e.target.checked,
                );
              }}
            />
          </label>
        </fieldset>
        <fieldset class="fieldset py-0">
          <legend class="fieldset-legend">
            Prefer AnkiConnect
            <div
              class="tooltip"
              data-tip="Query notes via AnkiConnect instead of the notes cache (Desktop only)."
            >
              <InfoIcon class="size-4 text-base-content-calm" />
            </div>
          </legend>
          <label class="label">
            <input
              type="checkbox"
              checked={$config.preferAnkiConnect}
              class="toggle"
              on:change={(e) => {
                $setConfig("preferAnkiConnect", e.target.checked);
              }}
            />
          </label>
        </fieldset>
      </div>
    </div>
  );
}

function ThemeSettings() {
  const [$general] = useGeneralContext();
  const [$config, _$setConfig] = useConfigContext();
  const changeTheme = useThemeTransition();

  return (
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="text-2xl font-bold">Theme</div>

      <Show when={$general.isThemeChanged}>
        <div role="alert" class="alert alert-warning">
          <span>
            A quick flash of the wrong theme may occur until you click Save and
            restart Anki.
          </span>
        </div>
      </Show>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] rounded-box gap-4">
        {daisyUIThemes.map((theme) => {
          return (
            <div
              class="border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline-2 outline-offset-2"
              classList={{
                "outline-2": theme === $config.theme,
              }}
              on:click={() => {
                changeTheme(theme);
              }}
            >
              <div class="bg-base-100 text-base-content w-full cursor-pointer">
                <div class="grid grid-cols-5 grid-rows-3" data-theme={theme}>
                  <div class="bg-base-200 col-start-1 row-span-2 row-start-1"></div>
                  <div class="bg-base-300 col-start-1 row-start-3"></div>
                  <div class="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2">
                    <div class="font-bold">{capitalize(theme)}</div>
                    <div class="flex flex-wrap gap-1">
                      <div class="bg-primary flex aspect-square w-5 items-center justify-center rounded">
                        <div class="text-primary-content text-sm font-bold">
                          A
                        </div>
                      </div>
                      <div class="bg-secondary flex aspect-square w-5 items-center justify-center rounded">
                        <div class="text-secondary-content text-sm font-bold">
                          A
                        </div>
                      </div>
                      <div class="bg-accent flex aspect-square w-5 items-center justify-center rounded">
                        <div class="text-accent-content text-sm font-bold">
                          A
                        </div>
                      </div>
                      <div class="bg-neutral flex aspect-square w-5 items-center justify-center rounded">
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
    </div>
  );
}

function FontSettings() {
  const [$config, $setConfig] = useConfigContext();

  return (
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="text-2xl font-bold">Font</div>
      <div>
        <div class="text-lg font-bold">Primary</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] rounded-box gap-4">
          <fieldset
            class="fieldset"
            classList={{
              hidden: $config.useSystemFontPrimary,
            }}
            on:change={(e) => {
              const target = e.target as HTMLSelectElement;
              $setConfig("webFontPrimary", target.value as WebFont);
            }}
          >
            <legend class="fieldset-legend">Web Font</legend>
            <select class="select w-full">
              {webFonts.map((font) => {
                return (
                  <option
                    value={font}
                    selected={$config.webFontPrimary === font}
                  >
                    <span class="font-primary" style={{ "font-family": font }}>
                      {font}
                    </span>
                  </option>
                );
              })}
            </select>
          </fieldset>
          <fieldset
            class="fieldset"
            classList={{
              hidden: !$config.useSystemFontPrimary,
            }}
          >
            <legend class="fieldset-legend">
              System Font
              <UndoIcon
                class="h-4 w-4 cursor-pointer"
                classList={{
                  hidden:
                    $config.systemFontPrimary ===
                    defaultConfig.systemFontPrimary,
                }}
                on:click={() => {
                  $setConfig(
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
              value={$config.systemFontPrimary}
              on:input={(e) => {
                $setConfig(
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
                checked={$config.useSystemFontPrimary}
                class="toggle"
                on:change={(e) => {
                  $setConfig("useSystemFontPrimary", e.target.checked);
                }}
              />
              {$config.useSystemFontPrimary
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
              hidden: $config.useSystemFontSecondary,
            }}
            on:change={(e) => {
              const target = e.target as HTMLSelectElement;
              $setConfig("webFontSecondary", target.value as WebFont);
            }}
          >
            <legend class="fieldset-legend">Web Font</legend>
            <select class="select w-full">
              {webFonts.map((font) => {
                return (
                  <option
                    value={font}
                    selected={$config.webFontSecondary === font}
                  >
                    <span
                      class="font-secondary"
                      style={{ "font-family": font }}
                    >
                      {font}
                    </span>
                  </option>
                );
              })}
            </select>
          </fieldset>
          <fieldset
            class="fieldset"
            classList={{
              hidden: !$config.useSystemFontSecondary,
            }}
          >
            <legend class="fieldset-legend">
              System Font
              <UndoIcon
                class="h-4 w-4 cursor-pointer"
                classList={{
                  hidden:
                    $config.systemFontSecondary ===
                    defaultConfig.systemFontSecondary,
                }}
                on:click={() => {
                  $setConfig(
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
              value={$config.systemFontSecondary}
              on:input={(e) => {
                $setConfig(
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
                checked={$config.useSystemFontSecondary}
                class="toggle"
                on:change={(e) => {
                  $setConfig("useSystemFontSecondary", e.target.checked);
                }}
              />
              {$config.useSystemFontSecondary
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
      <div class="collapse gap-4 collapse-arrow">
        <input type="checkbox" />
        <div class="collapse-title p-0">
          <div class="text-2xl font-bold">Font Size</div>
        </div>
        <div class="collapse-content p-0 flex flex-col gap-4">
          <div>
            <div class="text-lg font-bold">Mobile</div>
            {/* biome-ignore format: this looks nicer */}
            <div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-x-4 gap-y-4 sm:gap-y-2">
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
            <div class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] rounded-box gap-x-4 gap-y-4 sm:gap-y-2">
          <FontSizeSettingsFieldset configKey="fontSizeSmExpression" label="Expression" />
          <FontSizeSettingsFieldset configKey="fontSizeSmPitch" label="Pitch" />
          <FontSizeSettingsFieldset configKey="fontSizeSmSentence" label="Sentence" />
          <FontSizeSettingsFieldset configKey="fontSizeSmMiscInfo" label="Misc Info" />
          <FontSizeSettingsFieldset configKey="fontSizeSmHint" label="Hint" />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FontSizeSettingsFieldset(props: {
  configKey: keyof KikuConfig;
  label: string;
}) {
  const [$config, $setConfig] = useConfigContext();
  const configValue = () => $config[props.configKey] as TailwindSize;

  return (
    <div class="w-full">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">
          {props.label}{" "}
          <UndoIcon
            class="h-4 w-4 cursor-pointer"
            classList={{
              hidden:
                $config[props.configKey] === defaultConfig[props.configKey],
            }}
            on:click={() => {
              $setConfig(props.configKey, defaultConfig[props.configKey]);
            }}
          />
        </legend>

        <div class="tooltip">
          <div class="tooltip-content">
            <div
              class={`font-secondary`}
              style={{
                "font-size": tailwindFontSizeVar[configValue()].fontSize,
                "line-height": tailwindFontSizeVar[configValue()].lineHeight,
              }}
            >
              あ
            </div>
          </div>
          <input
            on:change={(e) => {
              const target = e.target as HTMLInputElement;
              const value = tailwindSize[Number(target.value)] as TailwindSize;
              $setConfig(props.configKey, value);
            }}
            type="range"
            min="0"
            max={(tailwindSize.length - 1).toString()}
            value={tailwindSize.indexOf(configValue()).toString()}
            class="range range-xs w-full "
            step="1"
          />
        </div>
        <div class="flex justify-between px-2 mt-1 text-xs">
          <For each={tailwindSize}>{(_) => <span>|</span>}</For>
        </div>
        <div class="flex justify-between px-2 mt-1 text-xs">
          <For each={tailwindSize}>{(label) => <span>{label}</span>}</For>
        </div>
      </fieldset>
    </div>
  );
}

function AnkiDroidSettings() {
  const [$config, $setConfig] = useConfigContext();

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
                checked={$config.ankiDroidEnableIntegration}
                class="toggle"
                on:change={(e) => {
                  $setConfig("ankiDroidEnableIntegration", e.target.checked);
                }}
              />
            </label>
          </fieldset>

          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box">
            <legend class="fieldset-legend">Reverse Swipe Direction</legend>
            <label class="label">
              <input
                type="checkbox"
                checked={$config.ankiDroidReverseSwipeDirection}
                class="toggle"
                on:change={(e) => {
                  $setConfig(
                    "ankiDroidReverseSwipeDirection",
                    e.target.checked,
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
  const [$config, $setConfig] = useConfigContext();
  const [$card] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"back">();
  const [kikuFiles, setKikuFiles] = createSignal<string>();
  const [missingFiles, setMissingFiles] = createSignal<string>();
  const [$general, _$setGeneral] = useGeneralContext();

  createEffect(async () => {
    if ($general.isAnkiConnectAvailable) {
      const files = await AnkiConnect.getKikuFiles();
      setKikuFiles(JSON.stringify(files, null, 2));
      const missing = env.KIKU_IMPORTANT_FILES.filter((file) => {
        return !files.includes(file);
      });
      setMissingFiles(missing.join(", "));
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
        $card.toast.success("Copied to clipboard!");
      })
      .catch(() => {
        $card.toast.error(
          "Copy to clipboard is not supported, you can select and CTRL+C manually.",
        );
      });
  }

  const rootDataset = () => {
    return Object.fromEntries(
      Object.entries($config).filter(([key]) => {
        return rootDatasetConfigWhitelist.has(key as RootDatasetKey);
      }),
    );
  };

  const cssVar = () => getCssVar($config);

  return (
    <div class="collapse collapse-arrow">
      <input type="checkbox" />
      <div class="collapse-title text-2xl font-bold p-0">Debug</div>
      <div class="collapse-content p-0">
        <div class="flex flex-col gap-4 animate-fade-in ">
          <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-x-4 gap-y-2">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">
                AnkiConnect Port
                <UndoIcon
                  class="h-4 w-4 cursor-pointer"
                  classList={{
                    hidden:
                      $config.ankiConnectPort === defaultConfig.ankiConnectPort,
                  }}
                  on:click={() => {
                    $setConfig(
                      "ankiConnectPort",
                      defaultConfig.ankiConnectPort,
                    );
                  }}
                />
              </legend>
              <input
                type="text"
                class="input w-full"
                placeholder={defaultConfig.ankiConnectPort.toString()}
                value={$config.ankiConnectPort}
                on:input={(e) => {
                  let value = (e.target as HTMLInputElement).value;
                  value = value.replaceAll(/[^0-9]/g, "");
                  (e.target as HTMLInputElement).value = value;
                  $setConfig("ankiConnectPort", Number(value));
                }}
              />
            </fieldset>
            <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 py-4">
              <legend class="fieldset-legend">Show Startup Time</legend>
              <label class="label">
                <input
                  type="checkbox"
                  checked={$config.showStartupTime}
                  class="toggle"
                  on:change={(e) => {
                    $setConfig("showStartupTime", e.target.checked);
                  }}
                />
              </label>
            </fieldset>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <div class="text-lg">Expected Root Dataset</div>
              <ClipboardCopyIcon
                class="size-4 text-base-content-calm cursor-pointer"
                classList={{
                  hidden: typeof pycmd !== "undefined",
                }}
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
              <div class="text-lg">Expected CSS Variable</div>
              <ClipboardCopyIcon
                class="size-4 text-base-content-calm cursor-pointer"
                classList={{
                  hidden: typeof pycmd !== "undefined",
                }}
                on:click={() => {
                  copyToClipboard(toCssVarString(cssVar()));
                }}
              />
            </div>
            <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
              <span class="opacity-25 select-none">{":root, :host {\n"}</span>
              {toCssVarString(cssVar())}
              <span class="opacity-25 select-none">{"\n}"}</span>
            </pre>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <div class="text-lg">Config</div>
              <ClipboardCopyIcon
                class="size-4 text-base-content-calm cursor-pointer"
                classList={{
                  hidden: typeof pycmd !== "undefined",
                }}
                on:click={() => {
                  copyToClipboard(JSON.stringify({ ...$config }, null, 2));
                }}
              />
            </div>
            <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
              {JSON.stringify({ ...$config }, null, 2)}
            </pre>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <div class="text-lg">Anki Fields</div>
              <ClipboardCopyIcon
                class="size-4 text-base-content-calm cursor-pointer"
                classList={{
                  hidden: typeof pycmd !== "undefined",
                }}
                on:click={() => {
                  copyToClipboard(JSON.stringify({ ...ankiFields }, null, 2));
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
                  class="size-4 text-base-content-calm cursor-pointer"
                  classList={{
                    hidden: typeof pycmd !== "undefined",
                  }}
                  on:click={() => {
                    copyToClipboard(kikuFiles() ?? "");
                  }}
                />
              </div>

              <Show when={missingFiles()}>
                <div role="alert" class="alert alert-warning">
                  <span>
                    Some files are missing, things may not work as expected.
                    <br />
                    <span class="text-xs ">{missingFiles()}</span>
                  </span>
                </div>
              </Show>
              <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                {kikuFiles()}
              </pre>
            </div>
          </Show>
          <div class="flex flex-col gap-2">
            <div class="flex gap-2 items-center">
              <div class="text-lg">Logs</div>
              <ClipboardCopyIcon
                class="size-4 text-base-content-calm cursor-pointer"
                classList={{
                  hidden: typeof pycmd !== "undefined",
                }}
                on:click={() => {
                  copyToClipboard(logs() ?? "");
                }}
              />

              <RefreshCwIcon
                class="size-4 text-base-content-calm cursor-pointer"
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
  );
}
