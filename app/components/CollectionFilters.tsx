import {useSearchParams} from 'react-router';
import {SORT_OPTIONS} from '~/lib/collection';
import {useAside} from '~/components/Aside';

export function CollectionFilters({
  filters,
  productCount,
  variant = 'drawer',
}: {
  filters: Array<{
    id: string;
    label: string;
    values: Array<{id: string; label: string; count: number; input: string}>;
  }>;
  productCount: number;
  variant?: 'drawer' | 'desktop';
}) {
  const [params] = useSearchParams();
  const selected = new Set(params.getAll('filter'));
  const sort = params.get('sort') || 'featured';
  const countLabel = `${productCount} ${productCount === 1 ? 'product' : 'products'}`;

  const sortSelect = (
    <label className="collection-sort">
      <span className="sr-only">Sort</span>
      <select
        name="sort"
        defaultValue={sort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  const filterGroups = filters.map((filter) => (
    <details key={filter.id} className="filter-group" open>
      <summary>{filter.label}</summary>
      <div className="filter-values">
        {filter.values.map((value) => (
          <label key={value.id}>
            <input
              type="checkbox"
              name="filter"
              value={value.input}
              defaultChecked={selected.has(value.input)}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            />
            <span>
              {value.label} ({value.count})
            </span>
          </label>
        ))}
      </div>
    </details>
  ));

  if (variant === 'desktop') {
    return (
      <form method="get" className="filters-form filters-form-desktop">
        <div className="desktop-filters">
          <p className="eyebrow">Filter</p>
          {filterGroups}
        </div>
        <div className="collection-toolbar">
          <p>Showing {countLabel}</p>
          {sortSelect}
        </div>
      </form>
    );
  }

  return (
    <form method="get" className="filters-form">
      <div className="collection-toolbar">
        <p>Showing {countLabel}</p>
        {sortSelect}
      </div>
      {filterGroups}
    </form>
  );
}

export function MobileFilterToggle() {
  const {open} = useAside();
  return (
    <button className="btn btn-secondary mobile-filter-toggle" type="button" onClick={() => open('filters')}>
      Filter & sort
    </button>
  );
}
