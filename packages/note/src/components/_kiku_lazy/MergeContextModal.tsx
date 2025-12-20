import { createEffect, createSignal, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { type AnkiNote, ankiFieldsSkeleton } from "#/types";
import { nodesToString, parseHtml } from "#/util/general";
import { useNavigationTransition } from "#/util/hooks";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useCardContext } from "../shared/CardContext";
import { useRootFieldGroupContext } from "../shared/FieldGroupContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { ArrowLeftIcon, GitPullRequestArrow, RefreshCwIcon } from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";

export default function MergeContextModal() {
  let dialogRef: HTMLDialogElement | undefined;
  const [$general, $setGeneral] = useGeneralContext();
  const { navigate } = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const { ankiFields: rootAnkiFields } = useRootFieldGroupContext();
  const { ankiFields, noteId } = useAnkiFieldContext<"back">();
  const [rootNote, setRootNote] = createSignal<AnkiNote>();
  const [mergeDirection, setMergeDirection] = createSignal<
    "toRoot" | "toCurrent"
  >("toCurrent");

  if ($card.isMergePreview) return null;

  $general.useCheckAnkiConnect();

  createEffect(async () => {
    if (dialogRef) {
      dialogRef.showModal();
    }

    if ($general.isAnkiConnectAvailable) {
      try {
        const noteIds = await AnkiConnect.invoke("findNotes", {
          query: `cid:${rootAnkiFields.CardID}`,
        });
        const noteId = noteIds.result[0];
        const notes = await AnkiConnect.invoke("notesInfo", {
          notes: [noteId],
        });
        const note = notes.result[0];
        setRootNote(note);
      } catch (e) {
        $general.toast.error("Failed to load root note");
        KIKU_STATE.logger.error("Failed to load root note", e);
      }
    }
  });

  const merged = () => {
    const root = {
      noteId: rootNote()?.noteId,
      Sentence: rootNote()?.fields.Sentence.value ?? "",
      SentenceFurigana: rootNote()?.fields.SentenceFurigana.value ?? "",
      SentenceAudio: rootNote()?.fields.SentenceAudio.value ?? "",
      Picture: rootNote()?.fields.Picture.value ?? "",
    };
    const current = {
      noteId: noteId,
      Sentence: ankiFields.Sentence,
      SentenceFurigana: ankiFields.SentenceFurigana,
      SentenceAudio: ankiFields.SentenceAudio,
      Picture: ankiFields.Picture,
    };
    if (mergeDirection() === "toRoot") {
      return mergeContext(root, current);
    } else {
      return mergeContext(current, root);
    }
  };

  const mergedReadable = () => parseMergedIntoReadable(merged());

  const mergedAnkiFields = () => {
    if (mergeDirection() === "toRoot") {
      const rootNote$ = rootNote();
      if (!rootNote$) return ankiFieldsSkeleton;
      const ankiFields = {
        ...ankiFieldsSkeleton,
        ...Object.fromEntries(
          Object.entries(rootNote$.fields).map(([key, value]) => {
            return [key, value.value];
          }),
        ),
        Tags: rootNote$.tags.join(" "),
      };
      return {
        ...ankiFieldsSkeleton,
        ...ankiFields,
        ...merged(),
      };
    } else {
      return {
        ...ankiFieldsSkeleton,
        ...ankiFields,
        ...merged(),
      };
    }
  };

  const updateNoteFieldsPayload = () => {
    const targetId =
      mergeDirection() === "toRoot" ? rootNote()?.noteId : noteId;
    if (!targetId) return;
    const fields = mergedAnkiFields();
    for (const key in fields) {
      if (
        key.startsWith("furigana:") ||
        key.startsWith("kana:") ||
        key.startsWith("kanji:") ||
        key === "Tags" ||
        key === "CardID"
      ) {
        delete fields[key as keyof typeof fields];
      }
    }
    return {
      note: {
        id: targetId,
        fields: fields,
      },
    };
  };

  const onPreviewClick = () => {
    $setCard("nestedIsMergePreview", true);
    $setCard({ nestedAnkiFields: mergedAnkiFields() });
    $setCard("nestedNoteId", noteId);
    navigate("nested", "forward", () => {
      navigate("main", "back");
      $setCard("nestedIsMergePreview", false);
    });
  };

  const onMergeClick = () => {
    const payload = updateNoteFieldsPayload();
    AnkiConnect.invoke("updateNoteFields", payload)
      .catch((e) => {
        $general.toast.error(
          `Failed to update note fields: ${e instanceof Error ? e.message : ""}`,
        );
      })
      .then(() => {
        $general.toast.success("Note fields updated!");
        if (dialogRef) {
          dialogRef.close();
        }
      });
  };

  return (
    <>
      <Switch>
        <Match when={$general.isAnkiConnectAvailable}>
          <GitPullRequestArrow
            class="size-4 cursor-pointer text-base-content-soft"
            on:click={() => {
              if (dialogRef) {
                dialogRef.showModal();
              }
            }}
          />
        </Match>
        <Match when={!$general.isAnkiConnectAvailable}>
          <div class="indicator">
            <div class="place-items-center">
              <RefreshCwIcon
                class="size-4 cursor-pointer text-base-content-soft"
                on:click={async () => {
                  try {
                    await $general.checkAnkiConnect();
                  } catch {
                    $general.toast.error("AnkiConnect is not available");
                  }
                }}
              />
            </div>
            <span class="status status-error animate-ping"></span>
          </div>
        </Match>
      </Switch>

      <Portal mount={$general.layoutRef}>
        <dialog class="modal" ref={dialogRef}>
          <div class="modal-box max-h-[80svh]">
            <h3 class="text-lg font-bold mb-4">Merge Context</h3>

            <div class="flex flex-col gap-4">
              <div class="flex gap-4 items-center justify-center">
                <div>Root</div>
                <ArrowLeftIcon
                  class="self-center text-base-content-calm size-10 cursor-pointer transition-transform"
                  on:click={() => {
                    setMergeDirection((prev) =>
                      prev === "toRoot" ? "toCurrent" : "toRoot",
                    );
                  }}
                  classList={{
                    "rotate-0": mergeDirection() === "toRoot",
                    "rotate-180": mergeDirection() === "toCurrent",
                  }}
                />
                <div>Current</div>
              </div>

              <Show
                when={
                  rootNote()?.fields.Expression.value !== ankiFields.Expression
                }
              >
                <div role="alert" class="alert alert-warning">
                  Root and Current have different Expression
                </div>
              </Show>

              <div class="flex flex-col gap-2">
                <FieldPreview
                  title="Sentence"
                  content={mergedReadable().Sentence}
                />
                <FieldPreview
                  title="SentenceFurigana"
                  content={mergedReadable().SentenceFurigana}
                />
                <FieldPreview
                  title="SentenceAudio"
                  content={mergedReadable().SentenceAudio}
                />
                <FieldPreview
                  title="Picture"
                  content={mergedReadable().Picture}
                />
                <FieldPreview
                  title="AnkiConnect Payload Preview"
                  content={JSON.stringify(updateNoteFieldsPayload(), null, 2)}
                />
              </div>
            </div>

            <div class="modal-action">
              <form method="dialog">
                <button class="btn">Close</button>
              </form>
              <button class="btn btn-secondary" on:click={onPreviewClick}>
                Preview
              </button>
              <button class="btn btn-primary" on:click={onMergeClick}>
                Merge
              </button>
            </div>
          </div>

          <form method="dialog" class="modal-backdrop">
            <button>Close</button>
          </form>
        </dialog>
      </Portal>
    </>
  );
}

