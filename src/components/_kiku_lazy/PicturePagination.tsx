import { useCardStore } from "../shared/Context";
import { ArrowLeftIcon } from "./Icons";

export default function PicturePagination() {
  const [card, setCard] = useCardStore();

  return (
    card.pictures.length > 1 && (
      <>
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 hover:scale-110 transition-transform"
          on:click={() => {
            setCard("pictureIndex", (prev) => {
              const newIndex =
                (prev - 1 + card.pictures.length) % card.pictures.length;
              const a = card.sentenceAudios;
              a?.[newIndex]?.click();
              return newIndex;
            });
          }}
        ></ArrowLeftIcon>
        {`${card.pictureIndex + 1} / ${card.pictures.length}`}
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 rotate-180 hover:scale-110 transition-transform"
          on:click={() => {
            setCard("pictureIndex", (prev) => {
              const newIndex = (prev + 1) % card.pictures.length;
              const a = card.sentenceAudios;
              a?.[newIndex]?.click();
              return newIndex;
            });
          }}
        ></ArrowLeftIcon>
      </>
    )
  );
}
