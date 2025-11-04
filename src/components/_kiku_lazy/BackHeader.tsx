import { BoltIcon, CircleChevronDownIcon, PaintbrushIcon } from "lucide-solid";
import type { AnkiBackFields } from "#/types";
import { capitalize } from "#/util/general";
import { nextTheme } from "#/util/theme";
import { useAnkiField, useConfig } from "../shared/Context";

export default function BackHeader(props: { onSettingsClick?: () => void }) {
  const [config, setConfig] = useConfig();
  const ankiFields = useAnkiField() as AnkiBackFields;

  return (
    <>
      <div class="flex gap-2 items-center">
        <BoltIcon
          class="h-full w-full cursor-pointer text-base-content/50"
          on:click={props.onSettingsClick}
        ></BoltIcon>
        <PaintbrushIcon
          class="h-full w-full cursor-pointer text-base-content/50"
          on:click={() => {
            setConfig("theme", nextTheme());
          }}
        ></PaintbrushIcon>
        <div class="text-base-content/50">{capitalize(config.theme)}</div>
      </div>
      <div class="flex gap-2 items-center relative hover:[&_>_#frequency]:block">
        <div innerHTML={ankiFields.FreqSort} class="text-base-content/50"></div>
        {ankiFields.Frequency && (
          <>
            <CircleChevronDownIcon class="h-full w-full text-base-content/50" />
            <div
              id="frequency"
              class="absolute z-10 top-0 translate-y-6 right-2 w-fit [&_li]:text-nowrap [&_li]:whitespace-nowrap bg-base-300/90 p-4 rounded-lg hidden"
              innerHTML={ankiFields.Frequency}
            ></div>
          </>
        )}
      </div>
    </>
  );
}