function FieldPreview(props: { title: string; content: string }) {
  return (
    <div class="flex flex-col gap-0.5">
      <div class="text-sm">{props.title}</div>
      <pre class="text-xs bg-base-200 p-2 rounded-sm overflow-auto max-h-[90svh]">
        {props.content ? props.content : "\n"}
      </pre>
    </div>
  );
}

type ContextField = {
  noteId: number | undefined;
  Sentence: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  Picture: string;
};

function mergeContext(base: ContextField, extra: ContextField) {
  const normalizedBase = normalizeFields(base);
  const normalizedExtra = normalizeFields(extra);

  // if one of them is empty, delete both
  const SentenceFurigana = () => {
    if (!normalizedBase.SentenceFurigana || !normalizedExtra.SentenceFurigana) {
      return "";
    }
    return normalizedBase.SentenceFurigana + normalizedExtra.SentenceFurigana;
  };

  // biome-ignore format: this looks nicer
  const merged = {
    Sentence: normalizedBase.Sentence + normalizedExtra.Sentence,
    SentenceFurigana: SentenceFurigana(),
    SentenceAudio: normalizedBase.SentenceAudio + normalizedExtra.SentenceAudio,
    Picture: normalizedBase.Picture + normalizedExtra.Picture,
  };
  return merged;
}

