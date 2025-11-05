export default function ImageModal(props: {
  img: Node;
  "on:click"?: () => void;
  show: boolean;
}) {
  return (
    <div
      class="absolute z-20 top-0 left-0 w-full h-full p-4 sm:p-8 bg-black/75 bg-opacity-50 flex justify-center items-center"
      classList={{
        hidden: !props.show,
      }}
      on:click={props["on:click"]}
    >
      {props.img}
    </div>
  );
}
