import { hatsuon } from "#/util/hatsuon";
import { useAnkiField } from "../shared/Context";

export default function Pitches() {
  const { ankiFields, ankiFieldNodes } = useAnkiField<"back">();

  const tempDiv = document.createElement("div");
  ankiFieldNodes.PitchPosition.forEach((node) => {
    tempDiv.appendChild(node);
  });
  const pitchNumber = Array.from(tempDiv.querySelectorAll("span"))
    .filter((el) => {
      return !Number.isNaN(Number(el.innerText));
    })
    .map((el) => {
      return Number(el.innerText);
    });

  const kana = ankiFields.ExpressionFurigana
    ? ankiFields["kana:ExpressionFurigana"]
    : ankiFields.ExpressionReading;
  return pitchNumber.map((pitchNum, index) => {
    return <Pitch kana={kana} pitchNum={pitchNum} index={index} />;
  });
}

function Pitch(props: { kana: string; pitchNum: number; index: number }) {
  const pitchInfo = hatsuon({ reading: props.kana, pitchNum: props.pitchNum });
  const isEven = props.index % 2 === 0;

  return (
    <div class="flex items-start gap-1 animate-fade-in-sm">
      <div data-is-even={isEven}>
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
