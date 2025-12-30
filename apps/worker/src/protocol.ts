import type { SimState } from "@kernel/types";

export type SimStartRequest = {
  type: "sim:start";
  intervalMs?: number;
};

export type SimStopRequest = {
  type: "sim:stop";
};

export type SimRequest = SimStartRequest | SimStopRequest;

export type SimStartedResponse = {
  type: "sim:started";
  intervalMs: number;
};

export type SimStoppedResponse = {
  type: "sim:stopped";
};

export type SimHeartbeatResponse = {
  type: "sim:heartbeat";
  state: SimState;
};

export type SimResponse =
  | SimStartedResponse
  | SimStoppedResponse
  | SimHeartbeatResponse;
