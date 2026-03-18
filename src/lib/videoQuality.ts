/**
 * Detecta se o dispositivo está em conexão lenta ou data-saver ativo.
 * Retorna 'low' para conexões fracas, 'high' para conexões boas.
 */
export type VideoQuality = 'high' | 'low';

export function getVideoQuality(): VideoQuality {
  // Verifica Network Information API (Chrome/Android)
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };
  };
  const conn = nav.connection;
  if (conn) {
    if (conn.saveData) return 'low';
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return 'low';
    if (conn.effectiveType === '3g') return 'low'; // ainda prefere low em 3G
  }
  return 'high';
}

/**
 * Escolhe a URL de vídeo correta baseado na qualidade detectada.
 * Se não houver versão low, usa sempre a high.
 */
export function selectVideoSrc(
  highSrc: string,
  lowSrc?: string
): string {
  if (!lowSrc) return highSrc;
  return getVideoQuality() === 'low' ? lowSrc : highSrc;
}
