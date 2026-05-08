import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { createEvent } from '../lib/api';
import { isAuthenticated } from '../lib/auth';

const createEventSchema = z
  .object({
    title: z.string().min(3, 'Informe um título com ao menos 3 caracteres.'),
    description: z.string().max(500).optional(),
    date: z.string().min(1, 'Informe data e hora do evento.'),
    city: z.string().optional(),
    uf: z.string().optional(),
    remote: z.boolean(),
    eventUrl: z.url('Informe uma URL válida.'),
    image: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.remote) {
      return;
    }

    if (!data.city || data.city.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['city'],
        message: 'Informe a cidade.',
      });
    }

    const ufValue = data.uf?.trim() ?? '';
    if (ufValue.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['uf'],
        message: 'UF inválida.',
      });
    }
  });

type CreateEventFormValues = z.infer<typeof createEventSchema> & {
  image?: FileList;
};

export function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = isAuthenticated();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      city: '',
      uf: '',
      remote: false,
      eventUrl: '',
    },
  });

  const isRemote = useWatch({
    control,
    name: 'remote',
  });

  const createEventMutation = useMutation({
    mutationFn: (formValues: CreateEventFormValues) =>
      createEvent({
        title: formValues.title,
        description: formValues.description,
        date: new Date(formValues.date).getTime(),
        city: formValues.remote ? undefined : formValues.city?.trim(),
        uf: formValues.remote ? undefined : formValues.uf?.trim().toUpperCase(),
        remote: formValues.remote,
        eventUrl: formValues.eventUrl,
        image: formValues.image?.item(0) ?? undefined,
      }),
    onSuccess: async (createdEvent) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/eventos/${createdEvent.id}`);
    },
  });

  if (!isAdmin) {
    return (
      <section className="create-page">
        <article className="panel">
          <p className="eyebrow">Acesso restrito</p>
          <h1>Login admin necessario</h1>
          <p className="panel-subtitle">
            Para cadastrar eventos, entre com uma conta administrativa.
          </p>
          <div className="form-actions">
            <Link className="button solid" to="/admin/login">
              Entrar como admin
            </Link>
            <Link className="button ghost" to="/">
              Voltar
            </Link>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="create-page">
      <article className="panel">
        <p className="eyebrow">Novo evento</p>
        <h1>Cadastre um evento em poucos minutos</h1>
        <form
          className="form-grid"
          onSubmit={handleSubmit((formValues) => createEventMutation.mutate(formValues))}
        >
          <label>
            Título
            <input placeholder="Ex: Java + AWS Summit" {...register('title')} />
            {errors.title ? <small>{errors.title.message}</small> : null}
          </label>

          <label>
            Descrição
            <textarea
              placeholder="Resumo do evento, trilhas e público esperado"
              rows={4}
              {...register('description')}
            />
            {errors.description ? <small>{errors.description.message}</small> : null}
          </label>

          <label>
            Data e hora
            <input type="datetime-local" {...register('date')} />
            {errors.date ? <small>{errors.date.message}</small> : null}
          </label>

          <label>
            Link do evento
            <input placeholder="https://..." {...register('eventUrl')} />
            {errors.eventUrl ? <small>{errors.eventUrl.message}</small> : null}
          </label>

          <label className="checkbox-label">
            <input type="checkbox" {...register('remote')} />
            Evento remoto
          </label>

          <div className="inline-fields">
            <label>
              Cidade
              <input
                placeholder={isRemote ? 'Online' : 'São Paulo'}
                {...register('city')}
                disabled={isRemote}
              />
              {errors.city ? <small>{errors.city.message}</small> : null}
            </label>

            <label>
              UF
              <input placeholder="SP" maxLength={2} {...register('uf')} disabled={isRemote} />
              {errors.uf ? <small>{errors.uf.message}</small> : null}
            </label>
          </div>

          <label>
            Banner (opcional)
            <input type="file" accept="image/*" {...register('image')} />
          </label>

          <div className="form-actions">
            <button type="submit" className="button solid" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Enviando...' : 'Criar evento'}
            </button>
            <Link className="button ghost" to="/">
              Cancelar
            </Link>
          </div>

          {createEventMutation.isError ? (
            <p className="status-inline error">
              Não foi possível cadastrar o evento. Verifique os dados e tente novamente.
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
