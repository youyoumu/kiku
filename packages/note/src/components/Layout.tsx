import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { useGeneralContext } from "./shared/GeneralContext";
import UseAnkiWeb from "./UseAnkiWeb";

export function Layout(props: { children: JSX.Element }) {
  const [$general, $setGeneral] = useGeneralContext();

  return (
    <div
      ref={(ref) => $setGeneral("layoutRef", ref)}
      class="overflow-y-auto overflow-x-hidden gutter-stable h-svh font-primary transition-colors relative"
    >
      <UseAnkiWeb />

      <div
        class="flex flex-col gap-6 p-2 sm:p-4 bg-base-100 min-h-full max-w-4xl mx-auto pt-10 sm:pt-14"
        ref={(ref) => $setGeneral("contentRef", ref)}
      >
        {props.children}
      </div>
      <Portal mount={KIKU_STATE.root}>
        {$general.toast.message && (
          <div class="toast toast-top toast-center">
            <div
              class="alert"
              classList={{
                "alert-error": $general.toast.type === "error",
                "alert-success": $general.toast.type === "success",
              }}
            >
              <span>{$general.toast.message}</span>
            </div>
          </div>
        )}
      </Portal>
    </div>
  );
}
