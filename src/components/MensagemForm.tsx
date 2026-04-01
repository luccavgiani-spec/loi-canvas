import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MensagemFormProps {
  /** When true, uses light text suitable for dark backgrounds (e.g. footer) */
  dark?: boolean;
}

const FONT_BODY = "'Sackers Gothic', sans-serif";

const MensagemForm = ({ dark = false }: MensagemFormProps) => {
  const [nome, setNome] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const labelColor = dark ? 'rgba(244,237,210,0.4)' : 'rgba(41,36,31,0.45)';
  const inputBg = dark ? 'rgba(244,237,210,0.05)' : '#fcf5e0';
  const inputBorder = dark ? '1px solid rgba(244,237,210,0.12)' : '1px solid rgba(41,36,31,0.12)';
  const inputColor = dark ? 'rgba(244,237,210,0.8)' : '#29241f';
  const btnBg = dark ? 'rgba(244,237,210,0.1)' : '#29241f';
  const btnColor = dark ? '#f4edd2' : '#fcf5e0';
  const btnBorder = dark ? '1px solid rgba(244,237,210,0.25)' : 'none';

  const inputStyle: React.CSSProperties = {
    fontFamily: FONT_BODY,
    fontWeight: 300,
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    color: inputColor,
    background: inputBg,
    border: inputBorder,
    outline: 'none',
    padding: '10px 14px',
    width: '100%',
    borderRadius: 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !mensagem.trim()) return;
    setStatus('sending');
    try {
      const { error } = await supabase.from('mensagens').insert({
        nome: nome.trim(),
        assunto: assunto || null,
        mensagem: mensagem.trim(),
      });
      if (error) throw error;
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.75rem', letterSpacing: '0.15em', color: labelColor }}>
          recebemos sua mensagem.
        </p>
      </div>
    );
  }

  return (
    <div>
      <span
        className="loi-label block mb-8"
        style={{ color: labelColor }}
      >
        deixe uma mensagem
      </span>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480 }}>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="seu nome"
          required
          style={inputStyle}
        />

        <select
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">assunto (opcional)</option>
          <option value="dúvida">dúvida</option>
          <option value="elogio">elogio</option>
          <option value="outro">outro</option>
        </select>

        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="sua mensagem"
          required
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />

        {status === 'error' && (
          <p style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.1em', color: '#c44' }}>
            algo deu errado. tente novamente.
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 300,
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: btnColor,
            background: btnBg,
            border: btnBorder,
            padding: '10px 24px',
            cursor: status === 'sending' ? 'wait' : 'pointer',
            alignSelf: 'flex-start',
            transition: 'opacity 0.3s ease',
            opacity: status === 'sending' ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'enviando...' : 'enviar mensagem'}
        </button>
      </form>
    </div>
  );
};

export default MensagemForm;
