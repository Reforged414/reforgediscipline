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
      admin_users: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          flagged_for_review: boolean
          id: string
          post_id: string
          status: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          flagged_for_review?: boolean
          id?: string
          post_id: string
          status?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          flagged_for_review?: boolean
          id?: string
          post_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_profiles: {
        Row: {
          created_at: string
          handle: string
          handle_type: string
          handle_updated_at: string
          id: string
          leaderboard_opt_in: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          handle: string
          handle_type?: string
          handle_updated_at?: string
          id?: string
          leaderboard_opt_in?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          handle?: string
          handle_type?: string
          handle_updated_at?: string
          id?: string
          leaderboard_opt_in?: boolean
          user_id?: string
        }
        Relationships: []
      }
      discipline_goals: {
        Row: {
          created_at: string
          goal_name: string
          icon_name: string
          id: string
          is_completed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_name: string
          icon_name?: string
          id?: string
          is_completed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          goal_name?: string
          icon_name?: string
          id?: string
          is_completed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      forums: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      moderation_flags: {
        Row: {
          created_at: string
          flag_reason: string
          id: string
          reviewed: boolean
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          flag_reason: string
          id?: string
          reviewed?: boolean
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          flag_reason?: string
          id?: string
          reviewed?: boolean
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          created_at: string
          flagged_for_review: boolean
          forum_id: string
          id: string
          image_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          flagged_for_review?: boolean
          forum_id: string
          id?: string
          image_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          flagged_for_review?: boolean
          forum_id?: string
          id?: string
          image_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          reporter_user_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          reporter_user_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          reporter_user_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          created_at: string
          daily_discipline: Json | null
          has_completed_tutorial: boolean
          id: string
          journal_logs: Json | null
          last_check_date: string | null
          level: number
          level_name: string
          onboarding_complete: boolean
          onboarding_data: Json | null
          pending_milestone: number | null
          relapse_logs: Json | null
          resisted_timestamps: Json | null
          shown_milestones: Json | null
          streak: number
          streak_start_date: string | null
          updated_at: string
          urge_logs: Json | null
          user_id: string
          xp: number
          xp_for_next_level: number
        }
        Insert: {
          created_at?: string
          daily_discipline?: Json | null
          has_completed_tutorial?: boolean
          id?: string
          journal_logs?: Json | null
          last_check_date?: string | null
          level?: number
          level_name?: string
          onboarding_complete?: boolean
          onboarding_data?: Json | null
          pending_milestone?: number | null
          relapse_logs?: Json | null
          resisted_timestamps?: Json | null
          shown_milestones?: Json | null
          streak?: number
          streak_start_date?: string | null
          updated_at?: string
          urge_logs?: Json | null
          user_id: string
          xp?: number
          xp_for_next_level?: number
        }
        Update: {
          created_at?: string
          daily_discipline?: Json | null
          has_completed_tutorial?: boolean
          id?: string
          journal_logs?: Json | null
          last_check_date?: string | null
          level?: number
          level_name?: string
          onboarding_complete?: boolean
          onboarding_data?: Json | null
          pending_milestone?: number | null
          relapse_logs?: Json | null
          resisted_timestamps?: Json | null
          shown_milestones?: Json | null
          streak?: number
          streak_start_date?: string | null
          updated_at?: string
          urge_logs?: Json | null
          user_id?: string
          xp?: number
          xp_for_next_level?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      community_admin_target_text: {
        Args: { _id: string; _type: string }
        Returns: string
      }
      community_am_i_admin: { Args: never; Returns: boolean }
      community_get_comments: {
        Args: { _post_id: string }
        Returns: {
          body: string
          created_at: string
          handle: string
          id: string
          is_mine: boolean
        }[]
      }
      community_get_forums: {
        Args: never
        Returns: {
          description: string
          icon: string
          id: string
          name: string
          post_count: number
          slug: string
          sort_order: number
        }[]
      }
      community_get_leaderboard: {
        Args: { _metric?: string }
        Returns: {
          handle: string
          is_me: boolean
          rank: number
          value: number
        }[]
      }
      community_get_posts: {
        Args: { _forum_id?: string; _post_id?: string; _sort?: string }
        Returns: {
          body: string
          comment_count: number
          created_at: string
          forum_id: string
          handle: string
          id: string
          image_url: string
          is_mine: boolean
          my_reactions: string[]
          reactions: Json
        }[]
      }
      community_handle_available: {
        Args: { _handle: string }
        Returns: boolean
      }
      is_admin: { Args: { _uid: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
