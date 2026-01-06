
import { BloodStock, DonationRequest, Feedback, Hospital, User, UserRole, Campaign, Achievement, Appointment, BloodRequest, DonorCertificate, EmergencyKey, SecurityLog } from "../types";

const HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'City General Hospital', city: 'New York', address: '123 Broad St', phone: '555-0101', email: 'contact@cgh.com' },
  { id: 'h2', name: 'St. Mary Medical Center', city: 'Los Angeles', address: '456 Sunset Blvd', phone: '555-0102', email: 'info@stmary.org' },
  { id: 'h3', name: 'Community Health Clinic', city: 'Chicago', address: '789 Lake Shore Dr', phone: '555-0103', email: 'support@chc.net' },
  { id: 'h16', name: 'Royal Care Hospital', city: 'London', address: '10 Downing St (Simulated)', phone: '+44-20-1234', email: 'royal@care.uk' },
];

let USERS_DB: User[] = [
  { id: 'donor-anuj', username: 'anuj', name: 'Anuj Donor', role: UserRole.DONOR, bloodType: 'O+', location: 'New York', isVerified: true, joinDate: '2023-03-15', phone: '9876543210', email: 'anuj@bloodbank.com', address: '555 Donor Lane, NY', level: 5, xp: 1200, status: 'Active' },
  { id: 'u1', username: 'samrat', name: 'Samrat Singh', role: UserRole.USER, bloodType: 'B+', location: 'Mumbai', joinDate: '2023-06-10', phone: '9123456789', email: 'samrat@bloodbank.com', address: '101 Marine Drive, Mumbai', status: 'Active' },
];

const BLOOD_REQUESTS: BloodRequest[] = [
  { id: 'req1', requesterName: 'City General Hospital', requesterType: 'Hospital', bloodType: 'O+', units: 5, urgency: 'Critical', location: '123 Broad St, New York', contact: '555-0101', distance: '2.5 km', date: '2023-10-27' },
  { id: 'req4', requesterName: 'James Bond', requesterType: 'User', bloodType: 'O-', units: 1, urgency: 'Critical', location: 'Royal Care, London', contact: '007-5555', distance: '5000 km', date: '2023-10-28' },
];

const CERTIFICATES: DonorCertificate[] = [];
const BLOOD_STOCKS: BloodStock[] = [
  { id: 'bs1', bloodType: 'A+', units: 12, maxCapacity: 50, hospitalName: 'City General Hospital', city: 'New York', contactNumber: '555-0101' },
  { id: 'bs2', bloodType: 'O-', units: 3, maxCapacity: 30, hospitalName: 'City General Hospital', city: 'New York', contactNumber: '555-0101' },
];

const REQUESTS: DonationRequest[] = [
  { id: 'r1', donorName: 'John Doe', bloodType: 'O+', status: 'Pending', date: '2023-10-25', urgency: 'Low', hospital: 'City General' },
  { id: 'r2', donorName: 'Jane Smith', bloodType: 'A-', status: 'Completed', date: '2023-10-20', urgency: 'Critical', hospital: 'St. Mary Medical' },
];

const FEEDBACKS: Feedback[] = [
  { id: 'f1', userId: 'u1', userRole: 'USER', message: 'Great service!', date: '2023-10-26' },
];

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', title: 'Red Cross Annual Drive', description: 'Biggest event.', date: '2023-11-15', location: 'New York, NY', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800', attendees: 124 },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Drop', description: 'Completed your first donation.', icon: '💧', locked: false },
];

const APPOINTMENTS: Appointment[] = [];
const EMERGENCY_KEYS: EmergencyKey[] = [
  { id: 'k1', code: 'GOLD-PRIORITY-882', type: 'Gold', usesRemaining: 2, issuedDate: '2023-09-01', status: 'Active' },
];

const SECURITY_LOGS: SecurityLog[] = [
  { id: 's1', severity: 'Low', message: 'System healthy', timestamp: '2023-10-28 10:30' },
];

export const MockBackend = {
  getHospitals: () => HOSPITALS,
  getAllUsers: () => USERS_DB,
  searchDonors: (bloodType: string, city: string) => USERS_DB.filter(d => (bloodType === 'All' || d.bloodType === bloodType) && (city === '' || d.location?.includes(city))),
  getBloodStocks: () => BLOOD_STOCKS,
  verifyDonorKey: (key: string): boolean => key === 'SPECIAL-KEY-123',
  getRequests: () => REQUESTS,
  addRequest: (req: DonationRequest) => REQUESTS.push(req),
  getFeedbacks: () => FEEDBACKS,
  addFeedback: (f: Feedback) => FEEDBACKS.push(f),
  getCampaigns: () => CAMPAIGNS,
  getAchievements: () => ACHIEVEMENTS,
  getAppointments: () => APPOINTMENTS,
  scheduleAppointment: (app: Appointment) => APPOINTMENTS.push(app),
  getBloodRequestsFeed: () => BLOOD_REQUESTS,
  getMyCertificates: (id: string) => CERTIFICATES,
  addCertificate: (c: DonorCertificate) => CERTIFICATES.push(c),
  getEmergencyKeys: () => EMERGENCY_KEYS,
  getSecurityLogs: () => SECURITY_LOGS,
  toggleUserStatus: (id: string) => {
    const u = USERS_DB.find(x => x.id === id);
    if (u) u.status = u.status === 'Active' ? 'Blocked' : 'Active';
    return u?.status || null;
  },
  promoteDonor: (id: string) => {
    const u = USERS_DB.find(x => x.id === id);
    if (u) { u.level = (u.level || 1) + 1; u.xp = (u.xp || 0) + 100; }
    return u?.level || null;
  },
  issueEmergencyKey: (id: string) => `GRANT-${Math.floor(Math.random() * 9999)}`,
};
