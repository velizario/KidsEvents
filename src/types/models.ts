// Core data models for the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: "parent" | "organizer";
  createdAt: string;
  updatedAt: string;
}

export interface Parent extends User {
  userType: "parent";
  children: Child[];
}

export interface Organizer extends User {
  userType: "organizer";
  organizationName: string;
  contactName: string;
  description: string;
  website?: string;
  yearEstablished?: number;
  rating?: number;
  reviewCount?: number;
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
  ageGroup: string;
  category: string;
  capacity: number;
  registrations: number;
  price: string;
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
  paymentStatus: "pending" | "paid" | "refunded";
  confirmationCode: string;
  registrationDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  eventId: string;
  parentId: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
