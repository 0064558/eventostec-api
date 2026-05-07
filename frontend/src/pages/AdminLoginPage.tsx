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
            <input type="email" placeholder="admin@admin.com" {...register('email')} />
            {errors.email ? <small>{errors.email.message}</small> : null}
          </label>

          <label>
            Senha
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
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
    </section>
  );
}
