import {ProductCard} from '~/components/ProductCard';

export function ProductGrid({
  products,
  className = 'product-grid',
}: {
  products: Array<Parameters<typeof ProductCard>[0]['product']>;
  className?: string;
}) {
  if (!products.length) {
    return <p className="empty-state">No products found.</p>;
  }

  return (
    <div className={className}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={index < 4 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({count = 8}: {count?: number}) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({length: count}, (_, index) => `skeleton-card-${index}`).map(
        (id) => (
          <div key={id} className="skeleton skeleton-card" />
        ),
      )}
    </div>
  );
}
