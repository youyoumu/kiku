import type { JSX } from "solid-js";
import { useCardStore } from "./shared/Context";

export function Layout(props: { children: JSX.Element }) {
  const [card] = useCardStore();
  if (card.nested) return props.children;

  return (
    <div class="max-w-4xl mx-auto overflow-auto p-2 sm:p-4 gutter-stable h-[calc(100vh-1rem)] sm:h-vh font-primary">
      <div class="flex flex-col gap-6 ">{props.children}</div>
    </div>
  );
}
