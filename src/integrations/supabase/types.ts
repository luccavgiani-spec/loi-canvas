export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      collabs: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          year: string | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          year?: string | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          year?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          detail: string | null
          id: string
          is_active: boolean
          name: string
          numeral: string | null
          price_label: string | null
          slug: string
          sort_order: number
          story: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          detail?: string | null
          id?: string
          is_active?: boolean
          name: string
          numeral?: string | null
          price_label?: string | null
          slug: string
          sort_order?: number
          story?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          detail?: string | null
          id?: string
          is_active?: boolean
          name?: string
          numeral?: string | null
          price_label?: string | null
          slug?: string
          sort_order?: number
          story?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          type: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          type: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          type?: string
          value?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      newsletter: {
        Row: {
          coupon_code: string | null
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          qty: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          qty: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          qty?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount: number | null
          id: string
          is_pickup: boolean
          mp_payment_id: string | null
          mp_preference_id: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number
          total: number
          tracking_code: string | null
          tracking_email_sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount?: number | null
          id?: string
          is_pickup?: boolean
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal: number
          total: number
          tracking_code?: string | null
          tracking_email_sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount?: number | null
          id?: string
          is_pickup?: boolean
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number
          total?: number
          tracking_code?: string | null
          tracking_email_sent_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          id: string
          price: number | null
          product_id: string | null
          sku: string | null
          stock: number | null
          variant_name: string
        }
        Insert: {
          id?: string
          price?: number | null
          product_id?: string | null
          sku?: string | null
          stock?: number | null
          variant_name: string
        }
        Update: {
          id?: string
          price?: number | null
          product_id?: string | null
          sku?: string | null
          stock?: number | null
          variant_name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          accord: string | null
          asset_folder: string | null
          burn_hours: number
          collection_id: string | null
          composition: string | null
          created_at: string | null
          description: string | null
          details: string | null
          id: string
          is_bestseller: boolean | null
          name: string
          notes: string | null
          price: number
          ritual: string | null
          sku: string
          slug: string
          sort_order: number
          status: string | null
          stock_quantity: number
          suggested_use: string | null
          visible: boolean
          weight_g: number
        }
        Insert: {
          accord?: string | null
          asset_folder?: string | null
          burn_hours: number
          collection_id?: string | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          details?: string | null
          id?: string
          is_bestseller?: boolean | null
          name: string
          notes?: string | null
          price: number
          ritual?: string | null
          sku: string
          slug: string
          sort_order?: number
          status?: string | null
          stock_quantity?: number
          suggested_use?: string | null
          visible?: boolean
          weight_g: number
        }
        Update: {
          accord?: string | null
          asset_folder?: string | null
          burn_hours?: number
          collection_id?: string | null
          composition?: string | null
          created_at?: string | null
          description?: string | null
          details?: string | null
          id?: string
          is_bestseller?: boolean | null
          name?: string
          notes?: string | null
          price?: number
          ritual?: string | null
          sku?: string
          slug?: string
          sort_order?: number
          status?: string | null
          stock_quantity?: number
          suggested_use?: string | null
          visible?: boolean
          weight_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved: boolean | null
          author_name: string
          body: string | null
          created_at: string | null
          id: string
          photo_url: string | null
          product_id: string | null
          rating: number
          title: string | null
        }
        Insert: {
          approved?: boolean | null
          author_name: string
          body?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          product_id?: string | null
          rating: number
          title?: string | null
        }
        Update: {
          approved?: boolean | null
          author_name?: string
          body?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          product_id?: string | null
          rating?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_rules: {
        Row: {
          default_shipping_cost: number | null
          enabled: boolean | null
          free_shipping_threshold: number | null
          id: string
        }
        Insert: {
          default_shipping_cost?: number | null
          enabled?: boolean | null
          free_shipping_threshold?: number | null
          id?: string
        }
        Update: {
          default_shipping_cost?: number | null
          enabled?: boolean | null
          free_shipping_threshold?: number | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
