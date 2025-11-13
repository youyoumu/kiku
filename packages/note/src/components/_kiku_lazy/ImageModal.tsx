import { createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import type { DatasetProp } from "#/util/config";

export default function ImageModal(props: {
  img: string | undefined;
  "on:click"?: () => void;
}) {
  const [showModal, setShowModal] = createSignal(false);
  const [transparent, setTransparent] = createSignal(true);

  let id: number;
  createEffect(() => {
    if (id) clearTimeout(id);
    if (props.img) {
      setShowModal(true);
      setTimeout(() => {
        setTransparent(false);
      }, 0);
    } else {
      setTransparent(true);
      id = setTimeout(() => {
        setShowModal(!!props.img);
      }, 200);
    }
  });

  const pictureModalDataset: () => DatasetProp = () => ({
    "data-modal-hidden": showModal() ? "false" : "true",
    "data-modal-transparent": transparent() ? "true" : "false",
  });

  return (
    <Portal mount={KIKU_STATE.root}>
      <div
        class="picture-modal"
        on:click={props["on:click"]}
        {...pictureModalDataset()}
        innerHTML={props.img}
      ></div>
    </Portal>
  );
}
