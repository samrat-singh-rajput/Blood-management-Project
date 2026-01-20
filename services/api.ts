
import { User, UserRole, BloodStock, DonationRequest, Appointment, Feedback, SecurityLog, Hospital, ChatMessage, DonorCertificate, EmergencyKey } from "../types";
import { DB } from "./db";
import { realtime } from "./realTimeService";

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
      if (user.status === 'Inactive') {
        user.status = 'Active';
        DB.saveUsers(users);
      }
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
      xp: 0,
      accentColor: 'blood',
      fontSize: 'medium',
      language: 'en',
      timeFormat: '12',
      dateFormat: 'DD/MM/YYYY'
    };

    (newUser as any).password = userData.password;
    users.push(newUser);
    DB.saveUsers(users);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'Medium', message: `New ${newUser.role} registered: ${newUser.username}`, timestamp: new Date().toLocaleString() });
    return newUser;
  },

  // --- USER SETTINGS & PROFILE ---
  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay(500);
    const users = DB.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");
    
    users[index] = { ...users[index], ...updates };
    DB.saveUsers(users);
    return users[index];
  },

  changePassword: async (userId: string, newPass: string): Promise<void> => {
    await delay(600);
    const users = DB.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      (users[index] as any).password = newPass;
      DB.saveUsers(users);
      DB.addLog({ id: `log-${Date.now()}`, severity: 'High', message: `Password changed for user: ${users[index].username}`, timestamp: new Date().toLocaleString() });
    }
  },

  deleteAccount: async (userId: string): Promise<void> => {
    await delay(800);
    const users = DB.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    DB.saveUsers(filtered);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'Critical', message: `Account deleted: ${userId}`, timestamp: new Date().toLocaleString() });
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

  getHospitals: async (): Promise<Hospital[]> => {
    await delay(300);
    return DB.getHospitals();
  },

  // --- CHAT SYSTEM ---
  getChatHistory: async (user1Id: string, user2Id: string): Promise<ChatMessage[]> => {
    await delay(200);
    const chats = DB.getChats();
    return chats.filter(c => 
      (c.senderId === user1Id && c.receiverId === user2Id) ||
      (c.senderId === user2Id && c.receiverId === user1Id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  getAllUserChats: async (userId: string): Promise<ChatMessage[]> => {
    await delay(200);
    const chats = DB.getChats();
    return chats.filter(c => c.senderId === userId || c.receiverId === userId);
  },

  sendMessage: async (msg: ChatMessage): Promise<void> => {
    await delay(100);
    const chats = DB.getChats();
    chats.push(msg);
    DB.saveChats(chats);
    realtime.emit('NEW_CHAT_MESSAGE', msg);
  },

  // --- ACTIONS ---
  addDonationRequest: async (req: DonationRequest): Promise<void> => {
    await delay(500);
    const requests = DB.getRequests();
    requests.unshift(req);
    DB.saveRequests(requests);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'High', message: `New Request: ${req.bloodType} from ${req.donorName}`, timestamp: new Date().toLocaleString() });
    realtime.emit('NEW_DONATION_REQUEST', req);
  },

  updateDonationRequestStatus: async (requestId: string, status: 'Pending' | 'Approved' | 'Completed' | 'Rejected'): Promise<void> => {
    await delay(400);
    const requests = DB.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = status;
      DB.saveRequests(requests);
      realtime.emit('REQUEST_STATUS_UPDATED', { requestId, status });
    }
  },

  addFeedback: async (feedback: Feedback): Promise<void> => {
    await delay(400);
    const feedbacks = DB.getFeedbacks();
    feedbacks.unshift(feedback);
    DB.saveFeedbacks(feedbacks);
    realtime.emit('NEW_FEEDBACK', feedback);
  },

  replyToFeedback: async (feedbackId: string, reply: string): Promise<void> => {
    await delay(400);
    const feedbacks = DB.getFeedbacks();
    const index = feedbacks.findIndex(f => f.id === feedbackId);
    if (index !== -1) {
      feedbacks[index].reply = reply;
      DB.saveFeedbacks(feedbacks);
      realtime.emit('FEEDBACK_REPLIED', { feedbackId, reply });
    }
  },

  // --- HOSPITAL MANAGEMENT ---
  addHospital: async (hospital: Partial<Hospital>): Promise<void> => {
    await delay(500);
    const hospitals = DB.getHospitals();
    const newHospital: Hospital = {
      id: `hosp-${Date.now()}`,
      name: hospital.name || 'Unnamed Hospital',
      city: hospital.city || 'Unknown',
      address: hospital.address || 'No Address',
      phone: hospital.phone || 'N/A',
      email: hospital.email || 'N/A',
      status: 'Active'
    };
    hospitals.unshift(newHospital);
    DB.saveHospitals(hospitals);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'Medium', message: `Admin added hospital: ${newHospital.name}`, timestamp: new Date().toLocaleString() });
  },

  deleteHospital: async (hospitalId: string): Promise<void> => {
    await delay(400);
    const hospitals = DB.getHospitals();
    const filtered = hospitals.filter(h => h.id !== hospitalId);
    DB.saveHospitals(filtered);
    DB.addLog({ id: `log-${Date.now()}`, severity: 'High', message: `Admin removed hospital ID: ${hospitalId}`, timestamp: new Date().toLocaleString() });
  },

  // --- EMERGENCY KEYS ---
  issueEmergencyKey: async (userId: string): Promise<string> => {
    await delay(500);
    const keys = DB.getEmergencyKeys();
    const code = `GRANT-${Math.floor(1000 + Math.random() * 8999)}`;
    const newKey: EmergencyKey & { ownerId: string } = {
      id: `key-${Date.now()}`,
      code: code,
      type: 'Gold',
      usesRemaining: 1,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      ownerId: userId
    };
    keys.push(newKey);
    DB.saveEmergencyKeys(keys);
    realtime.emit('NEW_EMERGENCY_KEY', { userId, key: newKey });
    return code;
  },

  getEmergencyKeys: async (userId: string): Promise<EmergencyKey[]> => {
    await delay(300);
    return DB.getEmergencyKeys().filter((k: any) => k.ownerId === userId);
  },

  // --- MISC ---
  toggleUserStatus: async (userId: string): Promise<string | null> => {
    await delay(400);
    const users = DB.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Blocked' : 'Active';
      DB.saveUsers(users);
      return user.status;
    }
    return null;
  },

  getCertificates: async (donorId: string): Promise<DonorCertificate[]> => {
    await delay(400);
    return DB.getCertificates().filter(c => c.donorId === donorId);
  },

  addCertificate: async (cert: DonorCertificate): Promise<void> => {
    await delay(600);
    const certs = DB.getCertificates();
    certs.unshift(cert);
    DB.saveCertificates(certs);
  },

  getAppointments: async (userId: string): Promise<Appointment[]> => {
    await delay(300);
    const apps = DB.getAppointments();
    return apps.filter(a => (a as any).donorId === userId);
  },

  scheduleAppointment: async (app: Appointment & { donorId: string }): Promise<void> => {
    await delay(500);
    const apps = DB.getAppointments();
    apps.push(app);
    DB.saveAppointments(apps);
    realtime.emit('NEW_APPOINTMENT', app);
  }
};
