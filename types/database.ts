export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type FontFileFormat = 'ttf' | 'otf' | 'woff2';

export type FontCategory =
  | 'Sans Serif'
  | 'Serif'
  | 'Display'
  | 'Handwritten'
  | 'Script'
  | 'Monospace'
  | 'Decorative'
  | 'Pixel'
  | 'Blackletter'
  | 'Other';

export type FontWeight =
  | 'Thin'
  | 'Extra Light'
  | 'Light'
  | 'Regular'
  | 'Medium'
  | 'Semi Bold'
  | 'Bold'
  | 'Extra Bold'
  | 'Black';

export type FontWidth =
  | 'Condensed'
  | 'Semi Condensed'
  | 'Normal'
  | 'Semi Expanded'
  | 'Expanded';

export type FontStyle =
  | 'Modern'
  | 'Minimal'
  | 'Elegant'
  | 'Futuristic'
  | 'Playful'
  | 'Professional'
  | 'Retro'
  | 'Vintage'
  | 'Geometric'
  | 'Organic';

export interface CharacterSetConfig {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  punctuation: boolean;
}

export interface AdvancedSettingsConfig {
  letterSpacing: number;
  contrast: 'low' | 'medium' | 'high';
  cornerStyle: 'sharp' | 'rounded' | 'bevel';
  strokeStyle: 'solid' | 'handdrawn' | 'inline';
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface FontGeneration {
  id: string;
  user_id: string;
  font_name: string | null;
  prompt: string;
  category: FontCategory;
  weight: FontWeight;
  width: FontWidth;
  style: FontStyle;
  character_set: CharacterSetConfig;
  advanced_settings: AdvancedSettingsConfig;
  status: GenerationStatus;
  error_message: string | null;
  parent_generation_id?: string | null;
  version_number?: number;
  generation_type?: 'initial' | 'regeneration' | 'handwriting';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface GeneratedFile {
  id: string;
  generation_id: string;
  format: FontFileFormat;
  storage_path: string;
  file_size: number;
  download_count: number;
  created_at: string;
}

export interface GenerationUsage {
  id: string;
  user_id: string;
  usage_date: string;
  generation_count: number;
  created_at: string;
  updated_at: string;
}

export interface FontFavorite {
  id: string;
  user_id: string;
  generation_id: string;
  created_at: string;
}

export interface FontCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FontCollectionItem {
  id: string;
  collection_id: string;
  generation_id: string;
  created_at: string;
}

export interface FontTag {
  id: string;
  user_id: string;
  generation_id: string;
  tag: string;
  created_at: string;
}

export interface ImportedFont {
  id: string;
  user_id: string;
  original_filename: string;
  format: 'ttf' | 'otf' | 'woff' | 'woff2';
  storage_path: string;
  file_size: number;
  status: 'uploaded' | 'analyzing' | 'ready' | 'failed';
  family_name: string | null;
  subfamily: string | null;
  full_name: string | null;
  postscript_name: string | null;
  version: string | null;
  units_per_em: number;
  glyph_count: number;
  ascender: number;
  descender: number;
  line_gap: number;
  extracted_metadata: Record<string, unknown>;
  glyph_cmap: Record<string, number[]>;
  table_records: Record<string, boolean>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface FontLicense {
  id: string;
  font_id: string;
  license_name: string | null;
  license_url: string | null;
  license_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  generation_limit: number;
  storage_limit_mb: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: string;
  provider_subscription_id: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
}

export interface UserEntitlementOverride {
  id: string;
  user_id: string;
  feature: string;
  enabled: boolean;
  limit_override: number | null;
  expires_at: string | null;
  reason: string | null;
  created_at: string;
}

export interface CreditBalance {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      font_generations: {
        Row: {
          advanced_settings: Json;
          category: string;
          character_set: Json;
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          font_name: string | null;
          id: string;
          prompt: string;
          status: string;
          style: string;
          updated_at: string;
          user_id: string;
          weight: string;
          width: string;
          parent_generation_id: string | null;
          version_number: number;
          generation_type: string;
        };
        Insert: {
          advanced_settings?: Json;
          category: string;
          character_set?: Json;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          font_name?: string | null;
          id?: string;
          prompt: string;
          status?: string;
          style?: string;
          updated_at?: string;
          user_id: string;
          weight: string;
          width: string;
          parent_generation_id?: string | null;
          version_number?: number;
          generation_type?: string;
        };
        Update: {
          advanced_settings?: Json;
          category?: string;
          character_set?: Json;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          font_name?: string | null;
          id?: string;
          prompt?: string;
          status?: string;
          style?: string;
          updated_at?: string;
          user_id?: string;
          weight?: string;
          width?: string;
          parent_generation_id?: string | null;
          version_number?: number;
          generation_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "font_generations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      generated_files: {
        Row: {
          created_at: string;
          download_count: number;
          file_size: number;
          format: string;
          generation_id: string;
          id: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          download_count?: number;
          file_size: number;
          format: string;
          generation_id: string;
          id?: string;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          download_count?: number;
          file_size?: number;
          format?: string;
          generation_id?: string;
          id?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "generated_files_generation_id_fkey";
            columns: ["generation_id"];
            isOneToOne: false;
            referencedRelation: "font_generations";
            referencedColumns: ["id"];
          }
        ];
      };
      generation_usage: {
        Row: {
          created_at: string;
          generation_count: number;
          id: string;
          updated_at: string;
          usage_date: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          generation_count?: number;
          id?: string;
          updated_at?: string;
          usage_date?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          generation_count?: number;
          id?: string;
          updated_at?: string;
          usage_date?: string;
          user_id: string;
        };
        Relationships: [
          {
            foreignKeyName: "generation_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          type: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          type?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          type?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      feature_flags: {
        Row: {
          id: string;
          key: string;
          enabled: boolean;
          description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          enabled?: boolean;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          enabled?: boolean;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      ai_providers: {
        Row: {
          id: string;
          provider: string;
          enabled: boolean;
          model: string;
          api_key_masked: string | null;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          enabled?: boolean;
          model: string;
          api_key_masked?: string | null;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          enabled?: boolean;
          model?: string;
          api_key_masked?: string | null;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_activity_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          generation_id: string | null;
          provider: string;
          model: string;
          request_type: string;
          input_tokens: number | null;
          output_tokens: number | null;
          total_tokens: number | null;
          latency_ms: number;
          status: string;
          error_code: string | null;
          estimated_cost_usd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          generation_id?: string | null;
          provider: string;
          model: string;
          request_type?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          latency_ms: number;
          status: string;
          error_code?: string | null;
          estimated_cost_usd?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          generation_id?: string | null;
          provider?: string;
          model?: string;
          request_type?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          latency_ms?: number;
          status?: string;
          error_code?: string | null;
          estimated_cost_usd?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      model_pricing: {
        Row: {
          id: string;
          provider: string;
          model: string;
          input_price_per_1k: number;
          output_price_per_1k: number;
          currency: string;
          effective_from: string;
        };
        Insert: {
          id?: string;
          provider: string;
          model: string;
          input_price_per_1k: number;
          output_price_per_1k: number;
          currency?: string;
          effective_from?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          model?: string;
          input_price_per_1k?: number;
          output_price_per_1k?: number;
          currency?: string;
          effective_from?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      font_favorites: {
        Row: {
          id: string;
          user_id: string;
          generation_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generation_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generation_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      font_collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      font_collection_items: {
        Row: {
          id: string;
          collection_id: string;
          generation_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          generation_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          generation_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      font_tags: {
        Row: {
          id: string;
          user_id: string;
          generation_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generation_id: string;
          tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generation_id?: string;
          tag?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      imported_fonts: {
        Row: {
          id: string;
          user_id: string;
          original_filename: string;
          format: string;
          storage_path: string;
          file_size: number;
          status: string;
          family_name: string | null;
          subfamily: string | null;
          full_name: string | null;
          postscript_name: string | null;
          version: string | null;
          units_per_em: number;
          glyph_count: number;
          ascender: number;
          descender: number;
          line_gap: number;
          extracted_metadata: Json;
          glyph_cmap: Json;
          table_records: Json;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_filename: string;
          format: string;
          storage_path: string;
          file_size: number;
          status?: string;
          family_name?: string | null;
          subfamily?: string | null;
          full_name?: string | null;
          postscript_name?: string | null;
          version?: string | null;
          units_per_em?: number;
          glyph_count?: number;
          ascender?: number;
          descender?: number;
          line_gap?: number;
          extracted_metadata?: Json;
          glyph_cmap?: Json;
          table_records?: Json;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_filename?: string;
          format?: string;
          storage_path?: string;
          file_size?: number;
          status?: string;
          family_name?: string | null;
          subfamily?: string | null;
          full_name?: string | null;
          postscript_name?: string | null;
          version?: string | null;
          units_per_em?: number;
          glyph_count?: number;
          ascender?: number;
          descender?: number;
          line_gap?: number;
          extracted_metadata?: Json;
          glyph_cmap?: Json;
          table_records?: Json;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      font_licenses: {
        Row: {
          id: string;
          font_id: string;
          license_name: string | null;
          license_url: string | null;
          license_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          font_id: string;
          license_name?: string | null;
          license_url?: string | null;
          license_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          font_id?: string;
          license_name?: string | null;
          license_url?: string | null;
          license_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
