import { createEffect, createSignal, onMount } from "solid-js";
import { useAnkiField, useConfig } from "../shared/Context";
import Sentence from "./Sentence";

export default function BackBody(props: {
  onDefinitionPictureClick?: (picture: string) => void;
}) {
  let definitionEl: HTMLDivElement | undefined;
  const { ankiFields } = useAnkiField<"back">();
  const [config] = useConfig();
  const [definitionPage, setDefinitionPage] = createSignal(
    ankiFields.SelectionText ? 0 : 1,
  );
  const [definitionPicture, setDefinitionPicture] = createSignal<string>();

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
    <div
      class="flex sm:flex-col gap-8 animate-fade-in"
      classList={{
        "flex-col-reverse": config.swapSentenceAndDefinitionOnMobile,
        "flex-col": !config.swapSentenceAndDefinitionOnMobile,
      }}
    >
      <div class="flex justify-between gap-2 items-center text-center">
        <Sentence />
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
          <div class="flex justify-end py-2 gap-2">
            <a
              href={(() => {
                const url = new URL("https://jpdb.io/search");
                url.searchParams.set("q", ankiFields.Expression);
                return url.toString();
              })()}
              target="_blank"
            >
              <img
                class="size-5 object-contain rounded-xs"
                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAgACADASIAAhEBAxEB/8QAGQAAAwADAAAAAAAAAAAAAAAABQYHAAME/8QALhAAAQMDAgMECwAAAAAAAAAAAQIDBAAFEQYSEzFBIVFhoQcUFiIyN3F0gZGx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECEVEh8f/aAAwDAQACEQMRAD8Asp7BQ6xXdV6gqkqgyIZS6pvhvpwTjr5/sGiCyQ2ojmAan9o1PeZXo8ut1embpkd7a07w0DaMI6AYPM9KlOzalFQaa7uelCrKQYftpedOtXdq8tx1hoqbYDCSXcdVHGATjljHKmDRt/XqOwIlvJSl9tZad2jAKgAcj6giqYDbpAZWScAJNSuwfKa+fcH+N1RL7ZU32EmIubKio3ZWY69pWMEbT3jtrQNK21vTblhZDjUVwe8pKhvJyCTkjn2d1AKlmu2pYekY0OJY1TOKyRGlNuDCQc/EnHMfjpTJomwO6e0+mLJx6w64XXQDkJJAGM+AA86LWu3NWm2sQGFLU2wnalSyCojxxXXQH//Z"
                alt="JPDB"
              />
            </a>

            <a
              href={`https://jisho.org/search/${ankiFields.Expression}`}
              target="_blank"
            >
              <img
                class="size-5 object-contain rounded-xs"
                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAUGBAL/xAAhEAACAgMAAQUBAAAAAAAAAAABAgMEAAURBhUhIkFRof/EABcBAQADAAAAAAAAAAAAAAAAAAABBQb/xAAfEQABAwQDAQAAAAAAAAAAAAACAAEDBAUREhMhQTH/2gAMAwEAAhEDEQA/AG+GVfi1OrY1kjz1oZWExALoGPOL+5v2uroel2WWpCjJEzqyIFIIHfrM2FvM4uRn8yqMaMij3Z1C4Zc6rV0PS6zNUhdnjVmZ0DEkjv3mHymnVr6yN4K0MTGYAlECnnG/MHbzCLkd/MoVGQx7u648Z2VGnrpI7NuGFzMWCu4B5we/8xlc2uvta+3FBdgkkMD8VZASfifrIXDEdwII2j16UhWEIaYVzS2mvq66pFPdgjkECdVpACPiMXeTbKjc10cda3DM4mDFUcE84ff+5L4YkuBHG8evXxDrHINML//Z"
                alt="Jisho"
              />
            </a>
            <a
              href={(() => {
                const url = new URL("https://www.google.co.jp/search");
                url.searchParams.set("q", ankiFields.Expression);
                return url.toString();
              })()}
              target="_blank"
            >
              <img
                class="size-5 object-contain rounded-xs"
                src="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAAE3ElEQVRYhc2XW2xUVRSGv30uU9rTMhUaCuVixQSMpLYmPIhYwAcTIyKFROI1KQmkxBgj8UEf5MEYiSYmPvhAfCASY02MUaFEHjSRQYtGNDAqIhKxQJVeodPLMJ2Zc/by4cz91tZ4+5Od2Wf2Xuv/z9lrr722EhFmiTagA9gEbCwz5wQQAg4D4Vl5FZGZWqeIhGXuCKdsK/qvNNgsIqG/QFyIUMrXnAR0iEjkbyBPI5LyWcSlpDgGOoG3S67XV71wshd+CMPwEAiAAShoXIy0tsL6dtS6u8qt+E7gUO4fhQI6gI+LzM6ehjf2w9AQJC1QgCi/KRMwQZmIYSLKRBYvwXj2KVTLmlIituEHaZGAZvzIDeZN/+BVOPwhTAX850QgS44CZWWaoBDTRgzbd77lfoxdTxYKGMffUZfA/35pHCoif+8F+Pxdvx/wSr1NPpSR/3z2HERvFM4KkrMMaYtOCvf2p8/A5W5ouAHz4+AkoDoJpguGB6QEpT6GAKJUVsstKzBe2QdOTSmpG1OcmSUIA62Z4eEeCD0BV+pgnoahOhhwwBCwVsL23bCuHZxaf340Cl9/g+5+H0YjcOvKSuRpfA+0KRFpA87kDX2xCgYHIWpDNOALmLLhju2w4/kscSGiUeTIMdTWzTORp3GnhR/5WYwdhUA/NBhQKzDtQZUHddvhkZcru3Mc1GMPz4Y4jQ4LP7dnETkK8wywACVgu2DUwQOvzcXxbLHJojD4pnuz/WoBF1j2KATyN0ga310p41pAkc0xCqEpqFhcr3JnbbSK7OJ9oAyUpcAEAsDSLWVfYXd3OQGFGVaxpx262vP/Ldi4KelCZk+LoWDeirICykKpbEs/l0CRABGd7aeMhNLGcxJTxk/xFxAN4uJpl6R4TIuLG79U0b+gEbxU06TSUqpVRlEMEGhGJy4zJRpLmVzXHtWRIzTUbSjpoOueNInK++35EQbGZ+THwi+jMjtB17bjXesDDKLaT7f9I+9Q37QPy6wvcrCnXeWQ+5ichu5v08IkM7725iLzEwZ+DZeB1G9lVAv9nseg1vziac7EJ/nk1z0zv04KB89EGXVjRO0pkkYCVyVJGgnWFsdyyCDnbAaw6zsYtldwUQtXtTCshUEx+HL0Mw5e2MuUO1mR/MBPf7A//DvjNcNMVI8QC0zhGR4PtZQM5MMlD6OJiRDHz91LRBTjYtAnDtd1DWPikAi0squ5i/sa1hO0nIynnoGLvHn+Ar0DMQKx5VhuNbZbg5MIYno2x3fXsTSYJyJzGEGJMizUt5fjVw8wLjaXJciEOEyKw5DXSJwASapI6lpqzflEkh6SDEJ8CYiJii3HdB0CroMdX0BXy0Je2lAUPzuBQ7kVUYiCtNx9oYuPhnoYkIV4YjGmb2JSGnBReFKFxsbVVSgE8Rz09BJQGuJNWLEmPMOlrXYZJ7fdXkh+gtQZlJsHOvHLpQweX/UWmxp3ABCXQHZAzEzXUG6mr6yJTN+1x3lw+SKObV5dSD6e4vJtZlOUnoqc5rmfX+e32AQxCSIYCCag0NryT01dhXjVSHIBtbKUF29bx9OrVxW6ggpFaRqdlCnLj42c4uhImN6x8/RPXwMUIgYKYb5Zz93BNrY0ruHBRS0E7apSLorK8v/8YvK/vZr9a5fTUjFQDv/I9fxPxUx0d1WRkbMAAAAASUVORK5CYII="
                alt="Google"
              />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
