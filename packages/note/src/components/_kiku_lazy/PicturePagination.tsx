import { useCardStore } from "../shared/Context";
import { useFieldGroup } from "../shared/FieldGroupContext";
import { ArrowLeftIcon } from "./Icons";

export default function PicturePagination() {
  const [card, setCard] = useCardStore();
  const { group, nextGroup, prevGroup, groupIds } = useFieldGroup();

  return (
    card.pictures.length > 1 && (
      <>
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 hover:scale-110 transition-transform"
          on:click={() => {
            prevGroup();
            // setCard("pictureIndex", (prev) => {
            //   const newIndex =
            //     (prev - 1 + card.pictures.length) % card.pictures.length;
            //   //TODO: auto play audio
            //   // const a = card.sentenceAudios;
            //   // a?.[newIndex]?.click();
            //   return newIndex;
            // });
          }}
        ></ArrowLeftIcon>
        {`${group.index + 1} / ${groupIds.size}`}
        <ArrowLeftIcon
          class="cursor-pointer size-5 sm:size-8 rotate-180 hover:scale-110 transition-transform"
          on:click={() => {
            nextGroup();
            // setCard("pictureIndex", (prev) => {
            //   const newIndex = (prev + 1) % card.pictures.length;
            //   //TODO: auto play audio
            //   // const a = card.sentenceAudios;
            //   // a?.[newIndex]?.click();
            //   return newIndex;
            // });
          }}
        ></ArrowLeftIcon>
      </>
    )
  );
}
