
import React, { useState, useEffect } from 'react';
// Added Droplet to imports
import { Heart, Calendar, CheckCircle, Lock, MapPin, Award, Clock, CreditCard, Share2, FileText, Upload, Eye, Activity, Trophy, Building2, User as UserIcon, ArrowRight, AlertCircle, Search, Phone, MessageCircle, X, Key, UserCheck, Send, Droplet } from 'lucide-react';
import { User, Achievement, Appointment, BloodRequest, DonorCertificate, EmergencyKey, DonationRequest } from '../types';
import { MockBackend } from '../services/mockBackend';
import { API } from '../services/api';
import { Button } from './Button';
import { getHealthTip, findDonorsWithAI } from '../services/geminiService';

interface DonorPanelProps {
  user: User;
}

type ActiveTab = 'dashboard' | 'requests' | 'certificates' | 'registration' | 'emergency';

export const DonorPanel: React.FC<DonorPanelProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Data States
  const [specialKey, setSpecialKey] = useState('');
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [healthTip, setHealthTip] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [certificates, setCertificates] = useState<DonorCertificate[]>([]);
  const [emergencyKeys, setEmergencyKeys] = useState<EmergencyKey[]>([]);

  // Donation Form State
  const [donationForm, setDonationForm] = useState({
    username: user.username,
    city: user.location || '',
    contact: user.phone || '',
    bloodType: user.bloodType || 'O+',
    dateToGive: '',
    isMedicallyFit: false,
    units: 1
  });
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  
  // Emergency Search State
  const [searchBloodType, setSearchBloodType] = useState('All');
  const [searchCity, setSearchCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [emergencySearchResults, setEmergencySearchResults] = useState<User[]>([]);
  
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingRequest, setBookingRequest] = useState<BloodRequest | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setHealthTip(await getHealthTip('Donor'));
      setAchievements(MockBackend.getAchievements());
      setAppointments(MockBackend.getAppointments());
      setBloodRequests(MockBackend.getBloodRequestsFeed());
      setCertificates(MockBackend.getMyCertificates(user.id));
      setEmergencyKeys(MockBackend.getEmergencyKeys());
    };
    loadData();
  }, [user.id]);

  const handleVerify = () => {
    if (MockBackend.verifyDonorKey(specialKey)) {
      setIsVerified(true);
      alert("Verified successfully!");
    } else {
      alert("Invalid Key");
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationForm.isMedicallyFit) {
      alert("You must confirm medical fitness before donating.");
      return;
    }
    setIsSubmittingDonation(true);
    try {
      const reg: DonationRequest = {
        id: `don-${Date.now()}`,
        donorName: donationForm.username,
        bloodType: donationForm.bloodType,
        status: 'Pending',
        date: donationForm.dateToGive,
        urgency: 'Medium',
        location: donationForm.city,
        phone: donationForm.contact,
        type: 'Donation',
        isMedicallyFit: donationForm.isMedicallyFit,
        units: donationForm.units
      };
      await API.addDonationRequest(reg);
      alert("Donation registered! Thank you for your contribution.");
      setDonationForm(prev => ({ ...prev, dateToGive: '', isMedicallyFit: false }));
    } catch (err) {
      alert("Failed to register donation.");
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const openBookingModal = (request: BloodRequest) => {
    setBookingRequest(request);
    setBookingDate(new Date().toISOString().split('T')[0]);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!bookingRequest || !bookingDate || !bookingTime) return;
    
    const newApp: Appointment = {
      id: Date.now().toString(),
      hospitalName: bookingRequest.requesterName,
      date: bookingDate,
      time: bookingTime,
      status: 'Scheduled'
    };
    MockBackend.scheduleAppointment(newApp);
    setAppointments([...appointments, newApp]);
    alert(`Donation scheduled for ${bookingRequest.requesterName} on ${bookingDate} at ${bookingTime}`);
    setShowBookingModal(false);
    setBookingRequest(null);
    setBookingTime('');
  };

  const handleEmergencySearch = async () => {
    setIsSearching(true);
    setEmergencySearchResults([]);
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const results = await findDonorsWithAI(searchBloodType, searchCity);
      setEmergencySearchResults(results);
    } catch (error) {
      setEmergencySearchResults(MockBackend.searchDonors(searchBloodType, searchCity));
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = () => {
    setTimeout(() => {
      const newCert: DonorCertificate = {
        id: Date.now().toString(),
        donorId: user.id,
        date: new Date().toISOString().split('T')[0],
        hospitalName: 'Community Upload',
        imageUrl: 'placeholder'
      };
      MockBackend.addCertificate(newCert);
      setCertificates([...certificates, newCert]);
      alert("Certificate Uploaded Successfully!");
    }, 1000);
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="space-y-8">
            <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] cursor-pointer">
               <div className="absolute inset-0 bg-gradient-to-br from-blood-600 to-blood-900"></div>
               <div className="relative z-10 p-6 flex flex-col justify-between h-full text-white">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Blood Bank Member</p>
                     <h3 className="font-bold text-xl tracking-wider flex items-center gap-2"><CreditCard size={20} /> {user.id.toUpperCase()}</h3>
                   </div>
                   {isVerified ? <CheckCircle className="text-green-400" /> : <Lock className="text-white/50" />}
                 </div>
                 <div className="flex items-end gap-4">
                   <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 text-center min-w-[60px]">
                     <p className="text-xs opacity-70 uppercase">Type</p>
                     <p className="text-2xl font-bold">{user.bloodType || 'N/A'}</p>
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium opacity-90">{user.name}</p>
                     <p className="text-xs opacity-60">Joined {user.joinDate || '2023'}</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* NEW: Donor Donation Form */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                 {/* Fixed missing icon reference by adding to imports */}
                 <Droplet size={20} className="text-blood-600" /> Register Donation
               </h3>
               <form onSubmit={handleDonationSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username</label>
                      <input type="text" readOnly value={donationForm.username} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Blood Type</label>
                      <select 
                        value={donationForm.bloodType} 
                        onChange={e => setDonationForm({...donationForm, bloodType: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">City / Region</label>
                    <input 
                      type="text" 
                      required
                      value={donationForm.city} 
                      onChange={e => setDonationForm({...donationForm, city: e.target.value})}
                      placeholder="e.g. New York" 
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Phone</label>
                    <input 
                      type="tel" 
                      required
                      value={donationForm.contact} 
                      onChange={e => setDonationForm({...donationForm, contact: e.target.value})}
                      placeholder="Mobile number" 
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date to Give</label>
                    <input 
                      type="date" 
                      required
                      value={donationForm.dateToGive} 
                      onChange={e => setDonationForm({...donationForm, dateToGive: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" 
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="medicalFit"
                      checked={donationForm.isMedicallyFit}
                      onChange={e => setDonationForm({...donationForm, isMedicallyFit: e.target.checked})}
                      className="w-4 h-4 text-blood-600 rounded"
                    />
                    <label htmlFor="medicalFit" className="text-[11px] font-bold text-gray-600 cursor-pointer">I am medically fit & healthy to donate</label>
                  </div>

                  <Button 
                    type="submit" 
                    isLoading={isSubmittingDonation}
                    disabled={!donationForm.isMedicallyFit}
                    className="w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg"
                  >
                    <Send size={14} className="mr-2" /> Submit Donation
                  </Button>
               </form>
            </div>

            {!isVerified && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Lock size={18} className="text-yellow-500" /> Verify Account</h3>
                <div className="flex gap-2">
                  <input type="text" value={specialKey} onChange={(e) => setSpecialKey(e.target.value)} className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm outline-none" placeholder="BLOOD-KEY-XXX" />
                  <Button onClick={handleVerify} className="text-sm py-2">Verify</Button>
                </div>
              </div>
            )}
         </div>
         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-2">Total Donations</p>
                  <p className="text-4xl font-bold text-gray-800">1</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-xs font-bold uppercase mb-2">Lives Impacted</p>
                  <p className="text-4xl font-bold text-green-600">3</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Upcoming Appointments</h3>
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((app, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={18}/></div>
                          <div>
                             <p className="font-bold text-gray-800">{app.hospitalName}</p>
                             <p className="text-xs text-gray-500">{app.date} at {app.time}</p>
                          </div>
                       </div>
                       <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{app.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No upcoming appointments.</p>
              )}
            </div>
         </div>
       </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 rounded-3xl border border-gray-100">
         <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Blood Requests</h2>
         <p className="text-gray-500">Real-time feed of patients needing help nearby.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
         {bloodRequests.map(req => (
           <div key={req.id} className={`bg-white p-6 rounded-2xl border-l-4 shadow-sm ${req.urgency === 'Critical' ? 'border-l-red-500' : req.urgency === 'High' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md ${req.requesterType === 'Hospital' ? 'bg-blue-500' : 'bg-green-500'}`}>
                       {req.requesterType === 'Hospital' ? <Building2 size={24}/> : <UserIcon size={24}/>}
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-gray-900">{req.requesterName}</h3>
                       <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {req.location} • {req.distance} away</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-center px-4">
                       <p className="text-xs text-gray-400 uppercase font-bold">Need</p>
                       <p className="text-2xl font-black text-blood-600">{req.bloodType}</p>
                    </div>
                    <Button className="flex-1 md:flex-none" onClick={() => openBookingModal(req)}>Donate Now</Button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );

  const renderEmergency = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="bg-red-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
         <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Key className="w-8 h-8"/> Emergency Access</h2>
         <p className="text-red-100">Special donor privileges for urgent search.</p>
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-50"></div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {emergencyKeys.map(key => (
           <div key={key.id} className="bg-white p-6 rounded-2xl shadow-md border border-l-4 border-l-yellow-500 flex justify-between items-center">
              <div>
                 <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">{key.type} Key</p>
                 <p className="font-mono text-2xl font-bold text-gray-800">{key.code}</p>
              </div>
              <div className="text-center">
                 <div className="text-3xl font-black text-blood-600">{key.usesRemaining}</div>
                 <div className="text-xs text-gray-400 uppercase">Left</div>
              </div>
           </div>
         ))}
       </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">My Certificates</h2>
          <Button variant="outline" className="gap-2" onClick={handleFileUpload}><Upload size={16}/> Upload</Button>
       </div>
       {certificates.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-white p-4 rounded-2xl border border-gray-100">
                 <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                    <FileText size={48} className="text-gray-300" />
                 </div>
                 <h4 className="font-bold text-gray-800">{cert.hospitalName}</h4>
                 <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={12}/> {cert.date}</p>
              </div>
            ))}
         </div>
       ) : (
         <p className="text-center py-12 text-gray-400">No certificates yet.</p>
       )}
    </div>
  );

  const renderRegistration = () => (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
       <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-blood-600 p-8 text-white">
             <h2 className="text-2xl font-bold mb-2">Screening</h2>
             <p className="text-blood-100">Update health details.</p>
          </div>
          <div className="p-8 space-y-6">
             <Button className="w-full py-4 text-lg rounded-xl" onClick={() => alert('Saved!')}>Save Changes</Button>
          </div>
       </div>
    </div>
  );

  const BookingModal = () => {
    if (!showBookingModal || !bookingRequest) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
           <div className="bg-blood-600 p-4 flex justify-between items-center text-white">
             <h3 className="font-bold text-lg">Schedule</h3>
             <button onClick={() => setShowBookingModal(false)}><X size={20}/></button>
           </div>
           <div className="p-6 space-y-6">
              <Button onClick={confirmBooking} className="w-full py-3 text-lg rounded-xl">Confirm</Button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2 w-full md:w-auto">
         <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Overview</button>
         <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-blood-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Requests Feed</button>
         <button onClick={() => setActiveTab('emergency')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'emergency' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Emergency Access</button>
         <button onClick={() => setActiveTab('certificates')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'certificates' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Certificates</button>
         <button onClick={() => setActiveTab('registration')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'registration' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Profile & Screening</button>
      </div>
      <div className="min-h-[500px]">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'requests' && renderRequests()}
         {activeTab === 'emergency' && renderEmergency()}
         {activeTab === 'certificates' && renderCertificates()}
         {activeTab === 'registration' && renderRegistration()}
      </div>
      <BookingModal />
    </div>
  );
};
