import {Link} from 'react-router';

export function PrivacyChoices() {
  return (
    <Link className="privacy-choices" to="/pages/data-sharing-opt-out">
      <PrivacyIcon />
      Your privacy choices
    </Link>
  );
}

function PrivacyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M12 3 5.5 6v5.4c0 4.2 2.8 7.9 6.5 8.6 3.7-.7 6.5-4.4 6.5-8.6V6L12 3Z" />
      <path d="M9.2 12.1 11 14l3.8-4.2" />
    </svg>
  );
}
