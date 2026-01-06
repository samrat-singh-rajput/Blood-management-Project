
import { User, UserRole, BloodStock, DonationRequest, Appointment, Feedback, SecurityLog, BloodRequest } from "../types";
import { DB } from "./db";

const delay = (ms: number = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const API = {
  // --- AUTH ---
  login: async (username: string, password: string, role: UserRole): Promise<User | null> => {
    await delay(800);
    const users = DB.getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      (u as any).password === password &&
      u.role === role
    );
    if (user) {
      DB.addLog({ id: `log-${Date.now()}`, severity: 'Low', message: `${role} Login: ${user.username}`, timestamp: new Date().toLocaleString() });
    }
    return user || null;
  },

  register: async (userData: Partial<User & { password?: string }>): Promise<User> => {
    await delay(1000);
    const users = DB.getUsers();
    if (users.some(u => u.username.toLowerCase() === (userData.username || '').toLowerCase())) {
      throw new Error("Username already taken.");
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: userData.username || '',
      name: userData.name || userData.username || '',
      role: userData.role || UserRole.USER,
      bloodType: userData.bloodType,
      location: userData.location,
      phone: userData.phone,
      email: userData.email,
      address: userData.address,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      level: 1,
      xp: 0
    };

    (newUser as any).password = userData.password;
    users.push(newUser);
    DB.saveUsers(users);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'Medium', message: `New ${newUser.role} registered: ${newUser.username}`, timestamp: new Date().toLocaleString() });
    return newUser;
  },

  // --- DATA FETCHING ---
  getUsers: async (): Promise<User[]> => {
    await delay(300);
    return DB.getUsers();
  },

  getBloodStocks: async (): Promise<BloodStock[]> => {
    await delay(400);
    return DB.getStocks();
  },

  getDonationRequests: async (): Promise<DonationRequest[]> => {
    await delay(300);
    return DB.getRequests();
  },

  getFeedbacks: async (): Promise<Feedback[]> => {
    await delay(200);
    return DB.getFeedbacks();
  },

  getSecurityLogs: async (): Promise<SecurityLog[]> => {
    await delay(200);
    return DB.getLogs();
  },

  // --- ACTIONS ---
  addDonationRequest: async (req: DonationRequest): Promise<void> => {
    await delay(500);
    const requests = DB.getRequests();
    requests.unshift(req);
    DB.saveRequests(requests);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'High', message: `New Request: ${req.bloodType} from ${req.donorName}`, timestamp: new Date().toLocaleString() });
  },

  updateDonationRequestStatus: async (requestId: string, status: 'Pending' | 'Approved' | 'Completed' | 'Rejected'): Promise<void> => {
    await delay(400);
    const requests = DB.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = status;
      DB.saveRequests(requests);
      DB.addLog({ id: `log-${Date.now()}`, severity: 'Medium', message: `Request ${requestId} status updated to ${status}`, timestamp: new Date().toLocaleString() });
    }
  },

  addFeedback: async (feedback: Feedback): Promise<void> => {
    await delay(400);
    const feedbacks = DB.getFeedbacks();
    feedbacks.unshift(feedback);
    DB.saveFeedbacks(feedbacks);
  },

  replyToFeedback: async (feedbackId: string, reply: string): Promise<void> => {
    await delay(400);
    const feedbacks = DB.getFeedbacks();
    const index = feedbacks.findIndex(f => f.id === feedbackId);
    if (index !== -1) {
      feedbacks[index].reply = reply;
      DB.saveFeedbacks(feedbacks);
      DB.addLog({ id: `log-${Date.now()}`, severity: 'Low', message: `Admin replied to feedback ${feedbackId}`, timestamp: new Date().toLocaleString() });
    }
  },

  toggleUserStatus: async (userId: string): Promise<string | null> => {
    await delay(400);
    const users = DB.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Blocked' : 'Active';
      DB.saveUsers(users);
      DB.addLog({ id: `log-${Date.now()}`, severity: 'Critical', message: `User status updated: ${user.username} (${user.status})`, timestamp: new Date().toLocaleString() });
      return user.status;
    }
    return null;
  },

  promoteDonor: async (userId: string): Promise<number | null> => {
    await delay(500);
    const users = DB.getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.role === UserRole.DONOR) {
      user.level = (user.level || 1) + 1;
      user.xp = (user.xp || 0) + 100;
      DB.saveUsers(users);
      return user.level;
    }
    return null;
  },

  issueEmergencyKey: async (userId: string): Promise<string> => {
    await delay(500);
    const key = `GRANT-${Math.floor(1000 + Math.random() * 8999)}`;
    DB.addLog({ id: `log-${Date.now()}`, severity: 'High', message: `Emergency Key issued for user ${userId}`, timestamp: new Date().toLocaleString() });
    return key;
  },

  getBloodNeeds: async (): Promise<BloodRequest[]> => {
    await delay(300);
    // Hardcoded feed for UI demo, but could be DB-backed
    return [
      { id: 'req1', requesterName: 'City General', requesterType: 'Hospital', bloodType: 'O+', units: 5, urgency: 'Critical', location: 'New York', contact: '555-0101', distance: '2km', date: '2023-10-28' }
    ];
  },

  getAppointments: async (): Promise<Appointment[]> => {
    return [];
  },

  scheduleAppointment: async (app: Appointment): Promise<void> => {
    await delay(400);
  }
};
