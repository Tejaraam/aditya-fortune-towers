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
  tower: 'Tower A' | 'Tower B' | 'Tower C';
  flatNumber: string; // e.g., "101", "405"
  email: string;
  phone: string;
  residentType: 'Owner Resident' | 'Owner (Rented Out)' | 'Tenant';
  moveInDate: string;
  profession: string;
  interests: string[];
  avatar: string;
  committeeRole?: string;
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
