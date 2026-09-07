import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {POLICY_LIST} from '~/lib/policies';

export function PolicyLayout({
  title,
  lede,
  handle,
  children,
}: {
  title: string;
  lede?: string;
  handle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell policy-page">
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Policies', to: '/policies'},
          {label: title},
        ]}
      />
      <div className="policy-layout">
        <nav className="policy-nav" aria-label="Policies">
          <p className="eyebrow">Policies</p>
          <ul>
            {POLICY_LIST.map((policy) => (
              <li key={policy.handle}>
                <Link
                  prefetch="intent"
                  to={`/policies/${policy.handle}`}
                  aria-current={handle === policy.handle ? 'page' : undefined}
                >
                  {policy.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="policy-article">
          <header className="page-header">
            <p className="eyebrow">Sloane</p>
            <h1>{title}</h1>
            {lede ? <p className="lede">{lede}</p> : null}
          </header>
          <div className="policy-body">{children}</div>
        </article>
      </div>
    </div>
  );
}
