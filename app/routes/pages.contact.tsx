import {Form, useActionData, useLoaderData, useNavigation} from 'react-router';
import {absoluteUrl, seoPayload} from '~/lib/seo';
import {siteContent} from '~/lib/site-content';
import type {Route} from './+types/pages.contact';

export const meta: Route.MetaFunction = ({data}) => {
  return seoPayload({
    title: 'Contact',
    description: siteContent.contact.intro,
    url: data?.canonicalUrl,
  });
};

export async function loader({context, request}: Route.LoaderArgs) {
  const {shop} = await context.storefront.query(`#graphql
    query ContactShop { shop { name } }
  `);

  return {
    shopName: shop.name,
    canonicalUrl: absoluteUrl(request, '/pages/contact'),
    contactEndpointConfigured: Boolean(context.env.CONTACT_FORM_ENDPOINT),
  };
}

type ActionData = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) fieldErrors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }
  if (phone && phone.replace(/\D/g, '').length < 7) {
    fieldErrors.phone = 'Please enter a valid phone number.';
  }
  if (message.length < 10) fieldErrors.message = 'Please enter a message of at least 10 characters.';

  if (Object.keys(fieldErrors).length) {
    return {fieldErrors} satisfies ActionData;
  }

  const endpoint = context.env.CONTACT_FORM_ENDPOINT as string | undefined;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({name, email, phone, message}),
    });
    if (!response.ok) {
      return {error: 'We could not send your message. Please email us directly.'} satisfies ActionData;
    }
  }

  return {ok: true} satisfies ActionData;
}

export default function ContactPage() {
  const {contactEndpointConfigured} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';
  const contact = siteContent.contact;

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h1>{contact.title}</h1>
        <p className="lede">{contact.intro}</p>
      </header>
      <div className="contact-layout">
        <Form method="post" className="contact-form" noValidate>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" autoComplete="name" required />
            {actionData?.fieldErrors?.name ? (
              <p className="field-error">{actionData.fieldErrors.name}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
            {actionData?.fieldErrors?.email ? (
              <p className="field-error">{actionData.fieldErrors.email}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />
            {actionData?.fieldErrors?.phone ? (
              <p className="field-error">{actionData.fieldErrors.phone}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required />
            {actionData?.fieldErrors?.message ? (
              <p className="field-error">{actionData.fieldErrors.message}</p>
            ) : null}
          </div>
          {actionData?.error ? <p className="field-error">{actionData.error}</p> : null}
          {actionData?.ok ? (
            <p className="form-status" role="status">
              {contactEndpointConfigured
                ? 'Thank you. We received your message and will reply shortly.'
                : `Thank you. Please also email ${contact.email} if this is time-sensitive. Configure CONTACT_FORM_ENDPOINT to deliver submissions automatically.`}
            </p>
          ) : null}
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send message'}
          </button>
        </Form>
        <aside>
          <h2>Contact information</h2>
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <p>
            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
          </p>
          <p>{contact.address}</p>
          <h3>Business hours</h3>
          {contact.hours.map((item) => (
            <p key={item.days}>
              <strong>{item.days}</strong>
              <br />
              {item.time}
            </p>
          ))}
          <h3>Social</h3>
          {siteContent.social.map((item) => (
            <p key={item.label}>
              <a href={item.href} rel="noopener noreferrer" target="_blank">
                {item.label}
              </a>
            </p>
          ))}
        </aside>
      </div>
      <section className="section accordion">
        <p className="eyebrow">FAQ</p>
        <h2>Common questions</h2>
        {contact.faq.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
