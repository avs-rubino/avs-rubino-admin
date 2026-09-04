import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import * as AuthHook from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

const renderWithRouter = (ui, initialRoute = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute component (IAM Zero-Trust Enforcement)', () => {
  it('displays loading spinner while authentication state is loading', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      currentUser: null,
      role: null,
      loading: true,
    });

    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>Protected Secret Content</div>
      </ProtectedRoute>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Protected Secret Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      currentUser: null,
      role: null,
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Secret Content')).not.toBeInTheDocument();
  });

  it('strictly redirects Utente_Normale to /login?status=pending (Zero-Trust baseline)', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      currentUser: { uid: 'user-123' },
      role: 'Utente_Normale',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Secret Content')).not.toBeInTheDocument();
  });

  it('allows Editor_Admin to access protected routes', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      currentUser: { uid: 'editor-123' },
      role: 'Editor_Admin',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Secret Content')).toBeInTheDocument();
  });

  it('blocks Editor_Admin when requireSuperAdmin is true and redirects to /', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      currentUser: { uid: 'editor-123' },
      role: 'Editor_Admin',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requireSuperAdmin={true}>
        <div>Super Admin Only Area</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Super Admin Only Area')).not.toBeInTheDocument();
  });

  it('allows Super_Admin to access requireSuperAdmin routes', () => {
    vi.spyOn(AuthHook, 'useAuth').mockReturnValue({
      currentUser: { uid: 'superadmin-123' },
      role: 'Super_Admin',
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute requireSuperAdmin={true}>
        <div>Super Admin Only Area</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Super Admin Only Area')).toBeInTheDocument();
  });
});
