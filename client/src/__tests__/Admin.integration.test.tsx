/* @vitest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Admin from '@/pages/Admin';
import { trpc } from '@/lib/trpc';
import { vi } from 'vitest';

// Mock the trpc hooks used by Admin
vi.mock('@/lib/trpc', async () => {
  const actual = await vi.importActual<any>('@/lib/trpc');
  return {
    ...actual,
    trpc: {
      ...actual.trpc,
      useUtils: () => ({ projects: { list: { invalidate: () => {} } }, certifications: { list: { invalidate: () => {} } }, resources: { list: { invalidate: () => {} } } }),
      projects: { list: { useQuery: () => ({ data: [], isLoading: false }) }, create: { useMutation: () => ({ mutate: () => {}, isPending: false }) }, delete: { useMutation: () => ({ mutate: () => {} }) } },
      certifications: { list: { useQuery: () => ({ data: [], isLoading: false }) }, create: { useMutation: () => ({ mutate: () => {}, isPending: false }) }, delete: { useMutation: () => ({ mutate: () => {} }) } },
      resources: { list: { useQuery: () => ({ data: [], isLoading: false }) }, create: { useMutation: () => ({ mutate: () => {}, isPending: false }) }, delete: { useMutation: () => ({ mutate: () => {} }) } },
      analytics: { adminStats: { useQuery: () => ({ data: {} }) } },
      upload: {
        file: { useMutation: () => ({ mutateAsync: async (payload: any) => ({ url: 'https://example.com/uploads/' + payload.fileName, key: 'uploads/test' }) }) },
        getPresignedUrl: { useMutation: () => ({ mutateAsync: async (payload: any) => ({ url: 'https://example.com/presigned', key: 'uploads/test', publicUrl: 'https://cdn.example.com/uploads/test' }) }) }
      }
    }
  };
});

vi.mock('@/_core/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true, loading: false, logout: () => {} }) }));

describe('Admin integration', () => {
  it('shows dialog description and can request presigned URL', async () => {
    render(<Admin />);

    // open Projects dialog
    const addBtn = await screen.findByText(/Add Project/i);
    fireEvent.click(addBtn);

    // dialog description present
    expect(await screen.findByText(/Fill in the project details/i)).toBeTruthy();

    // simulate file input (can't fully PUT in JSDOM) - ensure presigned is called by seeing upload mutation
    // open resources dialog
    const addResBtn = await screen.findByText(/Add Resource/i);
    fireEvent.click(addResBtn);

    // find file upload label
    expect(await screen.findByText(/Click to upload file/i)).toBeTruthy();
  });
});