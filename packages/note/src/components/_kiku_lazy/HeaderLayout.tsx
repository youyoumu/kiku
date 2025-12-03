import type { JSX } from "solid-js/jsx-runtime";
import { Portal } from "solid-js/web";

export default function HeaderLayout(props: { children: JSX.Element }) {
  return (
    <Portal mount={KIKU_STATE.root}>
      <div class="absolute top-0 left-0 w-full py-2 sm:py-4 px-1 sm:px-2 bg-base-100/90 backdrop-blur-xs">
        <div class="w-full max-w-4xl mx-auto px-1 sm:px-2 gutter-stable overflow-auto invisible-scrollbar">
          <div class="flex justify-between flex-row h-6 items-center min-h-6">
            {props.children}
          </div>
        </div>
      </div>
    </Portal>
  );
}
