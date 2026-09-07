import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AsideType = 'search' | 'cart' | 'mobile' | 'filters' | 'closed';

type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

const AsideContext = createContext<AsideContextValue | null>(null);

export function Aside({
  children,
  heading,
  type,
}: {
  children?: ReactNode;
  type: AsideType;
  heading: ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.body.style.overflow = 'hidden';
      const panel = closeRef.current?.closest('aside');
      const field = panel?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, [href]',
      );
      window.setTimeout(() => {
        (field && panel?.contains(field) ? field : closeRef.current)?.focus();
      }, 0);
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') close();
        },
        {signal: abortController.signal},
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      abortController.abort();
      document.body.style.overflow = '';
    };
  }, [close, expanded]);

  return (
    <div className={`overlay ${expanded ? 'expanded' : ''}`} hidden={!expanded}>
      <button
        className="close-outside"
        onClick={close}
        aria-label="Close dialog"
        tabIndex={expanded ? 0 : -1}
      />
      <aside
        className="drawer"
        role="dialog"
        aria-modal={expanded}
        aria-labelledby={id}
        aria-hidden={!expanded}
      >
        <header>
          <h3 id={id}>{heading}</h3>
          <button
            ref={closeRef}
            className="drawer-close"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
}

Aside.Provider = AsideProvider;

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
