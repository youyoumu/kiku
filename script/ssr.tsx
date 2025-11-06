import { createStore } from "solid-js/store";
import { generateHydrationScript, renderToString } from "solid-js/web";
import { Front } from "#/components/Front";
import { Back } from "../src/components/Back";
import {
  BreakpointContextProvider,
  ConfigContextProvider,
} from "../src/components/shared/Context";
import { defaultConfig } from "../src/util/config";

const [config, setConfig] = createStore(defaultConfig);

globalThis.KIKU_STATE = {
  rootDataset: {},
};

export function getSsrTemplate() {
  const frontTemplate = renderToString(() => (
    <BreakpointContextProvider>
      <ConfigContextProvider value={[config, setConfig]}>
        <Front />
      </ConfigContextProvider>
    </BreakpointContextProvider>
  ));
  const backTemplate = renderToString(() => (
    <BreakpointContextProvider>
      <ConfigContextProvider value={[config, setConfig]}>
        <Back />
      </ConfigContextProvider>
    </BreakpointContextProvider>
  ));

  const hydrationScript = generateHydrationScript();

  const result = {
    frontTemplate,
    backTemplate,
    hydrationScript,
  };
  console.log(result);
  return result;
}
