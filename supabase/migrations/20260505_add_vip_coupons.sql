-- v2.1 — Cupons VIP por coleção (RLS lockdown — sem policy pública).

CREATE TABLE vip_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vip_coupon_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES vip_coupons(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  UNIQUE (coupon_id, collection_id)
);

CREATE INDEX vip_coupon_discounts_coupon_id_idx ON vip_coupon_discounts(coupon_id);

ALTER TABLE vip_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_coupon_discounts ENABLE ROW LEVEL SECURITY;

-- vip_coupons: apenas admin (mesmo predicado de coupons), SEM policy pública.
CREATE POLICY "admin can read all vip_coupons" ON vip_coupons FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "admin can insert vip_coupons" ON vip_coupons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "admin can update vip_coupons" ON vip_coupons FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "admin can delete vip_coupons" ON vip_coupons FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- vip_coupon_discounts: mesmas 4 policies admin-gated.
CREATE POLICY "admin can read all vip_coupon_discounts" ON vip_coupon_discounts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "admin can insert vip_coupon_discounts" ON vip_coupon_discounts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "admin can update vip_coupon_discounts" ON vip_coupon_discounts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "admin can delete vip_coupon_discounts" ON vip_coupon_discounts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
