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

  const groupId = () => $group.ids[$group.index];

  const date = () => {
    const ms = Number(groupId());
    const MIN = Date.UTC(2000, 0, 1); // 2000-01-01
    const MAX = Date.UTC(2100, 0, 1); // 2100-01-01 (exclusive)
    if (ms < MIN || ms >= MAX) return null;
    return new Date(ms).toLocaleDateString();
  };

  return (
    $group.ids.length > 1 && (
      <>
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 hover:text-base-content-calm transition-colors"
          on:click={onPrevClick}
        ></ArrowLeftIcon>
        <div class="flex flex-col items-center">
          <div class="text-xs text-base-content-faint">{date()}</div>
          <div>{`${$group.index + 1} / ${$group.ids.length}`}</div>
        </div>
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 rotate-180 hover:text-base-content-calm transition-colors"
          on:click={onNextClick}
        ></ArrowLeftIcon>
      </>
    )
  );
}
