import { ErrorBoundary, Show } from "solid-js";
import { useCtxContext } from "../shared/CtxContext";
import { useFieldGroupContext } from "../shared/FieldGroupContext";
import { useGeneralContext } from "../shared/GeneralContext";
import { InfoIcon } from "./Icons";

export default function BackFooter(props: { tags: string[] }) {
  const [$general] = useGeneralContext();
  const { $group } = useFieldGroupContext();
  const ctx = useCtxContext();
  const tags = () => props.tags.filter(Boolean);

  function DefaultFooter() {
    return (
      <>
        {$group.miscInfoField && (
          <div
            class={`flex gap-2 items-center justify-center bg-base-200 p-2 rounded-lg animate-fade-in misc-info`}
          >
            <div class="min-w-4">
              <InfoIcon class="size-4 text-base-content-calm" />
            </div>
            <div
              class="text-base-content-calm"
              innerHTML={$group.miscInfoField}
            ></div>
          </div>
        )}
        <Show when={tags().length}>
          <div class="flex gap-2 items-center justify-center animate-fade-in flex-wrap">
            {tags().map((tag) => {
              return <div class="badge badge-secondary">{tag}</div>;
            })}
          </div>
        </Show>
      </>
    );
  }

  return (
    <ErrorBoundary fallback={<DefaultFooter />}>
      <Show when={$general.plugin?.Footer} fallback={<DefaultFooter />}>
        {(get) => {
          const Footer = get();
          return <Footer ctx={ctx} DefaultFooter={DefaultFooter} />;
        }}
      </Show>
    </ErrorBoundary>
  );
}
