import {useId} from 'react';
import {Form, useNavigation, useSearchParams} from 'react-router';
import {siteContent} from '~/lib/site-content';

export function Newsletter({compact = false}: {compact?: boolean}) {
  const navigation = useNavigation();
  const submitting = navigation.formAction === '/newsletter';
  const [searchParams] = useSearchParams();
  const inputId = useId();
  const status = searchParams.get('newsletter');
  const errorMessage = searchParams.get('newsletterMessage');

  return (
    <section className={compact ? 'footer-newsletter' : 'newsletter'} aria-labelledby="newsletter-heading">
      <p className="eyebrow">Newsletter</p>
      <h2 id="newsletter-heading">{siteContent.newsletter.title}</h2>
      <p className="lede" style={{margin: '0 auto'}}>
        {siteContent.newsletter.body}
      </p>
      {status === 'success' ? (
        <p className="form-status" role="status">
          {siteContent.newsletter.success}
        </p>
      ) : (
        <Form method="post" action="/newsletter" className="newsletter-form">
          <label className="sr-only" htmlFor={inputId}>
            Email address
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={siteContent.newsletter.placeholder}
          />
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : siteContent.newsletter.cta}
          </button>
        </Form>
      )}
      {status === 'error' && errorMessage ? (
        <p className="field-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
