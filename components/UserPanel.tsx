
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Droplet, Phone, MessageCircle, Activity, Users, Info, Send, Clock, CheckCircle2, MessageSquareText, ShieldCheck, ArrowLeft, PlusCircle, AlertCircle, Building2 } from 'lucide-react';
import { User, Feedback, UserRole, DonationRequest } from '../types';
import { API } from '../services/api';
import { findDonorsWithAI } from '../services/geminiService';
import { Button } from './Button';

type UserPanelView = 'search' | 'register_request';

export const UserPanel: React.FC = () => {
  const [activeView, setActiveView] = useState<UserPanelView>('search');
  const [bloodType, setBloodType] = useState('All');
  const [city, setCity] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [allDonors, setAllDonors] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingDonors, setIsLoadingDonors] = useState(true);
  
  // Blood Request Form State
  const [requestForm, setRequestForm] = useState({
    patientName: '',
    bloodType: 'O+',
    units: 1,
    hospital: '',
    city: '',
    phone: '',
    urgency: 'Medium' as 'Low' | 'Medium' | 'Critical'
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Feedback states
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);

  const currentUser = JSON.parse(localStorage.getItem('lifeflow_current_user') || '{}');

  useEffect(() => {
    loadDonors();
    loadMyFeedbacks();
  }, []);

  const loadDonors = async () => {
    setIsLoadingDonors(true);
    try {
      const users = await API.getUsers();
      const donors = users.filter(u => u.role === UserRole.DONOR && u.status !== 'Blocked');
      setAllDonors(donors);
    } catch (error) {
      console.error("Failed to load donors", error);
    } finally {
      setIsLoadingDonors(false);
    }
  };

  const loadMyFeedbacks = async () => {
    try {
      const allFeedbacks = await API.getFeedbacks();
      setUserFeedbacks(allFeedbacks.filter(f => f.userId === currentUser.id));
    } catch (error) {
      console.error("Failed to load feedbacks", error);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]); 
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const results = await findDonorsWithAI(bloodType, city);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);
    try {
      const req: DonationRequest = {
        id: `req-${Date.now()}`,
        donorName: requestForm.patientName,
        bloodType: requestForm.bloodType,
        status: 'Pending',
        date: new Date().toLocaleDateString(),
        urgency: requestForm.urgency,
        hospital: requestForm.hospital,
        location: requestForm.city,
        phone: requestForm.phone,
        type: 'Request'
      };
      await API.addDonationRequest(req);
      alert("Emergency Request Registered. Administrators have been notified.");
      setActiveView('search');
      setRequestForm({
        patientName: '',
        bloodType: 'O+',
        units: 1,
        hospital: '',
        city: '',
        phone: '',
        urgency: 'Medium'
      });
    } catch (err) {
      alert("Failed to register request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSendingFeedback(true);
    try {
      const f: Feedback = {
        id: `f-${Date.now()}`,
        userId: currentUser.id,
        userRole: currentUser.role,
        message: feedbackText.trim(),
        date: new Date().toLocaleString()
      };
      await API.addFeedback(f);
      setFeedbackText('');
      await loadMyFeedbacks();
      alert("Message transmitted to Admin.");
    } catch (error) {
      alert("Failed to send message.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const renderSearchEngine = () => (
    <div className="space-y-10">
      {/* Search Bar Container */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
                <Search className="text-blood-600" /> Network Search Engine
              </h2>
              <Button 
                variant="outline" 
                onClick={() => setActiveView('register_request')}
                className="text-xs h-auto py-2 px-4 gap-2 border-blood-200 text-blood-600 font-black uppercase tracking-widest"
              >
                <PlusCircle size={14} /> Manual Registration
              </Button>
           </div>
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                 <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-blood-600" size={20}/>
                 <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-xl focus:ring-2 focus:ring-blood-500 appearance-none font-bold text-gray-800">
                    <option value="All">All Blood Types</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
              </div>
              <div className="flex-[2] relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blood-600" size={20}/>
                 <input type="text" placeholder="Enter City (e.g. New York, London)" value={city} onChange={(e) => setCity(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-xl focus:ring-2 focus:ring-blood-500 font-bold" />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} className="px-10 py-4 rounded-2xl shadow-2xl shadow-blood-500/30 min-w-[180px] font-black uppercase tracking-widest">
                {isSearching ? 'Scanning...' : 'Search Network'}
              </Button>
           </div>
        </div>

        <div className="p-8 bg-gray-50/50 min-h-[350px]">
           {isSearching ? (
              <div className="flex flex-col items-center justify-center h-[250px] space-y-4">
                <div className="w-14 h-14 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-black text-xs tracking-[0.2em] animate-pulse uppercase">Syncing with Gemini AI Cluster...</p>
              </div>
           ) : searchResults.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
               {searchResults.map(donor => (
                 <div key={donor.id} className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Droplet size={60} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blood-100 to-blood-200 flex items-center justify-center text-blood-700 font-black text-xl shadow-inner">
                          {donor.bloodType}
                       </div>
                       <div className="flex-1">
                          <h3 className="font-black text-gray-900 text-lg">{donor.name}</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} className="text-blood-400" /> {donor.location}
                          </p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Button className="flex-1 text-xs font-black uppercase tracking-widest h-11 rounded-xl" onClick={() => alert("Urgent Request Logged")}>Send Request</Button>
                       <button className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blood-50 hover:text-blood-600 transition-colors shadow-sm">
                         <MessageCircle size={20} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           ) : hasSearched ? (
             <div className="flex flex-col items-center justify-center h-[250px] text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center border-2 border-orange-100 border-dashed">
                  <AlertCircle size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase">No Immediate Matches</h3>
                  <p className="text-sm text-gray-500 font-medium mt-2">We couldn't find any donors matching your criteria right now. You should register a public emergency request so admins can manually source blood for you.</p>
                </div>
                <Button onClick={() => setActiveView('register_request')} className="px-8 py-3 rounded-xl gap-2 font-black uppercase tracking-widest">
                  <PlusCircle size={18} /> Register Emergency Request
                </Button>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-[250px] text-gray-300">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-sm">Enter search criteria to initialize network scan</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderRegisterRequest = () => (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-blood-600 p-10 text-white flex justify-between items-start">
           <div>
             <button onClick={() => setActiveView('search')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4 font-black uppercase tracking-widest text-xs">
                <ArrowLeft size={16} /> Back to Search
             </button>
             <h2 className="text-3xl font-black tracking-tight uppercase">Emergency Registration</h2>
             <p className="text-blood-100 font-medium mt-1">Register your blood need. This will be visible to all administrators instantly.</p>
           </div>
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
              <PlusCircle size={32} />
           </div>
        </div>
        
        <form onSubmit={handleRequestSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Patient Identity</label>
              <input 
                type="text" 
                required
                value={requestForm.patientName}
                onChange={e => setRequestForm({...requestForm, patientName: e.target.value})}
                placeholder="Full Name of Patient" 
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:ring-2 focus:ring-blood-500 font-bold"
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Blood Group Required</label>
              <select 
                value={requestForm.bloodType}
                onChange={e => setRequestForm({...requestForm, bloodType: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:ring-2 focus:ring-blood-500 font-bold appearance-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Hospital / Medical Facility</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={requestForm.hospital}
                  onChange={e => setRequestForm({...requestForm, hospital: e.target.value})}
                  placeholder="e.g. St. Jude Medical" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:ring-2 focus:ring-blood-500 font-bold"
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Location / City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={requestForm.city}
                  onChange={e => setRequestForm({...requestForm, city: e.target.value})}
                  placeholder="e.g. London, NYC" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:ring-2 focus:ring-blood-500 font-bold"
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  required
                  value={requestForm.phone}
                  onChange={e => setRequestForm({...requestForm, phone: e.target.value})}
                  placeholder="Emergency contact number" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent outline-none focus:ring-2 focus:ring-blood-500 font-bold"
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Urgency Level</label>
              <div className="flex gap-4">
                 {(['Low', 'Medium', 'Critical'] as const).map(level => (
                   <button
                    key={level}
                    type="button"
                    onClick={() => setRequestForm({...requestForm, urgency: level})}
                    className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                      requestForm.urgency === level 
                      ? 'bg-blood-50 border-blood-200 text-blood-700 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                    }`}
                   >
                     {level}
                   </button>
                 ))}
              </div>
           </div>

           <div className="md:col-span-2 pt-6">
              <Button 
                type="submit" 
                isLoading={isSubmittingRequest}
                className="w-full py-5 text-lg font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl"
              >
                Register Public Request
              </Button>
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                By submitting, you agree that your details will be shared with verified administrators and donors.
              </p>
           </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      {/* View Switcher Content */}
      {activeView === 'search' ? renderSearchEngine() : renderRegisterRequest()}

      {/* Top Section: Registered Donors Table - Hidden when registering request to focus user */}
      {activeView === 'search' && (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blood-50 p-3 rounded-2xl text-blood-600">
                <Users size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Available Donors Registry</h2>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Verified donors from our secure network database</p>
              </div>
            </div>
            <Button variant="outline" className="text-xs h-auto py-2 px-4 gap-2" onClick={loadDonors}>
              <Activity size={14} /> Refresh List
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-50">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="p-5">Donor Identity</th>
                  <th className="p-5">Blood Group</th>
                  <th className="p-5">Primary City</th>
                  <th className="p-5">Contact Access</th>
                  <th className="p-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingDonors ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
                        <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Accessing DB Registry...</p>
                      </div>
                    </td>
                  </tr>
                ) : allDonors.length > 0 ? (
                  allDonors.map(donor => (
                    <tr key={donor.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:bg-blood-600 group-hover:text-white transition-all">
                            {donor.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{donor.name}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1.5 bg-blood-50 text-blood-700 rounded-lg font-black text-xs shadow-inner">
                          {donor.bloodType || 'N/A'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                          <MapPin size={14} className="text-gray-300" /> {donor.location || 'Not Specified'}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-green-600 font-black font-mono text-xs">
                          <Phone size={14} className="text-green-400" /> {donor.phone || 'Contact Admin'}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Users size={48} className="text-gray-300" />
                        <p className="text-gray-500 font-black text-xs uppercase tracking-widest">No donors registered in database</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advanced Feedback Section with History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Message Composer */}
        <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blood-600 rounded-full blur-[100px] opacity-20"></div>
          
          <div className="relative z-10 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <MessageSquareText size={24} className="text-blood-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Control Center Link</h3>
                <p className="text-gray-400 text-sm font-medium">Direct transmission to system administrators.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Type your message, inquiry, or emergency report here..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blood-500 text-white font-medium resize-none transition-all placeholder:text-gray-600"
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {feedbackText.length} Characters
                </span>
                <Button 
                  type="submit"
                  disabled={isSendingFeedback || !feedbackText.trim()}
                  isLoading={isSendingFeedback}
                  className="bg-white !text-gray-900 px-8 py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-2"
                >
                  <Send size={16} /> Transmit
                </Button>
              </div>
            </form>
          </div>
          
          <div className="relative z-10 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3">
               <ShieldCheck size={16} className="text-blood-500" />
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End-to-End Encrypted Session</p>
             </div>
          </div>
        </div>

        {/* Communication History */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-blood-600" /> Communication History
            </h3>
            <button onClick={loadMyFeedbacks} className="text-[10px] font-black uppercase tracking-widest text-blood-600 hover:underline">
              Sync Inbox
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] pr-2 custom-scrollbar">
            {userFeedbacks.length > 0 ? (
              userFeedbacks.map(f => (
                <div key={f.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{f.date}</span>
                    {f.reply ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <CheckCircle2 size={10} /> Replied
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-800 text-sm font-medium italic">"{f.message}"</p>
                  
                  {f.reply && (
                    <div className="mt-3 p-4 bg-blood-600 text-white rounded-xl shadow-lg relative">
                      <div className="absolute -top-1.5 left-4 w-3 h-3 bg-blood-600 rotate-45"></div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Admin Response</p>
                      <p className="text-xs font-bold leading-relaxed">{f.reply}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                <MessageSquareText size={48} className="text-gray-300 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">No active correspondence records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
