const Manifesto = () => {
  return (
    <section className="py-20 md:py-28" style={{ background: '#fcf5e0' }}>
      <div className="container max-w-5xl">
        <span className="loi-label block mb-10">manifesto</span>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* Placeholder de foto */}
          <div
            className="aspect-[3/4] border border-dashed border-[#29241f]/30 bg-[#f4edd2] flex items-center justify-center"
            aria-label="Foto em breve"
          >
            <span className="loi-label opacity-40">foto em breve</span>
          </div>

          {/* Texto do manifesto */}
          <div
            className="text-body text-justify text-[#29241f] font-light leading-[1.9]"
            style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
          >
            <p className="mb-5">acendemos uma vela como quem abre uma porta.</p>
            <p className="mb-5">uma porta pra dentro. pra memória. pra beleza que mora no silêncio.</p>
            <p className="mb-5">
              a loiê nasceu de uma casa antiga, de um ritual secreto, de um
              saber que se aprende com as mãos e os sentidos.
            </p>
            <p className="mb-5">
              cada aroma é uma narrativa, cada frasco é um convite a ficar
              mais tempo com o que importa.
            </p>
            <p className="mb-5">
              somos fogo, mas somos calma.<br />
              somos essência, mas somos presença.<br />
              somos brasileiros, feitos à mão, com técnica e alma.
            </p>
            <p>
              não vendemos velas.<br />
              criamos atmosferas.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Manifesto;
