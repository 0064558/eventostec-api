import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import {
  createCoupon,
  deleteCoupon,
  deleteEvent,
  fetchEventDetails,
  updateCoupon,
  updateEvent,
} from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import { formatDateOnly, formatEventDate } from '../lib/date';

const couponSchema = z.object({
  code: z.string().min(3, 'Informe ao menos 3 caracteres para o cupom.'),
  discount: z
    .number()
    .min(1, 'O desconto precisa ser maior que 0.')
    .max(100, 'O desconto máximo é 100.'),
  valid: z.string().min(1, 'Informe a data de validade.'),
});

const updateEventSchema = z
  .object({
    title: z.string().min(3, 'Informe um título com ao menos 3 caracteres.'),
    description: z
      .string()
      .min(1, 'Informe uma descrição.')
      .max(500, 'A descrição deve ter até 500 caracteres.'),
    date: z.string().min(1, 'Informe data e hora do evento.'),
    city: z.string(),
    uf: z.string(),
    remote: z.boolean(),
    eventUrl: z.string().url('Informe uma URL válida.'),
    image: z.any().optional(),
    removeImage: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const city = values.city.trim();
    const uf = values.uf.trim();
    const hasCity = city.length > 0;
    const hasUf = uf.length > 0;

    if (values.remote) {
      if (hasCity || hasUf) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Evento remoto não deve ter cidade ou UF.',
          path: ['city'],
        });
      }
      return;
    }

    if (!hasCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a cidade.',
        path: ['city'],
      });
    }

    if (!hasUf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a UF.',
        path: ['uf'],
      });
    } else if (uf.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'UF inválida.',
        path: ['uf'],
      });
    }
  });

type CouponFormValues = z.infer<typeof couponSchema>;
type UpdateEventFormValues = z.infer<typeof updateEventSchema> & {
  image?: FileList;
};

