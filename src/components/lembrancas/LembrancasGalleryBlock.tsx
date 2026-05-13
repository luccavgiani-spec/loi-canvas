import type { CSSProperties } from 'react';

export type GalleryPosition = 'esquerda' | 'direita';
export type GalleryTheme = 'cream' | 'charcoal';
export type GalleryFraseAlign = 'esquerda' | 'centro' | 'direita';

interface Props {
  imagem: string;
  frase: string;
  posicao: GalleryPosition;
  tema: GalleryTheme;
  /** Alinhamento horizontal da frase. Default 'direita' (comportamento legado). */
  posicaoFrase?: GalleryFraseAlign;
  fraseStyle?: CSSProperties;
}

const FRASE_ALIGN_MAP: Record<GalleryFraseAlign, CSSProperties['textAlign']> = {
  esquerda: 'left',
  centro: 'center',
  direita: 'right',
};

const Image = ({ src, order }: { src: string; order: number }) => (
  <div style={{ overflow: 'hidden', order }} className="md:order-none">
    <img
      src={src}
      alt=""
      loading="lazy"
      style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', display: 'block' }}
    />
  </div>
);

const TextSide = ({
  frase, tema, order, textAlign, extraStyle,
}: {
  frase: string;
  tema: GalleryTheme;
  order: number;
  textAlign: CSSProperties['textAlign'];
  extraStyle?: CSSProperties;
}) => {
  const isCharcoal = tema === 'charcoal';
  return (
    <div
      style={{
        background: isCharcoal ? '#29241f' : '#fcf5e0',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(3rem, 6vw, 4rem)',
        order,
      }}
      className="md:order-none"
    >
      <p
        style={{
          fontFamily: "'Wagon', sans-serif",
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          color: isCharcoal ? '#f4edd2' : '#29241f',
          lineHeight: 1.6,
          textAlign,
          width: '100%',
          ...extraStyle,
        }}
      >
        {frase}
      </p>
    </div>
  );
};

/**
 * Bloco da galeria intercalada de Lembranças. Quando posicao='esquerda',
 * a imagem aparece à esquerda no desktop (e no topo no mobile). Quando
 * posicao='direita', a imagem aparece à direita no desktop (e no topo
 * no mobile via order:0 — mantém a ordem visual familiar).
 *
 * posicaoFrase controla o alinhamento horizontal da frase dentro do bloco
 * de texto (independente da posição da imagem).
 */
const LembrancasGalleryBlock = ({
  imagem, frase, posicao, tema, posicaoFrase = 'direita', fraseStyle,
}: Props) => {
  const textAlign = FRASE_ALIGN_MAP[posicaoFrase];
  if (posicao === 'esquerda') {
    return (
      <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
        <Image src={imagem} order={0} />
        <TextSide frase={frase} tema={tema} order={1} textAlign={textAlign} extraStyle={fraseStyle} />
      </section>
    );
  }
  return (
    <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
      <TextSide frase={frase} tema={tema} order={1} textAlign={textAlign} extraStyle={fraseStyle} />
      <Image src={imagem} order={0} />
    </section>
  );
};

export default LembrancasGalleryBlock;
