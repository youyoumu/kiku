import type { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";
import { useGeneralContext } from "../shared/GeneralContext";

export default function HeaderLayout(props: { children: JSX.Element }) {
  const [$general] = useGeneralContext();

  return (
    <Portal mount={$general.layoutRef}>
      <div
        class="top-0 left-0 w-full py-2 sm:py-4 bg-base-100/90 backdrop-blur-xs z-10"
        classList={{
          fixed: !KIKU_STATE.isAnkiWeb,
          absolute: KIKU_STATE.isAnkiWeb,
        }}
      >
        <div class="w-full mx-auto px-2 sm:px-4 layout-max-width">
          <div class="flex justify-between flex-row h-6 items-center min-h-6">
            {props.children}
          </div>
        </div>
      </div>
    </Portal>
  );
}
