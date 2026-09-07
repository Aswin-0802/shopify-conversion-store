import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {classNames, isOnSale} from '~/lib/collection';

type MoneyLike = {
  amount: string;
  currencyCode: string;
};

export function Price({
  price,
  compareAtPrice,
}: {
  price?: MoneyLike | null;
  compareAtPrice?: MoneyLike | null;
}) {
  if (!price) return null;
  const sale = isOnSale(price, compareAtPrice);

  return (
    <div className="price">
      <span className={classNames(sale && 'price-sale')}>
        <Money data={price as MoneyV2} />
      </span>
      {sale && compareAtPrice ? (
        <span className="price-compare">
          <Money data={compareAtPrice as MoneyV2} />
        </span>
      ) : null}
    </div>
  );
}
