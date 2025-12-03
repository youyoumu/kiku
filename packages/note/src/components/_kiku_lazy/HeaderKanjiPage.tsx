import { useNavigationTransition } from "#/util/hooks";
import { useCardContext } from "../shared/CardContext";
import HeaderLayout from "./HeaderLayout";
import { ArrowLeftIcon } from "./Icons";

export default function HeaderKanjiPage() {
  const [$card, $setCard] = useCardContext();
  const navigate = useNavigationTransition();

  return (
    <HeaderLayout>
      <div class="flex flex-row justify-between items-center">
        <div class="h-5">
          <ArrowLeftIcon
            class="h-full w-full cursor-pointer text-base-content-soft"
            on:click={() => {
              if ($card.query.selectedSimilarKanji) {
                navigate(
                  () => $setCard("query", { selectedSimilarKanji: undefined }),
                  "back",
                );
              } else {
                navigate("main", "back");
              }
            }}
          ></ArrowLeftIcon>
        </div>
        <div class="flex flex-row gap-2 items-center"></div>
      </div>
    </HeaderLayout>
  );
}
