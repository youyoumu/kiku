import { createEffect, createSignal, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { type AnkiNote, ankiFieldsSkeleton } from "#/types";
import { nodesToString, parseHtml, unique } from "#/util/general";
import { useNavigationTransition } from "#/util/hooks";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useCardContext } from "../shared/CardContext";
import { useConfigContext } from "../shared/ConfigContext";
import { useRootFieldGroupContext } from "../shared/FieldGroupContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { ArrowLeftIcon, GitPullRequestArrow, RefreshCwIcon } from "./Icons";
import { AnkiConnect } from "./util/ankiConnect";

export default function MergeContextModal() {
  let dialogRef: HTMLDialogElement | undefined;
  const [$general, $setGeneral] = useGeneralContext();
  const [$config, $setConfig] = useConfigContext();
  const { navigate } = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const { ankiFields: rootAnkiFields } = useRootFieldGroupContext();
  const { noteId: currentNoteId } = useAnkiFieldContext<"back">();

  const [rootNote, setRootNote] = createSignal<AnkiNote>();
  const [currentNote, setCurrentNote] = createSignal<AnkiNote>();
  const [mergeDirection, setMergeDirection] = createSignal<
    "toRoot" | "toCurrent"
  >("toCurrent");
  const [deleteRootNote, setDeleteRootNote] = createSignal(false);
  const [loading, setLoading] = createSignal(true);

  if (!$config.preferAnkiConnect) return null;
  if ($card.isMergePreview) return null;

  $general.useCheckAnkiConnect();

  createEffect(async () => {
    if ($general.isAnkiConnectAvailable) {
      setLoading(true);
      try {
        const noteIds = await AnkiConnect.invoke("findNotes", {
          query: `cid:${rootAnkiFields.CardID}`,
        });
        const rootNoteId = noteIds.result[0];
        const notes = await AnkiConnect.invoke("notesInfo", {
          notes: [rootNoteId, currentNoteId],
        });
        const rootNote = notes.result[0];
        const currentNote = notes.result[1];
        if (!rootNote?.noteId) throw new Error("Failed to load root note");
        if (!currentNote?.noteId)
          throw new Error(
            "Failed to load current note, is your notes cache up to date?",
          );
        setRootNote(rootNote);
        setCurrentNote(currentNote);
      } catch (e) {
        $general.toast.error(
          e instanceof Error ? e.message : "Failed to load notes",
        );
        KIKU_STATE.logger.error(e);
      }
    }
    setLoading(false);
  });

  const merged = () => {
    const toContextField = (note: AnkiNote | undefined) => ({
      noteId: note?.noteId,
      Sentence: note?.fields.Sentence.value ?? "",
      SentenceFurigana: note?.fields.SentenceFurigana.value ?? "",
      SentenceAudio: note?.fields.SentenceAudio.value ?? "",
      MiscInfo: note?.fields.MiscInfo.value ?? "",
      Picture: note?.fields.Picture.value ?? "",
    });
    const root = toContextField(rootNote());
    const current = toContextField(currentNote());
    if (mergeDirection() === "toRoot") {
      return mergeContext(root, current);
    } else {
      return mergeContext(current, root);
    }
  };

  const mergedReadable = () => parseMergedIntoReadable(merged());
  const hasDuplicates = () =>
    Object.values(mergedReadable().duplicates).some((item) =>
      Boolean(item.length),
    );

  const mergedAnkiFields = () => {
    const direction = mergeDirection();
    // ---- fields ----
    const targetNote = direction === "toRoot" ? rootNote() : currentNote();
    if (!targetNote) return ankiFieldsSkeleton;
    const targetFields = Object.fromEntries(
      Object.entries(targetNote.fields).map(([key, value]) => [
        key,
        value.value,
      ]),
    );

    // ---- tags ----
    const rootTags = rootNote()?.tags ?? [];
    const currentTags = currentNote()?.tags ?? [];
    let tags = unique([...rootTags, ...currentTags]);
    const targetTags = direction === "toRoot" ? rootTags : currentTags;
    const unwantedTags = ["leech", "marked", "potential_leech"];
    tags = tags.filter(
      (tag) => targetTags.includes(tag) || !unwantedTags.includes(tag),
    );

    return {
      ...ankiFieldsSkeleton,
      ...targetFields,
      ...merged(),
      Tags: tags.join(" "),
    };
  };

  const targetId = () => {
    const targetId =
      mergeDirection() === "toRoot"
        ? rootNote()?.noteId
        : currentNote()?.noteId;
    if (!targetId) return;
    return targetId;
  };

  const updateNoteFieldsPayload = () => {
    const targetId$ = targetId();
    if (!targetId$) return;
    const fields = mergedAnkiFields();
    const tags = fields.Tags.split(" ");
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
        id: targetId$,
        fields: fields,
        tags: tags,
      },
    };
  };

  const onPreviewClick = () => {
    $setCard("nestedIsMergePreview", true);
    $setCard({ nestedAnkiFields: mergedAnkiFields() });
    $setCard("nestedNoteId", targetId());
    navigate("nested", "forward", () => {
      navigate("main", "back");
      $setCard("nestedIsMergePreview", false);
    });
  };

  const onMergeClick = async () => {
    const payload = updateNoteFieldsPayload();
    await AnkiConnect.invoke("updateNote", payload)
      .catch((e) => {
        $general.toast.error(
          `Failed to update note fields: ${e instanceof Error ? e.message : ""}`,
        );
      })
      .then(() => {
        $general.toast.success(`Note ${payload?.note.id} has been updated!`);
        if (dialogRef) dialogRef.close();
        const rootNoteId = rootNote()?.noteId;
        if (deleteRootNote() && rootNoteId) {
          setTimeout(() => {
            AnkiConnect.invoke("deleteNotes", {
              notes: [rootNoteId],
            })
              .catch((e) => {
                $general.toast.error(
                  `Failed to delete note: ${e instanceof Error ? e.message : ""}`,
                );
              })
              .then(() => {
                $general.toast.success(
                  `Note ${payload?.note.id} has been updated! Note ${rootNoteId} has been deleted!`,
                );
              });
          }, 500);
        }
      });
  };

  createEffect(() => {
    if (mergeDirection() === "toRoot") {
      setDeleteRootNote(false);
    }
  });

  return (
    <>
      <Switch>
        <Match when={loading()}>
          <span class="loading loading-spinner loading-xs text-base-content-faint animate-fade-in-sm"></span>
        </Match>
        <Match
          when={$general.isAnkiConnectAvailable && rootNote() && currentNote()}
        >
          <GitPullRequestArrow
            class="size-4 cursor-pointer text-base-content-soft animate-fade-in-sm"
            on:click={() => {
              if (dialogRef) {
                dialogRef.showModal();
              }
            }}
          />
        </Match>
        <Match
          when={
            $general.isAnkiConnectAvailable && (!rootNote() || !currentNote())
          }
        >
          <span class="animate-fade-in-sm">
            <span class="status status-error animate-ping"></span>
          </span>
        </Match>
        <Match when={!$general.isAnkiConnectAvailable}>
          <div class="indicator animate-fade-in-sm">
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
                <div class="flex flex-col items-center">
                  <div>Root</div>
                  <div class="text-base-content-calm text-xs">
                    {rootNote()?.noteId}
                  </div>
                  <Show when={rootNote()?.noteId}>
                    {(id) => (
                      <div class="text-base-content-soft text-xs">
                        {new Date(id()).toLocaleDateString()}
                      </div>
                    )}
                  </Show>
                </div>
                <ArrowLeftIcon
                  class="self-center text-base-content-calm size-10 cursor-pointer transition-transform"
                  on:click={() => {
                    // TODO: we can't update root while opening the note in anki browser. What to do??? https://github.com/FooSoft/anki-connect/issues/82
                    // setMergeDirection((prev) =>
                    //   prev === "toRoot" ? "toCurrent" : "toRoot",
                    // );
                  }}
                  classList={{
                    "rotate-0": mergeDirection() === "toRoot",
                    "rotate-180": mergeDirection() === "toCurrent",
                  }}
                />
                <div class="flex flex-col items-center">
                  <div>Current</div>
                  <div class="text-base-content-calm text-xs">
                    {currentNote()?.noteId}
                  </div>
                  <Show when={currentNote()?.noteId}>
                    {(id) => (
                      <div class="text-base-content-soft text-xs">
                        {new Date(id()).toLocaleDateString()}
                      </div>
                    )}
                  </Show>
                </div>
              </div>

              <Show
                when={
                  rootNote()?.fields.Expression.value &&
                  currentNote()?.fields.Expression.value &&
                  rootNote()?.fields.Expression.value !==
                    currentNote()?.fields.Expression.value
                }
              >
                <div role="alert" class="alert alert-warning">
                  Root and Current have different Expression
                </div>
              </Show>

              <Show when={hasDuplicates()}>
                <div role="alert" class="alert alert-warning">
                  Some fields have duplicates data-group-id
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
                  title="MiscInfo"
                  content={mergedReadable().MiscInfo}
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

              <Show
                when={
                  // only show if root note is not older than 1 day
                  Date.now() - (rootNote()?.noteId ?? Date.now()) <
                    1000 * 60 * 60 * 24 && mergeDirection() === "toCurrent"
                }
              >
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Delete Root Note</legend>
                  <label class="label">
                    <input
                      type="checkbox"
                      checked={deleteRootNote()}
                      class="toggle"
                      on:change={(e) => {
                        setDeleteRootNote(e.target.checked);
                      }}
                    />
                  </label>
                </fieldset>
              </Show>
            </div>

            <div class="modal-action">
              <form method="dialog">
                <button class="btn">Close</button>
              </form>
              <button class="btn btn-secondary" on:click={onPreviewClick}>
                Preview
              </button>
              <button
                class="btn"
                classList={{
                  "btn-primary": !deleteRootNote(),
                  "btn-error": deleteRootNote(),
                }}
                on:click={onMergeClick}
              >
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
  MiscInfo: string;
  Picture: string;
};

