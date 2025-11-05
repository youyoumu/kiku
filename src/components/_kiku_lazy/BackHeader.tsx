import { nextTheme } from "#/util/theme";
import { useAnkiField, useConfig } from "../shared/Context";
import { BoltIcon, CircleChevronDownIcon, PaintbrushIcon } from "./Icons";
import { capitalize } from "./util/general";

export default function BackHeader(props: { onSettingsClick?: () => void }) {
  const [config, setConfig] = useConfig();
  const { ankiFields, ankiFieldNodes } = useAnkiField<"back">();

  return (
    <>
      <div class="flex gap-2 items-center animate-fade-in-sm">
        <BoltIcon
          class="size-5 cursor-pointer text-base-content-soft"
          on:click={props.onSettingsClick}
        ></BoltIcon>
        <div
          class="flex gap-2 items-center cursor-pointer"
          on:click={() => {
            setConfig("theme", nextTheme());
          }}
        >
          <PaintbrushIcon class="size-5 cursor-pointer text-base-content-soft"></PaintbrushIcon>
          <div class="text-base-content-soft">{capitalize(config.theme)}</div>
        </div>
      </div>
      <div class="flex gap-2 items-center relative hover:[&_>_#frequency]:block animate-fade-in-sm z-10">
        <div class="text-base-content-soft">
          {Array.from(ankiFieldNodes.FreqSort).map((node) =>
            node.cloneNode(true),
          )}
        </div>
        {ankiFields.Frequency && (
          <>
            <CircleChevronDownIcon class="size-5 text-base-content-soft" />
            <div
              id="frequency"
              class="absolute top-0 translate-y-6 right-2 w-fit [&_li]:text-nowrap [&_li]:whitespace-nowrap bg-base-300/90 p-4 rounded-lg hidden"
            >
              {Array.from(ankiFieldNodes.Frequency).map((node) =>
                node.cloneNode(true),
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
