import { createEffect, createSignal, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { defaultConfig, type KikuConfig } from "#/util/config";
import { type WebFont, webFonts } from "#/util/fonts";
import { daisyUIThemes } from "#/util/theme";
import { useAnkiField, useBreakpoint, useConfig } from "../shared/Context";
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
  type TailwindBreakpoint,
  type TailwindFontSizeLabel,
  tailwindFontSizeLabel,
} from "./util/tailwind";

export default function Settings(props: {
  onBackClick?: () => void;
  onCancelClick?: () => void;
}) {
  const bp = useBreakpoint();
  const [config, setConfig] = useConfig();
  const { ankiFields } = useAnkiField<"back">();
  const [isAnkiConnectAvailable, setIsAnkiConnectAvailable] =
    createSignal(false);

  onMount(async () => {
    if (!bp.isAtLeast("sm")) return;
    await checkAnkiConnect();
  });

  async function checkAnkiConnect() {
    const version = await AnkiConnect.getVersion();
    if (version) {
      setIsAnkiConnectAvailable(true);
    }
  }

  const saveConfig = async () => {
    // biome-ignore format: this looks nicer
    const payload: KikuConfig = {
      kikuRoot: "true",
      theme: config.theme ? config.theme : defaultConfig.theme,
      webFontPrimary: config.webFontPrimary ? config.webFontPrimary : defaultConfig.webFontPrimary,
      systemFontPrimary: config.systemFontPrimary ? config.systemFontPrimary : defaultConfig.systemFontPrimary,
      useSystemFont: config.useSystemFont ? config.useSystemFont : defaultConfig.useSystemFont,
      //TODO: configurable
      ankiConnectPort: "8765",
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
      await AnkiConnect.saveConfig(payload);
      toast.success("Saved! Restart Anki to apply changes.");
    } catch (e) {
      toast.error(
        `Failed to save config: ${e instanceof Error ? e.message : ""}`,
      );
    }
  };

  const [toastMessage, setToastMessage] = createSignal("");
  const [toastType, setToastType] = createSignal<"success" | "error">(
    "success",
  );
  const [showToast, setShowToast] = createSignal(false);
  let timeout: number;
  const toast = {
    success: (message: string) => {
      if (timeout) clearTimeout(timeout);
      setToastType("success");
      setToastMessage(message);
      setShowToast(true);
      timeout = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    },
    error: (message: string) => {
      if (timeout) clearTimeout(timeout);
      setToastType("error");
      setToastMessage(message);
      setShowToast(true);
      timeout = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    },
  };
  function copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch(() => {
        toast.error(
          "Copy to clipboard is not supported, you can select and CTRL+C manually.",
        );
      });
  }

  function toDatasetString(obj: Record<string, string | number>) {
    return Object.entries(obj)
      .map(([key, value]) => {
        const dashed = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
        return `data-${dashed}="${value}"`;
      })
      .join("\n");
  }

  function toCssVarString(obj: Record<string, string>) {
    const txt = Object.entries(obj)
      .map(([key, value]) => {
        return `${key}: ${value};`;
      })
      .join("\n");
    return txt;
  }

  const [rootDatasetMismatches, setRootDatasetMismatches] = createSignal<
    Record<string, string>
  >({});
  function getRootDatasetMismatches() {
    const mismatches = Object.entries(config).filter(([key, value]) => {
      const rootDataValue =
        globalThis.KIKU_STATE.rootDataset[key as keyof KikuConfig];
      return (
        String(rootDataValue).replaceAll('"', "'") !==
        value.toString().replaceAll('"', "'")
      );
    });
    const mismatches$ = mismatches.map(([key]) => {
      return [key, globalThis.KIKU_STATE.rootDataset[key as keyof KikuConfig]];
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
  function getCssVarMismatches() {
    const mismatches: Array<[string, string]> = [];
    const systemFont = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--system-font");

    const systemFontConfigTrim = config.systemFontPrimary
      .replaceAll("\n", "")
      .split(",")
      .map((font) => font.trim().replaceAll('"', "'"))
      .join(", ");
    const systemFontTrim = systemFont
      .replaceAll("\n", "")
      .split(",")
      .map((font) => font.trim().replaceAll('"', "'"))
      .join(", ");

    if (config.systemFontPrimary && systemFontConfigTrim !== systemFontTrim) {
      mismatches.push(["--system-font", systemFont]);
    }

    return Object.fromEntries(mismatches);
  }
  function getCurrentCssVar() {
    const systemFont = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--system-font");
    return {
      "--system-font": systemFont,
    };
  }

  const [cssVar, setCssVar] = createSignal<Record<string, string>>({});
  function getCssVar() {
    const cssVar: Record<string, string> = {};
    if (config.systemFontPrimary) {
      cssVar["--system-font"] = `${config.systemFontPrimary}`;
    }
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
      <div class="flex flex-row justify-between items-center animate-fade-in">
        <div class="h-5">
          <ArrowLeftIcon
            class="h-full w-full cursor-pointer text-base-content-soft"
            on:click={props.onBackClick}
          ></ArrowLeftIcon>
        </div>
        <div class="flex flex-row gap-2 items-center">
          {isAnkiConnectAvailable() && (
            <>
              <div class="text-sm">AnkiConnect is available</div>
              <div class="status status-success"></div>
            </>
          )}
          {!isAnkiConnectAvailable() && (
            <>
              <RefreshCwIcon
                class="h-5 w-5 cursor-pointer text-base-content-soft"
                on:click={async () => {
                  try {
                    await checkAnkiConnect();
                  } catch {
                    toast.error("AnkiConnect is not available");
                  }
                }}
              />
              <div class="text-sm">AnkiConnect is not available</div>
              <div class="status status-error animate-ping"></div>
            </>
          )}
        </div>
      </div>
      <div class="flex flex-col gap-4 animate-fade-in">
        <div class="text-2xl font-bold">Theme</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(9.8rem,1fr))] rounded-box gap-4 p-2">
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
      </div>
      <div class="flex flex-col gap-4 animate-fade-in">
        <div class="text-2xl font-bold">Font</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] rounded-box gap-4">
          <fieldset
            class="fieldset"
            classList={{
              hidden: config.useSystemFont === "true",
            }}
            on:change={(e) => {
              const target = e.target as HTMLSelectElement;
              setConfig("webFontPrimary", target.value as WebFont);
            }}
          >
            <legend class="fieldset-legend">Web Font</legend>
            <select class="select w-full">
              {webFonts.map((font) => {
                return (
                  <option
                    value={font}
                    selected={config.webFontPrimary === font}
                    data-web-font={font}
                    data-use-system-font={"false"}
                  >
                    {font}
                  </option>
                );
              })}
            </select>
          </fieldset>
          <fieldset
            class="fieldset"
            classList={{
              hidden: config.useSystemFont !== "true",
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
                "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif"
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
            <label class="label">
              <input
                type="checkbox"
                checked={config.useSystemFont === "true"}
                class="toggle"
                on:change={(e) => {
                  setConfig(
                    "useSystemFont",
                    e.target.checked ? "true" : "false",
                  );
                }}
              />
              {config.useSystemFont === "true"
                ? "Using System Font"
                : "Using Web Font"}
            </label>
          </fieldset>
        </div>
      </div>
      <FontSizeSettings />
      <Show
        when={
          Object.keys(rootDatasetMismatches()).length > 0 ||
          Object.keys(cssVarMismatches()).length > 0
        }
      >
        <div role="alert" class="alert alert-warning">
          <TriangleAlertIcon />
          <span>
            <Show when={Object.keys(rootDatasetMismatches()).length > 0}>
              Root Dataset mismatches,{" "}
            </Show>
            <Show when={Object.keys(cssVarMismatches()).length > 0}>
              CSS Variable mismatches,{" "}
            </Show>
            <span>FOUC (Flash Of Unstyled Content) may occur.</span>
          </span>
        </div>
      </Show>

      <div class="pb-32">
        {/* NOTE: collapse arrow broke button color https://github.com/saadeghi/daisyui/issues/4209 */}
        <div class="collapse bg-base-100 border border-base-300">
          <input type="checkbox" />
          <div class="collapse-title text-lg font-bold">Debug</div>
          <div class="collapse-content text-sm">
            <div class="flex flex-col gap-4 animate-fade-in ">
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
                      copyToClipboard(
                        toDatasetString(globalThis.KIKU_STATE.rootDataset),
                      );
                    }}
                  />
                </div>
                <pre class="text-xs bg-base-200 p-4 rounded-lg overflow-auto">
                  <span class="opacity-25 select-none">{"<div\n"}</span>
                  {toDatasetString(globalThis.KIKU_STATE.rootDataset)}
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
            </div>
          </div>
        </div>
      </div>

      <Portal mount={window.KIKU_STATE.root}>
        <div class="max-w-4xl mx-auto w-full relative">
          <div class="flex flex-row gap-2 justify-end animate-fade-in absolute bottom-0 right-0 mx-4 mb-4">
            <div class="btn" on:click={props.onCancelClick}>
              Cancel
            </div>
            <div
              class="btn"
              classList={{
                "btn-primary": isAnkiConnectAvailable(),
                "btn-disabled bg-base-300 text-base-content-faint":
                  !isAnkiConnectAvailable(),
              }}
              role="button"
              //@ts-expect-error
              disabled={!isAnkiConnectAvailable()}
              on:click={saveConfig}
            >
              Save
            </div>
          </div>
        </div>
      </Portal>
      {showToast() && (
        <div class="toast toast-top toast-center">
          <div
            class="alert"
            classList={{
              "alert-error": toastType() === "error",
              "alert-success": toastType() === "success",
            }}
          >
            <span>{toastMessage()}</span>
          </div>
        </div>
      )}
    </>
  );
}

function FontSizeSettings() {
  return (
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="text-2xl font-bold">Font Size</div>
      <div>
        <div class="text-lg font-bold">Mobile</div>
        {/* biome-ignore format: this looks nicer */}
        <div class="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] rounded-box gap-x-4 gap-y-2">
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
        <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] rounded-box gap-x-4 gap-y-2">
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
