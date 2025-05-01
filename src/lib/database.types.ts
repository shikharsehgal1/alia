export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          user_id: string
          lat: number
          lng: number
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          lat: number
          lng: number
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          lat?: number
          lng?: number
          last_updated?: string
        }
      }
    }
  }
}