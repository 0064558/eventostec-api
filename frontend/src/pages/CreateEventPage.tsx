import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { createEvent } from '../lib/api';

const createEventSchema = z.object({
  title: z.string().min(3, 'Informe um título com ao menos 3 caracteres.'),
  description: z.string().max(500).optional(),
  date: z.string().min(1, 'Informe data e hora do evento.'),
  city: z.string().min(2, 'Informe a cidade.'),
  uf: z
    .string()
    .min(2, 'UF inválida.')
    .max(2, 'UF inválida.')
    .transform((value) => value.toUpperCase()),
  remote: z.boolean(),
  eventUrl: z.url('Informe uma URL válida.'),
  image: z.any().optional(),
});

type CreateEventFormValues = z.infer<typeof createEventSchema> & {
  image?: FileList;
};

export function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
        city: formValues.city,
        uf: formValues.uf,
        remote: formValues.remote,
        eventUrl: formValues.eventUrl,
        image: formValues.image?.item(0) ?? undefined,
      }),
    onSuccess: async (createdEvent) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/eventos/${createdEvent.id}`);
    },
  });

  return (
    <section className="create-page">
      <article className="panel">
        <p className="eyebrow">Novo evento</p>
        <h1>Cadastre um evento em poucos minutos</h1>
        <p className="panel-subtitle">
          Este formulário envia os dados em <code>multipart/form-data</code> para a API.
        </p>

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
              />
              {errors.city ? <small>{errors.city.message}</small> : null}
            </label>

            <label>
              UF
              <input placeholder="SP" maxLength={2} {...register('uf')} />
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
    </section>
  );
}
