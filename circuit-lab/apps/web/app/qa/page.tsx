'use client';

import React from 'react';
import Link from 'next/link';
import { FileCheck, Ruler, Eye, Zap, Grid3X3 } from 'lucide-react';

const QA_PAGES = [
  {
    href: '/qa/assets',
    icon: FileCheck,
    title: 'Asset Quality',
    description: 'Verify 3D assets at 100%, 200%, 400% zoom with lighting checks',
  },
  {
    href: '/qa/alignment',
    icon: Ruler,
    title: 'Pin Alignment',
    description: 'Grid overlay verification, snap point accuracy (≤0.25px error)',
  },
  {
    href: '/qa/components',
    icon: Grid3X3,
    title: 'Component Testing',
    description: 'Individual component behavior and interaction testing',
  },
  {
    href: '/qa/simulation',
    icon: Zap,
    title: 'Simulation QA',
    description: 'Circuit simulation accuracy and performance testing',
  },
  {
    href: '/qa/visual',
    icon: Eye,
    title: 'Visual Regression',
    description: 'Screenshot comparison for visual consistency',
  },
];

export default function QAPage() {
  return (
    <div className="min-h-screen bg-arduino-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Quality Assurance</h1>
        <p className="text-muted-foreground mb-8">
          Comprehensive testing suite for Circuit Lab components and features
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {QA_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="p-6 bg-card rounded-lg border border-border hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <page.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">{page.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">Acceptance Criteria</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Arduino Blink works correctly</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>LED lights correctly with proper color</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>PWM visibly changes LED brightness</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Wire flow animation visible and directional</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Serial output works correctly</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>60fps maintained on mid-range laptop</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Zoom does not blur text/textures</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>RBAC enforced correctly</span>
            </li>
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Compile sandbox secure</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
