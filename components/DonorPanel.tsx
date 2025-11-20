
import React, { useState, useEffect } from 'react';
import { Heart, Calendar, CheckCircle, Lock, MapPin, Award, Clock, CreditCard, Share2, FileText, Upload, Eye, Activity, Trophy, Building2, User as UserIcon, ArrowRight, AlertCircle, Search, Phone, MessageCircle, X, Key } from 'lucide-react';
import { User, Achievement, Appointment, BloodRequest, DonorCertificate, EmergencyKey } from '../types';
import { MockBackend } from '../services/mockBackend';
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

  // Gamification State
  const xp = user.xp || 0;
  const level = user.level || 1;
  const nextLevelXp = level * 100;
  const progress = (xp % 100) / 100 * 100; // Simplified logic

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

  const openBookingModal = (request: BloodRequest) => {
    setBookingRequest(request);
    setBookingDate(new Date().toISOString().split('T')[0]); // Default today
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

    // Simulate Buffer
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const results = await findDonorsWithAI(searchBloodType, searchCity);
      setEmergencySearchResults(results);
    } catch (error) {
      console.error("Search failed", error);
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
      alert("Certificate Uploaded Successfully! Only you can see this.");
    }, 1000);
  };

  const showFakeAlert = (msg: string) => alert(`Mock Data: ${msg}`);

  // --- Render Sections ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
       {/* Leveling & Progress Header */}
       <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blood-600 rounded-full blur-3xl opacity-30"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-6">
               <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-4 border-blood-500 shadow-lg">
                 <span className="text-3xl font-black text-white">{level}</span>
               </div>
               <div>
                 <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Current Rank</p>
                 <h2 className="text-3xl font-bold text-white">Life Saver</h2>
                 <p className="text-sm text-gray-300 mt-1">{xp} Total XP Earned</p>
               </div>
             </div>
             
             <div className="w-full md:w-1/2">
               <div className="flex justify-between text-xs font-bold uppercase text-gray-400 mb-2">
                 <span>Progress to Level {level + 1}</span>
                 <span>{Math.floor(xp % 100)} / 100 XP</span>
               </div>
               <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-blood-500 to-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
               <div className="mt-4 flex gap-3">
                 <div className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1"><Trophy size={12} className="text-yellow-400"/> Reward: Priority Booking</div>
                 <div className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1 opacity-50"><Lock size={12}/> Lvl {level + 1}: Health Checkup</div>
               </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="space-y-8">
            {/* Digital Card */}
            <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300 group perspective-1000 cursor-pointer">
               <div className="absolute inset-0 bg-gradient-to-br from-blood-600 to-blood-900"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
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

            {/* Verification Panel */}
            {!isVerified && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><Lock size={18} className="text-yellow-500" /> Verify Account</h3>
                <p className="text-sm text-gray-500 mb-4">Enter code from your screening nurse.</p>
                <div className="flex gap-2">
                  <input type="text" value={specialKey} onChange={(e) => setSpecialKey(e.target.value)} className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blood-500" placeholder="BLOOD-KEY-XXX" />
                  <Button onClick={handleVerify} className="text-sm py-2">Verify</Button>
                </div>
              </div>
            )}
         </div>

         <div className="lg:col-span-2 space-y-6">
             {/* Stats Grid */}
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
            
            {/* Recent Activity / Appointments */}
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
         <p className="text-gray-500">Real-time feed of patients and hospitals needing your help nearby. Book an appointment to help.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {bloodRequests.map(req => (
           <div key={req.id} className={`bg-white p-6 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all ${req.urgency === 'Critical' ? 'border-l-red-500' : req.urgency === 'High' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md ${req.requesterType === 'Hospital' ? 'bg-blue-500' : 'bg-green-500'}`}>
                       {req.requesterType === 'Hospital' ? <Building2 size={24}/> : <UserIcon size={24}/>}
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900">{req.requesterName}</h3>
                          {req.urgency === 'Critical' && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1"><AlertCircle size={10}/> Critical</span>}
                       </div>
                       <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={12}/> {req.location} <span className="text-gray-300">•</span> {req.distance} away</p>
                       <p className="text-xs text-gray-400 mt-1">Posted: {req.date}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-center px-4">
                       <p className="text-xs text-gray-400 uppercase font-bold">Need</p>
                       <p className="text-2xl font-black text-blood-600">{req.bloodType}</p>
                       <p className="text-xs text-gray-500">{req.units} Units</p>
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
         <div className="relative z-10">
           <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Key className="w-8 h-8"/> Emergency Access Panel</h2>
           <p className="text-red-100 max-w-2xl">
             As a valued donor, you are provided with special emergency keys. Use these keys to prioritize blood requests for yourself or immediate family members.
           </p>
         </div>
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-50"></div>
       </div>

       {/* Keys Display */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {emergencyKeys.map(key => (
           <div key={key.id} className="bg-white p-6 rounded-2xl shadow-md border border-l-4 border-l-yellow-500 flex justify-between items-center">
              <div>
                 <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">{key.type} Priority Key</p>
                 <p className="font-mono text-2xl font-bold text-gray-800 tracking-wider">{key.code}</p>
                 <p className="text-sm text-gray-500 mt-2">Issued: {key.issuedDate}</p>
              </div>
              <div className="text-center">
                 <div className="text-3xl font-black text-blood-600">{key.usesRemaining}</div>
                 <div className="text-xs text-gray-400 uppercase">Uses Left</div>
              </div>
           </div>
         ))}
       </div>

       {/* AI Search for Blood */}
       <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
         <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Find Blood Urgently</h2>
            <p className="text-sm text-gray-500 mb-6">Use your donor privilege to search for blood availability immediately.</p>
            
            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <select 
                     value={searchBloodType} 
                     onChange={(e) => setSearchBloodType(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blood-500 appearance-none"
                   >
                     <option value="All">All Blood Types</option>
                     <option value="A+">A+</option>
                     <option value="O+">O+</option>
                     <option value="B+">B+</option>
                     <option value="AB+">AB+</option>
                   </select>
               </div>
               <div className="flex-[2] relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input 
                   type="text" 
                   placeholder="Enter City (e.g. New York)" 
                   value={searchCity}
                   onChange={(e) => setSearchCity(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blood-500"
                  />
               </div>
               <Button onClick={handleEmergencySearch} disabled={isSearching} className="px-8 py-4 rounded-xl shadow-lg shadow-blood-500/20 min-w-[160px]">
                 {isSearching ? 'Scanning...' : 'Search Network'}
               </Button>
            </div>
         </div>

         <div className="p-8 bg-gray-50 min-h-[200px]">
            {isSearching ? (
               <div className="flex flex-col items-center justify-center py-12">
                 <div className="w-10 h-10 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500 animate-pulse">Searching secure donor database...</p>
               </div>
            ) : emergencySearchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencySearchResults.map(result => (
                  <div key={result.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-blood-100 rounded-full flex items-center justify-center text-blood-700 font-bold">{result.bloodType}</div>
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{result.name}</h4>
                        <p className="text-xs text-gray-500">{result.location}</p>
                        {result.phone && <p className="text-xs font-bold text-green-600">{result.phone}</p>}
                     </div>
                     <Button className="text-xs px-3 py-1" onClick={() => showFakeAlert('Emergency Contact Request Sent!')}>Contact</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                Enter search criteria to find available donors or blood banks.
              </div>
            )}
         </div>
       </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Certificate Vault</h2>
            <p className="text-gray-500 text-sm">Securely store and view your donation records. Visible only to you.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleFileUpload}><Upload size={16}/> Upload New</Button>
       </div>

       {certificates.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-lg transition-all">
                 <div className="aspect-[4/3] bg-gray-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    <FileText size={48} className="text-gray-300" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="secondary" className="text-xs" onClick={() => showFakeAlert('Viewing Full Certificate')}>View Full Size</Button>
                    </div>
                 </div>
                 <h4 className="font-bold text-gray-800">{cert.hospitalName}</h4>
                 <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={12}/> {cert.date}</p>
              </div>
            ))}
         </div>
       ) : (
         <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><FileText size={32}/></div>
            <p className="text-gray-500 font-medium">No certificates uploaded yet.</p>
            <Button variant="outline" className="mt-4" onClick={handleFileUpload}>Upload Your First</Button>
         </div>
       )}
    </div>
  );

  const renderRegistration = () => (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
       <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-blood-600 p-8 text-white">
             <h2 className="text-2xl font-bold mb-2">Donor Registration & Screening</h2>
             <p className="text-blood-100">Please update your health details before your next donation.</p>
          </div>
          
          <div className="p-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Full Legal Name</label>
                   <input type="text" defaultValue={user.name} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blood-500" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                   <input type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blood-500" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Weight (kg)</label>
                   <input type="number" placeholder="e.g. 70" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blood-500" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-gray-700">Last Donation Date</label>
                   <input type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blood-500" />
                </div>
             </div>

             <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-800 mb-4">Health Screening</h3>
                <div className="space-y-3">
                   {['Have you travelled abroad in the last 6 months?', 'Are you currently on any medication?', 'Have you had a tattoo in the last 12 months?', 'Do you have any history of heart disease?'].map((q, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm text-gray-700">{q}</span>
                        <div className="flex gap-2">
                           <button className="px-4 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold hover:bg-blood-50 hover:text-blood-600 hover:border-blood-200 transition-colors">Yes</button>
                           <button className="px-4 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors">No</button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="pt-4">
                <Button className="w-full py-4 text-lg rounded-xl" onClick={() => alert('Details Updated Successfully!')}>Save & Update Profile</Button>
             </div>
          </div>
       </div>
    </div>
  );

  // Booking Modal
  const BookingModal = () => {
    if (!showBookingModal || !bookingRequest) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
           <div className="bg-blood-600 p-4 flex justify-between items-center text-white">
             <h3 className="font-bold text-lg">Schedule Donation</h3>
             <button onClick={() => setShowBookingModal(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={20}/></button>
           </div>
           <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                 <p className="text-xs text-gray-500 uppercase font-bold">Recipient</p>
                 <p className="text-lg font-bold text-blue-800">{bookingRequest.requesterName}</p>
                 <p className="text-sm text-gray-600">{bookingRequest.location}</p>
              </div>

              <div className="space-y-3">
                 <label className="text-sm font-bold text-gray-700">Select Date</label>
                 <input 
                   type="date" 
                   value={bookingDate} 
                   onChange={(e) => setBookingDate(e.target.value)}
                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blood-500 outline-none"
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-sm font-bold text-gray-700">Select Time Slot</label>
                 <div className="flex flex-wrap gap-2">
                   {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                     <button 
                       key={time} 
                       onClick={() => setBookingTime(time)}
                       className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors border ${bookingTime === time ? 'bg-blood-600 text-white border-blood-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                     >
                       {time}
                     </button>
                   ))}
                 </div>
              </div>

              <Button onClick={confirmBooking} disabled={!bookingDate || !bookingTime} className="w-full py-3 text-lg rounded-xl">Confirm Appointment</Button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2 w-full md:w-auto">
         <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Overview</button>
         <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-blood-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Requests Feed</button>
         <button onClick={() => setActiveTab('emergency')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'emergency' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Emergency Access</button>
         <button onClick={() => setActiveTab('certificates')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'certificates' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Certificates</button>
         <button onClick={() => setActiveTab('registration')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'registration' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Profile & Screening</button>
      </div>

      {/* Content Area */}
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
