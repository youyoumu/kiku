import type { Key, WorkerChannels, WorkerResponse } from "./_kiku_worker";

export class WorkerClient {
  worker: Worker;
  private ready: Promise<void>;

  constructor() {
    //TODO: modular anki web stuff
    if (KIKU_STATE.isAnkiWeb) {
      this.worker = new Worker("/study/media/_kiku_worker.js", {
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
        baseUrl: import.meta.env.DEV
          ? "/"
          : KIKU_STATE.isAnkiWeb
            ? `${window.location.origin}/study/media/`
            : `${window.location.origin}/`,
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
