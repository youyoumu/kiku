import { AnkiConnect } from "#/components/_kiku_lazy/util/ankiConnect";
import { defaultConfig } from "#/util/config";
import { env } from "#/util/general";
import type { Key, WorkerChannels, WorkerResponse } from "./_kiku_worker";

export class WorkerClient {
  worker: Worker;
  private ready: Promise<void>;

  constructor() {
    if (KIKU_STATE.assetsPath !== window.location.origin) {
      this.worker = new Worker(`${KIKU_STATE.assetsPath}/_kiku_worker.js`, {
        type: "module",
      });
    } else {
      this.worker = new Worker(new URL("./_kiku_worker.ts", import.meta.url), {
        type: "module",
      });
    }

    this.ready = this.invoke({
      type: "init",
      payload: {
        baseUrl: import.meta.env.DEV ? "/" : `${KIKU_STATE.assetsPath}/`,
        config: KIKU_STATE.config ?? defaultConfig,
        env: env,
      },
    }).then(() => {});
  }

  async invoke<T extends Key>({
    type,
    payload,
  }: {
    type: T;
    payload: WorkerChannels[T]["payload"];
  }): Promise<WorkerChannels[T]["result"]> {
    if (type !== "init") {
      await this.ready;
    }
    const id = Math.random().toString(36).slice(2);

    return new Promise((resolve, reject) => {
      const handleMessage = (e: MessageEvent<WorkerResponse<T>>) => {
        if (e.data.id !== id) return;
        const msg = e.data;
        if (msg.result) {
          this.worker.removeEventListener("message", handleMessage);
          resolve(msg.result);
        } else if (msg.error) {
          this.worker.removeEventListener("message", handleMessage);
          reject(new Error(msg.error));
        }
      };

      this.worker.addEventListener("message", handleMessage);
      this.worker.postMessage({ id, type, payload });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}
