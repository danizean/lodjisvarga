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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          created_at: string | null
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          /** TipTap document JSON */
          content: Json | null
          created_at: string | null
          updated_at: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          published_at: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          excerpt: string | null
          read_time_minutes: number | null
          category: string | null
        }
        Insert: {
          author_id?: string | null
          content?: Json | null
          created_at?: string | null
          updated_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          published_at?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          excerpt?: string | null
          read_time_minutes?: number | null
          category?: string | null
        }
        Update: {
          author_id?: string | null
          content?: Json | null
          created_at?: string | null
          updated_at?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          excerpt?: string | null
          read_time_minutes?: number | null
          category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          reason: string | null
          room_type_id: string | null
          sync_source: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          reason?: string | null
          room_type_id?: string | null
          sync_source?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          reason?: string | null
          room_type_id?: string | null
          sync_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          room_type_id: string | null
          villa_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          room_type_id?: string | null
          villa_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          room_type_id?: string | null
          villa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villa_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          status: string | null
          total_price: number | null
          utm_campaign: string | null
          utm_source: string | null
          villa_id: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          status?: string | null
          total_price?: number | null
          utm_campaign?: string | null
          utm_source?: string | null
          villa_id?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          status?: string | null
          total_price?: number | null
          utm_campaign?: string | null
          utm_source?: string | null
          villa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villa_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          error_message: string | null
          id: string
          paid_at: string | null
          payment_gateway: string | null
          reservation_id: string
          response_code: string | null
          retry_count: number | null
          status: string | null
          transaction_id: string
          webhook_payload: Json | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          paid_at?: string | null
          payment_gateway?: string | null
          reservation_id: string
          response_code?: string | null
          retry_count?: number | null
          status?: string | null
          transaction_id: string
          webhook_payload?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          paid_at?: string | null
          payment_gateway?: string | null
          reservation_id?: string
          response_code?: string | null
          retry_count?: number | null
          status?: string | null
          transaction_id?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      promos: {
        Row: {
          created_at: string | null
          description: string | null
          discount_code: string
          discount_value: number | null
          expired_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_code: string
          discount_value?: number | null
          expired_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_code?: string
          discount_value?: number | null
          expired_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number | null
          endpoint: string
          id: string
          phone_number: string
          window_start: string | null
        }
        Insert: {
          count?: number | null
          endpoint: string
          id?: string
          phone_number: string
          window_start?: string | null
        }
        Update: {
          count?: number | null
          endpoint?: string
          id?: string
          phone_number?: string
          window_start?: string | null
        }
        Relationships: []
      }
      reservation_guests: {
        Row: {
          created_at: string | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          is_primary: boolean | null
          reservation_id: string
        }
        Insert: {
          created_at?: string | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          is_primary?: boolean | null
          reservation_id: string
        }
        Update: {
          created_at?: string | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          is_primary?: boolean | null
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_guests_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in: string
          check_out: string
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          guest_count_adult: number | null
          guest_count_child: number | null
          id: string
          lead_id: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          promo_id: string | null
          reservation_status: string | null
          room_type_id: string
          service_fee: number | null
          subtotal: number
          total_nights: number | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in: string
          check_out: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          guest_count_adult?: number | null
          guest_count_child?: number | null
          id?: string
          lead_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_id?: string | null
          reservation_status?: string | null
          room_type_id: string
          service_fee?: number | null
          subtotal: number
          total_nights?: number | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in?: string
          check_out?: string
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          guest_count_adult?: number | null
          guest_count_child?: number | null
          id?: string
          lead_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          promo_id?: string | null
          reservation_status?: string | null
          room_type_id?: string
          service_fee?: number | null
          subtotal?: number
          total_nights?: number | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_prices: {
        Row: {
          created_at: string | null
          date: string
          id: string
          price: number
          room_type_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          price: number
          room_type_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          price?: number
          room_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_prices_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_type_amenities: {
        Row: {
          amenity_id: string
          room_type_id: string
        }
        Insert: {
          amenity_id: string
          room_type_id: string
        }
        Update: {
          amenity_id?: string
          room_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_type_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_type_amenities_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          base_price: number
          capacity_adult: number | null
          capacity_child: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          villa_id: string | null
        }
        Insert: {
          base_price: number
          capacity_adult?: number | null
          capacity_child?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          villa_id?: string | null
        }
        Update: {
          base_price?: number
          capacity_adult?: number | null
          capacity_child?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          villa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_types_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villa_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_types_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villa_amenities: {
        Row: {
          amenity_id: string
          villa_id: string
        }
        Insert: {
          amenity_id: string
          villa_id: string
        }
        Update: {
          amenity_id?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "villa_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "villa_amenities_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villa_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "villa_amenities_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villas: {
        Row: {
          address: string | null
          created_at: string | null
          default_whatsapp_message: string | null
          description: string | null
          gmaps_url: string | null
          id: string
          name: string
          slug: string
          status: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          default_whatsapp_message?: string | null
          description?: string | null
          gmaps_url?: string | null
          id?: string
          name: string
          slug: string
          status?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          default_whatsapp_message?: string | null
          description?: string | null
          gmaps_url?: string | null
          id?: string
          name?: string
          slug?: string
          status?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      articles_listing: {
        Row: {
          id: string | null
          title: string | null
          slug: string | null
          excerpt: string | null
          thumbnail_url: string | null
          category: string | null
          read_time_minutes: number | null
          published_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      available_prices: {
        Row: {
          created_at: string | null
          date: string | null
          id: string | null
          price: number | null
          room_type_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_prices_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      villa_summary: {
        Row: {
          id: string | null
          name: string | null
          total_rooms: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      block_dates_range: {
        Args: {
          p_end_date: string
          p_reason: string
          p_room_type_id: string
          p_start_date: string
        }
        Returns: undefined
      }
      copy_price_range: {
        Args: {
          p_days: number
          p_room_type_id: string
          p_source_start: string
          p_target_start: string
        }
        Returns: undefined
      }
      get_villas_count: {
        Args: { search_term: string; status_filter: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      search_available_villas: {
        Args: {
          p_capacity_adult?: number
          p_check_in: string
          p_check_out: string
        }
        Returns: {
          address: string | null
          created_at: string | null
          default_whatsapp_message: string | null
          description: string | null
          gmaps_url: string | null
          id: string
          name: string
          slug: string
          status: string | null
          whatsapp_number: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "villas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_bulk_price: {
        Args: {
          p_end_date: string
          p_price: number
          p_room_type_id: string
          p_start_date: string
        }
        Returns: undefined
      }
      unblock_dates_range: {
        Args: {
          p_end_date: string
          p_room_type_id: string
          p_start_date: string
        }
        Returns: undefined
      }
    }
    Enums: {
      lead_status_enum:
        | "New"
        | "FollowUp"
        | "Quoted"
        | "Confirmed"
        | "Cancelled"
        | "Lost"
      payment_status_enum: "pending" | "paid" | "failed" | "refunded"
      tipe_villa_enum:
        | "Standard"
        | "Superior"
        | "Deluxe"
        | "Executive"
        | "Suite"
        | "Presidential"
      villa_status_enum: "Published" | "Maintenance" | "Hidden" | "Archived"
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
      lead_status_enum: [
        "New",
        "FollowUp",
        "Quoted",
        "Confirmed",
        "Cancelled",
        "Lost",
      ],
      payment_status_enum: ["pending", "paid", "failed", "refunded"],
      tipe_villa_enum: [
        "Standard",
        "Superior",
        "Deluxe",
        "Executive",
        "Suite",
        "Presidential",
      ],
      villa_status_enum: ["Published", "Maintenance", "Hidden", "Archived"],
    },
  },
} as const
