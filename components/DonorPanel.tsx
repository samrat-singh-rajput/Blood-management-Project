
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Calendar, CheckCircle, Lock, MapPin, Award, Clock, CreditCard, Share2, FileText, Upload, Eye, Activity, Trophy, Building2, User as UserIcon, Users, ArrowRight, AlertCircle, Search, Phone, MessageCircle, X, Key, UserCheck, Send, Droplet } from 'lucide-react';
import { User, Achievement, Appointment, BloodRequest, DonorCertificate, EmergencyKey, DonationRequest, ChatMessage } from '../types';
import { MockBackend } from '../services/mockBackend';
import { API } from '../services/api';
import { Button } from './Button';
import { getHealthTip, findDonorsWithAI } from '../services/geminiService';

interface DonorPanelProps {
  user: User;
}

type ActiveTab = 'dashboard' | 'requests' | 'certificates' | 'registration' | 'emergency' | 'chat';

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

  // Chat States
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recentChats, setRecentChats] = useState<{user: User, lastMsg: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
  
  useEffect(() => {
    const loadData = async () => {
      setHealthTip(await getHealthTip('Donor'));
      setAchievements(MockBackend.getAchievements());
      setAppointments(MockBackend.getAppointments());
      setBloodRequests(MockBackend.getBloodRequestsFeed());
      setCertificates(MockBackend.getMyCertificates(user.id));
      setEmergencyKeys(MockBackend.getEmergencyKeys());
      loadRecentChats();
    };
    loadData();
  }, [user.id]);

  useEffect(() => {
    if (activeChatPartner) {
      loadChatHistory(activeChatPartner.id);
    }
  }, [activeChatPartner]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const loadRecentChats = async () => {
    try {
      const allChats = await API.getAllUserChats(user.id);
      const partnersMap = new Map<string, {user: User, lastMsg: string}>();
      const allUsers = await API.getUsers();

      allChats.reverse().forEach(c => {
        const partnerId = c.senderId === user.id ? c.receiverId : c.senderId;
        if (!partnersMap.has(partnerId)) {
          const partner = allUsers.find(u => u.id === partnerId);
          if (partner) {
            partnersMap.set(partnerId, { user: partner, lastMsg: c.text });
          }
        }
      });
      setRecentChats(Array.from(partnersMap.values()));
    } catch (e) {
      console.error(e);
    }
  };

  const loadChatHistory = async (partnerId: string) => {
    const history = await API.getChatHistory(user.id, partnerId);
    setChatHistory(history);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatPartner) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      receiverId: activeChatPartner.id,
      receiverName: activeChatPartner.name,
      text: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    await API.sendMessage(newMsg);
    setChatInput('');
    loadChatHistory(activeChatPartner.id);
    loadRecentChats();
  };

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

  const renderChat = () => (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex h-[700px] animate-fade-in-up">
       <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
             <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
                <MessageCircle size={18} className="text-blood-600" /> Incoming Queries
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
             {recentChats.length > 0 ? (
               recentChats.map(chat => (
                 <button 
                  key={chat.user.id}
                  onClick={() => setActiveChatPartner(chat.user)}
                  className={`w-full p-5 text-left flex items-center gap-4 transition-all hover:bg-white border-b border-gray-50 ${activeChatPartner?.id === chat.user.id ? 'bg-white shadow-inner' : ''}`}
                 >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                      {chat.user.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="font-bold text-gray-900 truncate">{chat.user.name}</p>
                       <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMsg}</p>
                    </div>
                 </button>
               ))
             ) : (
               <div className="p-10 text-center opacity-30 flex flex-col items-center justify-center h-full">
                  <Users size={32} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">No messages from recipients yet.</p>
               </div>
             )}
          </div>
       </div>

       <div className="flex-1 flex flex-col bg-white">
          {activeChatPartner ? (
             <>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                         {activeChatPartner.name.charAt(0)}
                      </div>
                      <div>
                         <h4 className="font-black text-gray-900 tracking-tight">{activeChatPartner.name}</h4>
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Recipient Node</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 custom-scrollbar">
                   {chatHistory.map(msg => (
                     <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.senderId === user.id ? 'bg-blood-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                           <p className="leading-relaxed font-medium">{msg.text}</p>
                           <p className={`text-[9px] mt-2 font-bold uppercase tracking-tighter ${msg.senderId === user.id ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                   <form onSubmit={handleSendMessage} className="flex gap-4">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type response..."
                        className="flex-1 p-4 bg-gray-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-blood-500 transition-all"
                      />
                      <Button type="submit" disabled={!chatInput.trim()} className="px-8 rounded-2xl shadow-xl shadow-blood-500/20 gap-2 font-black uppercase tracking-widest">
                         <Send size={18} /> Send
                      </Button>
                   </form>
                </div>
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6 opacity-30">
                <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400">
                   <MessageCircle size={48} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Messaging Terminal</h3>
                   <p className="text-sm text-gray-500 font-medium max-w-sm mt-2">Select a conversation from the list to respond to recipients needing assistance.</p>
                </div>
             </div>
          )}
       </div>
    </div>
  );

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

            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                 <Droplet size={20} className="text-blood-600" /> Register Donation
               </h3>
               <form onSubmit={handleDonationSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username</label>
                      <input type="text" readOnly value={user.username} className="w-full p-3 bg-gray-50 rounded-xl text-xs font-bold border-none outline-none" />
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
                    <Button className="flex-1 md:flex-none">Donate Now</Button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2 w-full md:w-auto">
         <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Overview</button>
         <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-blood-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Requests Feed</button>
         <button onClick={() => setActiveTab('chat')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Messages</button>
         <button onClick={() => setActiveTab('emergency')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'emergency' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Emergency Access</button>
         <button onClick={() => setActiveTab('certificates')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'certificates' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Certificates</button>
         <button onClick={() => setActiveTab('registration')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'registration' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Profile & Screening</button>
      </div>
      <div className="min-h-[500px]">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'requests' && renderRequests()}
         {activeTab === 'chat' && renderChat()}
         {activeTab === 'emergency' && (
           <div className="space-y-8 animate-fade-in-up">
              <div className="bg-red-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Key className="w-8 h-8"/> Emergency Access</h2>
                <p className="text-red-100">Special donor privileges for urgent search.</p>
              </div>
           </div>
         )}
         {activeTab === 'certificates' && (
           <div className="space-y-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold text-gray-800">My Certificates</h2>
              <p className="text-gray-400">No certificates yet.</p>
           </div>
         )}
         {activeTab === 'registration' && (
           <div className="max-w-3xl mx-auto animate-fade-in-up">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                 <div className="bg-blood-600 p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Screening</h2>
                    <p className="text-blood-100">Update health details.</p>
                 </div>
                 <div className="p-8 space-y-6">
                    <Button className="w-full py-4 text-lg rounded-xl">Save Changes</Button>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
