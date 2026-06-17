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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          quantity: number
          unit_price_naira: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          quantity?: number
          unit_price_naira?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          quantity?: number
          unit_price_naira?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          commission_naira: number
          commission_rate: number
          created_at: string
          id: string
          notes: string
          pickup_zone: string
          service_fee_naira: number
          status: string
          subtotal_naira: number | null
          total_naira: number
          updated_at: string
          vendor_id: string
          vendor_payout_naira: number
        }
        Insert: {
          buyer_id: string
          buyer_name?: string
          buyer_phone?: string
          commission_naira?: number
          commission_rate?: number
          created_at?: string
          id?: string
          notes?: string
          pickup_zone?: string
          service_fee_naira?: number
          status?: string
          subtotal_naira?: number | null
          total_naira?: number
          updated_at?: string
          vendor_id: string
          vendor_payout_naira?: number
        }
        Update: {
          buyer_id?: string
          buyer_name?: string
          buyer_phone?: string
          commission_naira?: number
          commission_rate?: number
          created_at?: string
          id?: string
          notes?: string
          pickup_zone?: string
          service_fee_naira?: number
          status?: string
          subtotal_naira?: number | null
          total_naira?: number
          updated_at?: string
          vendor_id?: string
          vendor_payout_naira?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string
          buyer_id: string
          created_at: string
          id: string
          rating: number
          vendor_id: string
        }
        Insert: {
          body?: string
          buyer_id: string
          created_at?: string
          id?: string
          rating: number
          vendor_id: string
        }
        Update: {
          body?: string
          buyer_id?: string
          created_at?: string
          id?: string
          rating?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_media: {
        Row: {
          created_at: string
          id: string
          kind: string
          sort_order: number
          url: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          url: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          sort_order?: number
          url?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_media_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          business_name: string
          capacity: number
          category: string
          created_at: string
          demand: string
          description: string
          expected_customers: number
          featured_until: string | null
          id: string
          location: string
          opens_at: string
          owner_id: string | null
          phone: string | null
          plan: string
          plan_renews_at: string | null
          popular_items: string[]
          pos_x: number
          pos_y: number
          price_range: string
          rating: number
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          verified: boolean
          whatsapp: string | null
          zone: string
        }
        Insert: {
          business_name: string
          capacity?: number
          category: string
          created_at?: string
          demand?: string
          description?: string
          expected_customers?: number
          featured_until?: string | null
          id?: string
          location?: string
          opens_at?: string
          owner_id?: string | null
          phone?: string | null
          plan?: string
          plan_renews_at?: string | null
          popular_items?: string[]
          pos_x?: number
          pos_y?: number
          price_range?: string
          rating?: number
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
          zone: string
        }
        Update: {
          business_name?: string
          capacity?: number
          category?: string
          created_at?: string
          demand?: string
          description?: string
          expected_customers?: number
          featured_until?: string | null
          id?: string
          location?: string
          opens_at?: string
          owner_id?: string | null
          phone?: string | null
          plan?: string
          plan_renews_at?: string | null
          popular_items?: string[]
          pos_x?: number
          pos_y?: number
          price_range?: string
          rating?: number
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          verified?: boolean
          whatsapp?: string | null
          zone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendor" | "attendee"
      vendor_status: "live" | "low-stock" | "sold-out" | "closed"
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
    Enums: {
      app_role: ["admin", "vendor", "attendee"],
      vendor_status: ["live", "low-stock", "sold-out", "closed"],
    },
  },
} as const
