import type { CSSProperties } from 'react';

export type GalleryPosition = 'esquerda' | 'direita';
export type GalleryTheme = 'cream' | 'charcoal';

interface Props {
  imagem: string;
  frase: string;
  posicao: GalleryPosition;
  tema: GalleryTheme;
  fraseStyle?: CSSProperties;
}

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
  frase, tema, order, extraStyle,
}: { frase: string; tema: GalleryTheme; order: number; extraStyle?: CSSProperties }) => {
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
          textAlign: 'right',
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
 */
const LembrancasGalleryBlock = ({ imagem, frase, posicao, tema, fraseStyle }: Props) => {
  if (posicao === 'esquerda') {
    return (
      <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
        <Image src={imagem} order={0} />
        <TextSide frase={frase} tema={tema} order={1} extraStyle={fraseStyle} />
      </section>
    );
  }
  return (
    <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
      <TextSide frase={frase} tema={tema} order={1} extraStyle={fraseStyle} />
      <Image src={imagem} order={0} />
    </section>
  );
};

export default LembrancasGalleryBlock;
