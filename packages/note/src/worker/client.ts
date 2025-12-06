import type { KikuConfig } from "#/util/config";
import type { Env } from "#/util/general";
import type { NexApi } from "./_kiku_worker.ts";

export function wrap<T>(worker: Worker) {
  let msgId = 0;
  const pending = new Map();

  worker.onmessage = (e) => {
    const { id, result, error, log } = e.data;
    if (log) {
      KIKU_STATE.logger.push(log.level, log.args);
      return;
    }

    const { resolve, reject } = pending.get(id);
    pending.delete(id);
    error ? reject(error) : resolve(result);
  };

  return new Proxy(
    {},
    {
      get(_, fn) {
        if (fn === "then") return undefined;
        return (...args: unknown[]) =>
          new Promise((resolve, reject) => {
            const id = ++msgId;
            pending.set(id, { resolve, reject });
            worker.postMessage({ id, fn, args });
          });
      },
    },
  ) as T;
}

export class NexClient {
  nex: Promise<NexApi>;
  worker: Worker;

  constructor(payload: {
    env: Env;
    assetsPath: string;
    config: KikuConfig;
    preferAnkiConnect: boolean;
  }) {
    let worker: Worker;
    let nex: Promise<NexApi> | undefined;
    if (KIKU_STATE.nexClient) {
      worker = KIKU_STATE.nexClient.worker;
      nex = KIKU_STATE.nexClient.nex;
    } else if (KIKU_STATE.assetsPath !== window.location.origin) {
      worker = new Worker(`${KIKU_STATE.assetsPath}/_kiku_worker.js`, {
        type: "module",
      });
    } else {
      worker = new Worker(new URL("./_kiku_worker.ts", import.meta.url), {
        type: "module",
      });
    }
    if (nex) {
      this.nex = new Promise<NexApi>((resolve) => {
        nex.then((Nex) => {
          Nex.init(payload).then(() => {
            resolve(Nex);
          });
        });
      });
    } else {
      const Nex = wrap<NexApi>(worker);
      this.nex = new Promise<NexApi>((resolve) => {
        Nex.init(payload).then(() => {
          resolve(Nex);
        });
      });
    }
    this.worker = worker;
  }
}
