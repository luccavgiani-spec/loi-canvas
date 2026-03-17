-- =============================================
-- Seed 15 fictional Brazilian reviews (approved = true)
-- Distributed across products by slug lookup
-- =============================================

DO $$
DECLARE
  pid uuid;
BEGIN

  -- campos (Sala ou Estar) — 3 reviews
  SELECT id INTO pid FROM public.products WHERE slug = 'campos' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.reviews (author_name, rating, body, product_id, approved, created_at)
    VALUES
      ('Ana Luiza', 5, 'Essa vela transformou minha sala. O aroma de capim cidreira é suave e dura horas. Simplesmente perfeita!', pid, true, now() - interval '60 days'),
      ('Fernanda', 5, 'Comprei como presente e a pessoa amou. A embalagem é elegante e o cheiro é incrível. Já pedi mais duas!', pid, true, now() - interval '45 days'),
      ('Mariana', 4, 'Muito boa! O aroma é fresco e natural, sem artificialismo nenhum. Queima limpa, sem fumaça. Recomendo demais.', pid, true, now() - interval '30 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- dulce — 3 reviews
  SELECT id INTO pid FROM public.products WHERE slug = 'dulce' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.reviews (author_name, rating, body, product_id, approved, created_at)
    VALUES
      ('Juliana', 5, 'A Dulce é meu amor! Baunilha e coco num equilíbrio perfeito. Casa fica cheirosa por horas depois de apagar.', pid, true, now() - interval '55 days'),
      ('Carolina', 5, 'Melhor vela que já usei. Aroma gourmand aconchegante, perfeita pro inverno. Dá pra sentir que os ingredientes são naturais de verdade.', pid, true, now() - interval '40 days'),
      ('Beatriz', 4, 'Aroma doce e envolvente, não enjoativo. Dura bem e a cera é super limpa. Adorei, já é a terceira vez que compro a mesma!', pid, true, now() - interval '20 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- bosque — 3 reviews
  SELECT id INTO pid FROM public.products WHERE slug = 'bosque' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.reviews (author_name, rating, body, product_id, approved, created_at)
    VALUES
      ('Camila', 5, 'Bosque é poesia. Madeira, musgo, profundidade. Acendo toda vez que quero criar um ambiente especial em casa.', pid, true, now() - interval '50 days'),
      ('Renata', 5, 'O copo âmbar é lindo e o aroma é extraordinário. Chegou bem embalado, sem nenhum dano. Vale cada centavo.', pid, true, now() - interval '35 days'),
      ('Thaís', 4, 'Amei o aroma amadeirado. Bem diferente do que estou acostumada, mas no bom sentido. Queima limpa e duradoura.', pid, true, now() - interval '15 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- estela — 2 reviews
  SELECT id INTO pid FROM public.products WHERE slug = 'estela' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.reviews (author_name, rating, body, product_id, approved, created_at)
    VALUES
      ('Letícia', 5, 'Jasmim e peônia num equilíbrio delicado. A Estela é sofisticada sem ser pesada. Comprei pra presentear e foi sucesso!', pid, true, now() - interval '48 days'),
      ('Sofia', 4, 'Muito elegante. O aroma floral é verdadeiro, não sintético. Uso no quarto e durmo muito melhor. Super recomendo.', pid, true, now() - interval '25 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- pomar — 2 reviews
  SELECT id INTO pid FROM public.products WHERE slug = 'pomar' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO public.reviews (author_name, rating, body, product_id, approved, created_at)
    VALUES
      ('Gabriela', 5, 'O Pomar me transporta pra um jardim no interior. Frutas maduras e folhas verdes, é delicioso! Recomendo muito.', pid, true, now() - interval '42 days'),
      ('Amanda', 4, 'Cheiro alegre e vibrante. Acendo quando quero animar o ambiente. Chegou bem embalado e o aroma é incrível!', pid, true, now() - interval '18 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- ritual — 2 reviews (fallback to icaro if ritual not found)
  SELECT id INTO pid FROM public.products WHERE slug = 'ritual' LIMIT 1;
  IF pid IS NULL THEN
    SELECT id INTO pid FROM public.products WHERE slug = 'icaro' LIMIT 1;
  END IF;
  IF pid IS NOT NULL THEN
    INSERT INTO public.reviews (author_name, rating, body, product_id, approved, created_at)
    VALUES
      ('Isabela', 5, 'Para meditação é perfeita. O aroma cria uma atmosfera de paz que não encontro em nenhuma outra vela. Incrível.', pid, true, now() - interval '38 days'),
      ('Larissa', 4, 'Muito intensa e marcante. Dá pra sentir que os ingredientes são naturais de verdade. Presente de aniversário ideal!', pid, true, now() - interval '12 days')
    ON CONFLICT DO NOTHING;
  END IF;

END $$;
