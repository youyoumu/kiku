import { onMount } from "solid-js";
import type { AnkiFields } from "./types";

function App(props: { ankiFields: AnkiFields }) {
	let sentenceEl: HTMLDivElement | undefined;
	onMount(() => {
		if (sentenceEl) {
			const ruby = sentenceEl.querySelectorAll("ruby");
			ruby.forEach((el) => {
				el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
			});
		}
	});

	return (
		<div class="max-w-4xl mx-auto flex flex-col gap-8">
			<div class="flex rounded-lg gap-4 h-56">
				<div class="flex-1 bg-base-200 rounded-lg flex flex-col items-center justify-center">
					<div
						class="text-3xl"
						innerHTML={props.ankiFields["kana:ExpressionFurigana"]}
					></div>
					<div class="text-6xl" innerHTML={props.ankiFields.Expression}></div>
					<div class="text-3xl">{/* TODO: pitch  */}</div>
				</div>
				<div
					class="[&_>_img]:h-full [&_>_img]:rounded-lg"
					innerHTML={props.ankiFields.Picture}
				></div>
			</div>
			<div class="flex flex-col gap-4 items-center text-center">
				<div
					class="text-4xl"
					ref={sentenceEl}
					innerHTML={
						props.ankiFields["furigana:SentenceFurigana"] ??
						props.ankiFields["furigana:Sentence"]
					}
				></div>
			</div>
			<div class="bg-base-200 p-4 border-s-4 text-xl rounded-lg [&_ol]:list-inside [&_ul]:list-inside">
				<div innerHTML={props.ankiFields.MainDefinition}></div>
			</div>
		</div>
	);
}

export default App;
