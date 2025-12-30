import type { SimResponse } from "@worker/protocol";

export type HeartbeatListener = (message: SimResponse) => void;

export class SimBridge {
  private worker: Worker;
  private listener: HeartbeatListener;

  constructor(listener: HeartbeatListener) {
    this.listener = listener;
    this.worker = new Worker(new URL("../../worker/src/worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.addEventListener("message", (event: MessageEvent<SimResponse>) => {
      this.listener(event.data);
    });
  }

  start(intervalMs?: number) {
    this.worker.postMessage({ type: "sim:start", intervalMs });
  }

  stop() {
    this.worker.postMessage({ type: "sim:stop" });
  }

  dispose() {
    this.worker.terminate();
  }
}
