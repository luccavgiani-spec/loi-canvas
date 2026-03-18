#!/bin/bash

# Verifica se ffmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ ffmpeg não encontrado. Instale com: brew install ffmpeg (macOS) ou apt install ffmpeg (Linux)"
  exit 1
fi

# Conta quantos vídeos serão processados
TOTAL=$(find public/ -name "*.mp4" ! -name "*_low.mp4" | wc -l | tr -d ' ')
echo "🎬 Encontrados $TOTAL vídeos para processar..."
echo ""

PROCESSED=0
SKIPPED=0

# Processa cada vídeo
find public/ -name "*.mp4" ! -name "*_low.mp4" | while read INPUT; do
  # Gera o nome do arquivo de saída
  DIR=$(dirname "$INPUT")
  BASENAME=$(basename "$INPUT" .mp4)
  OUTPUT="$DIR/${BASENAME}_low.mp4"

  # Pula se já existir
  if [ -f "$OUTPUT" ]; then
    echo "⏭️  Já existe, pulando: $OUTPUT"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "⚙️  Comprimindo: $INPUT → $OUTPUT"

  ffmpeg -i "$INPUT" \
    -vf "scale='min(854,iw)':-2" \
    -c:v libx264 \
    -preset fast \
    -crf 32 \
    -maxrate 600k \
    -bufsize 1200k \
    -an \
    -pix_fmt yuv420p \
    -movflags +faststart \
    "$OUTPUT" \
    -loglevel error -stats

  if [ $? -eq 0 ]; then
    # Mostra tamanho original vs comprimido
    ORIG_SIZE=$(du -sh "$INPUT" | cut -f1)
    NEW_SIZE=$(du -sh "$OUTPUT" | cut -f1)
    echo "   ✅ $ORIG_SIZE → $NEW_SIZE"
    PROCESSED=$((PROCESSED + 1))
  else
    echo "   ❌ Erro ao comprimir $INPUT"
    rm -f "$OUTPUT" # Remove arquivo corrompido se ffmpeg falhou
  fi

  echo ""
done

echo "✅ Concluído. Processados: $PROCESSED | Pulados (já existiam): $SKIPPED"
