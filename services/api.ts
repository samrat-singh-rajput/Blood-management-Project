import { User, UserRole, BloodStock, DonationRequest, Appointment, Feedback, SecurityLog, Hospital, ChatMessage, DonorCertificate, EmergencyKey, Campaign } from "../types";

const getBaseUrl = () => {
  const ip = localStorage.getItem('bloodbank_server_ip') || 'localhost';
  return `http://${ip}/bloodbank-api/api.php`;
};

const fetchAPI = async (action: string, method: string = 'GET', data: any = null) => {
  const baseUrl = getBaseUrl();
  try {
    const url = new URL(baseUrl);
    url.searchParams.append('action', action);
    
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (data && method !== 'GET') options.body = JSON.stringify(data);
    
    const response = await fetch(url.toString(), options);
    const result = await response.json();
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
        throw new Error('Server Unreachable. Check XAMPP/Network.');
    }
    throw error;
  }
};

export const API = {
  login: async (username: string, pass: string, role: UserRole): Promise<User> => {
    const res = await fetchAPI('login', 'POST', { username, password: pass, role });
    return res.user;
  },

  sendSignupOtp: async (email: string) => {
    return await fetchAPI('send_signup_otp', 'POST', { email });
  },

  verifySignupOtp: async (email: string, otp: string) => {
    return await fetchAPI('verify_signup_otp', 'POST', { email, otp });
  },

  completeSignup: async (data: any) => {
    const res = await fetchAPI('complete_signup', 'POST', data);
    return res.user;
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    try { return await fetchAPI('get_campaigns'); } 
    catch (e) { return [{ _id: 'c1', title: 'Mega Drive', description: 'Saving lives.', date: 'Dec 2024', location: 'City Hall', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116ecaaba7f', attendees: 50 }]; }
  },

  getUsers: async (): Promise<User[]> => fetchAPI('get_users'),
  getDonationRequests: async (): Promise<DonationRequest[]> => fetchAPI('get_requests'),
  getHospitals: async (): Promise<Hospital[]> => fetchAPI('get_hospitals'),
  getFeedbacks: async (): Promise<Feedback[]> => fetchAPI('get_feedbacks'),
  getBloodStocks: async (): Promise<BloodStock[]> => fetchAPI('get_stocks'),
  getSecurityLogs: async (): Promise<SecurityLog[]> => fetchAPI('get_logs'),
  
  sendMessage: async (msg: any) => fetchAPI('send_message', 'POST', msg),
  getChatHistory: async (u1: string, u2: string) => fetchAPI('get_chat_history', 'POST', { user1Id: u1, user2Id: u2 }),
  getAllUserChats: async (uid: string) => fetchAPI('get_all_chats', 'POST', { userId: uid }),
  
  addDonationRequest: async (req: any) => fetchAPI('add_request', 'POST', req),
  updateDonationRequestStatus: async (id: string, s: string) => fetchAPI('update_request_status', 'POST', { requestId: id, status: s }),
  
  addHospital: async (h: any) => fetchAPI('add_hospital', 'POST', h),
  deleteHospital: async (id: string) => fetchAPI('delete_hospital', 'POST', { hospitalId: id }),
  
  issueEmergencyKey: async (uid: string) => {
    const code = `KEY-${Math.floor(1000 + Math.random() * 8999)}`;
    await fetchAPI('add_key', 'POST', { code, ownerId: uid, type: 'Gold', issuedDate: new Date().toISOString().split('T')[0] });
    return code;
  },

  // Fix: Added missing getEmergencyKeys method to retrieve the priority keys issued to a user.
  getEmergencyKeys: async (uid: string): Promise<EmergencyKey[]> => fetchAPI('get_keys', 'POST', { userId: uid }),
  
  addFeedback: async (f: any) => fetchAPI('add_feedback', 'POST', f),
  replyToFeedback: async (id: string, r: string) => fetchAPI('reply_feedback', 'POST', { feedbackId: id, reply: r }),
  
  toggleUserStatus: async (uid: string) => {
    const res = await fetchAPI('toggle_user_status', 'POST', { userId: uid });
    return res.newStatus;
  },

  getCertificates: async (uid: string) => fetchAPI('get_certificates', 'POST', { donorId: uid }),
  addCertificate: async (c: any) => fetchAPI('add_certificate', 'POST', c),
  
  getAppointments: async (uid: string) => fetchAPI('get_appointments', 'POST', { userId: uid }),
  scheduleAppointment: async (a: any) => fetchAPI('add_appointment', 'POST', a),
  
  updateUserProfile: async (uid: string, data: any) => {
    const res = await fetchAPI('update_profile', 'POST', { userId: uid, ...data });
    return res.user;
  }
};