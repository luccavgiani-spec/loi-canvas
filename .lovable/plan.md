

## Diagnóstico: Autoplay de vídeos no mobile

### Causa raiz

O autoplay em mobile **não está falhando por um bug no código** — ele está falhando por restrições dos navegadores mobile (Safari iOS e Chrome Android). Os navegadores mobile **bloqueiam autoplay** mesmo com `muted` e `playsInline` em certas condições:

1. **Safari iOS**: Exige que o vídeo tenha o atributo `playsinline` E `muted` no HTML original (não apenas via JS). O código atual faz isso corretamente no `<video>` tag, mas o hook `useVideoAutoplay` tenta `play()` antes do vídeo ter dados suficientes carregados — e após 3 falhas, desiste silenciosamente.

2. **`LazyVideo` desmonta e remonta vídeos**: A session replay mostra vídeos sendo adicionados e removidos rapidamente (IDs 636→removido, 637→removido, 638). Cada remontagem reinicia o carregamento, e o `useVideoAutoplay` pode não re-disparar corretamente porque o `useEffect` depende apenas de `[lowSrc]`.

3. **`preload="auto"` em múltiplos vídeos**: No mobile, o browser limita downloads simultâneos. Vários vídeos com `preload="auto"` competem por bandwidth, e nenhum carrega rápido o suficiente.

4. **Falha silenciosa**: Quando o autoplay falha após 3 tentativas, nada acontece — o usuário vê uma tela preta ou o poster (quando existe).

### Plano de correção

#### 1. Forçar autoplay com retry infinito e feedback visual

**Arquivo**: `src/hooks/useVideoAutoplay.ts`

- Remover o limite de 3 tentativas — usar retry com backoff exponencial (500ms, 1s, 2s, 4s) até o vídeo tocar
- Adicionar listener `loadeddata` como trigger adicional para `play()`
- Resetar o contador de tentativas quando o vídeo entra na viewport (IntersectionObserver)
- Disparar callback `onPlaybackFailed` após timeout longo (ex: 15s) para feedback ao usuário

#### 2. Adicionar estado de loading/erro visível nos vídeos

**Arquivo**: `src/components/ui/VideoPlayer.tsx`

- Adicionar estado interno: `loading`, `playing`, `failed`
- Mostrar spinner/skeleton enquanto o vídeo não reproduz
- Se falhar após timeout, mostrar overlay com botão "Toque para reproduzir" (tap-to-play) — isso contorna restrições de autoplay porque é uma interação do usuário
- Garantir que o poster é sempre visível até `onPlaying` disparar

#### 3. Corrigir LazyVideo para não desmontar/remontar vídeos

**Arquivo**: `src/components/LazyVideo.tsx`

- Quando o vídeo sai da viewport, apenas pausar (não remover do DOM via `isVisible`)
- Usar `display: none` ou `visibility: hidden` em vez de desmontagem condicional
- Isso evita perder o buffer do vídeo e re-trigger de downloads

#### 4. Limitar downloads simultâneos de vídeo

**Arquivo**: `src/components/LazyVideo.tsx` e `src/components/home/HomeSections.tsx`

- Usar `preload="metadata"` em vez de `preload="auto"` para vídeos fora da viewport
- Trocar para `preload="auto"` apenas quando o IntersectionObserver detectar proximidade
- No `CollabCard`, que monta 2 vídeos por card × 4 cards = 8 vídeos, montar apenas o vídeo ativo (não os dois simultaneamente)

#### 5. Tap-to-play como fallback final

**Arquivo**: `src/components/ui/VideoPlayer.tsx`

- Se após ~10s o vídeo não estiver rodando, exibir overlay transparente com ícone de play
- Ao toque, chamar `video.play()` — que funciona porque é gesture-initiated
- Isso garante que o usuário SEMPRE consegue ver os vídeos

#### 6. Corrigir build errors existentes

**Arquivo**: `src/types/index.ts` — remover `tracking_code` duplicado
**Arquivo**: `src/lib/api.ts` — ajustar referência ao campo

### Detalhes técnicos

- Safari iOS requer o primeiro `play()` após user gesture OU com `muted+playsinline` com dados já carregados. O problema é que `canplay` pode disparar antes de haver frames suficientes — usar `canplaythrough` é mais confiável.
- `video.readyState >= 2` (`HAVE_CURRENT_DATA`) não é suficiente; usar `>= 3` (`HAVE_FUTURE_DATA`) ou `>= 4` (`HAVE_ENOUGH_DATA`).
- A desmontagem do React remove o elemento do DOM, perdendo todo o buffer. Isso é o maior problema no `LazyVideo`.

