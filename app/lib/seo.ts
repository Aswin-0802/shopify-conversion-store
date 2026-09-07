type SeoInput = {
  title: string;
  description?: string;
  url?: string;
  image?: string | null;
  type?: 'website' | 'product' | 'article';
  noIndex?: boolean;
};

export function seoPayload({
  title,
  description,
  url,
  image,
  type = 'website',
  noIndex = false,
}: SeoInput) {
  const tags: Array<Record<string, string>> = [
    {title},
    {property: 'og:title', content: title},
    {property: 'og:type', content: type},
    {property: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
    {property: 'twitter:title', content: title},
  ];

  if (description) {
    tags.push(
      {name: 'description', content: description},
      {property: 'og:description', content: description},
      {property: 'twitter:description', content: description},
    );
  }

  if (url) {
    tags.push({tagName: 'link', rel: 'canonical', href: url}, {property: 'og:url', content: url});
  }

  if (image) {
    tags.push(
      {property: 'og:image', content: image},
      {property: 'twitter:image', content: image},
    );
  }

  if (noIndex) {
    tags.push({name: 'robots', content: 'noindex, nofollow'});
  }

  return tags;
}

export function absoluteUrl(request: Request, pathname: string) {
  const url = new URL(request.url);
  return `${url.origin}${pathname}`;
}

export function shopifyNumericId(gid?: string | null) {
  if (!gid) return '';
  const parts = gid.split('/');
  return parts[parts.length - 1] || '';
}
