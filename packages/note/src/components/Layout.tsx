import type { JSX } from "solid-js";
import { useCardContext } from "#/components/shared/CardContext";
import UseAnkiWeb from "./UseAnkiWeb";

export function Layout(props: { children: JSX.Element }) {
  const [$card, $setCard] = useCardContext();
  if ($card.nested) return props.children;

  return (
    <div
      ref={(ref) => $setCard("layoutRef", ref)}
      class="overflow-y-auto overflow-x-hidden gutter-stable h-svh font-primary transition-colors relative"
    >
      <UseAnkiWeb />

      <div
        class="flex flex-col gap-6 p-2 sm:p-4 bg-base-100 min-h-full max-w-4xl mx-auto pt-10 sm:pt-14"
        ref={(ref) => $setCard("contentRef", ref)}
      >
        {props.children}
      </div>
      {$card.toast.message && (
        <div class="toast toast-top toast-center">
          <div
            class="alert"
            classList={{
              "alert-error": $card.toast.type === "error",
              "alert-success": $card.toast.type === "success",
            }}
          >
            <span>{$card.toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
