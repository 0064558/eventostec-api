import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginAdmin } from '../lib/api';
import { isAuthenticated, setAuthToken } from '../lib/auth';

const loginSchema = z.object({
  email: z.string().email('Informe um email valido.'),
  password: z.string().min(1, 'Informe a senha.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const isAdmin = isAuthenticated();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => loginAdmin(values),
    onSuccess: (data) => {
      setAuthToken(data.token);
      navigate('/');
    },
  });

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="create-page">
      <article className="panel">
        <p className="eyebrow">Acesso administrativo</p>
        <h1>Entrar como administrador</h1>
        <p className="panel-subtitle">
          Use seu email e senha para gerenciar eventos e cupons.
        </p>

        <form
          className="form-grid"
          onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        >
          <label>
            Email
            <input type="email" placeholder="" {...register('email')} />
            {errors.email ? <small>{errors.email.message}</small> : null}
          </label>

          <label>
            Senha
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                {...register('password')}
              />
              <button
                type="button"
                className="button ghost password-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password ? <small>{errors.password.message}</small> : null}
          </label>

          <div className="form-actions">
            <button type="submit" className="button solid" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </button>
            <Link className="button ghost" to="/">
              Voltar
            </Link>
          </div>

          {loginMutation.isError ? (
            <p className="status-inline error">
              Nao foi possivel fazer login. Verifique as credenciais e tente novamente.
            </p>
          ) : null}
        </form>
      </article>

      <footer className="main-footer">
        <div className="footer-content">
          <div className="brand-minimal">
            <div className="brand-badge-small"></div>
            <span className="brand-title">EVNT</span>
          </div>

          <div className="footer-info">
            <p>
              © 2026 — Desenvolvido por Rodrigo Alexandre
              {!isAdmin && (
                <>
                  <span className="footer-separator"> </span>
                  <Link to="/admin/login" className="admin-link-discrete">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                      <path d="M 25 3 C 18.364481 3 13 8.3644809 13 15 L 13 20 L 9 20 C 7.3545455 20 6 21.354545 6 23 L 6 47 C 6 48.645455 7.3545455 50 9 50 L 41 50 C 42.645455 50 44 48.645455 44 47 L 44 23 C 44 21.354545 42.645455 20 41 20 L 37 20 L 37 15 C 37 8.3644809 31.635519 3 25 3 z M 25 5 C 30.564481 5 35 9.4355191 35 15 L 35 20 L 15 20 L 15 15 C 15 9.4355191 19.435519 5 25 5 z M 9 22 L 13.832031 22 A 1.0001 1.0001 0 0 0 14.158203 22 L 35.832031 22 A 1.0001 1.0001 0 0 0 36.158203 22 L 41 22 C 41.554545 22 42 22.445455 42 23 L 42 47 C 42 47.554545 41.554545 48 41 48 L 9 48 C 8.4454545 48 8 47.554545 8 47 L 8 23 C 8 22.445455 8.4454545 22 9 22 z M 25 30 C 23.3 30 22 31.3 22 33 C 22 33.9 22.4 34.699219 23 35.199219 L 23 38 C 23 39.1 23.9 40 25 40 C 26.1 40 27 39.1 27 38 L 27 35.199219 C 27.6 34.699219 28 33.9 28 33 C 28 31.3 26.7 30 25 30 z"></path>
                    </svg>
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}
