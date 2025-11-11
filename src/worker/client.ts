import AppWorker from "#/worker/_kiku_worker?worker";
import type { Key, WorkerChannels, WorkerResponse } from "./_kiku_worker";

export class WorkerClient {
  worker: Worker;
  private ready: Promise<void>;

  constructor() {
    this.worker = new AppWorker();
    this.ready = this.invoke({
      type: "init",
      payload: {
        baseUrl: import.meta.env.DEV ? "/" : `${window.location.origin}/`,
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
