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
      events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          is_archived: boolean
          location: string
          name: string
          notes: string | null
          registration_url: string | null
          state_abbr: string
          style: Database["public"]["Enums"]["event_style"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          is_archived?: boolean
          location: string
          name: string
          notes?: string | null
          registration_url?: string | null
          state_abbr: string
          style?: Database["public"]["Enums"]["event_style"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          is_archived?: boolean
          location?: string
          name?: string
          notes?: string | null
          registration_url?: string | null
          state_abbr?: string
          style?: Database["public"]["Enums"]["event_style"]
          updated_at?: string
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          approval_note: string | null
          body_html: string | null
          canonical_url: string | null
          category: string | null
          created_at: string
          distribution_status: Database["public"]["Enums"]["distribution_status"]
          id: string
          instagram_caption: string | null
          linkedin_post: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          one_click_approve: boolean | null
          pitch_email: string | null
          publish_date: string | null
          robots_index: boolean | null
          slug: string
          status: Database["public"]["Enums"]["press_release_status"]
          summary: string | null
          tags: string[] | null
          title: string
          twitter_post: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          wire_keywords: string | null
          wire_summary: string | null
          wire_title: string | null
        }
        Insert: {
          approval_note?: string | null
          body_html?: string | null
          canonical_url?: string | null
          category?: string | null
          created_at?: string
          distribution_status?: Database["public"]["Enums"]["distribution_status"]
          id?: string
          instagram_caption?: string | null
          linkedin_post?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          one_click_approve?: boolean | null
          pitch_email?: string | null
          publish_date?: string | null
          robots_index?: boolean | null
          slug: string
          status?: Database["public"]["Enums"]["press_release_status"]
          summary?: string | null
          tags?: string[] | null
          title: string
          twitter_post?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wire_keywords?: string | null
          wire_summary?: string | null
          wire_title?: string | null
        }
        Update: {
          approval_note?: string | null
          body_html?: string | null
          canonical_url?: string | null
          category?: string | null
          created_at?: string
          distribution_status?: Database["public"]["Enums"]["distribution_status"]
          id?: string
          instagram_caption?: string | null
          linkedin_post?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          one_click_approve?: boolean | null
          pitch_email?: string | null
          publish_date?: string | null
          robots_index?: boolean | null
          slug?: string
          status?: Database["public"]["Enums"]["press_release_status"]
          summary?: string | null
          tags?: string[] | null
          title?: string
          twitter_post?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          wire_keywords?: string | null
          wire_summary?: string | null
          wire_title?: string | null
        }
        Relationships: []
      }
      staff_applications: {
        Row: {
          admin_grade: number | null
          admin_notes: string | null
          application_type: Database["public"]["Enums"]["application_type"]
          certification_other: string | null
          certifications: string[] | null
          city: string
          created_at: string
          dob: string
          email: string
          experience: string | null
          full_name: string
          id: string
          interested_roles: string[] | null
          membership_number: string | null
          pay_address: string | null
          pay_city: string | null
          pay_state: string | null
          pay_zip: string | null
          payment_method: string | null
          phone: string
          positions: string[] | null
          primary_background: string | null
          ruleset_expertise: string[] | null
          shirt_size: string | null
          smoothcomp: string | null
          state: string
          status: string
          travel_radius: string | null
          updated_at: string
          worked_with_usag_before: boolean | null
        }
        Insert: {
          admin_grade?: number | null
          admin_notes?: string | null
          application_type: Database["public"]["Enums"]["application_type"]
          certification_other?: string | null
          certifications?: string[] | null
          city: string
          created_at?: string
          dob: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          interested_roles?: string[] | null
          membership_number?: string | null
          pay_address?: string | null
          pay_city?: string | null
          pay_state?: string | null
          pay_zip?: string | null
          payment_method?: string | null
          phone: string
          positions?: string[] | null
          primary_background?: string | null
          ruleset_expertise?: string[] | null
          shirt_size?: string | null
          smoothcomp?: string | null
          state: string
          status?: string
          travel_radius?: string | null
          updated_at?: string
          worked_with_usag_before?: boolean | null
        }
        Update: {
          admin_grade?: number | null
          admin_notes?: string | null
          application_type?: Database["public"]["Enums"]["application_type"]
          certification_other?: string | null
          certifications?: string[] | null
          city?: string
          created_at?: string
          dob?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          interested_roles?: string[] | null
          membership_number?: string | null
          pay_address?: string | null
          pay_city?: string | null
          pay_state?: string | null
          pay_zip?: string | null
          payment_method?: string | null
          phone?: string
          positions?: string[] | null
          primary_background?: string | null
          ruleset_expertise?: string[] | null
          shirt_size?: string | null
          smoothcomp?: string | null
          state?: string
          status?: string
          travel_radius?: string | null
          updated_at?: string
          worked_with_usag_before?: boolean | null
        }
        Relationships: []
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
      app_role: "admin" | "user"
      application_type: "officiate" | "staff"
      distribution_status:
        | "not_started"
        | "prepared"
        | "approved_to_submit"
        | "submitted_manual"
        | "submitted_auto"
        | "published_on_wires"
      event_style:
        | "catch_wrestling"
        | "college"
        | "grappling"
        | "sport_jiu_jitsu"
      press_release_status:
        | "draft"
        | "ready_for_review"
        | "approved"
        | "published"
        | "archived"
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
      app_role: ["admin", "user"],
      application_type: ["officiate", "staff"],
      distribution_status: [
        "not_started",
        "prepared",
        "approved_to_submit",
        "submitted_manual",
        "submitted_auto",
        "published_on_wires",
      ],
      event_style: [
        "catch_wrestling",
        "college",
        "grappling",
        "sport_jiu_jitsu",
      ],
      press_release_status: [
        "draft",
        "ready_for_review",
        "approved",
        "published",
        "archived",
      ],
    },
  },
} as const
