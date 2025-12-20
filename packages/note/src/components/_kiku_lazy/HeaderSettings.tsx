import { useNavigationTransition } from "#/util/hooks";
import { useGeneralContext } from "../shared/GeneralContext";
import HeaderLayout from "./HeaderLayout";
import { ArrowLeftIcon, RefreshCwIcon } from "./Icons";

export default function HeaderSettings() {
  const [$general, $setGeneral] = useGeneralContext();
  const { navigateBack } = useNavigationTransition();

  $general.useCheckAnkiConnect();

  return (
    <HeaderLayout>
      <div class="h-5">
        <ArrowLeftIcon
          class="h-full w-full cursor-pointer text-base-content-soft"
          on:click={() => {
            navigateBack();
          }}
        />
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
                  await $general.checkAnkiConnect();
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
