import { createSignal, Match, onMount, Switch } from "solid-js";
import type { AnkiNote } from "#/types";
import { nodesToString, parseHtml } from "#/util/general";
import { useBreakpointContext } from "../shared/BreakpointContext";
import {
  useFieldGroupContext,
  useRootFieldGroupContext,
} from "../shared/FieldGroupContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { ArrowLeftIcon, GitPullRequestArrow, RefreshCwIcon } from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";

export default function MergeContextModal() {
  let dialogRef: HTMLDialogElement | undefined;
  const [$general] = useGeneralContext();
  const { $group: $rootGroup, ankiFields: rootAnkiFields } =
    useRootFieldGroupContext();
  const { $group, ankiFields } = useFieldGroupContext();
  const [rootNote, setRootNote] = createSignal<AnkiNote>();
  const [mergeDirection, setMergeDirection] = createSignal<"up" | "down">(
    "down",
  );
  const bp = useBreakpointContext();

  onMount(async () => {
    if (dialogRef) {
      dialogRef.showModal();
    }

    if (!bp.isAtLeast("sm")) return;
    try {
      await $general.checkAnkiConnect();
      if ($general.isAnkiConnectAvailable) {
        const noteIds = await AnkiConnect.invoke("findNotes", {
          query: `cid:${rootAnkiFields.CardID}`,
        });
        const noteId = noteIds.result[0];
        const notes = await AnkiConnect.invoke("notesInfo", {
          notes: [noteId],
        });
        const note = notes.result[0];
        setRootNote(note);

        const result = normalizeFields({
          Sentence: note.fields.Sentence.value,
          SentenceFurigana: note.fields.SentenceFurigana.value,
          SentenceAudio: note.fields.SentenceAudio.value,
          Picture: note.fields.Picture.value,
        });

        console.log("DEBUG[1340]: result=", result);
      }
    } catch (e) {
      $general.toast.error("Failed to load root note");
      KIKU_STATE.logger.error("Failed to load root note", e);
    }
  });

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

      <dialog class="modal" ref={dialogRef}>
        <div class="modal-box">
          <h3 class="text-lg font-bold">Merge Context</h3>

          <div class="flex flex-col gap-2">
            <div class="flex flex-col gap-2">
              <h4 class="font-bold">Root</h4>
              <div class="flex flex-col gap-1">
                <FieldPreview
                  title="Sentence"
                  content={rootNote()?.fields.Sentence.value ?? ""}
                />
                <FieldPreview
                  title="SentenceFurigana"
                  content={rootNote()?.fields.SentenceFurigana.value ?? ""}
                />
                <FieldPreview
                  title="SentenceAudio"
                  content={rootNote()?.fields.SentenceAudio.value ?? ""}
                />
                <FieldPreview
                  title="Picture"
                  content={rootNote()?.fields.Picture.value ?? ""}
                />
              </div>
            </div>
            <ArrowLeftIcon
              class="self-center text-base-content-calm size-12 cursor-pointer transition-transform"
              on:click={() => {
                setMergeDirection((prev) => (prev === "up" ? "down" : "up"));
              }}
              classList={{
                "rotate-90": mergeDirection() === "up",
                "rotate-270": mergeDirection() === "down",
              }}
            />

            <div class="flex flex-col gap-2">
              <h4 class="font-bold">Current</h4>
              <div class="flex flex-col gap-1">
                <FieldPreview title="Sentence" content={ankiFields.Sentence} />
                <FieldPreview
                  title="SentenceFurigana"
                  content={ankiFields.SentenceFurigana}
                />
                <FieldPreview
                  title="SentenceAudio"
                  content={ankiFields.SentenceAudio}
                />
                <FieldPreview title="Picture" content={ankiFields.Picture} />
              </div>
            </div>
          </div>

          <div class="modal-action">
            <form method="dialog">
              <button class="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

function FieldPreview(props: { title: string; content: string }) {
  return (
    <div>
      <div class="text-xs">{props.title}</div>
      <pre class="text-xs text-base-content-calm bg-base-200 p-2 rounded-sm overflow-auto max-h-[90svh]">
        {props.content}
      </pre>
    </div>
  );
}

type ContextField = {
  Sentence: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  Picture: string;
};

function normalizeFields(fields: ContextField) {
  let newId = Date.now();
  function recalculateNewId(nodes: NodeListOf<Element>) {
    nodes.forEach((el) => {
      const id = Number((el as HTMLSpanElement).dataset.groupId);
      if (newId >= id) {
        newId = id - 1;
      }
    });
    if (newId <= 0) {
      newId = Date.now();
    }
  }

  const sentenceDoc = parseHtml(fields.Sentence);
  const sentenceWithGroup = sentenceDoc.querySelectorAll("[data-group-id]");
  recalculateNewId(sentenceWithGroup);
  const sentenceWithoutGroup = Array.from(sentenceDoc.body.childNodes).filter(
    (el) => !(el as HTMLSpanElement).dataset?.groupId,
  );

  const sentenceFuriganaDoc = parseHtml(fields.SentenceFurigana);
  const sentenceFuriganaWithGroup =
    sentenceFuriganaDoc.querySelectorAll("[data-group-id]");
  recalculateNewId(sentenceFuriganaWithGroup);
  const sentenceFuriganaWithoutGroup = Array.from(
    sentenceFuriganaDoc.body.childNodes,
  ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);

  const sentenceAudioDoc = parseHtml(fields.SentenceAudio);
  const sentenceAudioWithGroup =
    sentenceAudioDoc.querySelectorAll("[data-group-id]");
  recalculateNewId(sentenceAudioWithGroup);
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
    pictureWithoutGroup?.outerHTML;

  return {
    Sentence,
    SentenceFurigana,
    SentenceAudio,
    Picture,
  };
}
