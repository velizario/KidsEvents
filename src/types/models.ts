// Core data models for the application

// Base User model (matches auth.users table)
export interface User {
  id: string;
  email: string; // Email is stored in auth.users table, not in organizers or parents tables
  firstName: string;
  lastName: string;
  phone: string;
  userType: "parent" | "organizer";
  createdAt: string;
  updatedAt: string;
}

// Parent-specific data (matches parents table)
export interface ParentData {
  id: string; // References User.id
  children?: Child[];
}

// Organizer-specific data (matches organizers table)
export interface OrganizerData {
  id: string; // References User.id
  organizationName: string;
  description: string;
  website?: string;
}

// Combined types for application use
export interface Parent extends User, ParentData {
  userType: "parent";
}

export interface Organizer extends User, OrganizerData {
  userType: "organizer";
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age?: number;
  parentId: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  isPaid: boolean;
  status: "draft" | "active" | "cancelled" | "completed";
  imageUrl: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  childId: string;
  parentId: string;
  status: "pending" | "confirmed" | "cancelled";
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  eventId: string;
  parentId: string;
  organizerId: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
