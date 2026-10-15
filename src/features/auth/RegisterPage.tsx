import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { registerUser } from './authApi';
import { validateRegisterForm, type RegisterFormErrors } from './validateRegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateRegisterForm({ nome, email, senha, confirmarSenha });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({ nome, email, senha });
      navigate('/login');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setSubmitError('Este e-mail já está cadastrado.');
      } else {
        setSubmitError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-heading text-2xl font-bold text-ink">Criar conta</h1>

      <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
        <TextField
          label="Nome"
          placeholder="Seu nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          error={errors.nome}
        />
        <TextField
          label="E-mail"
          type="email"
          placeholder="nome@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Senha (mín. 8 caracteres)"
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          error={errors.senha}
        />
        <TextField
          label="Confirmar senha"
          type="password"
          value={confirmarSenha}
          onChange={(event) => setConfirmarSenha(event.target.value)}
          error={errors.confirmarSenha}
        />

        {submitError && (
          <p role="alert" className="text-sm text-danger-text">
            {submitError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>

        <p className="flex justify-center gap-1.5 text-sm text-ink-muted">
          Já tem conta?{' '}
          <Link to="/login" className="font-extrabold text-primary">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
