import { createEffect, createSignal, onMount } from "solid-js";
import h from "solid-js/h";
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
            <ExternalLinks />
          </div>
        </div>
      )}
    </div>
  );
}

function ExternalLinks() {
  const { ankiFields } = useAnkiField<"back">();

  try {
    const ExternalLinks = KIKU_STATE.plugin?.ExternalLinks;
    if (ExternalLinks) {
      return (
        <ExternalLinks
          ctx={{
            h,
            ankiFields,
          }}
          DefaultExternalLinks={DefaultExternalLinks}
        />
      );
    }
  } catch (e) {
    KIKU_STATE.logger.error(
      "Failed to render external links from plugin:",
      e instanceof Error ? e.message : e,
    );
  }
  return <DefaultExternalLinks />;
}

function DefaultExternalLinks() {
  const { ankiFields } = useAnkiField<"back">();

  return (
    <>
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
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAXRQTFRF//////39/6+v/2dn/7Oz//7+/9zc/x8f/wAA/yUl/+Li/9/f/yQk/yoq/+Tk/7u7/3h4/7+/+vr65+fn5eXl+/v77+/v5OTk8vLy9PT01tbWx8fH0NDQ6+vr4eHhZmZmWVlZZ2dn4+PjnZ2dV1dXWFhYqqqqzMzMc3NzUVFRS0tLTk5OZGRkqamp9vb23d3dVFRURUVFVVVV4ODgkpKSRERERkZGWlpaUFBQTU1NSEhIl5eXVlZWR0dHYmJitLS019fXysrKhoaGSkpKxMTEzc3Nfn5+g4ODfX19v7+/7Ozs2NjYUlJSnJyc3Nzc3t7ei4uL/v7+zs7OXFxc5ubm6urqnp6ecnJyjo6O/f39+Pj4wMDApqamU1NTZWVlgoKCdnZ2a2tr6enpioqKQkJCbW1t1dXVxcXFgYGBsrKyy8vLX19flpaW/Pz80dHR+fn5xsbGlZWV29vbSUlJwsLCm5ub8/Pzvr6+2tra9fX139/f7e3tX4KuCgAAAVZJREFUeJxjZCAAGOmngBEEfuNRwAZS8A2PAm7GP6yMn/AoYOViZHxPkSOFGBn/M71mEGNkYHwhCXLPYzQFciDBewzKjAhwCUWBPkjoLIMJI+Mn/v9MjH8ZWBivv0NRwMzC9h2o4C8nM0T/r3eSe7Aq4PksupuBQVL3w2+xc6+xKWAQPwsS9/z1mYNnG1YFXEdBfG/GV+/4z2JVILMZxPd7xPZHdiNWBfKM64H8oJvcsoxrsClg/aa5GsgPe/Bb7fol7N6UPmrDyHhK4qfaEuzhoHwWGFonRb4YMM7DqoBV9+I3K4aLHBqMs9CCmu3dr0dgb14PPWvyQnLLY9TIyjr/1/TVapAC6ykMDLlP1qNEt5Cz5Ke7X8TVJ8IUIAGwAu+HPP9+6whPYADGJoNNP6aColvqe3/4PF3OwFD64rLaKkwFZYxAr7WDWF4GDIytmArwATooAAA9VoEhkeDABAAAAABJRU5ErkJggg=="
          alt="JPDB"
        />
      </a>

      <a
        href={`https://jisho.org/search/${ankiFields.Expression}`}
        target="_blank"
      >
        <img
          class="size-5 object-contain rounded-xs"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAFpQTFRFVtkm////+f73vPCpXdovWtort++j+P32u++osu2c9Pvx6vjl9Pvy9Pry2u/S5vTh4vLcSLYgR7Qfa79M6/bmc8JWR7QgU9Alf8pjfspiUs4kVc0pVM0nVtgmNSyDBQAAAH5JREFUeJxjZCAAGEcVwBXAFTEyMv5hYGVk/AUT+I+mgIGB/QcD5w8EF1MB5zcG7m/4FACFeL4SUMD7ZVQBDgV8MD7jJ7AC/n8wgU8QBYJwBYyMbxj42Rh/wwTeo6cHccYXDJKMz5CF0BKM9FMGmScMeBTIPgYhPAowwWBQAADBWTUhzGucIAAAAABJRU5ErkJggg=="
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
    </>
  );
}