function mergeContext(base: ContextField, extra: ContextField) {
  const normalizedBase = normalizeFields(base);
  const normalizedExtra = normalizeFields(extra);

  // if one of them is empty, delete both
  const getSentenceFurigana = () => {
    if (!normalizedBase.SentenceFurigana || !normalizedExtra.SentenceFurigana) {
      return "";
    }
    return normalizedBase.SentenceFurigana + normalizedExtra.SentenceFurigana;
  };

  // biome-ignore format: this looks nicer
  const merged = {
    Sentence: normalizedBase.Sentence + normalizedExtra.Sentence,
    SentenceFurigana: getSentenceFurigana(),
    SentenceAudio: normalizedBase.SentenceAudio + normalizedExtra.SentenceAudio,
    MiscInfo: normalizedBase.MiscInfo + normalizedExtra.MiscInfo,
    Picture: normalizedBase.Picture + normalizedExtra.Picture,
  };

  function sortGroup(nodes: NodeListOf<Element>) {
    return Array.from(nodes).sort((a, b) => {
      const aId = Number((a as HTMLSpanElement).dataset.groupId);
      const bId = Number((b as HTMLSpanElement).dataset.groupId);
      return bId - aId;
    });
  }

  const sentenceDoc = parseHtml(merged.Sentence);
  const sentenceWithGroup = sentenceDoc.querySelectorAll("[data-group-id]");
  const Sentence = sortGroup(sentenceWithGroup);
  merged.Sentence = nodesToString(Sentence);

  const sentenceFuriganaDoc = parseHtml(merged.SentenceFurigana);
  const sentenceFuriganaWithGroup =
    sentenceFuriganaDoc.querySelectorAll("[data-group-id]");
  const SentenceFurigana = sortGroup(sentenceFuriganaWithGroup);
  merged.SentenceFurigana = nodesToString(SentenceFurigana);

  const sentenceAudioDoc = parseHtml(merged.SentenceAudio);
  const sentenceAudioWithGroup =
    sentenceAudioDoc.querySelectorAll("[data-group-id]");
  const SentenceAudio = sortGroup(sentenceAudioWithGroup);
  merged.SentenceAudio = nodesToString(SentenceAudio);

  const miscInfoDoc = parseHtml(merged.MiscInfo);
  const miscInfoWithGroup = miscInfoDoc.querySelectorAll("[data-group-id]");
  const MiscInfo = sortGroup(miscInfoWithGroup);
  merged.MiscInfo = nodesToString(MiscInfo);

  const pictureDoc = parseHtml(merged.Picture);
  const pictureWithGroup = pictureDoc.querySelectorAll("img[data-group-id]");
  const Picture = sortGroup(pictureWithGroup);
  merged.Picture = nodesToString(Picture);

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

  const miscInfoDoc = parseHtml(fields.MiscInfo);
  const miscInfoWithGroup = miscInfoDoc.querySelectorAll("[data-group-id]");
  const miscInfoWithoutGroup = Array.from(miscInfoDoc.body.childNodes).filter(
    (el) => !(el as HTMLSpanElement).dataset?.groupId,
  );

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
    if (!html) return "";
    const span = document.createElement("span");
    span.innerHTML = html;
    span.dataset.groupId = newId.toString();
    return span.outerHTML;
  }

  const Sentence =
    nodesToString(Array.from(sentenceWithGroup)).trim() +
    wrapInSpan(nodesToString(sentenceWithoutGroup).trim());

  const SentenceFurigana =
    nodesToString(Array.from(sentenceFuriganaWithGroup)).trim() +
    wrapInSpan(nodesToString(sentenceFuriganaWithoutGroup).trim());

  const SentenceAudio =
    nodesToString(Array.from(sentenceAudioWithGroup)).trim() +
    wrapInSpan(nodesToString(sentenceAudioWithoutGroup).trim());

  const MiscInfo =
    nodesToString(Array.from(miscInfoWithGroup)).trim() +
    wrapInSpan(nodesToString(miscInfoWithoutGroup).trim());

  const Picture =
    nodesToString(Array.from(pictureWithGroup)).trim() +
    (pictureWithoutGroup?.outerHTML ?? "");

  return {
    Sentence,
    SentenceFurigana,
    SentenceAudio,
    MiscInfo,
    Picture,
  };
}

