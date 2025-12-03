import { useNavigationTransition } from "#/util/hooks";
import HeaderLayout from "./HeaderLayout";
import { ArrowLeftIcon } from "./Icons";

export default function HeaderKanjiPage() {
  const { navigate, navigateBack } = useNavigationTransition();

  return (
    <HeaderLayout>
      <div class="flex flex-row justify-between items-center">
        <div class="h-5">
          <ArrowLeftIcon
            class="h-full w-full cursor-pointer text-base-content-soft"
            on:click={navigateBack}
          ></ArrowLeftIcon>
        </div>
        <div class="flex flex-row gap-2 items-center"></div>
      </div>
    </HeaderLayout>
  );
}
