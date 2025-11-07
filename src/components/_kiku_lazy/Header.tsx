import { createSignal, onMount } from "solid-js";
import { nextTheme } from "#/util/theme";
import { useAnkiField, useConfig } from "../shared/Context";
import { BoltIcon, CircleChevronDownIcon, PaintbrushIcon } from "./Icons";
import { capitalize } from "./util/general";

export default function Header(props: {
  onSettingsClick?: () => void;
  side: "back" | "front";
}) {
  const [config, setConfig] = useConfig();
  const [initDelay, setInitDelay] = createSignal<number | null>(null);

  onMount(() => {
    setTimeout(() => {
      if (window.KIKU_STATE.initDelay)
        setInitDelay(window.KIKU_STATE.initDelay);
    }, 200);
  });

  return (
    <>
      <div class="flex gap-2 items-center animate-fade-in-sm">
        <BoltIcon
          class="size-5"
          classList={{
            "text-base-content-soft cursor-pointer": props.side === "back",
            "text-base-content-subtle-100": props.side === "front",
          }}
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
        <div class="text-base-content-soft bg-warning/10 rounded-sm px-1 text-sm">
          {initDelay()}
          {initDelay() && "ms"}
        </div>
      </div>
      <div class="flex gap-2 items-center relative hover:[&_>_#frequency]:block animate-fade-in-sm z-10">
        {props.side === "back" && <Frequency />}
      </div>
    </>
  );
}

function Frequency() {
  const { ankiFields } = useAnkiField<"back">();
  return (
    <>
      <div class="text-base-content-soft" innerHTML={ankiFields.FreqSort}></div>
      {ankiFields.Frequency && (
        <>
          <CircleChevronDownIcon class="size-5 text-base-content-soft" />
          <div
            id="frequency"
            class="absolute top-0 translate-y-6 right-2 w-fit [&_li]:text-nowrap [&_li]:whitespace-nowrap bg-base-300/90 p-4 rounded-lg hidden"
            innerHTML={ankiFields.Frequency}
          ></div>
        </>
      )}
    </>
  );
}
