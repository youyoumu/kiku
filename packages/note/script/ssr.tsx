import { createStore } from "solid-js/store";
import { generateHydrationScript, renderToString } from "solid-js/web";
import { Front } from "#/components/Front";
import { AnkiFieldContextProvider } from "#/components/shared/AnkiFieldsContext";
import { CardStoreContextProvider } from "#/components/shared/CardContext";
import { ConfigContextProvider } from "#/components/shared/ConfigContext";
import { CtxContextProvider } from "#/components/shared/CtxContext";
import { FieldGroupContextProvider } from "#/components/shared/FieldGroupContext";
import { GeneralContextProvider } from "#/components/shared/GeneralContext";
import { debug } from "#/util/debug";
import { Logger } from "#/util/logger";
import { Back } from "../src/components/Back";
import { BreakpointContextProvider } from "../src/components/shared/BreakpointContext";
import { defaultConfig } from "../src/util/defaulConfig";

const [config, setConfig] = createStore(defaultConfig);

const logger = new Logger();

globalThis.KIKU_STATE = {
  assetsPath: "",
  logger,
  aborter: new AbortController(),
  debug,
};

export function getSsrTemplate() {
  const frontSsrTemplate = renderToString(() => (
    <GeneralContextProvider aborter={globalThis.KIKU_STATE.aborter}>
      <AnkiFieldContextProvider>
        <CardStoreContextProvider side="front">
          <BreakpointContextProvider>
            <ConfigContextProvider value={[config, setConfig]}>
              <FieldGroupContextProvider>
                <CtxContextProvider>
                  <Front />
                </CtxContextProvider>
              </FieldGroupContextProvider>
            </ConfigContextProvider>
          </BreakpointContextProvider>
        </CardStoreContextProvider>
      </AnkiFieldContextProvider>
    </GeneralContextProvider>
  ));
  const backSsrTemplate = renderToString(() => (
    <GeneralContextProvider aborter={globalThis.KIKU_STATE.aborter}>
      <AnkiFieldContextProvider>
        <CardStoreContextProvider side="back">
          <BreakpointContextProvider>
            <ConfigContextProvider value={[config, setConfig]}>
              <FieldGroupContextProvider>
                <CtxContextProvider>
                  <Back />
                </CtxContextProvider>
              </FieldGroupContextProvider>
            </ConfigContextProvider>
          </BreakpointContextProvider>
        </CardStoreContextProvider>
      </AnkiFieldContextProvider>
    </GeneralContextProvider>
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
