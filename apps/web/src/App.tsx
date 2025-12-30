import { useEffect, useMemo, useState } from "react";
import { SimBridge } from "./simBridge";

type LogEntry = {
  id: string;
  message: string;
};

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const bridge = useMemo(() => {
    return new SimBridge((message) => {
      if (message.type === "sim:heartbeat") {
        const line = `heartbeat tick=${message.state.tick} at ${new Date(
          message.state.updatedAt
        ).toLocaleTimeString()}`;
        setLogs((prev) => [{ id: `${message.state.tick}-${message.state.updatedAt}`, message: line }, ...prev].slice(0, 50));
        console.log(line);
      }
      if (message.type === "sim:started") {
        setRunning(true);
      }
      if (message.type === "sim:stopped") {
        setRunning(false);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      bridge.dispose();
    };
  }, [bridge]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Sim Console</h1>
          <p>Worker heartbeat stream</p>
        </div>
        <div className="actions">
          <button
            className="primary"
            onClick={() => bridge.start(1000)}
            disabled={running}
          >
            Start Sim
          </button>
          <button onClick={() => bridge.stop()} disabled={!running}>
            Stop Sim
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <span>Status</span>
          <span className={running ? "badge on" : "badge off"}>
            {running ? "Running" : "Stopped"}
          </span>
        </div>
        <div className="log-list">
          {logs.length === 0 ? (
            <div className="empty">No messages yet. Click Start Sim.</div>
          ) : (
            logs.map((entry) => (
              <div className="log" key={entry.id}>
                {entry.message}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
