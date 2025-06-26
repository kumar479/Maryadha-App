export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      factories: {
        Row: {
          id: string;
          name: string;
          location: string;
          description: string;
          founder_story?: string | null;
          delivery_timeline?: string | null;
          certifications?: string[] | null;
          branding_assets?: string[] | null;
          video_url?: string | null;
          featured_image?: string | null;
          verified?: boolean;
          instagram?: string | null;
          website?: string | null;
          gallery?: string[] | null;
          tech_pack_guide?: string | null;
          minimum_order_quantity?: number;
          leather_types?: string[];
          tanning_types?: string[];
          finishes?: string[];
          product_categories?: string[];
          rep_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          description?: string;
          founder_story?: string | null;
          delivery_timeline?: string | null;
          certifications?: string[] | null;
          branding_assets?: string[] | null;
          video_url?: string | null;
          featured_image?: string | null;
          verified?: boolean;
          instagram?: string | null;
          website?: string | null;
          gallery?: string[] | null;
          tech_pack_guide?: string | null;
          minimum_order_quantity?: number;
          leather_types?: string[];
          tanning_types?: string[];
          finishes?: string[];
          product_categories?: string[];
          rep_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          description?: string;
          founder_story?: string | null;
          delivery_timeline?: string | null;
          certifications?: string[] | null;
          branding_assets?: string[] | null;
          video_url?: string | null;
          featured_image?: string | null;
          verified?: boolean;
          instagram?: string | null;
          website?: string | null;
          gallery?: string[] | null;
          tech_pack_guide?: string | null;
          minimum_order_quantity?: number;
          leather_types?: string[];
          tanning_types?: string[];
          finishes?: string[];
          product_categories?: string[];
          rep_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      samples: {
        Row: {
          id: string;
          brand_id: string;
          factory_id: string;
          rep_id: string;
          status: string;
          file_url: string | null;
          preferred_moq: number;
          comments: string | null;
          quantity: number | null;
          finish_notes: string | null;
          delivery_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          factory_id: string;
          rep_id: string;
          status: string;
          file_url?: string | null;
          preferred_moq: number;
          comments?: string | null;
          quantity?: number | null;
          finish_notes?: string | null;
          delivery_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          factory_id?: string;
          rep_id?: string;
          status?: string;
          file_url?: string | null;
          preferred_moq?: number;
          comments?: string | null;
          quantity?: number | null;
          finish_notes?: string | null;
          delivery_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: string | null;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: string | null;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: string | null;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sample_status_history: {
        Row: {
          id: string;
          sample_id: string;
          status: string;
          notes: string | null;
          eta: string | null;
          tracking_number: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sample_id: string;
          status: string;
          notes?: string | null;
          eta?: string | null;
          tracking_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          sample_id?: string;
          status?: string;
          notes?: string | null;
          eta?: string | null;
          tracking_number?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
