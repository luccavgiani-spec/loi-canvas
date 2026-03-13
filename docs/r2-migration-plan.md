# Migrar videos do Supabase Storage para Cloudflare R2

## Problema

O bucket `produtos` no Supabase Storage serve todos os assets estaticos (imagens + videos).
Videos MP4 sao pesados e consomem a maior parte do **Cached Egress** (9.3 GB / 5 GB = 187%).
O plano Free do Supabase inclui apenas 5 GB de cached egress por mes.

## Videos identificados no bucket

| Arquivo | Usado em | Estimativa |
|---------|----------|------------|
| `escritorio_cadeira__1_.mp4` | HeroSection (home), HomeSections (collabs), mocks | ~5-15 MB |
| `Cartao_Postal_Loie.mp4` | About (hero), Shop (hero), HomeSections (collabs), mocks | ~5-15 MB |
| `video_sobre (1).mp4` | About (manifesto) | ~5-20 MB |
| `loie_vela_bosque_compress (1).mp4` | HomeSections (banner + collabs), mocks | ~3-10 MB |
| `loie_vela_pomar.mp4` | HomeSections (banner + collabs), mocks | ~3-10 MB |
| `loie_vela_estela (1).mp4` | HomeSections (collabs), mocks | ~3-10 MB |

**Total estimado de videos: ~25-80 MB**

> Para obter os tamanhos exatos, acesse o dashboard do Supabase > Storage > Bucket "produtos"
> ou execute: `supabase storage ls produtos --sort-by size`

### URLs publicas atuais

Base: `https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos/`

Cada video e acessado por essa base + nome do arquivo (URL-encoded).

## Plano de migracao

### Passo 1 — Criar conta e bucket no Cloudflare R2

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) e crie uma conta (ou use existente)
2. Va em **R2 Object Storage** > **Create bucket**
3. Nome sugerido: `loie-assets`
4. Regiao: **Auto** (mais proximo dos usuarios)
5. Habilite **Public Access** no bucket (Settings > Public Access > Allow Access)
6. Anote o **Public URL** do bucket, ex: `https://pub-xxxx.r2.dev` ou configure um dominio customizado

### Passo 2 — Upload dos videos

```bash
# Instale o Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Upload cada video
wrangler r2 object put loie-assets/escritorio_cadeira__1_.mp4 --file ./escritorio_cadeira__1_.mp4
wrangler r2 object put loie-assets/Cartao_Postal_Loie.mp4 --file ./Cartao_Postal_Loie.mp4
wrangler r2 object put loie-assets/video_sobre_1.mp4 --file "./video_sobre (1).mp4"
wrangler r2 object put loie-assets/loie_vela_bosque_compress_1.mp4 --file "./loie_vela_bosque_compress (1).mp4"
wrangler r2 object put loie-assets/loie_vela_pomar.mp4 --file ./loie_vela_pomar.mp4
wrangler r2 object put loie-assets/loie_vela_estela_1.mp4 --file "./loie_vela_estela (1).mp4"
```

### Passo 3 — Atualizar referencias no codigo

Editar `src/lib/storage.ts`:

```typescript
const SUPABASE_URL = "https://xigituxddrtsqhmrmsvy.supabase.co";
const R2_URL = "https://pub-xxxx.r2.dev"; // ou dominio customizado
const BUCKET = "produtos";

export function storageUrl(filename: string): string {
  // Videos servidos pelo R2 (egress gratuito), imagens pelo Supabase
  if (filename.match(/\.mp4$/i)) {
    // R2 nao precisa de URL encoding nos mesmos moldes; ajustar nomes se necessario
    const r2Name = filename.replace(/\s+/g, '_').replace(/[()]/g, '');
    return `${R2_URL}/${r2Name}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`;
}
```

### Passo 4 — (Opcional) Dominio customizado

1. No Cloudflare R2, va em **Settings** > **Custom Domains**
2. Adicione ex: `assets.loie.com.br`
3. O Cloudflare configura SSL automaticamente
4. Atualize `R2_URL` no codigo

## Estimativa de economia

| | Supabase (atual) | Cloudflare R2 |
|--|--|--|
| Armazenamento | 1 GB incluso (Free) | 10 GB gratis |
| Egress | 5 GB/mes (Free) | **Gratis** (sem limites de egress) |
| CDN | Incluso | Incluso (rede Cloudflare) |
| Cache headers | Via query param | Configuravel por regra |
| Custo mensal | R$ 0 (mas estoura o limite) | R$ 0 |

**Economia esperada:**
- Mover apenas os 6 videos para R2 elimina ~80-90% do cached egress
- O Supabase fica apenas para imagens JPG (leves, ~50-300 KB cada)
- Cached Egress do Supabase deve cair de 9.3 GB para ~1-2 GB (dentro do limite)

## Checklist

- [ ] Criar conta Cloudflare (ou usar existente)
- [ ] Criar bucket R2 `loie-assets` com acesso publico
- [ ] Baixar videos do Supabase Storage
- [ ] Upload para R2 (renomear removendo espacos/parenteses)
- [ ] Atualizar `storageUrl()` em `src/lib/storage.ts`
- [ ] Testar todos os videos no site
- [ ] (Opcional) Configurar dominio customizado
- [ ] (Opcional) Remover videos do bucket Supabase para liberar storage
