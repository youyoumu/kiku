import { onMount } from "solid-js";
import { useNavigationTransition } from "#/util/hooks";
import { useBreakpointContext } from "../shared/BreakpointContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useGeneralContext } from "../shared/GeneralContext";
import HeaderLayout from "./HeaderLayout";
import { ArrowLeftIcon, RefreshCwIcon } from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";

export default function HeaderSettings() {
  const [$general, $setGeneral] = useGeneralContext();
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
    <HeaderLayout>
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
    </HeaderLayout>
  );
}
