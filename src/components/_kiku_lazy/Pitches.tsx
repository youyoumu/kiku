import type { DatasetProp } from "#/util/config";
import { hatsuon } from "#/util/hatsuon";
import { useAnkiField, useCardStore } from "../shared/Context";

export default function Pitches() {
  const [card, setCard] = useCardStore();
  const { ankiFields } = useAnkiField<"back">();

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = ankiFields.PitchPosition;
  const pitchNumber = Array.from(tempDiv.querySelectorAll("span"))
    .filter((el) => {
      return !Number.isNaN(Number(el.innerText));
    })
    .map((el) => {
      return Number(el.innerText);
    });

  const kana = () => {
    if (card.nested) return ankiFields.ExpressionReading;
    return ankiFields.ExpressionFurigana
      ? ankiFields["kana:ExpressionFurigana"]
      : ankiFields.ExpressionReading;
  };

  return pitchNumber.map((pitchNum, index) => {
    return <Pitch kana={kana()} pitchNum={pitchNum} index={index} />;
  });
}

function Pitch(props: { kana: string; pitchNum: number; index: number }) {
  const pitchInfo = hatsuon({ reading: props.kana, pitchNum: props.pitchNum });
  const isEven = props.index % 2 === 0;

  const pitchDataset: DatasetProp = {
    "data-is-even": isEven ? "true" : "false",
  };

  return (
    <div class="flex items-start gap-1 animate-fade-in-sm">
      <div {...pitchDataset}>
        {pitchInfo.morae.map((mora, i) => {
          return (
            <span
              classList={{
                "border-primary": isEven,
                "border-secondary": !isEven,
                "border-t-2": pitchInfo.pattern[i] === 1,
                "pitch-segment":
                  pitchInfo.pattern[i] === 1 && pitchInfo.pattern[i + 1] === 0,
              }}
            >
              {mora}
            </span>
          );
        })}
      </div>
      <div
        class="text-sm px-0.5 rounded-sm leading-tight"
        classList={{
          "bg-primary": isEven,
          "bg-secondary": !isEven,
          "text-primary-content": isEven,
          "text-secondary-content": !isEven,
        }}
      >
        {pitchInfo.pitchNum}
      </div>
    </div>
  );
}
