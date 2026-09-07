import {Image} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Price} from '~/components/Price';
import {Rating} from '~/components/Rating';
import {useAside} from '~/components/Aside';
import {isOnSale} from '~/lib/collection';
import {useVariantUrl} from '~/lib/variants';

type ProductCardProduct = {
  id: string;
  handle: string;
  title: string;
  availableForSale?: boolean | null;
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  images?: {
    nodes: Array<{
      id?: string | null;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    }>;
  };
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  compareAtPriceRange?: {
    minVariantPrice?: {amount: string; currencyCode: string} | null;
  } | null;
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale?: boolean | null;
    title?: string | null;
    image?: {
      id?: string | null;
      url: string;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    } | null;
    price: {amount: string; currencyCode: string};
    compareAtPrice?: {amount: string; currencyCode: string} | null;
    selectedOptions?: Array<{name: string; value: string}> | null;
    product?: {handle: string; title: string} | null;
  } | null;
  rating?: {value?: string | null} | null;
  ratingCount?: {value?: string | null} | null;
};

export function ProductCard({
  product,
  loading,
  showQuickAdd = true,
}: {
  product: ProductCardProduct;
  loading?: 'eager' | 'lazy';
  showQuickAdd?: boolean;
}) {
  const {open} = useAside();
  const variant = product.selectedOrFirstAvailableVariant;
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage || product.images?.nodes?.[0];
  const hoverImage = product.images?.nodes?.[1];
  const price = variant?.price || product.priceRange.minVariantPrice;
  const compareAt =
    variant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;
  const available = variant?.availableForSale ?? product.availableForSale ?? true;
  const sale = isOnSale(price, compareAt);

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link prefetch="intent" to={variantUrl} aria-label={product.title}>
          {image ? (
            <Image
              alt={image.altText || product.title}
              data={image}
              loading={loading}
              sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw"
            />
          ) : (
            <div className="skeleton skeleton-card" />
          )}
          {hoverImage ? (
            <Image
              className="hover-image"
              alt=""
              data={hoverImage}
              loading="lazy"
              sizes="(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw"
            />
          ) : null}
        </Link>
        {sale ? <span className="badge">Sale</span> : null}
        {!available ? <span className="badge badge-sold">Sold out</span> : null}
        {showQuickAdd && available && variant?.id ? (
          <div className="quick-add">
            <AddToCartButton
              className="btn btn-full"
              onClick={() => open('cart')}
              lines={[
                {
                  merchandiseId: variant.id,
                  quantity: 1,
                  selectedVariant: {
                    ...variant,
                    selectedOptions: variant.selectedOptions ?? [],
                    product: {
                      handle: variant.product?.handle || product.handle,
                      title: variant.product?.title || product.title,
                    },
                  },
                },
              ]}
            >
              Quick add
            </AddToCartButton>
          </div>
        ) : null}
      </div>
      <Link prefetch="intent" to={variantUrl}>
        <h3>{product.title}</h3>
        <Price price={price} compareAtPrice={compareAt} />
        <Rating
          ratingMetafield={product.rating?.value}
          ratingCountMetafield={product.ratingCount?.value}
        />
      </Link>
    </article>
  );
}
