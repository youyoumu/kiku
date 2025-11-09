import { createStore } from "solid-js/store";
import { generateHydrationScript, renderToString } from "solid-js/web";
import { Front } from "#/components/Front";
import { Back } from "../src/components/Back";
import {
  AnkiFieldContextProvider,
  BreakpointContextProvider,
  CardStoreContextProvider,
  ConfigContextProvider,
} from "../src/components/shared/Context";
import { defaultConfig } from "../src/util/config";

const [config, setConfig] = createStore(defaultConfig);

globalThis.KIKU_STATE = {
  rootDataset: defaultConfig,
};

export function getSsrTemplate() {
  const frontTemplate = renderToString(() => (
    <AnkiFieldContextProvider>
      <CardStoreContextProvider>
        <BreakpointContextProvider>
          <ConfigContextProvider value={[config, setConfig]}>
            <Front />
          </ConfigContextProvider>
        </BreakpointContextProvider>
      </CardStoreContextProvider>
    </AnkiFieldContextProvider>
  ));
  const backTemplate = renderToString(() => (
    <AnkiFieldContextProvider>
      <CardStoreContextProvider>
        <BreakpointContextProvider>
          <ConfigContextProvider value={[config, setConfig]}>
            <Back />
          </ConfigContextProvider>
        </BreakpointContextProvider>
      </CardStoreContextProvider>
    </AnkiFieldContextProvider>
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