function formatDateTimeLocal(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  const year = parsedDate.getFullYear();
  const month = pad(parsedDate.getMonth() + 1);
  const day = pad(parsedDate.getDate());
  const hours = pad(parsedDate.getHours());
  const minutes = pad(parsedDate.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EventDetailsPage() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const isAdmin = isAuthenticated();

  const detailsQuery = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: () => fetchEventDetails(eventId ?? ''),
    enabled: Boolean(eventId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discount: 10,
      valid: '',
    },
  });

  const {
    register: registerEditCoupon,
    handleSubmit: handleSubmitEditCoupon,
    reset: resetEditCoupon,
    formState: { errors: editErrors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discount: 10,
      valid: '',
    },
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    control: updateControl,
    reset: resetUpdate,
    setValue: setUpdateValue,
    formState: { errors: updateErrors },
  } = useForm<UpdateEventFormValues>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      city: '',
      uf: '',
      remote: true,
      eventUrl: '',
      removeImage: false,
    },
  });

  const isUpdateRemote = useWatch({
    control: updateControl,
    name: 'remote',
  });

  const shouldRemoveImage = useWatch({
    control: updateControl,
    name: 'removeImage',
  });

  const couponMutation = useMutation({
    mutationFn: (values: CouponFormValues) =>
      createCoupon(eventId ?? '', {
        code: values.code.toUpperCase().trim(),
        discount: values.discount,
        valid: new Date(values.valid).getTime(),
      }),
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: (values: CouponFormValues) => {
      if (!eventId || !editingCouponId) {
        throw new Error('Cupom inválido.');
      }

      return updateCoupon(eventId, editingCouponId, {
        code: values.code.toUpperCase().trim(),
        discount: values.discount,
        valid: new Date(values.valid).getTime(),
      });
    },
    onSuccess: async () => {
      setEditingCouponId(null);
      resetEditCoupon();
      await queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (couponId: string) => {
      if (!eventId) {
        throw new Error('ID de evento inválido.');
      }
      await deleteCoupon(eventId, couponId);
    },
    onSuccess: async () => {
      if (editingCouponId) {
        setEditingCouponId(null);
        resetEditCoupon();
      }
      await queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: (values: UpdateEventFormValues) => {
      if (!eventId) {
        throw new Error('ID de evento inválido.');
      }

      const removeImage = Boolean(values.removeImage);
      const cityValue = values.city.trim();
      const ufValue = values.uf.trim().toUpperCase();

      return updateEvent(eventId, {
        title: values.title,
        description: values.description,
        date: new Date(values.date).getTime(),
        city: values.remote ? undefined : cityValue,
        uf: values.remote ? undefined : ufValue,
        remote: values.remote,
        eventUrl: values.eventUrl,
        image: removeImage ? undefined : values.image?.item(0) ?? undefined,
        removeImage,
      });
    },
    onSuccess: async () => {
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) {
        throw new Error('ID de evento inválido.');
      }
      await deleteEvent(eventId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/');
    },
  });

  useEffect(() => {
    if (detailsQuery.data) {
      const eventData = detailsQuery.data;
      resetUpdate({
        title: eventData.title ?? '',
        description: eventData.description ?? '',
        date: formatDateTimeLocal(eventData.date),
        city: eventData.city ?? '',
        uf: eventData.uf ?? '',
        remote: !(eventData.city || eventData.uf),
        eventUrl: eventData.eventUrl ?? '',
        removeImage: false,
      });
    }
  }, [detailsQuery.data, resetUpdate]);

  useEffect(() => {
    if (isUpdateRemote) {
      setUpdateValue('city', '');
      setUpdateValue('uf', '');
    }
  }, [isUpdateRemote, setUpdateValue]);

  if (!eventId) {
    return <p className="status-card error">ID de evento inválido.</p>;
  }

  if (detailsQuery.isLoading) {
    return <p className="status-card">Carregando detalhes do evento...</p>;
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <div className="status-card error">
        <p>Não foi possível carregar este evento.</p>
        <Link className="button ghost" to="/">
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const event = detailsQuery.data;
  const location = event.city ? `${event.city}, ${event.uf}` : 'Remoto';
  const isUpdateDisabled =
    !isAdmin || updateEventMutation.isPending || deleteEventMutation.isPending;
  const isCouponActionDisabled =
    !isAdmin ||
    couponMutation.isPending ||
    updateCouponMutation.isPending ||
    deleteCouponMutation.isPending;

  function handleDeleteEvent() {
    if (!eventId) {
      return;
    }

    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm('Deseja realmente excluir este evento?');
    if (!confirmed) {
      return;
    }

    deleteEventMutation.mutate();
  }

  function handleEditCoupon(couponId: string, code: string, discount: number, valid: string) {
    if (!isAdmin) {
      return;
    }

    setEditingCouponId(couponId);
    resetEditCoupon({
      code,
      discount,
      valid: formatDateTimeLocal(valid),
    });
  }

  function handleDeleteCoupon(couponId: string) {
    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm('Deseja realmente excluir este cupom?');
    if (!confirmed) {
      return;
    }

    deleteCouponMutation.mutate(couponId);
  }

  return (
    <section className="details-page">
      <article className="details-hero">
        <div className="details-cover">
          {event.imgUrl ? (
            <img src={event.imgUrl} alt={event.title} />
          ) : (
            <div className="fallback-cover">
              <span>Evento sem imagem</span>
            </div>
          )}
        </div>
        <div className="details-info">
          <p className="eyebrow">Detalhes do evento</p>
          <h1>{event.title}</h1>
          <p>{event.description || 'Sem descrição cadastrada.'}</p>
          <div className="details-meta">
            <span>{formatEventDate(event.date)}</span>
            <span>{location}</span>
          </div>
          <div className="details-actions">
            <a className="button solid" href={event.eventUrl} target="_blank" rel="noreferrer">
              Acessar evento
            </a>
            <Link className="button ghost" to="/">
              Voltar
            </Link>
            {isAdmin ? (
              <button
                type="button"
                className="button ghost"
                onClick={() => setIsEditing((current) => !current)}
                disabled={isUpdateDisabled}
              >
                {isEditing ? 'Fechar edição' : 'Editar evento'}
              </button>
            ) : null}
            {isAdmin ? (
              <button
                type="button"
                className="button ghost"
                onClick={handleDeleteEvent}
                disabled={isUpdateDisabled}
              >
                {deleteEventMutation.isPending ? 'Excluindo...' : 'Excluir evento'}
              </button>
            ) : null}
          </div>
        </div>
      </article>

      {isAdmin && isEditing ? (
        <article className="panel">
          <h2>Editar evento</h2>
          <form
            className="form-grid"
            onSubmit={handleSubmitUpdate((values) => updateEventMutation.mutate(values))}
          >
            <label>
              Título
              <input placeholder="Ex: Java + AWS Summit" {...registerUpdate('title')} />
              {updateErrors.title ? <small>{updateErrors.title.message}</small> : null}
            </label>

            <label>
              Descrição
              <textarea
                placeholder="Resumo do evento, trilhas e público esperado"
                rows={4}
                {...registerUpdate('description')}
              />
              {updateErrors.description ? (
                <small>{updateErrors.description.message}</small>
              ) : null}
            </label>

            <label>
              Data e hora
              <input type="datetime-local" {...registerUpdate('date')} />
              {updateErrors.date ? <small>{updateErrors.date.message}</small> : null}
            </label>

            <label>
              Link do evento
              <input placeholder="https://..." {...registerUpdate('eventUrl')} />
              {updateErrors.eventUrl ? <small>{updateErrors.eventUrl.message}</small> : null}
            </label>

            <label className="checkbox-label">
              <input type="checkbox" {...registerUpdate('remote')} />
              Evento remoto
            </label>

            <div className="inline-fields">
              <label>
                Cidade
                <input
                  placeholder={isUpdateRemote ? 'Online' : 'São Paulo'}
                  disabled={isUpdateRemote}
                  {...registerUpdate('city')}
                />
                {updateErrors.city ? <small>{updateErrors.city.message}</small> : null}
              </label>

              <label>
                UF
                <input
                  placeholder="SP"
                  maxLength={2}
                  disabled={isUpdateRemote}
                  {...registerUpdate('uf')}
                />
                {updateErrors.uf ? <small>{updateErrors.uf.message}</small> : null}
              </label>
            </div>

            <label>
              Atualizar banner (opcional)
              <input
                type="file"
                accept="image/*"
                disabled={shouldRemoveImage}
                {...registerUpdate('image')}
              />
            </label>

            {event.imgUrl ? (
              <label className="checkbox-label">
                <input type="checkbox" {...registerUpdate('removeImage')} />
                Remover imagem atual
              </label>
            ) : null}

            <div className="form-actions">
              <button type="submit" className="button solid" disabled={isUpdateDisabled}>
                {updateEventMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button
                type="button"
                className="button ghost"
                onClick={() => setIsEditing(false)}
                disabled={isUpdateDisabled}
              >
                Cancelar
              </button>
            </div>

            {updateEventMutation.isError ? (
              <p className="status-inline error">
                Não foi possível atualizar o evento. Verifique os dados e tente novamente.
              </p>
            ) : null}
            {updateEventMutation.isSuccess ? (
              <p className="status-inline success">Evento atualizado com sucesso.</p>
            ) : null}
          </form>
        </article>
      ) : null}

      <section className="details-grid">
        <article className="panel">
          <div className="filters-head">
            <h2>Cupons válidos</h2>
            {isAdmin ? (
              <button
                type="button"
                className="button ghost"
                onClick={() => setIsCouponFormOpen((current) => !current)}
              >
                {isCouponFormOpen ? 'Fechar' : 'Cadastrar cupom'}
              </button>
            ) : null}
          </div>
          {event.coupons.length === 0 ? (
            <p className="status-inline">Ainda não há cupons disponíveis para este evento.</p>
          ) : (
            <ul className="coupon-list">
              {event.coupons.map((coupon) => {
                const isEditingCoupon = editingCouponId === coupon.id;
                return (
                  <li key={coupon.id}>
                    <div className="coupon-row">
                      <div className="coupon-info">
                        <strong>{coupon.code}</strong>
                        <p>Válido até {formatDateOnly(coupon.validUntil)}</p>
                      </div>
                      <span className="coupon-discount">{coupon.discount}%</span>
                    </div>
                    {isAdmin ? (
                      <div className="coupon-actions">
                        <button
                          type="button"
                          className="button ghost"
                          onClick={() =>
                            handleEditCoupon(
                              coupon.id,
                              coupon.code,
                              coupon.discount,
                              coupon.validUntil,
                            )
                          }
                          disabled={isCouponActionDisabled}
                        >
                          {isEditingCoupon ? 'Editando' : 'Editar'}
                        </button>
                        <button
                          type="button"
                          className="button ghost"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={isCouponActionDisabled}
                        >
                          Excluir
                        </button>
                      </div>
                    ) : null}
                    {isAdmin && isEditingCoupon ? (
                      <form
                        className="form-grid coupon-edit-form"
                        onSubmit={handleSubmitEditCoupon((values) =>
                          updateCouponMutation.mutate(values),
                        )}
                      >
                        <label>
                          Código
                          <input placeholder="EX: JAVA20" {...registerEditCoupon('code')} />
                          {editErrors.code ? <small>{editErrors.code.message}</small> : null}
                        </label>
                        <label>
                          Desconto (%)
                          <input
                            type="number"
                            min={1}
                            max={100}
                            {...registerEditCoupon('discount', { valueAsNumber: true })}
                          />
                          {editErrors.discount ? (
                            <small>{editErrors.discount.message}</small>
                          ) : null}
                        </label>
                        <label>
                          Validade
                          <input type="datetime-local" {...registerEditCoupon('valid')} />
                          {editErrors.valid ? <small>{editErrors.valid.message}</small> : null}
                        </label>
                        <div className="form-actions">
                          <button
                            type="submit"
                            className="button solid"
                            disabled={updateCouponMutation.isPending}
                          >
                            {updateCouponMutation.isPending ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            className="button ghost"
                            onClick={() => setEditingCouponId(null)}
                            disabled={updateCouponMutation.isPending}
                          >
                            Cancelar
                          </button>
                        </div>
                        {updateCouponMutation.isError ? (
                          <p className="status-inline error">
                            Não foi possível atualizar o cupom. Tente novamente.
                          </p>
                        ) : null}
                      </form>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="panel">
      
          {isAdmin && !isCouponFormOpen ? (
            <p className="status-inline">
              Clique em "Cadastrar cupom" para adicionar um novo cupom.
            </p>
          ) : null}
          {isAdmin && isCouponFormOpen ? (
            <form
              className="form-grid"
              onSubmit={handleSubmit((values) => couponMutation.mutate(values))}
            >
              <label>
                Código
                <input placeholder="EX: JAVA20" {...register('code')} />
                {errors.code ? <small>{errors.code.message}</small> : null}
              </label>
              <label>
                Desconto (%)
                <input
                  type="number"
                  min={1}
                  max={100}
                  {...register('discount', { valueAsNumber: true })}
                />
                {errors.discount ? <small>{errors.discount.message}</small> : null}
              </label>
              <label>
                Validade
                <input type="datetime-local" {...register('valid')} />
                {errors.valid ? <small>{errors.valid.message}</small> : null}
              </label>

              <button type="submit" className="button solid" disabled={couponMutation.isPending}>
                {couponMutation.isPending ? 'Salvando...' : 'Salvar cupom'}
              </button>
              {couponMutation.isError ? (
                <p className="status-inline error">
                  Não foi possível salvar o cupom. Verifique os dados e tente novamente.
                </p>
              ) : null}
              {couponMutation.isSuccess ? (
                <p className="status-inline success">Cupom cadastrado com sucesso.</p>
              ) : null}
            </form>
          ) : null}
        </article>
      </section>
    </section>
  );
}
