import { PlayIcon } from "lucide-solid";

export function NotePlayIcon(props: { "on:click"?: () => void }) {
  return (
    <PlayIcon
      class="bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer"
      on:click={props["on:click"]}
    />
  );
}
