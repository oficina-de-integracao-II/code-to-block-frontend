import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

function LoginPage() {
  return <h2>Login</h2>;
}

function RegisterPage() {
  return <h2>Cadastro</h2>;
}

function WorkspacePage() {
  return <p>Bem-vindo ao editor!</p>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<WorkspacePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}