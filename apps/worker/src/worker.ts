import type { ConnectivityGraph, SimState } from "@kernel/types";
import type { SimRequest, SimResponse } from "./protocol";

const DEFAULT_INTERVAL_MS = 1000;

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let tick = 0;

const emptyGraph: ConnectivityGraph = {
  components: [],
  nets: [],
};

function buildState(): SimState {
  tick += 1;
  return {
    tick,
    graph: emptyGraph,
    updatedAt: Date.now(),
  };
}

function send(message: SimResponse) {
  self.postMessage(message);
}

function start(intervalMs: number) {
  stop();
  tick = 0;
  send({ type: "sim:started", intervalMs });
  intervalHandle = setInterval(() => {
    send({ type: "sim:heartbeat", state: buildState() });
  }, intervalMs);
}

function stop() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
  send({ type: "sim:stopped" });
}

self.addEventListener("message", (event: MessageEvent<SimRequest>) => {
  const message = event.data;
  if (message.type === "sim:start") {
    start(message.intervalMs ?? DEFAULT_INTERVAL_MS);
    return;
  }
  if (message.type === "sim:stop") {
    stop();
  }
});
