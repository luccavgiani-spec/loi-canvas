-- Adiciona colunas status e visible na tabela products
-- status: texto livre (ex: "em breve"), null por padrão para produtos existentes
-- visible: boolean, true por padrão para preservar comportamento dos produtos existentes

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS status  text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;
