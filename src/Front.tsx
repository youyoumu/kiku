import type { AnkiFrontFields } from "./types";

export function Front(props: { ankiFields: AnkiFrontFields }) {
  return (
    <div class="max-w-4xl mx-auto overflow-auto px-4">
      <div
        class="flex flex-col gap-8"
        style={{
          "max-height": "calc(100vh - 4em)",
        }}
      >
        Front
      </div>
    </div>
  );
}
