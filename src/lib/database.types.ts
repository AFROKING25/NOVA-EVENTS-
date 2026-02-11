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
          full_name: string
          email: string
          phone: string | null
          bio: string | null
          avatar_url: string | null
          default_mobile_number: string | null
          default_mobile_name: string | null
          default_bank_account: string | null
          default_bank_name: string | null
          default_bank_holder: string | null
          default_lipa_number: string | null
          default_lipa_name: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          default_mobile_number?: string | null
          default_mobile_name?: string | null
          default_bank_account?: string | null
          default_bank_name?: string | null
          default_bank_holder?: string | null
          default_lipa_number?: string | null
          default_lipa_name?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          bio?: string | null
          avatar_url?: string | null
          default_mobile_number?: string | null
          default_mobile_name?: string | null
          default_bank_account?: string | null
          default_bank_name?: string | null
          default_bank_holder?: string | null
          default_lipa_number?: string | null
          default_lipa_name?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          organizer_id: string
          name: string
          type: string
          description: string | null
          event_date: string
          status: string
          visibility: string
          card_background_url: string | null
          card_name_position: Json
          card_qr_position: Json
          payment_mobile: Json | null
          payment_bank: Json | null
          payment_lipa: Json | null
          total_guests: number
          total_pledged: number
          total_paid: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          name: string
          type: string
          description?: string | null
          event_date: string
          status?: string
          visibility?: string
          card_background_url?: string | null
          card_name_position?: Json
          card_qr_position?: Json
          payment_mobile?: Json | null
          payment_bank?: Json | null
          payment_lipa?: Json | null
          total_guests?: number
          total_pledged?: number
          total_paid?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          name?: string
          type?: string
          description?: string | null
          event_date?: string
          status?: string
          visibility?: string
          card_background_url?: string | null
          card_name_position?: Json
          card_qr_position?: Json
          payment_mobile?: Json | null
          payment_bank?: Json | null
          payment_lipa?: Json | null
          total_guests?: number
          total_pledged?: number
          total_paid?: number
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          event_id: string
          name: string
          phone: string
          email: string | null
          category: string
          rsvp_status: string
          checked_in: boolean
          checked_in_at: string | null
          contribution_option_id: string | null
          pledge_amount: number
          payment_status: string
          payment_method: string | null
          transaction_id: string | null
          payment_screenshot_url: string | null
          paid_at: string | null
          invite_sent: boolean
          invite_sent_at: string | null
          reminder_sent_at: string | null
          thank_you_sent_at: string | null
          secure_token: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          phone: string
          email?: string | null
          category?: string
          rsvp_status?: string
          checked_in?: boolean
          checked_in_at?: string | null
          contribution_option_id?: string | null
          pledge_amount?: number
          payment_status?: string
          payment_method?: string | null
          transaction_id?: string | null
          payment_screenshot_url?: string | null
          paid_at?: string | null
          invite_sent?: boolean
          invite_sent_at?: string | null
          reminder_sent_at?: string | null
          thank_you_sent_at?: string | null
          secure_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          phone?: string
          email?: string | null
          category?: string
          rsvp_status?: string
          checked_in?: boolean
          checked_in_at?: string | null
          contribution_option_id?: string | null
          pledge_amount?: number
          payment_status?: string
          payment_method?: string | null
          transaction_id?: string | null
          payment_screenshot_url?: string | null
          paid_at?: string | null
          invite_sent?: boolean
          invite_sent_at?: string | null
          reminder_sent_at?: string | null
          thank_you_sent_at?: string | null
          secure_token?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contribution_options: {
        Row: {
          id: string
          event_id: string
          name: string
          amount: number
          description: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          amount: number
          description?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          amount?: number
          description?: string | null
          display_order?: number
          created_at?: string
        }
      }
      event_locations: {
        Row: {
          id: string
          event_id: string
          label: string
          google_maps_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          label: string
          google_maps_url: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          label?: string
          google_maps_url?: string
          display_order?: number
          created_at?: string
        }
      }
      custom_templates: {
        Row: {
          id: string
          event_id: string
          template_type: string
          subject: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          template_type: string
          subject: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          template_type?: string
          subject?: string
          body?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_event_stats: {
        Args: { event_uuid: string }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
