#!/bin/bash
echo "📋 Vídeos encontrados em public/:"
echo ""
find public/ -name "*.mp4" | sort | while read f; do
  SIZE=$(du -sh "$f" | cut -f1)
  if [[ "$f" == *_low.mp4 ]]; then
    echo "   [LOW]  $SIZE  $f"
  else
    echo "   [HIGH] $SIZE  $f"
  fi
done
echo ""
echo "Total de arquivos: $(find public/ -name "*.mp4" | wc -l | tr -d ' ')"
