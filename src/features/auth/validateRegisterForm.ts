const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterFormValues = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (values.nome.trim().length === 0) {
    errors.nome = 'Informe seu nome.';
  }

  if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (values.senha.length < 8) {
    errors.senha = 'A senha deve ter no mínimo 8 caracteres.';
  }

  if (values.confirmarSenha !== values.senha) {
    errors.confirmarSenha = 'As senhas não coincidem.';
  }

  return errors;
}
