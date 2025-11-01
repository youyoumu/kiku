function App() {
	return (
		<button
			onClick={() => {
				try {
					const container = document.getElementById("anki-fields");
					if (!container) return;

					const nodes = container.querySelectorAll("[data-field]");
					const obj = {};

					nodes.forEach((node) => {
						const key = node.getAttribute("data-field");
						// Use innerHTML to keep any HTML inside the field
						obj[key] = node.innerHTML || "";
					});

					console.log(obj);
				} catch (err) {
					console.error("Failed to build note JSON", err);
				}
			}}
		>
			test
		</button>
	);
}

export default App;
