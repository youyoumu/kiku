import { GitPullRequestArrow } from "./Icons";

export default function MergeContextModal() {
  let dialogRef: HTMLDialogElement | undefined;

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
          <h3 class="text-lg font-bold">Hello!</h3>
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
