import { createSignal, onMount } from "solid-js";
import { useAnkiField, useConfig } from "../shared/Context";

export default function BackBody(props: {
  onDefinitionPictureClick?: (node: Node) => void;
}) {
  let sentenceEl: HTMLDivElement | undefined;
  const [config] = useConfig();
  const { ankiFields, ankiFieldNodes } = useAnkiField<"back">();
  const [definitionPage, setDefinitionPage] = createSignal(
    ankiFields.SelectionText ? 0 : 1,
  );

  const pages = [
    ankiFields.SelectionText,
    ankiFields.MainDefinition,
    ankiFields.Glossary,
  ];
  const pagesWithContent = pages.filter((page) => page?.trim());

  const pageNodes = [
    ankiFieldNodes.SelectionText,
    ankiFieldNodes.MainDefinition,
    ankiFieldNodes.Glossary,
  ];

  const pageNode = () => pageNodes[definitionPage()];
  const pageType = () => {
    if (definitionPage() === 0) return "Selection text";
    if (definitionPage() === 1) return "Main definition";
    if (definitionPage() === 2) return "Glossary";
  };

  function changePage(direction: 1 | -1) {
    setDefinitionPage((prev) => {
      let next = (prev + direction + pages.length) % pages.length;
      for (let i = 0; i < pages.length; i++) {
        if (pages[next]?.trim()) break;
        next = (next + direction + pages.length) % pages.length;
      }
      return next;
    });
  }

  onMount(() => {
    if (sentenceEl) {
      const ruby = sentenceEl.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }
  });

  const tempDiv = document.createElement("div");
  ankiFieldNodes.DefinitionPicture.forEach((node) => {
    tempDiv.appendChild(node);
  });
  const definitionPicture = tempDiv.querySelector("img");

  return (
    <div class="flex sm:flex-col gap-8 flex-col-reverse animate-fade-in">
      <div class="flex flex-col gap-4 items-center text-center">
        <div
          class={`[&_b]:text-base-content-primary ${config.fontSizeBaseSentence} ${config.fontSizeSmSentence}`}
          ref={sentenceEl}
        >
          {ankiFields["furigana:SentenceFurigana"]
            ? Array.from(ankiFieldNodes["furigana:SentenceFurigana"])
            : Array.from(ankiFieldNodes["kanji:Sentence"])}
        </div>
      </div>
      {pagesWithContent.length > 0 && (
        <div>
          {pagesWithContent.length > 1 && (
            <div class="text-end text-base-content-soft">{pageType()}</div>
          )}
          <div class="relative bg-base-200 p-4 border-s-4 border-primary text-base sm:text-xl rounded-lg [&_ol]:list-inside [&_ul]:list-inside">
            <div class="overflow-auto">
              {ankiFields.DefinitionPicture && (
                <div
                  class="max-w-1/3 float-end [&_img]:rounded-sm ps-2 cursor-pointer"
                  on:click={() =>
                    definitionPicture &&
                    props.onDefinitionPictureClick?.(definitionPicture)
                  }
                >
                  {definitionPicture}
                </div>
              )}
              {Array.from(pageNode()).map((node) => node.cloneNode(true))}
            </div>
            {pagesWithContent.length > 1 && (
              <>
                <button
                  class="cursor-pointer w-8 h-full absolute top-0 left-0 hover:bg-base-content/10"
                  on:click={() => changePage(-1)}
                ></button>
                <button
                  class="cursor-pointer w-8 h-full absolute top-0 right-0 hover:bg-base-content/10"
                  on:click={() => changePage(1)}
                ></button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
