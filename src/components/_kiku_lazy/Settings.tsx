import { ArrowLeftIcon, RefreshCwIcon, UndoIcon } from "lucide-solid";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import { AnkiConnect } from "#/util/ankiConnect";
import {
  defaultConfig,
  getTailwindFontSize,
  type KikuConfig,
  type TailwindBreakpoint,
  type TailwindFontSizeLabel,
  tailwindFontSizeLabel,
} from "#/util/config";
import { type OnlineFont, onlineFonts } from "#/util/fonts";
import { capitalize, isMobile } from "#/util/general";
import { daisyUIThemes } from "#/util/theme";
import { useConfig } from "../shared/Context";

export default function Settings(props: {
  onBackClick?: () => void;
  onCancelClick?: () => void;
}) {
  const [config, setConfig] = useConfig();
  const [isAnkiConnectAvailable, setIsAnkiConnectAvailable] =
    createSignal(false);

  onMount(async () => {
    if (isMobile()) return;
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
      //TODO: configurable
      ankiConnectPort: 8765,
      theme: config.theme ? config.theme : defaultConfig.theme,
      onlineFont: config.onlineFont ? config.onlineFont : defaultConfig.onlineFont,
      systemFont: config.systemFont ? config.systemFont : defaultConfig.systemFont,
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

  return (
    <>
      <div class="flex flex-row justify-between items-center">
        <div class="h-5">
          <ArrowLeftIcon
            class="h-full w-full cursor-pointer text-base-content/50"
            on:click={props.onBackClick}
          ></ArrowLeftIcon>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <Switch>
            <Match when={isAnkiConnectAvailable()}>
              <div class="text-sm">AnkiConnect is available</div>
              <div class="status status-success"></div>
            </Match>
            <Match when={!isAnkiConnectAvailable()}>
              <RefreshCwIcon
                class="h-5 w-5 cursor-pointer text-base-content/50"
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
            </Match>
          </Switch>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="text-2xl font-bold">Theme</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] rounded-box gap-4 p-2">
          <For each={daisyUIThemes}>
            {(theme) => {
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
                    <div
                      class="grid grid-cols-5 grid-rows-3"
                      data-theme={theme}
                    >
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
            }}
          </For>
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <div class="text-2xl font-bold">Font</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] rounded-box gap-4">
          <fieldset
            class="fieldset"
            on:change={(e) => {
              const target = e.target as HTMLSelectElement;
              setConfig("onlineFont", target.value as OnlineFont);
            }}
          >
            <legend class="fieldset-legend">Online Font</legend>
            <select class="select w-full">
              <For each={onlineFonts}>
                {(font) => {
                  return (
                    <option value={font} selected={config.onlineFont === font}>
                      {font}
                    </option>
                  );
                }}
              </For>
            </select>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">System Font</legend>
            <input
              type="text"
              class="input w-full"
              placeholder="Segoe UI"
              value={config.systemFont}
              on:input={(e) => {
                setConfig("systemFont", (e.target as HTMLInputElement).value);
              }}
            />
            <p class="label">Overrides online font when specified</p>
          </fieldset>
        </div>
      </div>
      <FontSizeSettings />
      <div class="flex flex-col gap-4">
        <div class="text-2xl font-bold">Debug</div>
        <pre class="text-xs bg-base-200 p-4 rounded-lg">
          {JSON.stringify({ ...config }, null, 2)}
        </pre>
      </div>
      <div class="flex flex-row gap-2 justify-end">
        <button class="btn btn-secondary" on:click={props.onCancelClick}>
          Cancel
        </button>
        <button
          class="btn btn-primary"
          classList={{
            "btn-disabled": !isAnkiConnectAvailable(),
          }}
          disabled={!isAnkiConnectAvailable()}
          on:click={saveConfig}
        >
          Save
        </button>
      </div>
      <Show when={showToast()}>
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
      </Show>
    </>
  );
}

function FontSizeSettings() {
  return (
    <div class="flex flex-col gap-4">
      <div class="text-2xl font-bold">Font Size</div>
      <div>
        <div class="text-lg font-bold">Mobile</div>
        {/* biome-ignore format: this looks nicer */}
        <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] rounded-box gap-x-4 gap-y-2">
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
        <For each={tailwindFontSizeLabel}>
          {(label) => {
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
          }}
        </For>
      </select>
    </fieldset>
  );
}
