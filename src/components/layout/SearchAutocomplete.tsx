import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchProductsByName, type ProductSearchSuggestion } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

interface Props {
  variant?: 'desktop-dropdown' | 'mobile-bar';
  onSelectClose: () => void;
  autoFocus?: boolean;
}

const DROPDOWN_BG = 'rgba(41,36,31,0.95)';
const DROPDOWN_BORDER = 'rgba(244,237,210,0.1)';
const DROPDOWN_TEXT = '#f4edd2';
const DROPDOWN_MUTED = 'rgba(244,237,210,0.5)';
const DROPDOWN_FAINT = 'rgba(244,237,210,0.3)';

const SearchAutocomplete = ({ variant = 'desktop-dropdown', onSelectClose, autoFocus = true }: Props) => {
  const [term, setTerm] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const navigate = useNavigate();
  const debounced = useDebounce(term.trim(), 250);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['product-search', debounced.toLowerCase()],
    queryFn: () => searchProductsByName(debounced),
    enabled: debounced.length >= 2,
    staleTime: 30_000,
  });

  const suggestions: ProductSearchSuggestion[] = useMemo(() => data ?? [], [data]);

  useEffect(() => {
    setHighlight(-1);
  }, [debounced]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const submit = () => {
    const t = term.trim();
    if (!t) return;
    if (highlight >= 0 && suggestions[highlight]) {
      navigate(`/product/${suggestions[highlight].slug}`);
    } else {
      navigate(`/produtos?busca=${encodeURIComponent(t)}`);
    }
    onSelectClose();
    setTerm('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === 'Escape') {
      onSelectClose();
    }
  };

  const showDropdown = debounced.length >= 2;
  const isMobile = variant === 'mobile-bar';

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: '0.78rem',
    letterSpacing: '0.08em',
    color: DROPDOWN_TEXT,
    width: '100%',
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex items-center gap-2"
        style={{
          background: isMobile ? 'transparent' : DROPDOWN_BG,
          border: isMobile ? 'none' : `1px solid ${DROPDOWN_BORDER}`,
          padding: isMobile ? 0 : '10px 14px',
          minWidth: isMobile ? undefined : 280,
          backdropFilter: isMobile ? undefined : 'blur(16px)',
        }}
      >
        <Search size={14} style={{ color: DROPDOWN_MUTED, flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Buscar produtos…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown && suggestions.length > 0}
          aria-controls="navbar-search-listbox"
          aria-autocomplete="list"
          style={inputStyle}
        />
      </form>

      {showDropdown && (
        <div
          id="navbar-search-listbox"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            minWidth: isMobile ? '100%' : 320,
            background: DROPDOWN_BG,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${DROPDOWN_BORDER}`,
            padding: '6px 0',
            zIndex: 70,
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {isFetching && suggestions.length === 0 && (
            <div
              style={{
                padding: '14px 16px',
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                color: DROPDOWN_FAINT,
              }}
            >
              buscando…
            </div>
          )}

          {!isFetching && suggestions.length === 0 && (
            <div
              style={{
                padding: '14px 16px',
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: '0.72rem',
                letterSpacing: '0.05em',
                color: DROPDOWN_FAINT,
              }}
            >
              nenhum produto encontrado para “{debounced}”.
            </div>
          )}

          {suggestions.map((s, i) => (
            <Link
              key={s.id}
              to={`/product/${s.slug}`}
              onClick={() => { onSelectClose(); setTerm(''); }}
              onMouseEnter={() => setHighlight(i)}
              role="option"
              aria-selected={i === highlight}
              className="flex items-center gap-3 px-4 py-2"
              style={{
                textDecoration: 'none',
                background: i === highlight ? 'rgba(244,237,210,0.06)' : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  overflow: 'hidden',
                  background: 'rgba(244,237,210,0.06)',
                }}
              >
                {s.image && (
                  <img
                    src={s.image}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Wagon', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.85rem',
                    color: DROPDOWN_TEXT,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    fontSize: '0.72rem',
                    color: DROPDOWN_MUTED,
                    letterSpacing: '0.05em',
                  }}
                >
                  R$ {s.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}

          <button
            type="button"
            onClick={submit}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              borderTop: `1px solid ${DROPDOWN_BORDER}`,
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontSize: '0.62rem',
              color: '#989857',
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            ver todos os resultados →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
