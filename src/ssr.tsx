import { createStore } from "solid-js/store";
import { generateHydrationScript, renderToString } from "solid-js/web";
import { Back } from "./components/Back";
import {
  AnkiFieldContextProvider,
  BreakpointContextProvider,
  ConfigContextProvider,
} from "./components/shared/Context";
import { exampleFields6 } from "./types";
import { defaultConfig } from "./util/config";

const [config, setConfig] = createStore(defaultConfig);

globalThis.KIKU_STATE = {};

const html = renderToString(() => (
  <BreakpointContextProvider>
    <AnkiFieldContextProvider value={{ ankiFields: exampleFields6 }}>
      <ConfigContextProvider value={[config, setConfig]}>
        <Back />
      </ConfigContextProvider>
    </AnkiFieldContextProvider>
  </BreakpointContextProvider>
));
const hydrationScript = generateHydrationScript();

console.log(html);
console.log("\n");
console.log(hydrationScript);
