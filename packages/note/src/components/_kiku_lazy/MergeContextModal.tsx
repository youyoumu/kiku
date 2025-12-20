import { onMount } from "solid-js";
import {
  useFieldGroupContext,
  useRootFieldGroupContext,
} from "../shared/FieldGroupContext";
import { GitPullRequestArrow } from "./Icons";

export default function MergeContextModal() {
  let dialogRef: HTMLDialogElement | undefined;
  const { $group: $rootGroup, ankiFields: rootAnkiFields } =
    useRootFieldGroupContext();
  const { $group, ankiFields } = useFieldGroupContext();

  onMount(() => {
    if (dialogRef) {
      dialogRef.showModal();
    }
  });

  return (
    <>
      <GitPullRequestArrow
        class="size-5 cursor-pointer text-base-content-soft"
        on:click={() => {
          if (dialogRef) {
            dialogRef.showModal();
          }
        }}
      />

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
