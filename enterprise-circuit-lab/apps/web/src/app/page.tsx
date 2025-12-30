'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Circuit Lab Enterprise
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enterprise-grade, production-ready Arduino circuit simulator with Tinkercad-class visuals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon="🎨"
            title="WebGL Rendering"
            description="60fps photoreal circuit visualization powered by PixiJS"
          />
          <FeatureCard
            icon="⚡"
            title="Real Compilation"
            description="True Arduino compilation with arduino-cli in secure Docker sandbox"
          />
          <FeatureCard
            icon="🔬"
            title="AVR Emulation"
            description="In-browser ATmega328P execution via WebAssembly"
          />
          <FeatureCard
            icon="🌊"
            title="Flow Animation"
            description="GPU-optimized particle system for electric current visualization"
          />
          <FeatureCard
            icon="🏢"
            title="Enterprise RBAC"
            description="Multi-tenant organizations with Owner/Admin/Editor/Viewer roles"
          />
          <FeatureCard
            icon="📊"
            title="Observability"
            description="Audit logs, metrics, and structured logging"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-16">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/editor"
                className="px-8 py-4 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Launch Editor
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Architecture</h2>
          <div className="space-y-4">
            <ArchitectureItem
              title="Frontend"
              tech="Next.js 14 + TypeScript + PixiJS + Zustand"
            />
            <ArchitectureItem
              title="Backend"
              tech="NestJS + PostgreSQL + Redis + MinIO"
            />
            <ArchitectureItem
              title="Compilation"
              tech="BullMQ + Docker + arduino-cli + avr-gcc"
            />
            <ArchitectureItem
              title="Simulation"
              tech="Custom circuit engine + AVR8js WASM"
            />
          </div>
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3">
            <span className="text-green-800 font-semibold">
              ✅ Phase 1.1 Complete - Auth + Dashboard Ready
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ArchitectureItem({ title, tech }: { title: string; tech: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="font-bold text-blue-600 min-w-[120px]">{title}:</div>
      <div className="text-gray-700">{tech}</div>
    </div>
  );
}
