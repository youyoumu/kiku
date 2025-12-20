import { Match, onMount, Switch } from "solid-js";
import { useBreakpointContext } from "../shared/BreakpointContext";
import {
  useFieldGroupContext,
  useRootFieldGroupContext,
} from "../shared/FieldGroupContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { GitPullRequestArrow, RefreshCwIcon } from "./Icons";

export default function MergeContextModal() {
  let dialogRef: HTMLDialogElement | undefined;
  const [$general] = useGeneralContext();
  const { $group: $rootGroup, ankiFields: rootAnkiFields } =
    useRootFieldGroupContext();
  const { $group, ankiFields } = useFieldGroupContext();
  const bp = useBreakpointContext();

  onMount(async () => {
    if (dialogRef) {
      dialogRef.showModal();
    }

    if (!bp.isAtLeast("sm")) return;
    await $general.checkAnkiConnect();
  });

  return (
    <>
      <Switch>
        <Match when={$general.isAnkiConnectAvailable}>
          <GitPullRequestArrow
            class="size-4 cursor-pointer text-base-content-soft"
            on:click={() => {
              if (dialogRef) {
                dialogRef.showModal();
              }
            }}
          />
        </Match>
        <Match when={!$general.isAnkiConnectAvailable}>
          <div class="indicator">
            <div class="place-items-center">
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
            </div>
            <span class="status status-error animate-ping"></span>
          </div>
        </Match>
      </Switch>

      <dialog class="modal" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">Merge Context</h3>

          <div>
            <h4 class="font-bold">Origin</h4>
            <div>
              <div>Sentence</div>
              <pre class="text-xs bg-base-200 p-2 rounded-sm overflow-auto max-h-[90svh]">
                {$rootGroup.sentenceField}
              </pre>
              <div>SentenceAudio</div>
              <pre class="text-xs bg-base-200 p-2 rounded-sm overflow-auto max-h-[90svh]">
                {$rootGroup.sentenceAudioField}
              </pre>
              <div>Picture</div>
              <pre class="text-xs bg-base-200 p-2 rounded-sm overflow-auto max-h-[90svh]">
                {$rootGroup.pictureField}
              </pre>
            </div>
          </div>
          <div>{$group.pictureField}</div>

          <p class="py-4">Press ESC key or click the button below to close</p>
          <div class="modal-action">
            <form method="dialog">
              <button class="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
