
import { BloodStock, DonationRequest, Feedback, Hospital, User, UserRole, Campaign, Achievement, Appointment, BloodRequest, DonorCertificate, EmergencyKey, SecurityLog } from "../types";

// Expanded Hospital List (15+ entries)
const HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'City General Hospital', city: 'New York', address: '123 Broad St', phone: '555-0101', email: 'contact@cgh.com' },
  { id: 'h2', name: 'St. Mary Medical Center', city: 'Los Angeles', address: '456 Sunset Blvd', phone: '555-0102', email: 'info@stmary.org' },
  { id: 'h3', name: 'Community Health Clinic', city: 'Chicago', address: '789 Lake Shore Dr', phone: '555-0103', email: 'support@chc.net' },
  { id: 'h4', name: 'Hope Memorial', city: 'New York', address: '321 Wall St', phone: '555-0104', email: 'admin@hope.org' },
  { id: 'h5', name: 'Sunshine Hospital', city: 'Miami', address: '77 Palm Way', phone: '555-0105', email: 'sunshine@hosp.com' },
  { id: 'h6', name: 'Westside Clinic', city: 'Seattle', address: '88 Pine St', phone: '555-0106', email: 'westside@clinic.com' },
  { id: 'h7', name: 'Central Blood Bank', city: 'Austin', address: '404 Longhorn Blvd', phone: '555-0107', email: 'central@bloodbank.com' },
  { id: 'h8', name: 'Golden Gate Health', city: 'San Francisco', address: '101 Bridge Rd', phone: '555-0108', email: 'info@goldengate.com' },
  { id: 'h9', name: 'Metro General', city: 'Detroit', address: '500 Auto Dr', phone: '555-0109', email: 'metro@health.org' },
  { id: 'h10', name: 'Lone Star Hospital', city: 'Houston', address: '202 Space Center Blvd', phone: '555-0110', email: 'contact@lonestar.com' },
  { id: 'h11', name: 'Summit Medical', city: 'Denver', address: '888 Peak Way', phone: '555-0111', email: 'help@summit.org' },
  { id: 'h12', name: 'Freedom Hospital', city: 'Philadelphia', address: '1776 Bell St', phone: '555-0112', email: 'info@freedom.org' },
  { id: 'h13', name: 'Desert Oasis Clinic', city: 'Phoenix', address: '99 Cactus Ave', phone: '555-0113', email: 'oasis@clinic.com' },
  { id: 'h14', name: 'Bay Area Medical', city: 'San Jose', address: '404 Tech Park', phone: '555-0114', email: 'bayarea@medical.com' },
  { id: 'h15', name: 'Riverside Health', city: 'New Orleans', address: '303 Jazz Ln', phone: '555-0115', email: 'river@health.com' },
  { id: 'h16', name: 'Royal Care Hospital', city: 'London', address: '10 Downing St (Simulated)', phone: '+44-20-1234', email: 'royal@care.uk' },
  { id: 'h17', name: 'Evergreen Health', city: 'Portland', address: '555 Tree Ln', phone: '555-0117', email: 'evergreen@health.com' },
];

// Expanded Donors/Users List (20+ entries with phone numbers)
// Making this a let variable so we can update status/level in memory
let USERS_DB: User[] = [
  { id: 'd1', username: 'donor1', name: 'John Doe', role: UserRole.DONOR, bloodType: 'O+', location: 'New York', isVerified: true, joinDate: '2023-01-15', phone: '9876543210', email: 'john@example.com', address: '123 Maple Ave, NY', level: 2, xp: 240, status: 'Active' },
  { id: 'd2', username: 'donor2', name: 'Jane Smith', role: UserRole.DONOR, bloodType: 'A-', location: 'Chicago', isVerified: false, joinDate: '2023-06-20', phone: '9876543211', email: 'jane@example.com', address: '456 Oak St, Chicago', level: 1, xp: 50, status: 'Active' },
  { id: 'd3', username: 'donor3', name: 'Mike Ross', role: UserRole.DONOR, bloodType: 'B+', location: 'New York', isVerified: true, joinDate: '2023-08-10', phone: '9876543212', email: 'mike@example.com', address: '789 Pine St, NY', level: 3, xp: 450, status: 'Active' },
  { id: 'donor-anuj', username: 'anuj', name: 'Anuj Donor', role: UserRole.DONOR, bloodType: 'O+', location: 'New York', isVerified: true, joinDate: '2023-03-15', phone: '9876543210', email: 'anuj@bloodbank.com', address: '555 Donor Lane, NY', level: 5, xp: 1200, status: 'Active' },
  { id: 'u1', username: 'samrat', name: 'Samrat Singh', role: UserRole.USER, bloodType: 'B+', location: 'Mumbai', joinDate: '2023-06-10', phone: '9123456789', email: 'samrat@bloodbank.com', address: '101 Marine Drive, Mumbai', status: 'Active' },
  { id: 'u2', username: 'sarah', name: 'Sarah Connor', role: UserRole.USER, bloodType: 'O-', location: 'Los Angeles', joinDate: '2023-07-01', phone: '555-1234', email: 'sarah@sky.net', address: '2029 Future Rd, LA', status: 'Active' },
];

