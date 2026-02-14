
import { db, auth } from "./firebase";
import { User, UserRole, BloodStock, DonationRequest, Appointment, Feedback, SecurityLog, Hospital, ChatMessage, DonorCertificate, EmergencyKey, Campaign } from "../types";

/**
 * Cloud-Based API Service (Firebase) - Refactored for namespaced compatibility
 */

export const API = {
  // --- AUTHENTICATION ---
  login: async (username: string, pass: string, role: UserRole): Promise<User | null> => {
    // We use username + "@bloodbank.com" as a virtual email for Firebase Auth compatibility
    const virtualEmail = `${username.toLowerCase()}@bloodbank.com`;
    
    try {
      const userCredential = await auth.signInWithEmailAndPassword(virtualEmail, pass);
      const userDoc = await db.collection("users").doc(userCredential.user!.uid).get();
      
      if (!userDoc.exists) return null;
      
      const userData = userDoc.data() as User;
      if (userData.role !== role) {
        await auth.signOut();
        throw new Error(`Unauthorized access for role: ${role}`);
      }
      
      if (userData.status === 'Blocked') {
        await auth.signOut();
        throw new Error("Account is suspended by administrator.");
      }
      
      return { ...userData, _id: userDoc.id };
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      return null;
    }
  },

  register: async (userData: Partial<User & { password?: string }>): Promise<User> => {
    if (userData.role === UserRole.ADMIN) throw new Error("Security: Administrative enrollment restricted.");
    
    const virtualEmail = `${userData.username?.toLowerCase()}@bloodbank.com`;
    
    try {
      // 1. Create entry in Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(virtualEmail, userData.password!);
      
      // 2. Create Profile in Firestore
      const newUser: User = {
        _id: userCredential.user!.uid,
        username: userData.username!.toLowerCase(),
        name: userData.username!,
        role: userData.role || UserRole.USER,
        bloodType: userData.bloodType,
        email: userData.email?.toLowerCase() || virtualEmail,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      await db.collection("users").doc(userCredential.user!.uid).set(newUser);

      // 3. Log the creation
      await db.collection("security_logs").add({
        severity: 'Medium',
        message: `New User Node Online: ${newUser.username} (${newUser.role})`,
        timestamp: new Date().toLocaleString()
      });

      return newUser;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Username already claimed. Please choose another.");
      }
      throw error;
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const userRef = db.collection("users").doc(userId);
    await userRef.update({ ...updates, updatedAt: new Date().toISOString() });
    const updated = await userRef.get();
    return { ...(updated.data() as User), _id: updated.id };
  },

  getUsers: async (): Promise<User[]> => {
    const snap = await db.collection("users").get();
    return snap.docs.map(d => ({ ...(d.data() as User), _id: d.id }));
  },

  getDonationRequests: async (): Promise<DonationRequest[]> => {
    const snap = await db.collection("requests").get();
    return snap.docs.map(d => ({ ...(d.data() as DonationRequest), _id: d.id }));
  },

  getHospitals: async (): Promise<Hospital[]> => {
    const snap = await db.collection("hospitals").get();
    return snap.docs.map(d => ({ ...(d.data() as Hospital), _id: d.id }));
  },

  getFeedbacks: async (): Promise<Feedback[]> => {
    const snap = await db.collection("feedback").get();
    return snap.docs.map(d => ({ ...(d.data() as Feedback), _id: d.id }));
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    const snap = await db.collection("campaigns").get();
    return snap.docs.map(d => ({ ...(d.data() as Campaign), _id: d.id }));
  },

  sendMessage: async (msg: Omit<ChatMessage, '_id'>): Promise<void> => {
    await db.collection("messages").add(msg);
  },

  getChatHistory: async (user1Id: string, user2Id: string): Promise<ChatMessage[]> => {
    const snap = await db.collection("messages").orderBy("timestamp", "asc").get();
    const msgs = snap.docs.map(d => ({ ...(d.data() as ChatMessage), _id: d.id }));
    return msgs.filter(m => 
      (m.senderId === user1Id && m.receiverId === user2Id) || 
      (m.senderId === user2Id && m.receiverId === user1Id)
    );
  },

  getAllUserChats: async (userId: string): Promise<ChatMessage[]> => {
    const snap = await db.collection("messages").get();
    const msgs = snap.docs.map(d => ({ ...(d.data() as ChatMessage), _id: d.id }));
    return msgs.filter(m => m.senderId === userId || m.receiverId === userId);
  },

  addDonationRequest: async (req: Omit<DonationRequest, '_id'>): Promise<void> => {
    await db.collection("requests").add(req);
  },

  updateDonationRequestStatus: async (requestId: string, status: string): Promise<void> => {
    await db.collection("requests").doc(requestId).update({ status });
  },

  addHospital: async (hospital: Partial<Hospital>): Promise<void> => {
    await db.collection("hospitals").add({ ...hospital, status: 'Active' });
  },

  deleteHospital: async (hospitalId: string): Promise<void> => {
    await db.collection("hospitals").doc(hospitalId).delete();
  },

  issueEmergencyKey: async (userId: string): Promise<string> => {
    const code = `GRANT-${Math.floor(1000 + Math.random() * 8999)}`;
    const keyData = {
      code, 
      type: 'Gold', 
      usesRemaining: 1, 
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Active', 
      ownerId: userId
    };
    await db.collection("emergency_keys").add(keyData);
    return code;
  },

  getEmergencyKeys: async (userId: string): Promise<EmergencyKey[]> => {
    const snap = await db.collection("emergency_keys").where("ownerId", "==", userId).get();
    return snap.docs.map(d => ({ ...(d.data() as EmergencyKey), _id: d.id }));
  },

  getBloodStocks: async (): Promise<BloodStock[]> => {
    const snap = await db.collection("stocks").get();
    return snap.docs.map(d => ({ ...(d.data() as BloodStock), _id: d.id }));
  },

  getSecurityLogs: async (): Promise<SecurityLog[]> => {
    const snap = await db.collection("security_logs").orderBy("timestamp", "desc").get();
    return snap.docs.map(d => ({ ...(d.data() as SecurityLog), _id: d.id }));
  },

  addFeedback: async (feedback: Omit<Feedback, '_id'>): Promise<void> => {
    await db.collection("feedback").add(feedback);
  },

  replyToFeedback: async (feedbackId: string, reply: string): Promise<void> => {
    await db.collection("feedback").doc(feedbackId).update({ reply });
  },

  toggleUserStatus: async (userId: string): Promise<string | null> => {
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return null;
    const newStatus = userSnap.data()!.status === 'Active' ? 'Blocked' : 'Active';
    await userRef.update({ status: newStatus });
    return newStatus;
  },

  getCertificates: async (donorId: string): Promise<DonorCertificate[]> => {
    const snap = await db.collection("certificates").where("donorId", "==", donorId).get();
    return snap.docs.map(d => ({ ...(d.data() as DonorCertificate), _id: d.id }));
  },

  addCertificate: async (cert: Omit<DonorCertificate, '_id'>): Promise<void> => {
    await db.collection("certificates").add(cert);
  },

  getAppointments: async (userId: string): Promise<Appointment[]> => {
    const snap = await db.collection("appointments").where("donorId", "==", userId).get();
    return snap.docs.map(d => ({ ...(d.data() as Appointment), _id: d.id }));
  },

  scheduleAppointment: async (app: Omit<Appointment, '_id'>): Promise<void> => {
    await db.collection("appointments").add(app);
  },

  changePassword: async (userId: string, newPass: string): Promise<void> => {
    if (auth.currentUser) {
      await auth.currentUser.updatePassword(newPass);
    }
  },

  deleteAccount: async (userId: string): Promise<void> => {
    await db.collection("users").doc(userId).update({ status: 'Inactive' });
    if (auth.currentUser) {
       // Identity deactivation handled via status flag
    }
  }
};
