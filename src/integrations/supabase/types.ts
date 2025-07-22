export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_placements: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ad_reports: {
        Row: {
          ad_id: string
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_reports_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_views: {
        Row: {
          ad_id: string
          id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          ad_id: string
          id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          ad_id?: string
          id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_views_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type"]
          brand: string
          city: string
          condition: Database["public"]["Enums"]["car_condition"]
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          is_featured: boolean
          is_premium: boolean
          mileage: number | null
          model: string
          phone: string
          price: number
          reported_count: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          views_count: number
          year: number
        }
        Insert: {
          ad_type?: Database["public"]["Enums"]["ad_type"]
          brand: string
          city: string
          condition?: Database["public"]["Enums"]["car_condition"]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          is_premium?: boolean
          mileage?: number | null
          model: string
          phone: string
          price: number
          reported_count?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
          year: number
        }
        Update: {
          ad_type?: Database["public"]["Enums"]["ad_type"]
          brand?: string
          city?: string
          condition?: Database["public"]["Enums"]["car_condition"]
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          is_premium?: boolean
          mileage?: number | null
          model?: string
          phone?: string
          price?: number
          reported_count?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_reveals: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_reveals_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_reveals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ad_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          ad_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          ad_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          ad_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          ad_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          ad_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_ad_distribution: {
        Row: {
          ad_id: string
          between_ads_impressions: number | null
          created_at: string
          details_bottom_impressions: number | null
          details_top_impressions: number | null
          fairness_score: number | null
          footer_impressions: number | null
          header_impressions: number | null
          id: string
          last_shown_at: string | null
          sidebar_impressions: number | null
          total_impressions: number | null
          updated_at: string
        }
        Insert: {
          ad_id: string
          between_ads_impressions?: number | null
          created_at?: string
          details_bottom_impressions?: number | null
          details_top_impressions?: number | null
          fairness_score?: number | null
          footer_impressions?: number | null
          header_impressions?: number | null
          id?: string
          last_shown_at?: string | null
          sidebar_impressions?: number | null
          total_impressions?: number | null
          updated_at?: string
        }
        Update: {
          ad_id?: string
          between_ads_impressions?: number | null
          created_at?: string
          details_bottom_impressions?: number | null
          details_top_impressions?: number | null
          fairness_score?: number | null
          footer_impressions?: number | null
          header_impressions?: number | null
          id?: string
          last_shown_at?: string | null
          sidebar_impressions?: number | null
          total_impressions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      premium_ad_impressions: {
        Row: {
          ad_id: string
          id: string
          impression_time: string
          placement_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          user_ip: string | null
        }
        Insert: {
          ad_id: string
          id?: string
          impression_time?: string
          placement_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_ip?: string | null
        }
        Update: {
          ad_id?: string
          id?: string
          impression_time?: string
          placement_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          started_at: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          started_at?: string
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          started_at?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ads_count: number
          city: string | null
          created_at: string
          credits: number
          full_name: string
          id: string
          is_active: boolean
          is_featured: boolean
          is_premium: boolean
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          ads_count?: number
          city?: string | null
          created_at?: string
          credits?: number
          full_name: string
          id: string
          is_active?: boolean
          is_featured?: boolean
          is_premium?: boolean
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          ads_count?: number
          city?: string | null
          created_at?: string
          credits?: number
          full_name?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_premium?: boolean
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      project_backups: {
        Row: {
          backup_data: Json
          backup_name: string
          backup_size: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_data: Json
          backup_name: string
          backup_size?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_data?: Json
          backup_name?: string
          backup_size?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_ads: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ad_limits: {
        Row: {
          ads_count: number
          created_at: string
          last_reset: string
          max_ads: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ads_count?: number
          created_at?: string
          last_reset?: string
          max_ads?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ads_count?: number
          created_at?: string
          last_reset?: string
          max_ads?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_behavior: {
        Row: {
          brand_preferences: Json | null
          city_preferences: Json | null
          condition_preferences: Json | null
          created_at: string
          favorite_brands: string[] | null
          featured_ads_viewed: number | null
          id: string
          last_search_filters: Json | null
          preferred_price_max: number | null
          preferred_price_min: number | null
          premium_ads_viewed: number | null
          price_range_preferences: Json | null
          updated_at: string
          user_id: string
          viewed_ads_count: number | null
        }
        Insert: {
          brand_preferences?: Json | null
          city_preferences?: Json | null
          condition_preferences?: Json | null
          created_at?: string
          favorite_brands?: string[] | null
          featured_ads_viewed?: number | null
          id?: string
          last_search_filters?: Json | null
          preferred_price_max?: number | null
          preferred_price_min?: number | null
          premium_ads_viewed?: number | null
          price_range_preferences?: Json | null
          updated_at?: string
          user_id: string
          viewed_ads_count?: number | null
        }
        Update: {
          brand_preferences?: Json | null
          city_preferences?: Json | null
          condition_preferences?: Json | null
          created_at?: string
          favorite_brands?: string[] | null
          featured_ads_viewed?: number | null
          id?: string
          last_search_filters?: Json | null
          preferred_price_max?: number | null
          preferred_price_min?: number | null
          premium_ads_viewed?: number | null
          price_range_preferences?: Json | null
          updated_at?: string
          user_id?: string
          viewed_ads_count?: number | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          credits_remaining: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          credits_remaining?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          credits_remaining?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_toggle_ad_status: {
        Args: { _admin_id: string; _ad_id: string; _is_active: boolean }
        Returns: boolean
      }
      admin_update_report_status: {
        Args: { _admin_id: string; _report_id: string; _status: string }
        Returns: boolean
      }
      admin_update_user_type: {
        Args: {
          _admin_id: string
          _target_user_id: string
          _user_type: Database["public"]["Enums"]["user_type"]
        }
        Returns: boolean
      }
      check_ad_limit: {
        Args: { _user_id: string }
        Returns: boolean
      }
      check_premium_status: {
        Args: { _user_id: string }
        Returns: boolean
      }
      cleanup_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          _user_id: string
          _type: string
          _title: string
          _content: string
          _ad_id?: string
        }
        Returns: string
      }
      get_ad_priority: {
        Args: {
          ad_type: Database["public"]["Enums"]["ad_type"]
          is_featured: boolean
          is_premium: boolean
        }
        Returns: number
      }
      get_fair_premium_ads: {
        Args: { _user_id?: string; _placement_type?: string; _limit?: number }
        Returns: {
          ad_id: string
          title: string
          brand: string
          price: number
          city: string
          images: string[]
          priority_score: number
          fairness_score: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_ad_count: {
        Args: { _user_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { _user_id: string }
        Returns: boolean
      }
      record_premium_ad_impression: {
        Args: {
          _ad_id: string
          _user_id?: string
          _placement_type?: string
          _user_ip?: string
          _user_agent?: string
          _session_id?: string
        }
        Returns: boolean
      }
      reset_monthly_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_behavior: {
        Args: {
          _user_id: string
          _search_filters?: Json
          _viewed_ad_brand?: string
          _viewed_ad_price?: number
          _viewed_ad_city?: string
          _viewed_ad_condition?: string
          _is_premium_ad?: boolean
          _is_featured_ad?: boolean
        }
        Returns: boolean
      }
      verify_admin_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ad_type: "standard" | "featured" | "premium"
      app_role: "admin" | "moderator" | "user"
      car_condition: "new" | "used" | "excellent" | "good" | "fair"
      user_type: "free" | "premium"
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
      ad_type: ["standard", "featured", "premium"],
      app_role: ["admin", "moderator", "user"],
      car_condition: ["new", "used", "excellent", "good", "fair"],
      user_type: ["free", "premium"],
    },
  },
} as const
