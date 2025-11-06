import { createStore } from "solid-js/store";
import { generateHydrationScript, renderToString } from "solid-js/web";
import { Back } from "./components/Back";
import {
  BreakpointContextProvider,
  ConfigContextProvider,
} from "./components/shared/Context";
import { defaultConfig } from "./util/config";

const [config, setConfig] = createStore(defaultConfig);

globalThis.KIKU_STATE = {};

const html = renderToString(() => (
  <BreakpointContextProvider>
    <ConfigContextProvider value={[config, setConfig]}>
      <Back />
    </ConfigContextProvider>
  </BreakpointContextProvider>
));
const hydrationScript = generateHydrationScript();

console.log(html);
console.log("\n");
console.log(hydrationScript);
