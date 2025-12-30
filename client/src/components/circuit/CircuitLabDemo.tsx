/**
 * Circuit Lab Demo Component
 * Showcases End-to-End Arduino + 3D + Simulation integration
 *
 * Features:
 * - Pre-built demo circuits (Blink, Ultrasonic, Servo)
 * - Live 3D visualization
 * - Real Arduino code execution (simulated)
 * - Serial Monitor output
 * - Interactive controls (run/pause/step)
 */

import { useState, useEffect } from 'react';
import { Circuit3DCanvas } from './Circuit3DCanvas';
import { getAllDemos } from '@circuit-sim/kernel/DemoCircuits';
import { useSimulation } from '@/hooks/useSimulation';
import type { CircuitDef } from '@circuit-sim/kernel/contracts';

type DemoName = 'blink' | 'ultrasonic' | 'servo';

export function CircuitLabDemo() {
  const [selectedDemo, setSelectedDemo] = useState<DemoName>('blink');
  const [circuit, setCircuit] = useState<CircuitDef | null>(null);

  // Use simulation hook
  const sim = useSimulation();

  // Load demo circuit
  useEffect(() => {
    const demos = getAllDemos();
    const newCircuit = demos[selectedDemo];
    setCircuit(newCircuit);

    // Initialize simulation with new circuit
    if (sim.state.isInitialized) {
      sim.init(newCircuit);
    }
  }, [selectedDemo, sim.state.isInitialized]);

  const handleRun = () => {
    sim.run();
    console.log('[Demo] Starting simulation...');
  };

  const handlePause = () => {
    sim.pause();
    console.log('[Demo] Pausing simulation...');
  };

  const handleReset = () => {
    sim.reset();
    console.log('[Demo] Resetting circuit...');
  };

  if (!circuit) {
    return <div>Loading demo...</div>;
  }

  return (
    <div className="circuit-lab-demo">
      {/* Header */}
      <header className="demo-header">
        <h1>Circuit Lab - End-to-End Demo</h1>
        <p>Tinkercad-superior Arduino + 3D Simulator</p>
      </header>

      {/* Demo Selector */}
      <div className="demo-selector">
        <button
          className={selectedDemo === 'blink' ? 'active' : ''}
          onClick={() => setSelectedDemo('blink')}
        >
          🔆 Arduino Blink
        </button>
        <button
          className={selectedDemo === 'ultrasonic' ? 'active' : ''}
          onClick={() => setSelectedDemo('ultrasonic')}
        >
          📡 Ultrasonic Sensor
        </button>
        <button
          className={selectedDemo === 'servo' ? 'active' : ''}
          onClick={() => setSelectedDemo('servo')}
        >
          🔄 Servo Motor
        </button>
      </div>

      {/* Main Content */}
      <div className="demo-content">
        {/* 3D Canvas */}
        <div className="canvas-container">
          <Circuit3DCanvas
            components={circuit.components}
            wires={circuit.wires}
          />
        </div>

        {/* Control Panel */}
        <div className="control-panel">
          {/* Simulation Controls */}
          <section className="controls-section">
            <h3>⚙️ Simulation</h3>
            <div className="control-buttons">
              <button
                onClick={handleRun}
                disabled={sim.state.isRunning}
                className="btn-primary"
              >
                ▶️ Run
              </button>
              <button
                onClick={handlePause}
                disabled={!sim.state.isRunning}
                className="btn-secondary"
              >
                ⏸️ Pause
              </button>
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                🔄 Reset
              </button>
            </div>
            <div className="status-indicator">
              Status: {sim.state.isRunning ? '🟢 Running' : '🔴 Stopped'} |
              Time: {(sim.state.time_us / 1000000).toFixed(2)}s |
              FPS: {sim.state.fps}
            </div>
          </section>

          {/* Arduino Code */}
          <section className="code-section">
            <h3>📝 Arduino Code</h3>
            <pre className="code-display">
              <code>{circuit.components[0].properties.code}</code>
            </pre>
          </section>

          {/* Serial Monitor */}
          <section className="serial-section">
            <h3>💬 Serial Monitor (9600 baud)</h3>
            <div className="serial-output">
              {sim.serialOutput.length === 0 ? (
                <div className="serial-empty">
                  No output yet. Click Run to start.
                </div>
              ) : (
                sim.serialOutput.map((output, i) => (
                  <div key={i} className="serial-line">
                    <span className="serial-time">
                      [{(output.timestamp_us / 1000000).toFixed(3)}s]
                    </span>
                    <span className="serial-text">{output.text}</span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => sim.reset()}
              className="btn-small"
            >
              Clear
            </button>
          </section>

          {/* Component Info */}
          <section className="info-section">
            <h3>ℹ️ Circuit Info</h3>
            <dl>
              <dt>Components:</dt>
              <dd>{circuit.components.length}</dd>

              <dt>Wires:</dt>
              <dd>{circuit.wires.length}</dd>

              <dt>Created:</dt>
              <dd>{new Date(circuit.metadata.created).toLocaleDateString()}</dd>
            </dl>
          </section>
        </div>
      </div>

      {/* Architecture Info */}
      <footer className="demo-footer">
        <details>
          <summary>🏗️ Architecture Details</summary>
          <div className="architecture-info">
            <h4>Principal Engineer Architecture</h4>
            <ul>
              <li>✅ Rendering: UI Thread (Three.js + React)</li>
              <li>✅ Simulation: WebWorker (SimEngine + ArduinoRuntime)</li>
              <li>✅ Communication: Message-based (no shared state)</li>
              <li>✅ Connectivity: Union-Find O(α(n)) incremental updates</li>
              <li>✅ Wire Rendering: GPU Instanced (500+ wires @ 60fps)</li>
              <li>✅ Arduino API: Virtualization (NOT AVR emulator)</li>
              <li>✅ Time: Microsecond granularity event-driven</li>
            </ul>

            <h4>Performance Targets</h4>
            <ul>
              <li>FPS: 60fps @ 200+ components</li>
              <li>Wire Rendering: &lt;2ms per frame</li>
              <li>Net Resolution: &lt;1ms for wire add/remove</li>
              <li>Simulation Rate: 1MHz virtual (16× real-time)</li>
            </ul>
          </div>
        </details>
      </footer>

      <style jsx>{`
        .circuit-lab-demo {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          color: #e0e0e0;
          font-family: 'Inter', sans-serif;
        }

        .demo-header {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-bottom: 2px solid #00ffff;
        }

        .demo-header h1 {
          margin: 0;
          font-size: 1.8rem;
          color: #00ffff;
        }

        .demo-header p {
          margin: 0.5rem 0 0;
          opacity: 0.7;
        }

        .demo-selector {
          display: flex;
          gap: 1rem;
          padding: 1rem 2rem;
          background: #1a1a1a;
          border-bottom: 1px solid #333;
        }

        .demo-selector button {
          padding: 0.75rem 1.5rem;
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 6px;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-selector button:hover {
          background: #3a3a3a;
          border-color: #00ffff;
        }

        .demo-selector button.active {
          background: #00ffff;
          color: #0a0a0a;
          border-color: #00ffff;
        }

        .demo-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1px;
          background: #000;
          overflow: hidden;
        }

        .canvas-container {
          background: #0a0a0a;
          position: relative;
        }

        .control-panel {
          background: #1a1a1a;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .controls-section h3,
        .code-section h3,
        .serial-section h3,
        .info-section h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          color: #00ffff;
        }

        .control-buttons {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .btn-primary,
        .btn-secondary,
        .btn-small {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #00ffff;
          color: #0a0a0a;
          font-weight: 600;
        }

        .btn-primary:hover:not(:disabled) {
          background: #00cccc;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #2a2a2a;
          color: #e0e0e0;
          border: 1px solid #444;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #3a3a3a;
        }

        .btn-small {
          background: #2a2a2a;
          color: #00ffff;
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
        }

        .status-indicator {
          font-size: 0.9rem;
          padding: 0.5rem;
          background: #2a2a2a;
          border-radius: 4px;
        }

        .code-display {
          background: #0a0a0a;
          padding: 1rem;
          border-radius: 4px;
          font-size: 0.75rem;
          line-height: 1.5;
          overflow: auto;
          max-height: 300px;
          border: 1px solid #333;
        }

        .serial-output {
          background: #0a0a0a;
          padding: 1rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #333;
          margin-bottom: 0.5rem;
        }

        .serial-empty {
          color: #666;
          text-align: center;
          padding: 2rem;
        }

        .serial-line {
          margin-bottom: 0.25rem;
        }

        .serial-time {
          color: #00ffff;
          margin-right: 0.5rem;
        }

        .serial-text {
          color: #e0e0e0;
        }

        .info-section dl {
          margin: 0;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.5rem;
        }

        .info-section dt {
          font-weight: 600;
          color: #00ffff;
        }

        .info-section dd {
          margin: 0;
        }

        .demo-footer {
          padding: 1rem 2rem;
          background: #1a1a1a;
          border-top: 1px solid #333;
        }

        .demo-footer summary {
          cursor: pointer;
          color: #00ffff;
          font-weight: 600;
        }

        .architecture-info {
          margin-top: 1rem;
          padding: 1rem;
          background: #0a0a0a;
          border-radius: 4px;
        }

        .architecture-info h4 {
          color: #00ffff;
          margin: 1rem 0 0.5rem;
        }

        .architecture-info ul {
          margin: 0;
          padding-left: 1.5rem;
          line-height: 1.8;
        }

        .architecture-info li {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
