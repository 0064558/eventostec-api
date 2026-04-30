import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="notfound-page">
      <article className="panel">
        <p className="eyebrow">404</p>
        <h1>Página não encontrada</h1>
        <p>Este caminho não existe na aplicação.</p>
        <Link className="button solid" to="/">
          Voltar para eventos
        </Link>
      </article>
    </section>
  );
}
