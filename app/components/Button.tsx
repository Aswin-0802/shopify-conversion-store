import {Link} from 'react-router';
import {classNames} from '~/lib/collection';

export function Button({
  children,
  to,
  href,
  variant = 'primary',
  type = 'button',
  full,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit';
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const className = classNames(
    'btn',
    variant === 'secondary' && 'btn-secondary',
    variant === 'ghost' && 'btn-ghost',
    full && 'btn-full',
  );

  if (to) {
    return (
      <Link className={className} prefetch="intent" to={to}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={className} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