// Mock Blood Requests Feed
const BLOOD_REQUESTS: BloodRequest[] = [
  { id: 'req1', requesterName: 'City General Hospital', requesterType: 'Hospital', bloodType: 'O+', units: 5, urgency: 'Critical', location: '123 Broad St, New York', contact: '555-0101', distance: '2.5 km', date: '2023-10-27' },
  { id: 'req2', requesterName: 'Sarah Connor (Patient)', requesterType: 'User', bloodType: 'AB-', units: 2, urgency: 'High', location: 'Hope Memorial, New York', contact: '555-9999', distance: '4.1 km', date: '2023-10-26' },
  { id: 'req3', requesterName: 'St. Mary Medical Center', requesterType: 'Hospital', bloodType: 'A-', units: 10, urgency: 'Normal', location: '456 Sunset Blvd, LA', contact: '555-0102', distance: '12.0 km', date: '2023-10-25' },
  { id: 'req4', requesterName: 'James Bond', requesterType: 'User', bloodType: 'O-', units: 1, urgency: 'Critical', location: 'Royal Care, London', contact: '007-5555', distance: '5000 km', date: '2023-10-28' },
];

// Mock Certificates
const CERTIFICATES: DonorCertificate[] = [
  { id: 'cert1', donorId: 'd1', date: '2023-01-20', hospitalName: 'City General Hospital', imageUrl: 'placeholder' },
  { id: 'cert2', donorId: 'd1', date: '2023-05-15', hospitalName: 'Red Cross Camp', imageUrl: 'placeholder' },
  { id: 'cert3', donorId: 'donor-anuj', date: '2023-06-01', hospitalName: 'Anuj General Hospital', imageUrl: 'placeholder' },
];

// Fake Blood Stock Data
const BLOOD_STOCKS: BloodStock[] = [
  { id: 'bs1', bloodType: 'A+', units: 12, maxCapacity: 50, hospitalName: 'City General Hospital', city: 'New York', contactNumber: '555-0101' },
  { id: 'bs2', bloodType: 'O-', units: 3, maxCapacity: 30, hospitalName: 'City General Hospital', city: 'New York', contactNumber: '555-0101' },
  { id: 'bs3', bloodType: 'B+', units: 38, maxCapacity: 60, hospitalName: 'St. Mary Medical Center', city: 'Los Angeles', contactNumber: '555-0102' },
  { id: 'bs4', bloodType: 'AB+', units: 5, maxCapacity: 20, hospitalName: 'Community Health Clinic', city: 'Chicago', contactNumber: '555-0103' },
  { id: 'bs5', bloodType: 'O+', units: 20, maxCapacity: 100, hospitalName: 'Hope Memorial', city: 'New York', contactNumber: '555-0104' },
  { id: 'bs6', bloodType: 'A-', units: 4, maxCapacity: 25, hospitalName: 'Sunshine Hospital', city: 'Miami', contactNumber: '555-0105' },
  { id: 'bs7', bloodType: 'B-', units: 2, maxCapacity: 25, hospitalName: 'Westside Clinic', city: 'Seattle', contactNumber: '555-0106' },
  { id: 'bs8', bloodType: 'O+', units: 15, maxCapacity: 80, hospitalName: 'Central Blood Bank', city: 'Austin', contactNumber: '555-0107' },
  { id: 'bs9', bloodType: 'A+', units: 45, maxCapacity: 50, hospitalName: 'Golden Gate Health', city: 'San Francisco', contactNumber: '555-0108' },
  { id: 'bs10', bloodType: 'AB-', units: 1, maxCapacity: 15, hospitalName: 'Metro General', city: 'Detroit', contactNumber: '555-0109' },
  { id: 'bs11', bloodType: 'O-', units: 8, maxCapacity: 40, hospitalName: 'Lone Star Hospital', city: 'Houston', contactNumber: '555-0110' },
  { id: 'bs12', bloodType: 'B+', units: 22, maxCapacity: 60, hospitalName: 'Summit Medical', city: 'Denver', contactNumber: '555-0111' },
  { id: 'bs13', bloodType: 'A-', units: 18, maxCapacity: 30, hospitalName: 'Freedom Hospital', city: 'Philadelphia', contactNumber: '555-0112' },
  { id: 'bs14', bloodType: 'AB+', units: 7, maxCapacity: 20, hospitalName: 'Desert Oasis Clinic', city: 'Phoenix', contactNumber: '555-0113' },
  { id: 'bs15', bloodType: 'O+', units: 55, maxCapacity: 120, hospitalName: 'Bay Area Medical', city: 'San Jose', contactNumber: '555-0114' },
  { id: 'bs16', bloodType: 'B-', units: 3, maxCapacity: 25, hospitalName: 'Riverside Health', city: 'New Orleans', contactNumber: '555-0115' },
];

