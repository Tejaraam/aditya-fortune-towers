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
          tower: string
          flat_number: string
          phone: string | null
          resident_type: 'Owner Resident' | 'Owner (Rented Out)' | 'Tenant' | null
          move_in_date: string | null
          profession: string | null
          interests: string[] | null
          avatar_url: string | null
          committee_role: string | null
          role: 'Admin' | 'Committee Member' | 'Member' | 'Visitor'
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id: string
          name: string
          tower: string
          flat_number: string
          phone?: string | null
          resident_type?: 'Owner Resident' | 'Owner (Rented Out)' | 'Tenant' | null
          move_in_date?: string | null
          profession?: string | null
          interests?: string[] | null
          avatar_url?: string | null
          committee_role?: string | null
          role?: 'Admin' | 'Committee Member' | 'Member' | 'Visitor'
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          name?: string
          tower?: string
          flat_number?: string
          phone?: string | null
          resident_type?: 'Owner Resident' | 'Owner (Rented Out)' | 'Tenant' | null
          move_in_date?: string | null
          profession?: string | null
          interests?: string[] | null
          avatar_url?: string | null
          committee_role?: string | null
          role?: 'Admin' | 'Committee Member' | 'Member' | 'Visitor'
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }
      events: {
        Row: {
          id: string
          title: string
          category: string
          event_date: string
          location: string
          description: string
          organizer_id: string | null
          image_url: string | null
          is_ai_stitched: boolean
          ai_prompt: string | null
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id?: string
          title: string
          category: string
          event_date: string
          location: string
          description: string
          organizer_id?: string | null
          image_url?: string | null
          is_ai_stitched?: boolean
          ai_prompt?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          title?: string
          category?: string
          event_date?: string
          location?: string
          description?: string
          organizer_id?: string | null
          image_url?: string | null
          is_ai_stitched?: boolean
          ai_prompt?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }
      event_attendees: {
        Row: {
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          event_id?: string
          user_id?: string
          created_at?: string
        }
      }
      event_comments: {
        Row: {
          id: string
          event_id: string
          owner_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          owner_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          owner_id?: string
          text?: string
          created_at?: string
        }
      }
      notices: {
        Row: {
          id: string
          title: string
          notice_date: string
          priority: 'Urgent' | 'High' | 'Normal' | null
          author_id: string | null
          department: 'Maintenance' | 'Security' | 'Management' | 'Finance' | null
          content: string
          attachment_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          notice_date?: string
          priority?: 'Urgent' | 'High' | 'Normal' | null
          author_id?: string | null
          department?: 'Maintenance' | 'Security' | 'Management' | 'Finance' | null
          content: string
          attachment_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          notice_date?: string
          priority?: 'Urgent' | 'High' | 'Normal' | null
          author_id?: string | null
          department?: 'Maintenance' | 'Security' | 'Management' | 'Finance' | null
          content?: string
          attachment_url?: string | null
          created_at?: string
        }
      }
      communications: {
        Row: {
          id: string
          title: string
          doc_date: string
          doc_type: 'Minutes of Meeting' | 'Communication' | 'Letter to Authority' | null
          author_id: string | null
          summary: string
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          doc_date?: string
          doc_type?: 'Minutes of Meeting' | 'Communication' | 'Letter to Authority' | null
          author_id?: string | null
          summary: string
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          doc_date?: string
          doc_type?: 'Minutes of Meeting' | 'Communication' | 'Letter to Authority' | null
          author_id?: string | null
          summary?: string
          file_url?: string | null
          created_at?: string
        }
      }
      pictures: {
        Row: {
          id: string
          title: string
          pic_date: string
          category: 'Event Photos' | 'Project Drawings' | 'Approvals & Documents' | 'Infrastructure' | null
          uploaded_by_id: string | null
          description: string
          image_url: string
          file_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          pic_date?: string
          category?: 'Event Photos' | 'Project Drawings' | 'Approvals & Documents' | 'Infrastructure' | null
          uploaded_by_id?: string | null
          description: string
          image_url: string
          file_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          pic_date?: string
          category?: 'Event Photos' | 'Project Drawings' | 'Approvals & Documents' | 'Infrastructure' | null
          uploaded_by_id?: string | null
          description?: string
          image_url?: string
          file_name?: string | null
          created_at?: string
        }
      }
      complaints: {
        Row: {
          id: string
          title: string
          category: string
          flat: string
          status: 'Open' | 'In Progress' | 'Resolved'
          description: string
          user_id: string | null
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id?: string
          title: string
          category: string
          flat: string
          status?: 'Open' | 'In Progress' | 'Resolved'
          description: string
          user_id?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          title?: string
          category?: string
          flat?: string
          status?: 'Open' | 'In Progress' | 'Resolved'
          description?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }
      financial_transactions: {
        Row: {
          id: string
          type: 'Income' | 'Expense'
          category: string
          amount: number
          description: string
          transaction_date: string
          receipt_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id?: string
          type: 'Income' | 'Expense'
          category: string
          amount: number
          description: string
          transaction_date: string
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          type?: 'Income' | 'Expense'
          category?: string
          amount?: number
          description?: string
          transaction_date?: string
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }

      flats: {
        Row: {
          id: string
          flat_number: string
          tower: string
          owner_profile_id: string | null
          monthly_maintenance_fee: number
          is_active: boolean
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id?: string
          flat_number: string
          tower: string
          owner_profile_id?: string | null
          monthly_maintenance_fee?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          flat_number?: string
          tower?: string
          owner_profile_id?: string | null
          monthly_maintenance_fee?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }
      monthly_maintenance: {
        Row: {
          id: string
          month: number
          year: number
          opening_balance: number
          expected_collection: number
          collected_amount: number
          pending_amount: number
          total_expenditure: number
          closing_balance: number
          remarks: string | null
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id?: string
          month: number
          year: number
          opening_balance?: number
          expected_collection?: number
          collected_amount?: number
          pending_amount?: number
          total_expenditure?: number
          closing_balance?: number
          remarks?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          month?: number
          year?: number
          opening_balance?: number
          expected_collection?: number
          collected_amount?: number
          pending_amount?: number
          total_expenditure?: number
          closing_balance?: number
          remarks?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }
      maintenance_payments: {
        Row: {
          id: string
          maintenance_id: string
          flat_id: string
          amount: number
          payment_date: string
          status: 'Paid' | 'Partially Paid' | 'Pending' | 'Advance Paid'
          payment_mode: string | null
          receipt_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          receipt_number: string | null
          billing_month: number | null
          billing_year: number | null
          transaction_reference: string | null
          collected_by: string | null
          remarks: string | null
          generated_receipt_url: string | null
        }
        Insert: {
          id?: string
          maintenance_id: string
          flat_id: string
          amount?: number
          payment_date?: string
          status?: 'Paid' | 'Partially Paid' | 'Pending' | 'Advance Paid'
          payment_mode?: string | null
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          receipt_number?: string | null
          billing_month?: number | null
          billing_year?: number | null
          transaction_reference?: string | null
          collected_by?: string | null
          remarks?: string | null
          generated_receipt_url?: string | null
        }
        Update: {
          id?: string
          maintenance_id?: string
          flat_id?: string
          amount?: number
          payment_date?: string
          status?: 'Paid' | 'Partially Paid' | 'Pending' | 'Advance Paid'
          payment_mode?: string | null
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          receipt_number?: string | null
          billing_month?: number | null
          billing_year?: number | null
          transaction_reference?: string | null
          collected_by?: string | null
          remarks?: string | null
          generated_receipt_url?: string | null
        }
      }
      expenditures: {
        Row: {
          id: string
          maintenance_id: string
          expense_date: string
          category: string
          description: string | null
          amount: number
          vendor_name: string | null
          payment_mode: string | null
          receipt_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string

          date_of_birth: string | null
          marriage_anniversary: string | null
          gender: string | null
          email: string | null
          bio: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          linkedin_url: string | null
          profile_visibility: boolean

        }
        Insert: {
          id?: string
          maintenance_id: string
          expense_date?: string
          category: string
          description?: string | null
          amount?: number
          vendor_name?: string | null
          payment_mode?: string | null
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
        Update: {
          id?: string
          maintenance_id?: string
          expense_date?: string
          category?: string
          description?: string | null
          amount?: number
          vendor_name?: string | null
          payment_mode?: string | null
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string

          date_of_birth?: string | null
          marriage_anniversary?: string | null
          gender?: string | null
          email?: string | null
          bio?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          linkedin_url?: string | null
          profile_visibility?: boolean

        }
      }
      receipts: {
        Row: {
          id: string
          payment_id: string
          receipt_number: string
          receipt_pdf_url: string | null
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          receipt_number: string
          receipt_pdf_url?: string | null
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          receipt_number?: string
          receipt_pdf_url?: string | null
          generated_at?: string
          created_at?: string
        }
      }


      personal_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          event_type: string | null
          event_date: string
          reminder_days_before: number
          is_recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          event_type?: string | null
          event_date: string
          reminder_days_before?: number
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          event_type?: string | null
          event_date?: string
          reminder_days_before?: number
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
      }

    }
    Views: {

      vw_flat_dues_summary: {
        Row: {
          flat_id: string
          flat_number: string
          tower: string
          current_month_charge: number
          total_months_initialized: number
          total_billed_amount: number
          total_paid_amount: number
          pending_dues: number
          advance_paid: number
        }
      }

    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
