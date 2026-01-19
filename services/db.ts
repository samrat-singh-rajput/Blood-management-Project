
import { User, UserRole, BloodStock, DonationRequest, Feedback, SecurityLog, Hospital, ChatMessage, DonorCertificate, Appointment } from "../types";

const DB_KEYS = {
  USERS: 'lifeflow_users',
  STOCKS: 'lifeflow_stocks',
  REQUESTS: 'lifeflow_requests',
  FEEDBACKS: 'lifeflow_feedbacks',
  LOGS: 'lifeflow_logs',
  HOSPITALS: 'lifeflow_hospitals',
  CHATS: 'lifeflow_chats',
  CERTIFICATES: 'lifeflow_certificates',
  APPOINTMENTS: 'lifeflow_appointments'
};

const INITIAL_STOCKS: BloodStock[] = [
  { id: 'bs1', bloodType: 'A+', units: 42, maxCapacity: 50, hospitalName: 'City General Hospital', city: 'New York', contactNumber: '555-0101' },
  { id: 'bs2', bloodType: 'O-', units: 12, maxCapacity: 30, hospitalName: 'St. Mary Medical', city: 'Los Angeles', contactNumber: '555-0102' },
  { id: 'bs3', bloodType: 'B+', units: 25, maxCapacity: 40, hospitalName: 'Hope Memorial', city: 'Chicago', contactNumber: '555-0103' },
];

const INITIAL_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'City General Hospital', city: 'New York', address: '123 Broad St', phone: '555-0101', email: 'contact@cgh.com' },
  { id: 'h2', name: 'St. Mary Medical Center', city: 'Los Angeles', address: '456 Sunset Blvd', phone: '555-0102', email: 'info@stmary.org' },
];

const INITIAL_USERS: User[] = [
  { 
    id: 'admin-rajput', 
    username: 'rajput', 
    name: 'Rajput Admin', 
    role: UserRole.ADMIN, 
    joinDate: '2022-01-01', 
    status: 'Active', 
    email: 'admin@bloodbank.com', 
    address: 'Central HQ, Delhi',
    password: 'rajput' 
  } as any,
  { 
    id: 'donor-anuj', 
    username: 'anuj', 
    name: 'Anuj Donor', 
    role: UserRole.DONOR, 
    bloodType: 'O+', 
    location: 'New York', 
    isVerified: true, 
    joinDate: '2023-03-15', 
    phone: '9876543210', 
    email: 'anuj@bloodbank.com', 
    address: '555 Donor Lane, NY', 
    level: 5, 
    xp: 1200, 
    status: 'Active',
    password: 'singh'
  } as any,
  { 
    id: 'user-anuj', 
    username: 'anuj', 
    name: 'Anuj User', 
    role: UserRole.USER, 
    bloodType: 'A+', 
    location: 'Gujrat', 
    joinDate: '2023-11-01', 
    phone: '9988776655', 
    email: 'anuj_user@gmail.com', 
    address: 'mehana 4, Rohini, Delhi', 
    status: 'Active',
    password: 'singh'
  } as any,
];

export const DB = {
  init: () => {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(DB_KEYS.STOCKS)) {
      localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(INITIAL_STOCKS));
    }
    if (!localStorage.getItem(DB_KEYS.REQUESTS)) {
      localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.FEEDBACKS)) {
      localStorage.setItem(DB_KEYS.FEEDBACKS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.HOSPITALS)) {
      localStorage.setItem(DB_KEYS.HOSPITALS, JSON.stringify(INITIAL_HOSPITALS));
    }
    if (!localStorage.getItem(DB_KEYS.CHATS)) {
      localStorage.setItem(DB_KEYS.CHATS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.CERTIFICATES)) {
      localStorage.setItem(DB_KEYS.CERTIFICATES, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.APPOINTMENTS)) {
      localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.LOGS)) {
      localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([{ id: 's1', severity: 'Low', message: 'System Initialized', timestamp: new Date().toLocaleString() }]));
    }
  },

  getUsers: (): User[] => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)),

  getStocks: (): BloodStock[] => JSON.parse(localStorage.getItem(DB_KEYS.STOCKS) || '[]'),
  saveStocks: (stocks: BloodStock[]) => localStorage.setItem(DB_KEYS.STOCKS, JSON.stringify(stocks)),

  getRequests: (): DonationRequest[] => JSON.parse(localStorage.getItem(DB_KEYS.REQUESTS) || '[]'),
  saveRequests: (reqs: DonationRequest[]) => localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(reqs)),

  getFeedbacks: (): Feedback[] => JSON.parse(localStorage.getItem(DB_KEYS.FEEDBACKS) || '[]'),
  saveFeedbacks: (feedbacks: Feedback[]) => localStorage.setItem(DB_KEYS.FEEDBACKS, JSON.stringify(feedbacks)),

  getHospitals: (): Hospital[] => JSON.parse(localStorage.getItem(DB_KEYS.HOSPITALS) || '[]'),
  saveHospitals: (hospitals: Hospital[]) => localStorage.setItem(DB_KEYS.HOSPITALS, JSON.stringify(hospitals)),

  getChats: (): ChatMessage[] => JSON.parse(localStorage.getItem(DB_KEYS.CHATS) || '[]'),
  saveChats: (chats: ChatMessage[]) => localStorage.setItem(DB_KEYS.CHATS, JSON.stringify(chats)),

  getCertificates: (): DonorCertificate[] => JSON.parse(localStorage.getItem(DB_KEYS.CERTIFICATES) || '[]'),
  saveCertificates: (certs: DonorCertificate[]) => localStorage.setItem(DB_KEYS.CERTIFICATES, JSON.stringify(certs)),

  getAppointments: (): Appointment[] => JSON.parse(localStorage.getItem(DB_KEYS.APPOINTMENTS) || '[]'),
  saveAppointments: (apps: Appointment[]) => localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(apps)),

  getLogs: (): SecurityLog[] => JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]'),
  addLog: (log: SecurityLog) => {
    const logs = DB.getLogs();
    logs.unshift(log);
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
  }
};

DB.init();
