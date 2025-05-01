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
          name: string
          age: number | null
          bio: string | null
          image_url: string | null
          interests: string[] | null
          activities: string[] | null
          education: string | null
          occupation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          age?: number | null
          bio?: string | null
          image_url?: string | null
          interests?: string[] | null
          activities?: string[] | null
          education?: string | null
          occupation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number | null
          bio?: string | null
          image_url?: string | null
          interests?: string[] | null
          activities?: string[] | null
          education?: string | null
          occupation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}