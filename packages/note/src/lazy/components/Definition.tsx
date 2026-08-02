import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { DatasetProp } from "#/src/lib/config";
import { isHtmlEffectivelyEmpty, parseHtml, removeBrInsideStyleTag } from "#/src/lib/dom";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { DefinitionPictureSection } from "./DefinitionPictureSection";
import { ExternalLinks } from "./ExternalLinks";

export function Definition() {
  const [$modalRef, $setModalRef] = createSignal<HTMLDialogElement>();
  const { $ankiFields } = useAnkiFieldContext();
  const { $config } = useConfigContext();

  const $glossary = createMemo(() => {
    // empty glossary if it's the same as main definition
    if ($ankiFields.MainDefinition === $ankiFields.Glossary) return "";
    const glossary = removeMainDefinitionFromGlossary(
      $ankiFields.Glossary,
      $ankiFields.MainDefinition,
    );
    return !isHtmlEffectivelyEmpty(glossary) ? removeBrInsideStyleTag(glossary) : "";
  });

  const $selection = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.SelectionText)
      ? removeBrInsideStyleTag($ankiFields.SelectionText)
      : "";
  });

  const $main = createMemo(() => {
    return !isHtmlEffectivelyEmpty($ankiFields.MainDefinition)
      ? removeBrInsideStyleTag($ankiFields.MainDefinition)
      : "";
  });

  const $pages = createMemo(() => {
    const p: { name: string; html: string }[] = [];
    const selection = $selection();
    const main = $main();
    const glossary = $glossary();

    if ($config.definitionStyle === "single-page") {
      const combined = [selection, main, glossary].filter(Boolean);
      if (combined.length > 0) {
        const html = combined.join('<div class="divider my-4"></div>');
        p.push({ name: "Definition", html });
      }
      return p;
    }

    if (selection) {
      p.push({ name: "Selection Text", html: selection });
    }
    if (main) {
      let name = "Main Definition";
      if ($config.definitionStyle === "glossary-split") {
        const doc = parseHtml(main);
        const li = doc.querySelector("li[data-dictionary]");
        const dictName = li?.getAttribute("data-dictionary");
        if (dictName) {
          name = `Main Definition (${dictName})`;
        }
      }
      p.push({ name, html: main });
    }

    if (!isHtmlEffectivelyEmpty(glossary)) {
      const doc = parseHtml(glossary);
      const entries = doc.querySelectorAll("li[data-dictionary]");
      if ($config.definitionStyle === "glossary-split" && entries.length > 0) {
        const styles = Array.from(doc.querySelectorAll("style"))
          .map((s) => s.outerHTML)
          .join("");
        const dictGroups = new Map<string, string>();
        for (const li of entries) {
          const dictName = li.getAttribute("data-dictionary") || "Glossary";
          const prevHtml = dictGroups.get(dictName);
          const divider = prevHtml ? '<div class="divider"></div>' : "";
          dictGroups.set(dictName, (prevHtml || "") + divider + li.outerHTML);
        }
        for (const [name, html] of dictGroups) {
          p.push({
            name: name,
            html: `<div style="text-align: left;" class="yomitan-glossary"><ol>${styles}${html}</ol></div>`,
          });
        }
      } else {
        p.push({ name: "Glossary", html: glossary });
      }
    }

    if ($config.definitionStyle === "glossary-split") {
      for (const item of p) {
        const doc = parseHtml(item.html);
        const iEl = doc.querySelector("i:first-child");
        if (!(iEl instanceof HTMLElement)) continue;
        if (iEl?.textContent === `(${item.name})`) {
          iEl.style.display = "none";
        }
        item.html = doc.body.innerHTML;
      }
    }

    return p;
  });

  let defaultIndex = 0;
  // if it's one page, it will always be index 0
  // if it's normal, can chose between selection (always 0), main, or glossary
  // if it's glossary-split, it can be any dictionnary name (even if it's in MainDefinition)
  switch ($config.definitionStyle) {
    case "normal":
      switch ($ankiFields.PreferredDictionary.toLowerCase()) {
        case "maindefinition":
        case "main":
        case "m":
          if ($selection() && $main()) {
            // main is index 1
            defaultIndex = 1
          }
          break;
        case "glossary":
        case "gloss":
        case "g":
          const isThereSelection = $selection() ? 1 : 0;
          const isThereMain = $main() ? 1 : 0;
          defaultIndex = isThereSelection + isThereMain;
          break;
      }
      break;
    case "glossary-split":
      for (let i = 0; i < $pages().length; i++) {
        const page = $pages()[i];
        if (
          page.name.toLowerCase() == $ankiFields.PreferredDictionary.toLowerCase()
          || page.name.toLowerCase() == `Main Definition (${$ankiFields.PreferredDictionary})`.toLowerCase()
        ) {
          defaultIndex = i;
          break;
        }
      }
      break;

  }

  const [$definitionIndex, $setDefinitionIndex] = createSignal(defaultIndex);
  const currentPage = () => $pages()[$definitionIndex()];

  function changePage(direction: 1 | -1) {
    if ($pages().length === 0) return;
    $setDefinitionIndex((prev) => (prev + direction + $pages().length) % $pages().length);
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === $config.keybindDefinitionPrev) changePage(-1);
      if (e.key === $config.keybindDefinitionNext) changePage(1);
    };

    window.addEventListener("keydown", handler);
    onCleanup(() => window.removeEventListener("keydown", handler));
  });

  const $definitionDataset = createMemo<DatasetProp>(() => ({
    "data-dictionary": currentPage()?.name,
  }));

  return (
    <>
      <Show when={$pages().length > 0}>
        <div class="animate-fade-in" {...$definitionDataset()}>
          {$pages().length > 1 && (
            <div
              class="flex justify-between text-base-content-calm text-sm cursor-pointer hover:text-base-content transition-colors mb-1 tappable"
              on:click={() => $modalRef()?.showModal()}
              on:touchend={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  color: "var(--dictionary-color, var(--color-base-content-calm)",
                }}
              >
                {currentPage()?.name}
              </div>
              <div class="text-base-content-soft">{`${$definitionIndex() + 1}/${$pages().length}`}</div>
            </div>
          )}
          <div
            class="relative bg-base-200 p-2 sm:p-4 border-s-4 text-base sm:text-xl rounded-lg definition-field"
            style={{
              "border-color": "var(--dictionary-color, var(--color-primary)",
            }}
            data-definition-style={$config.definitionStyle}
          >
            <div class="overflow-auto">
              <DefinitionPictureSection currentHtml={currentPage()?.html} />
              <div class="contents" innerHTML={currentPage()?.html}></div>
            </div>
            {$pages().length > 1 && (
              <div class="absolute inset-y-0 left-0 right-0 flex justify-between pointer-events-none">
                <button
                  type="button"
                  class="h-full w-4 sm:w-6 hover:bg-base-content/10 cursor-pointer pointer-events-auto transition-colors rounded-l-lg"
                  on:click={() => changePage(-1)}
                  on:touchend={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  class="h-full w-4 sm:w-6 hover:bg-base-content/10 cursor-pointer pointer-events-auto transition-colors rounded-r-lg"
                  on:click={() => changePage(1)}
                  on:touchend={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
          <div class="flex justify-end mt-2 gap-2">
            <ExternalLinks />
          </div>
        </div>
      </Show>

      <dialog class="modal" ref={$setModalRef}>
        <div class="modal-box max-w-sm max-h-[80svh] flex flex-col p-4 gap-2">
          <h3 class="font-bold text-lg px-2 text-center">Select Page</h3>
          <div class="flex flex-col gap-1 overflow-auto p-2">
            <For each={$pages()}>
              {(page, i) => (
                <button
                  type="button"
                  class="btn btn-ghost btn-sm justify-start font-normal text-left"
                  classList={{ "btn-active": i() === $definitionIndex() }}
                  on:click={() => {
                    $setDefinitionIndex(i());
                    $modalRef()?.close();
                  }}
                  on:touchend={(e) => e.stopPropagation()}
                >
                  <span class="truncate">
                    {i() + 1}. {page.name}
                  </span>
                </button>
              )}
            </For>
          </div>
          <div class="modal-action mt-2">
            <form method="dialog">
              <button class="btn btn-sm" on:touchend={(e) => e.stopPropagation()}>
                Close
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button on:touchend={(e) => e.stopPropagation()}>Close</button>
        </form>
      </dialog>
    </>
  );
}

function removeMainDefinitionFromGlossary(glossary: string, mainDefinition: string) {
  const parser = new DOMParser();
  const glossaryDoc = parser.parseFromString(glossary, "text/html");
  const mainDefinitionDoc = parser.parseFromString(mainDefinition, "text/html");

  const mainDefinitionLis = mainDefinitionDoc.querySelectorAll(
    'div[class="yomitan-glossary"] > ol > li[data-dictionary]',
  );
  const mainDefinitionDicts = Array.from(mainDefinitionLis)
    .map((li) => li.getAttribute("data-dictionary"))
    .filter(Boolean) as string[];
  if (mainDefinitionDicts.length === 0) return glossary;

  const glossaries = glossaryDoc.querySelectorAll(
    `div[class="yomitan-glossary"] > ol > li[data-dictionary]`,
  );
  for (const glossaryLi of glossaries) {
    const dictName = glossaryLi.getAttribute("data-dictionary");
    if (!dictName) continue;
    if (mainDefinitionDicts.includes(dictName)) {
      glossaryLi.remove();
    }
  }
  return glossaryDoc.body.innerHTML;
}
