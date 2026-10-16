import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { logoutUser } from './authApi';

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      // A sessão local é limpa mesmo se a chamada ao backend falhar.
    } finally {
      logout();
      navigate('/login');
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-16 border-[3px] border-ink bg-surface px-6 py-2
        font-heading text-sm font-bold text-ink
        disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? 'Saindo…' : 'Sair'}
    </button>
  );
}
