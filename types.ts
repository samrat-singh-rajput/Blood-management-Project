
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
  bloodType?: string;
  location?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  joinDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  level?: number;
  xp?: number;
  status?: 'Active' | 'Blocked' | 'Inactive';
  // Personalization
  accentColor?: 'blood' | 'blue' | 'green' | 'purple';
  fontSize?: 'small' | 'medium' | 'large';
  language?: 'en' | 'hi';
  timeFormat?: '12' | '24';
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
}

export interface BloodStock {
  id: string;
  bloodType: string;
  units: number;
  maxCapacity: number;
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
  location?: string;
  phone?: string;
  type?: 'Donation' | 'Request';
  isMedicallyFit?: boolean;
  units?: number;
}

export interface DonorCertificate {
  id: string;
  donorId: string;
  date: string;
  hospitalName: string;
  imageUrl: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userRole: string;
  message: string;
  date: string;
  reply?: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status?: 'Active' | 'Inactive';
}

export interface EmergencyKey {
  id: string;
  code: string;
  type: 'Gold' | 'Platinum';
  usesRemaining: number;
  issuedDate: string;
  status: 'Active' | 'Expired';
  // Added ownerId to link keys to specific users in the storage
  ownerId?: string;
}

export interface SecurityLog {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  timestamp: string;
  user?: string;
}

export interface Appointment {
  id: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed';
}

// Added missing interface to fix build errors in components and mock services
export interface Campaign {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  attendees: number;
}

// Added missing interface to fix build errors in components and mock services
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  locked: boolean;
}

// Added missing interface to fix build errors in components and mock services
export interface BloodRequest {
  id: string;
  requesterName: string;
  requesterType: string;
  bloodType: string;
  units: number;
  urgency: 'Low' | 'Medium' | 'Critical';
  location: string;
  contact: string;
  distance: string;
  date: string;
}
