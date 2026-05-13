import { createElement, type CSSProperties, type ReactNode } from 'react';
import { useSiteContent } from '@/lib/site-content/hooks';
import { overridesToClasses } from '@/lib/site-content/presentation';

type AllowedTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface Props {
  pageKey: string;
  sectionKey: string;
  blockKey: string;
  defaultText: string;
  /** Tag HTML — default 'span'. */
  as?: AllowedTag;
  /** Classes Tailwind padrão (vencem quando overrides são 'padrao'). */
  defaultClass?: string;
  /** Estilo inline preservado do componente original. */
  style?: CSSProperties;
  /** Para envolver o texto com formatação extra (ex: <em>). */
  wrap?: (text: string) => ReactNode;
}

/** Renderiza um bloco de texto do site_content com fallback ao defaultText.
 *  Quando há overrides explícitos no banco, anexa classes Tailwind extras. */
const EditableText = ({
  pageKey, sectionKey, blockKey, defaultText, as = 'span', defaultClass = '', style, wrap,
}: Props) => {
  const { data } = useSiteContent(pageKey, sectionKey);
  const block = data?.[blockKey];

  if (block && !block.is_visible) return null;

  const text = block?.value_text ?? defaultText;
  const overrideCls = overridesToClasses(block?.presentation_overrides);
  const className = [defaultClass, overrideCls].filter(Boolean).join(' ');
  const content: ReactNode = wrap ? wrap(text) : text;

  return createElement(as, { className: className || undefined, style }, content);
};

export default EditableText;
