import { createStore } from "solid-js/store";
import { generateHydrationScript, renderToString } from "solid-js/web";
import { Front } from "#/components/Front";
import { CardStoreContextProvider } from "#/components/shared/CardContext";
import { FieldGroupContextProvider } from "#/components/shared/FieldGroupContext";
import { Logger } from "#/util/logger";
import { Back } from "../src/components/Back";
import {
  AnkiFieldContextProvider,
  BreakpointContextProvider,
  ConfigContextProvider,
} from "../src/components/shared/Context";
import { defaultConfig } from "../src/util/config";

const [config, setConfig] = createStore(defaultConfig);

const logger = new Logger();

globalThis.KIKU_STATE = {
  assetsPath: "",
  logger,
};

export function getSsrTemplate() {
  const frontSsrTemplate = renderToString(() => (
    <AnkiFieldContextProvider>
      <CardStoreContextProvider side="front">
        <BreakpointContextProvider>
          <ConfigContextProvider value={[config, setConfig]}>
            <FieldGroupContextProvider>
              <Front />
            </FieldGroupContextProvider>
          </ConfigContextProvider>
        </BreakpointContextProvider>
      </CardStoreContextProvider>
    </AnkiFieldContextProvider>
  ));
  const backSsrTemplate = renderToString(() => (
    <AnkiFieldContextProvider>
      <CardStoreContextProvider side="back">
        <BreakpointContextProvider>
          <ConfigContextProvider value={[config, setConfig]}>
            <FieldGroupContextProvider>
              <Back />
            </FieldGroupContextProvider>
          </ConfigContextProvider>
        </BreakpointContextProvider>
      </CardStoreContextProvider>
    </AnkiFieldContextProvider>
  ));

  const hydrationScript = generateHydrationScript();

  const result = {
    frontSsrTemplate,
    backSsrTemplate,
    hydrationScript,
  };
  console.log(result);
  return result;
}
