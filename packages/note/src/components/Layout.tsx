import type { JSX } from "solid-js";
import { useCardStore } from "./shared/Context";
import UseAnkiWeb from "./UseAnkiWeb";

export function Layout(props: { children: JSX.Element }) {
  const [card, setCard] = useCardStore();
  if (card.nested) return props.children;

  return (
    <div
      ref={(ref) => setCard("layoutRef", ref)}
      class="max-w-4xl mx-auto overflow-y-auto overflow-x-hidden gutter-stable h-svh font-primary transition-colors relative"
    >
      <UseAnkiWeb />
      <div
        class="flex flex-col gap-6 p-2 sm:p-4 bg-base-100 min-h-full"
        ref={(ref) => setCard("contentRef", ref)}
      >
        {props.children}
      </div>
      {card.toastMessage && (
        <div class="toast toast-top toast-center">
          <div
            class="alert"
            classList={{
              "alert-error": card.toastType === "error",
              "alert-success": card.toastType === "success",
            }}
          >
            <span>{card.toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
