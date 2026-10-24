import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import Home from '../pages/Home';

test('protected home shows username when logged in', () => {
  localStorage.setItem('skribl_token', 'fake');
  // Mock getMe
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: '1', username: 'alice', email: 'alice@example.com' }),
  }) as any;

  render(
    <MemoryRouter>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </MemoryRouter>
  );
});