const REQUESTS: DonationRequest[] = [
  { id: 'r1', donorName: 'John Doe', bloodType: 'O+', status: 'Pending', date: '2023-10-25', urgency: 'Low', hospital: 'City General' },
  { id: 'r2', donorName: 'Jane Smith', bloodType: 'A-', status: 'Completed', date: '2023-10-20', urgency: 'Critical', hospital: 'St. Mary Medical' },
  { id: 'r3', donorName: 'Mike Ross', bloodType: 'B+', status: 'Approved', date: '2023-10-26', urgency: 'Medium', hospital: 'Hope Memorial' },
  { id: 'r4', donorName: 'Anuj Donor', bloodType: 'O+', status: 'Pending', date: '2023-10-28', urgency: 'Critical', hospital: 'Central Blood Bank' },
];

const FEEDBACKS: Feedback[] = [
  { id: 'f1', userId: 'u1', userRole: 'USER', message: 'Great service, very fast response!', date: '2023-10-26' },
  { id: 'f2', userId: 'd1', userRole: 'DONOR', message: 'The donation camp was well organized.', date: '2023-10-25' },
  { id: 'f3', userId: 'h1', userRole: 'HOSPITAL', message: 'Need more O- stock urgently.', date: '2023-10-27' },
  { id: 'f4', userId: 'd3', userRole: 'DONOR', message: 'App is very easy to use.', date: '2023-10-24' },
];

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', title: 'Red Cross Annual Drive', description: 'Join us at Central Park for the biggest donation event of the year.', date: '2023-11-15', location: 'New York, NY', imageUrl: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800', attendees: 124 },
  { id: 'c2', title: 'University Blood Week', description: 'Students and faculty unite to save lives.', date: '2023-11-20', location: 'Austin, TX', imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800', attendees: 85 },
];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Drop', description: 'Completed your first donation.', icon: '💧', earnedDate: '2023-02-10', locked: false },
  { id: 'a2', title: 'Life Saver', description: 'Donated 5 times.', icon: '❤️', locked: true },
  { id: 'a3', title: 'Heroic', description: 'Responded to a critical request.', icon: '🦸', earnedDate: '2023-08-15', locked: false },
  { id: 'a4', title: 'Centurion', description: 'Donated 100 times.', icon: '👑', locked: true },
];

const APPOINTMENTS: Appointment[] = [
  { id: 'app1', hospitalName: 'City General Hospital', date: '2023-11-01', time: '10:00 AM', status: 'Scheduled' }
];

const EMERGENCY_KEYS: EmergencyKey[] = [
  { id: 'k1', code: 'GOLD-PRIORITY-882', type: 'Gold', usesRemaining: 2, issuedDate: '2023-09-01', status: 'Active' },
  { id: 'k2', code: 'PLATINUM-LIFE-101', type: 'Platinum', usesRemaining: 1, issuedDate: '2023-01-15', status: 'Active' },
];

