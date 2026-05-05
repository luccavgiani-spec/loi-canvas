-- product_upsells: junction table for product → upsell relationships.
-- Consumed by get-order-public edge function to suggest cross-sells on
-- /pedido-confirmado, joining the upsells of every product in an order
-- (deduped, excluding products already in that order).
CREATE TABLE product_upsells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  upsell_product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, upsell_product_id),
  CHECK(product_id <> upsell_product_id)
);

CREATE INDEX product_upsells_product_id_sort
  ON product_upsells(product_id, sort_order);

ALTER TABLE product_upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read product_upsells"
  ON product_upsells FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admin can insert product_upsells"
  ON product_upsells FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "admin can update product_upsells"
  ON product_upsells FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "admin can delete product_upsells"
  ON product_upsells FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
