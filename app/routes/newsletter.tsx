import {redirect} from 'react-router';
import type {Route} from './+types/newsletter';

function returnTo(request: Request, status: 'success' | 'error', message?: string) {
  const referer = request.headers.get('Referer');
  const url = new URL(referer || '/', request.url);
  url.searchParams.set('newsletter', status);
  if (message) url.searchParams.set('newsletterMessage', message);
  return redirect(`${url.pathname}${url.search}${url.hash}`);
}

export async function loader() {
  return redirect('/');
}

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return returnTo(request, 'error', 'Please enter a valid email address.');
  }

  const endpoint = context.env.NEWSLETTER_FORM_ENDPOINT as string | undefined;
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({email}),
    });
    if (!response.ok) {
      return returnTo(request, 'error', 'Subscription failed. Please try again.');
    }
  }

  return returnTo(request, 'success');
}
