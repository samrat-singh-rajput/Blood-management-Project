
import { User, UserRole, BloodStock, DonationRequest, Appointment, Feedback, SecurityLog, Hospital, ChatMessage, DonorCertificate, EmergencyKey, Campaign } from "../types";

// Virtual Database Storage
const getStorage = (key: string) => JSON.parse(localStorage.getItem(`bb_mock_${key}`) || '[]');
const setStorage = (key: string, data: any) => localStorage.setItem(`bb_mock_${key}`, JSON.stringify(data));

// Initialize Default Users
const initMockDB = () => {
  const users = getStorage('users');
  if (users.length === 0) {
    const defaults = [
      { _id: 'admin_01', username: 'rajput', password: 'rajput', role: UserRole.ADMIN, name: 'Samrat Admin', email: 'admin@gmail.com', status: 'Active', joinDate: '2023-10-01' },
      { _id: 'donor_01', username: 'anuj', password: 'singh', role: UserRole.DONOR, name: 'Anuj Donor', bloodType: 'A+', email: 'donor@gmail.com', status: 'Active', joinDate: '2023-10-01' },
      { _id: 'user_01', username: 'anuj_user', password: 'anuj', role: UserRole.USER, name: 'Anuj Recipient', bloodType: 'B-', email: 'user@gmail.com', status: 'Active', joinDate: '2023-10-01' }
    ];
    setStorage('users', defaults);
  }
};
initMockDB();

export const API = {
  login: async (usernameOrEmail: string, pass: string, role: UserRole): Promise<User> => {
    await new Promise(r => setTimeout(r, 500));
    const users = getStorage('users');
    const user = users.find((u: any) => 
      (u.username === usernameOrEmail || u.email?.toLowerCase() === usernameOrEmail.toLowerCase()) && 
      u.password === pass && 
      u.role === role
    );
    if (!user) throw new Error("Invalid credentials or role mismatch");
    return user;
  },

  isEmailRegistered: async (email: string): Promise<User | null> => {
    await new Promise(r => setTimeout(r, 600));
    const users = getStorage('users');
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  checkEmail: async (email: string) => {
    await new Promise(r => setTimeout(r, 600));
    const users = getStorage('users');
    if (users.some((u: any) => u.email?.toLowerCase() === email.toLowerCase())) {
      throw new Error("This email is already registered. Please log in.");
    }
    return { success: true };
  },

  completeSignup: async (data: any) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getStorage('users');
    // Double check email conflict
    if (users.some((u: any) => u.email?.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("Email already registered during session. Please log in.");
    }
    
    const newUser = {
      _id: `BB_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    setStorage('users', users);
    return newUser;
  },

  getUsers: async (): Promise<User[]> => getStorage('users'),
  getDonationRequests: async (): Promise<DonationRequest[]> => getStorage('requests'),
  getHospitals: async (): Promise<Hospital[]> => getStorage('hospitals'),
  getFeedbacks: async (): Promise<Feedback[]> => getStorage('feedbacks'),
  getBloodStocks: async (): Promise<BloodStock[]> => getStorage('stocks'),
  getSecurityLogs: async (): Promise<SecurityLog[]> => getStorage('logs'),
  
  sendMessage: async (msg: any) => {
    const chats = getStorage('messages');
    chats.push({ ...msg, _id: Date.now().toString() });
    setStorage('messages', chats);
  },
  
  getChatHistory: async (u1: string, u2: string) => {
    const chats = getStorage('messages');
    return chats.filter((c: any) => (c.senderId === u1 && c.receiverId === u2) || (c.senderId === u2 && c.receiverId === u1));
  },

  getAllUserChats: async (uid: string) => {
    const chats = getStorage('messages');
    return chats.filter((c: any) => c.senderId === uid || c.receiverId === uid);
  },

  addDonationRequest: async (req: any) => {
    const items = getStorage('requests');
    items.push({ ...req, _id: Date.now().toString() });
    setStorage('requests', items);
  },

  updateDonationRequestStatus: async (id: string, s: string) => {
    const items = getStorage('requests');
    const idx = items.findIndex((i: any) => i._id === id);
    if (idx !== -1) items[idx].status = s;
    setStorage('requests', items);
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    return [
      { _id: 'c1', title: 'Mega Blood Drive', description: 'Helping the community.', date: 'Dec 24, 2024', location: 'Central Park', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116ecaaba7f', attendees: 124 },
      { _id: 'c2', title: 'Winter Support', description: 'Winter blood collection.', date: 'Jan 10, 2025', location: 'City Hospital', imageUrl: 'https://images.unsplash.com/photo-1579152276502-545a248a9931', attendees: 89 }
    ];
  },

  addHospital: async (h: any) => {
    const items = getStorage('hospitals');
    items.push({ ...h, _id: Date.now().toString() });
    setStorage('hospitals', items);
  },

  deleteHospital: async (id: string) => {
    const items = getStorage('hospitals');
    setStorage('hospitals', items.filter((i: any) => i._id !== id));
  },

  addFeedback: async (f: any) => {
    const items = getStorage('feedbacks');
    items.push({ ...f, _id: Date.now().toString() });
    setStorage('feedbacks', items);
  },

  replyToFeedback: async (id: string, r: string) => {
    const items = getStorage('feedbacks');
    const idx = items.findIndex((i: any) => i._id === id);
    if (idx !== -1) items[idx].reply = r;
    setStorage('feedbacks', items);
  },

  toggleUserStatus: async (uid: string) => {
    const users = getStorage('users');
    const idx = users.findIndex((u: any) => u._id === uid);
    if (idx !== -1) {
      users[idx].status = users[idx].status === 'Active' ? 'Blocked' : 'Active';
      setStorage('users', users);
      return users[idx].status;
    }
  },

  getCertificates: async (uid: string) => getStorage('certificates').filter((c: any) => c.donorId === uid),
  addCertificate: async (c: any) => {
    const items = getStorage('certificates');
    items.push({ ...c, _id: Date.now().toString() });
    setStorage('certificates', items);
  },

  getAppointments: async (uid: string) => getStorage('appointments').filter((a: any) => a.donorId === uid),
  scheduleAppointment: async (a: any) => {
    const items = getStorage('appointments');
    items.push({ ...a, _id: Date.now().toString() });
    setStorage('appointments', items);
  },

  getEmergencyKeys: async (uid: string): Promise<EmergencyKey[]> => getStorage('keys').filter((k: any) => k.ownerId === uid),
  issueEmergencyKey: async (uid: string) => {
    const keys = getStorage('keys');
    const code = `KEY-${Math.floor(1000 + Math.random() * 8999)}`;
    keys.push({ _id: Date.now().toString(), code, ownerId: uid, type: 'Gold', issuedDate: new Date().toISOString().split('T')[0], status: 'Active', usesRemaining: 1 });
    setStorage('keys', keys);
    return code;
  },

  updateUserProfile: async (uid: string, data: any) => {
    const users = getStorage('users');
    const idx = users.findIndex((u: any) => u._id === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      setStorage('users', users);
      return users[idx];
    }
  }
};
