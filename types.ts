
export enum UserRole {
  ADMIN = 'ADMIN',
  DONOR = 'DONOR',
  USER = 'USER', // Recipient
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  bloodType?: string; // For donors and users
  location?: string;
  isVerified?: boolean; // Verified by special key (for donors)
  avatarUrl?: string;
  joinDate?: string;
  phone?: string; // Added for contact details
  email?: string; // Added
  address?: string; // Added
  level?: number; // Gamification
  xp?: number; // Gamification
  status?: 'Active' | 'Blocked'; // New: for admin control
}

export interface BloodStock {
  id: string;
  bloodType: string;
  units: number;
  maxCapacity: number; // Added for visual progress bars
  hospitalName: string;
  city: string;
  contactNumber: string;
}

export interface DonationRequest {
  id: string;
  donorName: string;
  bloodType: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  date: string;
  urgency: 'Low' | 'Medium' | 'Critical';
  hospital?: string;
}

export interface BloodRequest {
  id: string;
  requesterName: string;
  requesterType: 'Hospital' | 'User';
  bloodType: string;
  units: number;
  urgency: 'Normal' | 'High' | 'Critical';
  location: string;
  contact: string;
  distance: string;
  date: string;
}

export interface DonorCertificate {
  id: string;
  donorId: string;
  date: string;
  hospitalName: string;
  imageUrl: string; // In real app, this would be a URL. Mocking with string.
}

export interface Feedback {
  id: string;
  userId: string;
  userRole: string;
  message: string;
  date: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  coordinates?: { lat: number; lng: number };
}

export interface EmergencyKey {
  id: string;
  code: string;
  type: 'Gold' | 'Platinum';
  usesRemaining: number;
  issuedDate: string;
  status: 'Active' | 'Expired';
}

export interface SecurityLog {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  timestamp: string;
  user?: string;
}

// New Types for "Big" Features
export interface Campaign {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  attendees: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  earnedDate?: string;
  locked: boolean;
}

export interface Appointment {
  id: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed';
}