import { onCleanup, onMount } from "solid-js";
import { useCardContext } from "../shared/CardContext";
import { useFieldGroupContext } from "../shared/FieldGroupContext";
import { ArrowLeftIcon } from "./Icons";

export default function PicturePagination() {
  const { $group, $next, $prev } = useFieldGroupContext();
  const [$card, $setCard] = useCardContext();

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "h") onPrevClick();
      if (e.key === "l") onNextClick();
    };
    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  const onPrevClick = () => {
    if ($prev()) {
      const el = $card.sentenceAudios?.[0];
      if (el) {
        el.click();
        if (el instanceof HTMLAudioElement) el.play();
      }
    }
  };

  const onNextClick = () => {
    if ($next()) {
      const el = $card.sentenceAudios?.[0];
      if (el) {
        el.click();
        if (el instanceof HTMLAudioElement) el.play();
      }
    }
  };

  return (
    $group.ids.length > 1 && (
      <>
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 hover:scale-110 transition-transform"
          on:click={onPrevClick}
        ></ArrowLeftIcon>
        {`${$group.index + 1} / ${$group.ids.length}`}
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 rotate-180 hover:scale-110 transition-transform"
          on:click={onNextClick}
        ></ArrowLeftIcon>
      </>
    )
  );
}
