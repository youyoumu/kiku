import { useSentenceField } from "#/util/hooks";
import { useAnkiField, useCardStore } from "../shared/Context";

export function SentenceBack() {
  const { ankiFields } = useAnkiField<"back">();
  const [card, setCard] = useCardStore();
  useSentenceField();

  const innerHTML = () => {
    if (card.nested) return ankiFields.Sentence;
    return ankiFields["furigana:SentenceFurigana"]
      ? ankiFields["furigana:SentenceFurigana"]
      : ankiFields["kanji:Sentence"];
  };

  return (
    <div
      class={`[&_b]:text-base-content-primary sentence font-secondary flex-1`}
      ref={(ref) => setCard("sentenceFieldRef", ref)}
      innerHTML={innerHTML()}
    ></div>
  );
}
