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
        }
      }
    }
    Views: {
      [_ in never]: never
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
