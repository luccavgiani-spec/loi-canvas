-- Cadastra os produtos Tabaco, Gabriela e Toca como "em breve"
-- Coleção: Refúgio (descubra novos aromas)
-- visible: false → não aparecem no frontend até liberação
-- Campos obrigatórios preenchidos com valores da coleção (serão atualizados posteriormente)

INSERT INTO products (slug, name, sku, price, weight_g, burn_hours, collection_id, status, visible)
VALUES
  ('tabaco',   'Tabaco',   'LOI-BRW-TAB', 0, 300, 50,
   '11133943-8d14-4d6d-8e3f-798f7662c05b', 'em breve', false),
  ('gabriela', 'Gabriela', 'LOI-BRW-GAB', 0, 300, 50,
   '11133943-8d14-4d6d-8e3f-798f7662c05b', 'em breve', false),
  ('toca',     'Toca',     'LOI-BRW-TOC', 0, 300, 50,
   '11133943-8d14-4d6d-8e3f-798f7662c05b', 'em breve', false);

-- Registra referência de imagem placeholder para cada produto
INSERT INTO product_images (product_id, filename, sort_order)
SELECT id, 'placeholder-' || slug || '.svg', 0
FROM products
WHERE slug IN ('tabaco', 'gabriela', 'toca');
