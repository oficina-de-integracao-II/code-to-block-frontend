import { useCallback, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from './AuthContext';
import { loginUser, loginWithGoogle } from './authApi';
import { GoogleLoginButton } from './GoogleLoginButton';

type LoginLocationState = {
  sessionExpired?: boolean;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const sessionExpired = Boolean((location.state as LoginLocationState | null)?.sessionExpired);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { data } = await loginUser({ email, senha });
      login(data.accessToken, data.user);
      navigate('/app');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setSubmitError('E-mail ou senha incorretos.');
      } else {
        setSubmitError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      setGoogleError(null);

      try {
        const { data } = await loginWithGoogle(idToken);
        login(data.accessToken, data.user);
        navigate('/app');
      } catch {
        setGoogleError(
          'Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.',
        );
      }
    },
    [login, navigate],
  );

  const handleGoogleError = useCallback(() => {
    setGoogleError(
      'Não deu para entrar com o Google. Tente de novo ou use e-mail e senha.',
    );
  }, []);

  return (
    <AuthLayout>
      <h1 className="font-heading text-2xl font-bold text-ink">Entrar</h1>

      {sessionExpired && (
        <p className="w-full rounded-[10px] bg-soft-warn px-3 py-2.5 text-sm text-warn-text">
          Você ficou um tempão fora. Entre de novo!
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
        <TextField
          label="E-mail"
          type="email"
          placeholder="nome@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />

        {submitError && (
          <p role="alert" className="text-sm text-danger-text">
            {submitError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>

        <div className="flex w-full items-center gap-3">
          <div className="h-[2px] flex-1 bg-ink-muted" />
          <span className="text-sm text-ink-muted">ou</span>
          <div className="h-[2px] flex-1 bg-ink-muted" />
        </div>

        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        {googleError && (
          <p role="alert" className="text-[13px] text-warn-text">
            {googleError}
          </p>
        )}

        <p className="flex justify-center gap-1.5 text-sm text-ink-muted">
          Não tem conta?{' '}
          <Link to="/register" className="font-extrabold text-primary">
            Criar conta
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
