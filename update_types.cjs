const fs = require('fs');
const file = 'src/types/database.types.ts';
let content = fs.readFileSync(file, 'utf8');

const tablesToAdd = `
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
`;

const viewsToAdd = `
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
`;

content = content.replace(/    }\r?\n    Views: {/, tablesToAdd + '\n    }\n    Views: {');
content = content.replace(/    Views: {\r?\n      \[_ in never\]: never\r?\n    }/, '    Views: {\n' + viewsToAdd + '\n    }');

fs.writeFileSync(file, content);
console.log("Updated");
