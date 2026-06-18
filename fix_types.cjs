const fs = require('fs');
const file = 'src/types/database.types.ts';
let content = fs.readFileSync(file, 'utf8');

const profileAdditions = `
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
`;
const profileInsertUpdate = `
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
`;

const personalEvents = `
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
`;

content = content.replace(/          updated_at: string(\r?\n        })/g, "          updated_at: string\n" + profileAdditions + "$1");
content = content.replace(/          updated_at\?: string(\r?\n        })/g, "          updated_at?: string\n" + profileInsertUpdate + "$1");

// Insert personal_events
content = content.replace(/    }\r?\n    Views: {/g, personalEvents + '\n    }\n    Views: {');

fs.writeFileSync(file, content);
console.log("Fixed types.");
