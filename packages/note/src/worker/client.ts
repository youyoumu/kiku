import { type Remote, wrap } from "comlink";
import type { KikuConfig } from "#/util/config";
import type { Env } from "#/util/general";
import type { Nex as Nex$ } from "./_kiku_worker.ts";

export class WorkerClient {
  nex: Promise<Remote<Nex$>>;

  constructor(payload: { env: Env; assetsPath: string; config: KikuConfig }) {
    let worker: Worker;
    if (KIKU_STATE.assetsPath !== window.location.origin) {
      worker = new Worker(`${KIKU_STATE.assetsPath}/_kiku_worker.js`, {
        type: "module",
      });
    } else {
      worker = new Worker(new URL("./_kiku_worker.ts", import.meta.url), {
        type: "module",
      });
    }
    const Nex = wrap<typeof Nex$>(worker);
    this.nex = new Nex(payload);
  }
}
