import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { z } from 'zod';
import { createCoupon, fetchEventDetails } from '../lib/api';
import { formatDateOnly, formatEventDate } from '../lib/date';

const couponSchema = z.object({
  code: z.string().min(3, 'Informe ao menos 3 caracteres para o cupom.'),
  discount: z
    .number()
    .min(1, 'O desconto precisa ser maior que 0.')
    .max(100, 'O desconto máximo é 100.'),
  valid: z.string().min(1, 'Informe a data de validade.'),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export function EventDetailsPage() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();

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
          </div>
        </div>
      </article>

      <section className="details-grid">
        <article className="panel">
          <h2>Cupons válidos</h2>
          {event.coupons.length === 0 ? (
            <p className="status-inline">Ainda não há cupons disponíveis para este evento.</p>
          ) : (
            <ul className="coupon-list">
              {event.coupons.map((coupon) => (
                <li key={`${coupon.code}-${coupon.validUntil}`}>
                  <div>
                    <strong>{coupon.code}</strong>
                    <p>Válido até {formatDateOnly(coupon.validUntil)}</p>
                  </div>
                  <span>{coupon.discount}%</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <h2>Cadastrar cupom</h2>
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
        </article>
      </section>
    </section>
  );
}
