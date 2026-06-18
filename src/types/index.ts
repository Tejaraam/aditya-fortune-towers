export interface UnitConfig {
  id: string;
  type: string;
  area: string;
  facing: string;
  price: string;
  bathrooms: number;
  balconies: number;
  description: string;
  image: string;
}

export interface Amenity {
  id: string;
  name: string;
  category: 'sports' | 'leisure' | 'wellness' | 'essentials';
  description: string;
  iconName: string;
}

export interface FlatOwner {
  id: string;
  name: string;
  tower: string;
  flatNumber: string; // e.g., "101", "405"
  email: string | null;
  phone: string | null;
  residentType: string | null;
  moveInDate: string | null;
  profession: string | null;
  interests: string[] | null;
  avatar: string | null;
  committeeRole?: string | null;
  role?: string;
  dateOfBirth?: string | null;
  marriageAnniversary?: string | null;
  gender?: string | null;
  bio?: string | null;
  occupation?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  linkedinUrl?: string | null;
  profileVisibility?: boolean;
}

export interface Comment {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerFlat: string;
  ownerAvatar: string;
  text: string;
  timestamp: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'Celebration' | 'Sports' | 'Meeting' | 'Cultural' | 'Kids' | 'Workshop';
  date: string;
  time: string;
  location: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizerFlat: string;
  organizerAvatar: string;
  image: string;
  attendees: string[]; // list of owner IDs
  comments: Comment[];
  isAiStitched?: boolean; // Tag for Google Stitch created events
  aiPrompt?: string;
}

export interface SocietyNotice {
  id: string;
  title: string;
  date: string;
  priority: 'Urgent' | 'High' | 'Normal';
  author: string;
  department: 'Maintenance' | 'Security' | 'Management' | 'Finance';
  content: string;
  attachmentName?: string;
}

export interface Facility {
  id: string;
  name: string;
  capacity: string;
  timings: string;
  charges: string;
  image: string;
  status: 'Available' | 'Fully Booked' | 'Under Maintenance';
}

export interface PersonalEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  event_date: string;
  reminder_days_before: number;
  is_recurring: boolean;
  created_at?: string;
}