const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function normalizeFields(fields: ContextField) {
  const newId = fields.noteId ?? Date.now() + randomNumber(0, 1000);

  const sentenceDoc = parseHtml(fields.Sentence);
  const sentenceWithGroup = sentenceDoc.querySelectorAll("[data-group-id]");
  const sentenceWithoutGroup = Array.from(sentenceDoc.body.childNodes).filter(
    (el) => !(el as HTMLSpanElement).dataset?.groupId,
  );

  const sentenceFuriganaDoc = parseHtml(fields.SentenceFurigana);
  const sentenceFuriganaWithGroup =
    sentenceFuriganaDoc.querySelectorAll("[data-group-id]");
  const sentenceFuriganaWithoutGroup = Array.from(
    sentenceFuriganaDoc.body.childNodes,
  ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);

  const sentenceAudioDoc = parseHtml(fields.SentenceAudio);
  const sentenceAudioWithGroup =
    sentenceAudioDoc.querySelectorAll("[data-group-id]");
  const sentenceAudioWithoutGroup = Array.from(
    sentenceAudioDoc.body.childNodes,
  ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);

  const pictureDoc = parseHtml(fields.Picture);
  const pictureWithGroup = pictureDoc.querySelectorAll("img[data-group-id]");
  // NOTE: this only pick the first img from ungrouped img
  const pictureWithoutGroup = pictureDoc.querySelector(
    "img:not([data-group-id])",
  );
  if (pictureWithoutGroup) {
    pictureWithoutGroup.setAttribute("data-group-id", newId.toString());
  }

  function wrapInSpan(html: string) {
    const span = document.createElement("span");
    span.innerHTML = html;
    span.dataset.groupId = newId.toString();
    return span.outerHTML;
  }

  const Sentence =
    nodesToString(Array.from(sentenceWithGroup)).trim() +
    wrapInSpan(nodesToString(sentenceWithoutGroup).trim());

  const sentenceFuriganaWithoutGroupHtml = nodesToString(
    sentenceFuriganaWithoutGroup,
  ).trim();
  const SentenceFurigana =
    nodesToString(Array.from(sentenceFuriganaWithGroup)).trim() +
    sentenceFuriganaWithoutGroupHtml
      ? wrapInSpan(sentenceFuriganaWithoutGroupHtml)
      : "";

  const SentenceAudio =
    nodesToString(Array.from(sentenceAudioWithGroup)).trim() +
    wrapInSpan(nodesToString(sentenceAudioWithoutGroup).trim());

  const Picture =
    nodesToString(Array.from(pictureWithGroup)).trim() +
    (pictureWithoutGroup?.outerHTML ?? "");

  return {
    Sentence,
    SentenceFurigana,
    SentenceAudio,
    Picture,
  };
}

function parseMergedIntoReadable(fields: {
  Sentence: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  Picture: string;
}) {
  const sentenceDoc = parseHtml(fields.Sentence);
  const sentenceWithGroup = sentenceDoc.querySelectorAll("[data-group-id]");
  const Sentence = Array.from(sentenceWithGroup)
    .map((node) => {
      return `${node.getAttribute("data-group-id")}: ${node.textContent}`;
    })
    .join("\n");

  const sentenceFuriganaDoc = parseHtml(fields.SentenceFurigana);
  const sentenceFuriganaWithGroup =
    sentenceFuriganaDoc.querySelectorAll("[data-group-id]");
  const SentenceFurigana = Array.from(sentenceFuriganaWithGroup)
    .map((node) => {
      return `${node.getAttribute("data-group-id")}: ${node.textContent}`;
    })
    .join("\n");

  const sentenceAudioDoc = parseHtml(fields.SentenceAudio);
  const sentenceAudioWithGroup =
    sentenceAudioDoc.querySelectorAll("[data-group-id]");
  const SentenceAudio = Array.from(sentenceAudioWithGroup)
    .map((node) => {
      return `${node.getAttribute("data-group-id")}: ${node.textContent}`;
    })
    .join("\n");

  const pictureDoc = parseHtml(fields.Picture);
  const pictureWithGroup = pictureDoc.querySelectorAll("img[data-group-id]");
  const Picture = Array.from(pictureWithGroup)
    .map((node) => {
      return `${node.getAttribute("data-group-id")}: ${node.getAttribute("src")}`;
    })
    .join("\n");

  return {
    Sentence,
    SentenceFurigana,
    SentenceAudio,
    Picture,
  };
}
