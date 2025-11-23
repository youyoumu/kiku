import { useCardContext } from "../shared/CardContext";
import { useFieldGroupContext } from "../shared/FieldGroupContext";
import { ArrowLeftIcon } from "./Icons";

export default function PicturePagination() {
  const { $group, $next, $prev } = useFieldGroupContext();
  const [$card, $setCard] = useCardContext();

  return (
    $group.ids.size > 1 && (
      <>
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 hover:scale-110 transition-transform"
          on:click={() => {
            $prev();
            const el = $card.sentenceAudios?.[0];
            if (el) {
              el.click();
              if (el instanceof HTMLAudioElement) el.play();
            }
          }}
        ></ArrowLeftIcon>
        {`${$group.index + 1} / ${$group.ids.size}`}
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 rotate-180 hover:scale-110 transition-transform"
          on:click={() => {
            $next();
            const el = $card.sentenceAudios?.[0];
            if (el) {
              el.click();
              if (el instanceof HTMLAudioElement) el.play();
            }
          }}
        ></ArrowLeftIcon>
      </>
    )
  );
}