function parseMergedIntoReadable(fields: {
  Sentence: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  MiscInfo: string;
  Picture: string;
}) {
  function extractGroupedText(
    doc: Document,
    selector: string,
    value: (node: Element) => string,
  ) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    const lines = Array.from(doc.querySelectorAll(selector))
      .map((node) => {
        const groupId = node.getAttribute("data-group-id");
        if (!groupId) return null;
        if (seen.has(groupId)) {
          duplicates.add(groupId);
        } else {
          seen.add(groupId);
        }
        return `${groupId}: ${value(node)}`;
      })
      .filter(Boolean) as string[];

    return {
      text: lines.join("\n"),
      duplicates: Array.from(duplicates),
    };
  }

  const sentence = extractGroupedText(
    parseHtml(fields.Sentence),
    "[data-group-id]",
    (n) => n.textContent ?? "",
  );

  const sentenceFurigana = extractGroupedText(
    parseHtml(fields.SentenceFurigana),
    "[data-group-id]",
    (n) => n.textContent ?? "",
  );

  const sentenceAudio = extractGroupedText(
    parseHtml(fields.SentenceAudio),
    "[data-group-id]",
    (n) => n.textContent ?? "",
  );

  const miscInfo = extractGroupedText(
    parseHtml(fields.MiscInfo),
    "[data-group-id]",
    (n) => n.textContent ?? "",
  );

  const picture = extractGroupedText(
    parseHtml(fields.Picture),
    "img[data-group-id]",
    (n) => n.getAttribute("src") ?? "",
  );

  return {
    Sentence: sentence.text,
    SentenceFurigana: sentenceFurigana.text,
    SentenceAudio: sentenceAudio.text,
    MiscInfo: miscInfo.text,
    Picture: picture.text,

    duplicates: {
      Sentence: sentence.duplicates,
      SentenceFurigana: sentenceFurigana.duplicates,
      SentenceAudio: sentenceAudio.duplicates,
      MiscInfo: miscInfo.duplicates,
      Picture: picture.duplicates,
    },
  };
}
