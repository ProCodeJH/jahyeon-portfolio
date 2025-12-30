'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState(`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Dashboard
          </Link>
          <h1 className="text-white font-semibold">Circuit Editor</h1>
          <span className="text-gray-400 text-sm">Untitled Project</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">
            ▶ Compile
          </button>
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
            💾 Save
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
            <h2 className="text-white text-sm font-semibold">Arduino Code</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Center: Circuit Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-white text-sm font-semibold">Circuit View</h2>
            <div className="flex gap-2 text-xs text-gray-400">
              <button className="hover:text-white">🔍 Zoom</button>
              <button className="hover:text-white">⚡ Simulate</button>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 relative">
            {/* Placeholder for WebGL Canvas (Phase 1.5) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  WebGL Circuit Renderer
                </h3>
                <p className="text-gray-500 mb-4">Coming in Phase 1.5</p>
                <div className="inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-3">
                  <p className="text-yellow-800 font-semibold">
                    🚧 PixiJS renderer + GPU particles pending
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Right: Component Library */}
        <div className="w-64 border-l border-gray-700 flex flex-col bg-gray-800">
          <div className="px-4 py-2 border-b border-gray-700">
            <h2 className="text-white text-sm font-semibold">Components</h2>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {[
              { name: 'Arduino UNO', icon: '🎛️' },
              { name: 'LED', icon: '💡' },
              { name: 'Button', icon: '🔘' },
              { name: 'Resistor', icon: '⚡' },
              { name: 'Breadboard', icon: '📊' },
              { name: 'PIR Sensor', icon: '👁️' },
              { name: 'Ultrasonic', icon: '📡' },
              { name: 'Servo', icon: '⚙️' },
            ].map((component) => (
              <div
                key={component.name}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
              >
                <div className="text-2xl mb-1">{component.icon}</div>
                <div className="text-xs text-gray-300">{component.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Serial Monitor */}
      <div className="h-48 border-t border-gray-700 bg-gray-900 flex flex-col">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-white text-sm font-semibold">Serial Monitor</h2>
          <button className="text-gray-400 hover:text-white text-xs">Clear</button>
        </div>
        <div className="flex-1 overflow-auto p-4 font-mono text-sm text-gray-400">
          <p>Waiting for serial output...</p>
          <p className="text-gray-600">Compile and run your code to see output here</p>
        </div>
      </div>
    </div>
  );
}
