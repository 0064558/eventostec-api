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

// --- Schemas ---

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

    if (values.remote) {
      if (city.length > 0 || uf.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Evento remoto não deve ter cidade ou UF.',
          path: ['city'],
        });
      }
      return;
    }

    if (city.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe a cidade.',
        path: ['city'],
      });
    }

    if (uf.length === 0) {
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

// --- Helpers ---

function formatDateTimeLocal(dateValue: string | number): string {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const pad = (v: number) => String(v).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(
    parsedDate.getDate()
  )}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

export function EventDetailsPage() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const isAdmin = isAuthenticated();

  // --- Queries ---

  const detailsQuery = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: () => fetchEventDetails(eventId ?? ''),
    enabled: Boolean(eventId),
  });

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: { code: '', discount: 10, valid: '' },
  });

  const {
    register: registerEditCoupon,
    handleSubmit: handleSubmitEditCoupon,
    reset: resetEditCoupon,
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    control: updateControl,
    reset: resetUpdate,
    setValue: setUpdateValue,
  } = useForm<UpdateEventFormValues>({
    resolver: zodResolver(updateEventSchema),
  });

  const isUpdateRemote = useWatch({ control: updateControl, name: 'remote' });
  const shouldRemoveImage = useWatch({ control: updateControl, name: 'removeImage' });

  const couponMutation = useMutation({
    mutationFn: (values: CouponFormValues) =>
      createCoupon(eventId!, {
        code: values.code.toUpperCase().trim(),
        discount: values.discount,
        valid: new Date(values.valid).getTime(),
      }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: (values: CouponFormValues) =>
      updateCoupon(eventId!, editingCouponId!, {
        code: values.code.toUpperCase().trim(),
        discount: values.discount,
        valid: new Date(values.valid).getTime(),
      }),
    onSuccess: () => {
      setEditingCouponId(null);
      queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (couponId: string) => deleteCoupon(eventId!, couponId),
    onSuccess: () => {
      if (editingCouponId) setEditingCouponId(null);
      queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: (values: UpdateEventFormValues) => {
      const removeImage = Boolean(values.removeImage);
      return updateEvent(eventId!, {
        title: values.title,
        description: values.description,
        date: new Date(values.date).getTime(),
        city: values.remote ? undefined : values.city.trim(),
        uf: values.remote ? undefined : values.uf.trim().toUpperCase(),
        remote: values.remote,
        eventUrl: values.eventUrl,
        image: removeImage ? undefined : values.image?.item(0) ?? undefined,
        removeImage,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['event-details', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: () => deleteEvent(eventId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/');
    },
  });

  // --- Side Effects ---

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

  if (!eventId) return <p className="status-card error">ID de evento inválido.</p>;
  if (detailsQuery.isLoading) return <p className="status-card">Carregando detalhes do evento...</p>;
  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <div className="status-card error">
        <p>Não foi possível carregar este evento.</p>
        <Link className="button ghost" to="/">Voltar para listagem</Link>
      </div>
    );
  }

  const event = detailsQuery.data;
  const isUpdateDisabled = !isAdmin || updateEventMutation.isPending || deleteEventMutation.isPending;

  return (
    <section className="details-page">
      <article className="details-hero">
        <div className="details-cover">
          {event.imgUrl ? <img src={event.imgUrl} alt={event.title} /> : (
            <div className="fallback-cover"><span>Evento sem imagem</span></div>
          )}
        </div>
        <div className="details-info">
          <p className="eyebrow">Detalhes do evento</p>
          <h1>{event.title}</h1>
          <p>{event.description || 'Sem descrição cadastrada.'}</p>
          <div className="details-meta">
            <span>{formatEventDate(event.date)}</span>
            <span>{event.city ? `${event.city}, ${event.uf}` : 'Remoto'}</span>
          </div>
          <div className="details-actions">
            <a className="button solid" href={event.eventUrl} target="_blank" rel="noreferrer">Acessar evento</a>
            <Link className="button ghost" to="/">Voltar</Link>
            {isAdmin && (
              <>
                <button className="button ghost" onClick={() => setIsEditing(!isEditing)} disabled={isUpdateDisabled}>
                  {isEditing ? 'Fechar edição' : 'Editar evento'}
                </button>
                <button className="button ghost" onClick={() => window.confirm('Excluir evento?') && deleteEventMutation.mutate()} disabled={isUpdateDisabled}>
                  {deleteEventMutation.isPending ? 'Excluindo...' : 'Excluir evento'}
                </button>
              </>
            )}
          </div>
        </div>
      </article>

      {isAdmin && isEditing && (
        <article className="panel">
          <h2>Editar evento</h2>
          <form className="form-grid" onSubmit={handleSubmitUpdate((v) => updateEventMutation.mutate(v))}>
            <label>Título <input {...registerUpdate('title')} /></label>
            <label>Descrição <textarea rows={4} {...registerUpdate('description')} /></label>
            <label>Data e hora <input type="datetime-local" {...registerUpdate('date')} /></label>
            <label>Link <input {...registerUpdate('eventUrl')} /></label>
            <label className="checkbox-label"><input type="checkbox" {...registerUpdate('remote')} /> Evento remoto</label>

            <div className="inline-fields">
              <label>Cidade <input disabled={isUpdateRemote} {...registerUpdate('city')} /></label>
              <label>UF <input maxLength={2} disabled={isUpdateRemote} {...registerUpdate('uf')} /></label>
            </div>

            <label>Atualizar banner <input type="file" accept="image/*" disabled={shouldRemoveImage} {...registerUpdate('image')} /></label>
            {event.imgUrl && <label className="checkbox-label"><input type="checkbox" {...registerUpdate('removeImage')} /> Remover imagem atual</label>}

            <div className="form-actions">
              <button type="submit" className="button solid" disabled={isUpdateDisabled}>Salvar</button>
              <button type="button" className="button ghost" onClick={() => setIsEditing(false)}>Cancelar</button>
            </div>
          </form>
        </article>
      )}

      <section className="details-grid">
        <article className="panel">
          <div className="filters-head">
            <h2>Cupons válidos</h2>
            {isAdmin && (
              <button className="button ghost" onClick={() => setIsCouponFormOpen(!isCouponFormOpen)}>
                {isCouponFormOpen ? 'Fechar' : 'Cadastrar cupom'}
              </button>
            )}
          </div>

          {event.coupons.length === 0 ? <p>Sem cupons disponíveis.</p> : (
            <ul className="coupon-list">
              {event.coupons.map((coupon) => (
                <li key={coupon.id}>
                  <div className="coupon-row">
                    <div className="coupon-info">
                      <strong>{coupon.code}</strong>
                      <p>Válido até {formatDateOnly(coupon.validUntil)}</p>
                    </div>
                    <span className="coupon-discount">{coupon.discount}%</span>
                  </div>
                  {isAdmin && (
                    <div className="coupon-actions">
                      <button className="button ghost" onClick={() => {
                        setEditingCouponId(coupon.id);
                        resetEditCoupon({ code: coupon.code, discount: coupon.discount, valid: formatDateTimeLocal(coupon.validUntil) });
                      }}>Editar</button>
                      <button className="button ghost" onClick={() => window.confirm('Excluir cupom?') && deleteCouponMutation.mutate(coupon.id)}>Excluir</button>
                    </div>
                  )}
                  {editingCouponId === coupon.id && (
                    <form className="form-grid coupon-edit-form" onSubmit={handleSubmitEditCoupon((v) => updateCouponMutation.mutate(v))}>
                      <input {...registerEditCoupon('code')} />
                      <input type="number" {...registerEditCoupon('discount', { valueAsNumber: true })} />
                      <input type="datetime-local" {...registerEditCoupon('valid')} />
                      <div className="form-actions">
                        <button type="submit" className="button solid">Salvar</button>
                        <button type="button" className="button ghost" onClick={() => setEditingCouponId(null)}>Cancelar</button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>

        {isAdmin && isCouponFormOpen && (
          <article className="panel">
            <form className="form-grid" onSubmit={handleSubmit((v) => couponMutation.mutate(v))}>
              <label>Código <input {...register('code')} /></label>
              <label>Desconto <input type="number" {...register('discount', { valueAsNumber: true })} /></label>
              <label>Validade <input type="datetime-local" {...register('valid')} /></label>
              <button type="submit" className="button solid" disabled={couponMutation.isPending}>Salvar cupom</button>
            </form>
          </article>
        )}
      </section>

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