import {Link, useNavigate} from 'react-router';
import {useState} from 'react';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {colorFromName, isColorOption} from '~/lib/swatch';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);
  const available = Boolean(selectedVariant?.availableForSale);
  const checkoutUrl = selectedVariant
    ? `/cart/${selectedVariant.id}:${quantity}`
    : '/cart';

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;
        const selectedLabel = option.optionValues.find((value) => value.selected)?.name;
        const colorOption = isColorOption(option.name);

        return (
          <div className="product-options" key={option.name}>
            <h3>
              {option.name}
              {selectedLabel ? <span> {selectedLabel}</span> : null}
            </h3>
            <div
              className={`product-options-grid${colorOption ? ' is-swatches' : ''}`}
              role="group"
              aria-label={option.name}
            >
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available: valueAvailable,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;
                const className = `product-options-item${selected ? ' is-selected' : ''}${
                  colorOption ? ' is-swatch' : ''
                }`;

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={className}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      aria-label={name}
                      aria-pressed={selected}
                      style={{opacity: valueAvailable ? 1 : 0.35}}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={className}
                    key={option.name + name}
                    aria-label={name}
                    aria-pressed={selected}
                    disabled={!exists}
                    style={{opacity: valueAvailable ? 1 : 0.35}}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="field">
        <label htmlFor="quantity">Quantity</label>
        <div className="qty">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.max(1, Number(event.currentTarget.value) || 1))
            }
          />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => value + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="product-actions">
        <AddToCartButton
          className="btn btn-full"
          disabled={!selectedVariant || !available}
          onClick={() => open('cart')}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant: {
                      ...selectedVariant,
                      product: selectedVariant.product || {
                        handle: selectedVariant.product?.handle,
                        title: selectedVariant.product?.title,
                      },
                    },
                  },
                ]
              : []
          }
        >
          {available ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
        {available ? (
          <Link className="btn btn-secondary btn-full" to={checkoutUrl}>
            Buy now
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color || colorFromName(name);

  if (!image && !color) return name;

  return (
    <span
      aria-hidden="true"
      className="product-option-label-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {image ? <img src={image} alt="" /> : null}
    </span>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
