import { ArrowLeftIcon, RefreshCwIcon } from "lucide-solid";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import { AnkiConnect } from "../util/ankiConnect";
import { capitalize } from "../util/capitalize";
import type { KikuConfig } from "../util/config";
import { isMobile } from "../util/general";
import { type DaisyUITheme, daisyUIThemes, setTheme } from "../util/theme";

export function Settings(props: {
  onBackClick?: () => void;
  onCancelClick?: () => void;
}) {
  const [currentTheme, setCurrentTheme] = createSignal<DaisyUITheme>(
    document.documentElement.getAttribute("data-theme") as DaisyUITheme,
  );
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
    const payload: KikuConfig = {
      //TODO: configurable
      ankiConnectPort: 8765,
      theme: currentTheme(),
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
      <div class="flex flex-col gap-2">
        <div class="text-2xl font-bold">Theme</div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] rounded-box gap-4 p-2">
          <For each={daisyUIThemes}>
            {(theme) => {
              return (
                <div
                  class="border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline-2 outline-offset-2"
                  classList={{
                    "outline-2": theme === currentTheme(),
                  }}
                  on:click={() => {
                    setTheme(theme);
                    setCurrentTheme(theme);
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
        <div class="toast">
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
