import { useAnkiField } from "../shared/Context";
import { InfoIcon } from "./Icons";

export default function BackFooter(props: { tags: string[] }) {
  const { ankiFields } = useAnkiField<"back">();

  return (
    <>
      {ankiFields.MiscInfo && (
        <div
          class={`flex gap-2 items-center justify-center bg-base-200 p-2 rounded-lg animate-fade-in misc-info`}
        >
          <InfoIcon class="h-5 w-5 text-base-content-calm" />
          <div
            class="text-base-content-calm"
            innerHTML={ankiFields.MiscInfo}
          ></div>
        </div>
      )}
      <div class="flex gap-2 items-center justify-center animate-fade-in flex-wrap">
        {props.tags.map((tag) => {
          return <div class="badge badge-secondary">{tag}</div>;
        })}
      </div>
    </>
  );
}
