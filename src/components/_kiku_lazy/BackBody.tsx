import { createEffect, createSignal, onMount } from "solid-js";
import { useAnkiField, useConfig } from "../shared/Context";

export default function BackBody(props: {
  onDefinitionPictureClick?: (picture: string) => void;
  sentenceIndex?: (sentencesLenght: number) => number | undefined;
}) {
  let sentenceEl: HTMLDivElement | undefined;
  let definitionEl: HTMLDivElement | undefined;
  const [config] = useConfig();
  const { ankiFields } = useAnkiField<"back">();
  const [definitionPage, setDefinitionPage] = createSignal(
    ankiFields.SelectionText ? 0 : 1,
  );
  const [definitionPicture, setDefinitionPicture] = createSignal<string>();
  const [sentences, setSentences] = createSignal<HTMLSpanElement[]>([]);

  const pages = [
    ankiFields.SelectionText,
    ankiFields.MainDefinition,
    ankiFields.Glossary,
  ];
  const pagesWithContent = pages.filter((page) => page?.trim());

  const pageType = () => {
    if (definitionPage() === 0) return "Selection Text";
    if (definitionPage() === 1) return "Main Definition";
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
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = ankiFields.DefinitionPicture;
    setDefinitionPicture(tempDiv.querySelector("img")?.outerHTML ?? "");

    if (sentenceEl) {
      const ruby = sentenceEl.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }

    if (definitionEl) {
      const spans = Array.from(definitionEl.querySelectorAll("span")).filter(
        (el) => {
          return getComputedStyle(el).backgroundColor === "rgb(86, 86, 86)";
        },
      );
      spans.forEach((el) => {
        el.dataset.jitendexTag = "true";
      });

      const i = Array.from(definitionEl.querySelectorAll("i")).filter((el) => {
        return el.innerHTML.includes("Jitendex.org");
      });
      i.forEach((el) => {
        el.dataset.jitendexI = "true";
      });
    }

    if (sentenceEl) {
      const spans = Array.from(sentenceEl.querySelectorAll("span")).filter(
        (el) => el.parentNode === sentenceEl,
      );
      spans.forEach((span, index) => {
        span.dataset.index = index.toString();
      });
      setSentences(spans);
    }
  });

  createEffect(() => {
    const sentencesIndex = props.sentenceIndex?.(sentences().length);
    if (typeof sentencesIndex === "number") {
      sentences().forEach((span) => {
        span.style.display =
          span.dataset.index === sentencesIndex.toString() ? "block" : "none";
      });
    }
  });

  createEffect(() => {
    definitionPage();
    if (definitionEl) {
      const spans = Array.from(definitionEl.querySelectorAll("span")).filter(
        (el) => {
          return getComputedStyle(el).backgroundColor === "rgb(86, 86, 86)";
        },
      );
      spans.forEach((el) => {
        el.dataset.jitendexTag = "true";
      });

      const i = Array.from(definitionEl.querySelectorAll("i")).filter((el) => {
        return el.innerHTML.includes("Jitendex.org");
      });
      i.forEach((el) => {
        el.dataset.jitendexI = "true";
      });
    }
  });

  return (
    <div class="flex sm:flex-col gap-8 flex-col-reverse animate-fade-in">
      <div class="flex justify-between gap-2 items-center text-center">
        <div
          class={`[&_b]:text-base-content-primary sentence font-secondary flex-1`}
          ref={sentenceEl}
          innerHTML={
            ankiFields["furigana:SentenceFurigana"]
              ? ankiFields["furigana:SentenceFurigana"]
              : ankiFields["kanji:Sentence"]
          }
        ></div>
      </div>
      {pagesWithContent.length > 0 && (
        <div>
          {pagesWithContent.length > 1 && (
            <div class="text-end text-base-content-soft">{pageType()}</div>
          )}
          <div class="relative bg-base-200 p-4 border-s-4 border-primary text-base sm:text-xl rounded-lg [&_ol]:list-inside [&_ul]:list-inside">
            <div class="overflow-auto" ref={definitionEl}>
              {ankiFields.DefinitionPicture && (
                <div
                  class="max-w-1/3 float-right [&_img]:rounded-sm ps-2 cursor-pointer"
                  on:click={() => {
                    const picture = definitionPicture();
                    if (picture) props.onDefinitionPictureClick?.(picture);
                  }}
                  innerHTML={definitionPicture()}
                ></div>
              )}
              <div class="contents" innerHTML={pages[definitionPage()]}></div>
            </div>
            {pagesWithContent.length > 1 && (
              <>
                <div
                  class="cursor-pointer w-8 h-full absolute top-0 left-0 hover:bg-base-content/10"
                  on:click={() => changePage(-1)}
                ></div>
                <div
                  class="cursor-pointer w-8 h-full absolute top-0 right-0 hover:bg-base-content/10"
                  on:click={() => changePage(1)}
                ></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