const SECURITY_LOGS: SecurityLog[] = [
  { id: 's1', severity: 'Low', message: 'New user registration: samrat', timestamp: '2023-10-28 10:30' },
  { id: 's2', severity: 'Medium', message: 'Multiple failed login attempts: admin', timestamp: '2023-10-28 09:15' },
  { id: 's3', severity: 'Critical', message: 'Unusual stock depletion detected: City General', timestamp: '2023-10-27 14:20' },
  { id: 's4', severity: 'High', message: 'Verification key reused: GOLD-PRIORITY-882', timestamp: '2023-10-26 11:00', user: 'd1' },
];

const ADMIN_KEYS = ['SPECIAL-KEY-123', 'BLOOD-LIFE-456', 'ADMIN-GRANT-789'];

export const MockBackend = {
  login: (username: string, password: string, role: UserRole): User | null => {
    const user = username.trim();
    const pass = password.trim();

    // Admin: rajput / rajput
    if (role === UserRole.ADMIN) {
      if (user === 'rajput' && pass === 'rajput') {
         return { id: 'admin-rajput', username: 'rajput', name: 'Rajput Admin', role: UserRole.ADMIN, joinDate: '2022-01-01', status: 'Active', email: 'admin@bloodbank.com', address: 'Central HQ, Delhi' };
      }
    }

    // Donor: anuj / singh
    if (role === UserRole.DONOR) {
      if (user === 'anuj' && pass === 'singh') {
         return USERS_DB.find(d => d.username === 'anuj' && d.role === UserRole.DONOR) || null;
      }
    }

    // User: samrat / singh
    if (role === UserRole.USER) {
      if (user === 'samrat' && pass === 'singh') {
         return USERS_DB.find(u => u.username === 'samrat' && u.role === UserRole.USER) || null;
      }
    }
    
    return null;
  },
  
  updateUser: (updatedUser: User): User | null => {
    const index = USERS_DB.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      USERS_DB[index] = { ...USERS_DB[index], ...updatedUser };
      return USERS_DB[index];
    }
    // If admin or dynamic user not in array (like admin-rajput), just return it back as 'saved'
    return updatedUser;
  },

  getHospitals: () => HOSPITALS,
  getDonors: () => USERS_DB.filter(u => u.role === UserRole.DONOR),
  getAllUsers: () => USERS_DB,
  searchDonors: (bloodType: string, city: string) => {
    return USERS_DB.filter(d => 
      d.role === UserRole.DONOR &&
      d.status === 'Active' &&
      (bloodType === 'All' || d.bloodType === bloodType) &&
      (city === '' || d.location?.toLowerCase().includes(city.toLowerCase()))
    );
  },
  getBloodStocks: () => BLOOD_STOCKS,
  verifyDonorKey: (key: string): boolean => {
    return ADMIN_KEYS.includes(key);
  },
  getRequests: () => REQUESTS,
  addRequest: (req: DonationRequest) => {
    REQUESTS.push(req);
  },
  getFeedbacks: () => FEEDBACKS,
  addFeedback: (f: Feedback) => {
    FEEDBACKS.push(f);
  },
  getCampaigns: () => CAMPAIGNS,
  getAchievements: () => ACHIEVEMENTS,
  getAppointments: () => APPOINTMENTS,
  scheduleAppointment: (app: Appointment) => APPOINTMENTS.push(app),
  
  getBloodRequestsFeed: () => BLOOD_REQUESTS,
  getMyCertificates: (donorId: string) => CERTIFICATES, // In real app, filter by ID
  addCertificate: (cert: DonorCertificate) => CERTIFICATES.push(cert),
  getEmergencyKeys: () => EMERGENCY_KEYS,
  
  // Admin Specific Methods
  getSecurityLogs: () => SECURITY_LOGS,
  
  toggleUserStatus: (userId: string) => {
    const user = USERS_DB.find(u => u.id === userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Blocked' : 'Active';
      // In a real app, this would update the DB. Here we modify the in-memory array reference.
      return user.status;
    }
    return null;
  },

  promoteDonor: (userId: string) => {
    const user = USERS_DB.find(u => u.id === userId);
    if (user && user.role === UserRole.DONOR) {
      user.level = (user.level || 1) + 1;
      user.xp = (user.xp || 0) + 100;
      return user.level;
    }
    return null;
  },
  
  issueEmergencyKey: (userId: string) => {
     const code = `GRANT-${Math.floor(Math.random() * 9999)}`;
     // In real app, would save this to the user's key list
     return code;
  }
};