
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  setDoc,
  getDoc,
  Timestamp,
  serverTimestamp,
  or,
  and
} from "firebase/firestore";
import { User, UserRole, BloodStock, DonationRequest, Appointment, Feedback, SecurityLog, Hospital, ChatMessage, DonorCertificate, EmergencyKey, Campaign } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { realtime } from "./realTimeService";

// This service now uses real Firebase Firestore.
export const API = {
  login: async (username: string, pass: string, role: UserRole): Promise<User> => {
    try {
      const q = query(collection(db, "users"), where("username", "==", username), where("role", "==", role));
      const snapshot = await getDocs(q);
      let userDoc = snapshot.docs[0];

      if (!userDoc) {
        // Check email as well
        const qEmail = query(collection(db, "users"), where("email", "==", username), where("role", "==", role));
        const snapshotEmail = await getDocs(qEmail);
        userDoc = snapshotEmail.docs[0];
      }

      if (!userDoc) throw new Error("Invalid credentials or role mismatch.");
      const userData = userDoc.data() as User;
      if (userData.password !== pass) throw new Error("Invalid password.");
      return { ...userData, _id: userDoc.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "users");
      throw error;
    }
  },

  checkEmail: async (email: string) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
      const snapshot = await getDocs(q);
      return { success: true, exists: !snapshot.empty };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "users");
      throw error;
    }
  },

  completeSignup: async (data: any) => {
    try {
      const q = query(collection(db, "users"), where("username", "==", data.username));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) throw new Error("Username already taken.");
      
      const newUser = {
        ...data,
        email: data.email.toLowerCase(),
        status: 'Active',
        joinDate: new Date().getFullYear().toString(),
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "users"), newUser);
      return { ...newUser, _id: docRef.id } as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "users");
      throw error;
    }
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    try {
      const snapshot = await getDocs(collection(db, "campaigns"));
      const campaigns = snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as Campaign));
      
      if (campaigns.length === 0) {
        const initial = [
          { title: 'Mega Blood Drive 2024', description: 'Join us at City Hall for our biggest event of the year.', date: 'Dec 15, 2024', location: 'City Hall', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116ecaaba7f', attendees: 142 },
          { title: 'Emergency O- Drive', description: 'Critical shortage of O negative blood. Urgent donors needed.', date: 'Oct 20, 2024', location: 'Central Hospital', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d', attendees: 89 }
        ];
        for (const c of initial) await addDoc(collection(db, "campaigns"), c);
        const newSnapshot = await getDocs(collection(db, "campaigns"));
        return newSnapshot.docs.map(d => ({ ...d.data(), _id: d.id } as Campaign));
      }
      return campaigns;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "campaigns");
      throw error;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as User));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "users");
      throw error;
    }
  },
  
  getDonationRequests: async (): Promise<DonationRequest[]> => {
    try {
      const q = query(collection(db, "requests"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as DonationRequest));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "requests");
      throw error;
    }
  },
  
  getHospitals: async (): Promise<Hospital[]> => {
    try {
      const snapshot = await getDocs(collection(db, "hospitals"));
      const hospitals = snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as Hospital));
      if (hospitals.length === 0) {
        const initial = [
          { name: 'City General Hospital', city: 'New York', address: '123 Medical Plaza', phone: '555-0123', email: 'contact@citygeneral.com' },
          { name: 'St. Jude Medical Center', city: 'London', address: '45 Healthcare Ave', phone: '555-9876', email: 'info@stjude.org' }
        ];
        for (const h of initial) await addDoc(collection(db, "hospitals"), h);
        const newSnapshot = await getDocs(collection(db, "hospitals"));
        return newSnapshot.docs.map(d => ({ ...d.data(), _id: d.id } as Hospital));
      }
      return hospitals;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "hospitals");
      throw error;
    }
  },

  getFeedbacks: async (): Promise<Feedback[]> => {
    try {
      const snapshot = await getDocs(collection(db, "feedback"));
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as Feedback));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "feedback");
      throw error;
    }
  },
  
  getBloodStocks: async (): Promise<BloodStock[]> => {
    try {
      const snapshot = await getDocs(collection(db, "stocks"));
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as BloodStock));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "stocks");
      throw error;
    }
  },
  
  getSecurityLogs: async (): Promise<SecurityLog[]> => {
    try {
      const snapshot = await getDocs(collection(db, "logs"));
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as SecurityLog));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "logs");
      throw error;
    }
  },
  
  sendMessage: async (msg: any) => {
    try {
      const docRef = await addDoc(collection(db, "messages"), {
        ...msg,
        timestamp: new Date().toISOString()
      });
      const savedMsg = { ...msg, _id: docRef.id };
      realtime.emit('NEW_MESSAGE', savedMsg);
      return savedMsg;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "messages");
      throw error;
    }
  },

  getChatHistory: async (u1: string, u2: string) => {
    try {
      const q = query(
        collection(db, "messages"), 
        or(
          and(where("senderId", "==", u1), where("receiverId", "==", u2)),
          and(where("senderId", "==", u2), where("receiverId", "==", u1))
        )
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as ChatMessage));
      return messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "messages");
      throw error;
    }
  },

  getAllUserChats: async (uid: string) => {
    try {
      const q = query(
        collection(db, "messages"),
        or(where("senderId", "==", uid), where("receiverId", "==", uid))
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as ChatMessage));
      return messages.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "messages");
      throw error;
    }
  },
  
  addDonationRequest: async (req: any) => {
    try {
      const docRef = await addDoc(collection(db, "requests"), {
        ...req,
        date: new Date().toISOString()
      });
      return { ...req, _id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "requests");
      throw error;
    }
  },

  updateDonationRequestStatus: async (id: string, s: string) => {
    try {
      const docRef = doc(db, "requests", id);
      await updateDoc(docRef, { status: s });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${id}`);
      throw error;
    }
  },
  
  addHospital: async (h: any) => {
    try {
      const docRef = await addDoc(collection(db, "hospitals"), h);
      return { ...h, _id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "hospitals");
      throw error;
    }
  },
  
  deleteHospital: async (id: string) => {
    try {
      await deleteDoc(doc(db, "hospitals", id));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `hospitals/${id}`);
      throw error;
    }
  },
  
  issueEmergencyKey: async (uid: string) => {
    try {
      const code = `KEY-${Math.floor(1000 + Math.random() * 8999)}`;
      const newKey = { 
        code, 
        ownerId: uid, 
        type: 'Gold', 
        status: 'Active',
        issuedDate: new Date().toISOString().split('T')[0],
        usesRemaining: 1
      };
      const docRef = await addDoc(collection(db, "keys"), newKey);
      const savedKey = { ...newKey, _id: docRef.id };
      realtime.emit('NEW_EMERGENCY_KEY', { userId: uid, key: savedKey });
      return code;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "keys");
      throw error;
    }
  },

  getEmergencyKeys: async (uid: string): Promise<EmergencyKey[]> => {
    try {
      const q = query(collection(db, "keys"), where("ownerId", "==", uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as EmergencyKey));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "keys");
      throw error;
    }
  },
  
  addFeedback: async (f: any) => {
    try {
      const docRef = await addDoc(collection(db, "feedback"), {
        ...f,
        date: new Date().toISOString()
      });
      const savedFeedback = { ...f, _id: docRef.id };
      realtime.emit('NEW_FEEDBACK', savedFeedback);
      return savedFeedback;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "feedback");
      throw error;
    }
  },
  
  replyToFeedback: async (id: string, r: string) => {
    try {
      const docRef = doc(db, "feedback", id);
      await updateDoc(docRef, { reply: r });
      realtime.emit('NEW_FEEDBACK_REPLY', { feedbackId: id, reply: r });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `feedback/${id}`);
      throw error;
    }
  },
  
  toggleUserStatus: async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const userSnap = await getDoc(docRef);
      if (!userSnap.exists()) throw new Error("User not found");
      const user = userSnap.data() as User;
      const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
      await updateDoc(docRef, { status: newStatus });
      return newStatus;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  },

  getCertificates: async (uid: string) => {
    try {
      const q = query(collection(db, "certificates"), where("donorId", "==", uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as DonorCertificate));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "certificates");
      throw error;
    }
  },
  
  addCertificate: async (c: any) => {
    try {
      const docRef = await addDoc(collection(db, "certificates"), c);
      return { ...c, _id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "certificates");
      throw error;
    }
  },
  
  getAppointments: async (uid: string) => {
    try {
      const q = query(collection(db, "appointments"), where("donorId", "==", uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ ...d.data(), _id: d.id } as Appointment));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "appointments");
      throw error;
    }
  },
  
  scheduleAppointment: async (a: any) => {
    try {
      const docRef = await addDoc(collection(db, "appointments"), a);
      return { ...a, _id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "appointments");
      throw error;
    }
  },
  
  updateUserProfile: async (uid: string, data: any) => {
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, data);
      const updatedSnap = await getDoc(docRef);
      return { ...updatedSnap.data(), _id: updatedSnap.id } as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  }
};

// Seed default users if database is empty
export const seed = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    if (snapshot.empty) {
      await addDoc(collection(db, "users"), { username: 'rajput', password: 'rajput', role: UserRole.ADMIN, name: 'Admin Rajput', email: 'admin@bloodbank.com', status: 'Active', joinDate: '2023', createdAt: new Date().toISOString() });
      await addDoc(collection(db, "users"), { username: 'anuj', password: 'anuj', role: UserRole.DONOR, name: 'Anuj Donor', email: 'anuj@donor.com', bloodType: 'O+', location: 'New York', phone: '555-0199', status: 'Active', joinDate: '2023', createdAt: new Date().toISOString() });
      await addDoc(collection(db, "users"), { username: 'anuj_user', password: 'anuj', role: UserRole.USER, name: 'Anuj User', email: 'anuj@user.com', status: 'Active', joinDate: '2023', createdAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error("Seeding failed", error);
  }
};
