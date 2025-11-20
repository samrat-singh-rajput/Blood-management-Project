
import React, { useState, useRef, useEffect } from 'react';
import { Droplet, LogOut, Menu, X, ArrowLeft, User as UserIcon, MessageSquare, Send, Minus, Bell, ChevronDown, BookOpen, Heart, Activity, Phone, ImageIcon, Video, HelpCircle, FileText, Map, Calendar, Info, ShieldCheck, Users, Home, Settings, Mail, MapPin, Save, Edit2, Moon, Sun, Smartphone, Lock, Globe, Trash2 } from 'lucide-react';
import { User, UserRole, BloodStock } from './types';
import { MockBackend } from './services/mockBackend';
import { AdminPanel } from './components/AdminPanel';
import { DonorPanel } from './components/DonorPanel';
import { UserPanel } from './components/UserPanel';
import { LandingPage } from './components/LandingPage';
import { Button } from './components/Button';
import { chatWithSamrat } from './services/geminiService';

// View State Types
type ViewState = 'landing' | 'login' | 'register' | 'dashboard';

// --- Samrat Chatbot Component ---
const SamratBot: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([
    { sender: 'bot', text: `Namaste! I'm Samrat. How can I help you with the Blood Bank today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const context = user 
      ? `User Role: ${user.role}, Name: ${user.name}, Location: ${user.location || 'Unknown'}`
      : `User Role: Guest/Visitor (Not Logged In)`;

    const response = await chatWithSamrat(userMsg, context);

    setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blood-700 to-blood-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm">Samrat AI</h3>
                <p className="text-xs text-blood-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors">
              <Minus size={18} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blood-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blood-500 text-sm transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blood-600 text-white rounded-lg hover:bg-blood-700 disabled:opacity-50 transition-all hover:scale-105"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'bg-gray-800 rotate-90' : 'bg-blood-600 hover:bg-blood-700 hover:-translate-y-1'} text-white p-4 rounded-full shadow-xl shadow-blood-600/30 transition-all duration-300 flex items-center justify-center`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'info' | 'urgent'} | null>(null);

  // Modals State
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Login/Register Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.USER);
  const [loginError, setLoginError] = useState('');
  const [regName, setRegName] = useState('');
  
  // Simulated Notification System
  useEffect(() => {
    if (currentUser && currentUser.role === UserRole.DONOR) {
      const timer = setTimeout(() => {
        setNotification({ msg: 'Urgent: O+ Blood needed at City General Hospital!', type: 'urgent' });
        setTimeout(() => setNotification(null), 8000); // Hide after 8s
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MockBackend.login(loginUsername, loginPassword, loginRole);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid credentials. Please check username and password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setLoginUsername('');
    setLoginPassword('');
    setLoginRole(UserRole.USER);
    setShowProfile(false);
    setShowSettings(false);
  };

  const initiateLogin = (role: UserRole) => {
    setLoginRole(role);
    setCurrentView('login');
    setLoginError('');
    setLoginUsername('');
    setLoginPassword('');
    setMobileMenuOpen(false);
  };

  const showDummyData = (feature: string) => {
    setNotification({ msg: `Navigating to ${feature} (Mock Data)`, type: 'info' });
    setTimeout(() => setNotification(null), 3000);
  };

  const renderDashboard = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return <AdminPanel />;
      case UserRole.DONOR:
        return <DonorPanel user={currentUser} />;
      case UserRole.USER:
        return <UserPanel />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  // --- MODALS ---

  // About Us Modal
  const AboutModal = () => {
    if (!showAboutModal) return null;
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
           <button onClick={() => setShowAboutModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"><X size={20}/></button>
           
           <div className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blood-100 p-3 rounded-xl text-blood-600">
                  <Info size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">About Blood Bank</h2>
              </div>
              
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  Welcome to <span className="font-bold text-blood-600">Blood Bank</span>, a state-of-the-art digital platform designed to bridge the gap between life-saving blood donors, hospitals, and patients in critical need.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><Activity size={18} className="text-blue-500"/> Real-Time Tracking</h4>
                    <p className="text-sm">Monitor blood availability instantly across partner hospitals.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><Users size={18} className="text-green-500"/> Donor Network</h4>
                    <p className="text-sm">Connect with over 50,000 verified donors ready to help.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><MessageSquare size={18} className="text-purple-500"/> AI Assistant</h4>
                    <p className="text-sm">24/7 Support from Samrat, our AI powered guide.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><ShieldCheck size={18} className="text-orange-500"/> Verified & Safe</h4>
                    <p className="text-sm">Blockchain-inspired security keys for donor verification.</p>
                  </div>
                </div>

                <p className="italic text-sm border-l-4 border-gray-300 pl-4 py-1">
                  "Our mission is to ensure that no life is lost due to a shortage of blood. Join us in this journey of humanity."
                </p>
              </div>
              
              <div className="mt-8 text-center">
                 <Button onClick={() => { setShowAboutModal(false); setCurrentView('register'); }} className="bg-blood-600 text-white px-8">Join Our Mission</Button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  // Settings Modal Component
  const SettingsModal = () => {
    if (!showSettings) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in-up">
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Settings size={24} className="text-gray-500"/> App Settings</h2>
             <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={20}/></button>
           </div>
           
           <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Notifications Section */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notifications</h3>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Mail size={18}/></div>
                          <div>
                             <p className="font-medium text-gray-800">Email Alerts</p>
                             <p className="text-xs text-gray-500">Receive updates via email</p>
                          </div>
                       </div>
                       <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                          <span className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out translate-x-0"></span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Smartphone size={18}/></div>
                          <div>
                             <p className="font-medium text-gray-800">SMS Notifications</p>
                             <p className="text-xs text-gray-500">Urgent alerts to phone</p>
                          </div>
                       </div>
                       <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-gray-200">
                          <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out translate-x-0"></span>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Appearance */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appearance</h3>
                 <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-gray-800 text-white rounded-lg"><Moon size={18}/></div>
                       <div>
                          <p className="font-medium text-gray-800">Dark Mode</p>
                          <p className="text-xs text-gray-500">Reduce eye strain at night</p>
                       </div>
                    </div>
                    <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-gray-200">
                       <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out translate-x-0"></span>
                    </div>
                 </div>
              </section>

              {/* Privacy */}
              <section className="space-y-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Privacy & Security</h3>
                 <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Globe size={18}/></div>
                       <div>
                          <p className="font-medium text-gray-800">Public Profile</p>
                          <p className="text-xs text-gray-500">Visible to other users</p>
                       </div>
                    </div>
                    <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                       <span className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out translate-x-0"></span>
                    </div>
                 </div>
              </section>

              {/* Danger Zone */}
              <section className="pt-4 border-t border-gray-100">
                 <Button variant="danger" className="w-full flex items-center gap-2 justify-center bg-red-50 text-red-600 hover:bg-red-100 border-none"><Trash2 size={16}/> Delete Account</Button>
              </section>

           </div>
           <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-400">App Version 1.0.5 (Build 2023)</p>
           </div>
        </div>
      </div>
    );
  };

  // Profile Modal Component
  const ProfileModal = () => {
    if (!showProfile || !currentUser) return null;
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(currentUser);
    const [newPassword, setNewPassword] = useState('');

    // Reset form data when modal opens
    useEffect(() => {
      if (showProfile) {
        setFormData(currentUser);
        setIsEditing(false);
        setNewPassword('');
      }
    }, [showProfile, currentUser]);

    const handleSave = () => {
      const updated = MockBackend.updateUser(formData);
      if (updated) {
        setCurrentUser(updated);
        if (newPassword) {
          alert('Password updated successfully (Mock)!');
        }
        setNotification({ msg: 'Profile Details Updated Successfully', type: 'info' });
        setIsEditing(false);
        setTimeout(() => setNotification(null), 3000);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up overflow-y-auto">
        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 my-auto">
           <div className="relative h-32 bg-gradient-to-r from-blood-600 to-blood-800">
             <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"><X size={20}/></button>
             <h2 className="absolute bottom-4 left-8 text-white font-bold text-lg opacity-90">My Profile</h2>
           </div>
           
           <div className="px-8 pb-8 relative">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white p-1 rounded-full -mt-12 shadow-lg mb-6 relative">
                 <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden">
                    {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover"/> : currentUser.name.charAt(0)}
                 </div>
                 <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>

              {/* Header Actions */}
              <div className="flex justify-between items-center mb-6">
                 <div>
                   {!isEditing ? (
                     <>
                       <h3 className="text-2xl font-bold text-gray-900">{currentUser.name}</h3>
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">{currentUser.role}</span>
                     </>
                   ) : (
                     <span className="text-gray-500 font-bold">Editing Profile...</span>
                   )}
                 </div>
                 <Button 
                   variant={isEditing ? 'secondary' : 'outline'} 
                   onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                   className="text-sm gap-2"
                 >
                   {isEditing ? <><X size={14}/> Cancel</> : <><Edit2 size={14}/> Edit Details</>}
                 </Button>
              </div>
              
              {/* Form Content */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                
                {/* Basic Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Personal Info</h4>
                  <div className="grid grid-cols-1 gap-3">
                     <div>
                       <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                       {isEditing ? (
                         <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"/>
                       ) : (
                         <p className="font-bold text-gray-800">{currentUser.name}</p>
                       )}
                     </div>
                     <div>
                       <label className="text-xs text-gray-500 block mb-1">Username</label>
                       {isEditing ? (
                         <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"/>
                       ) : (
                         <p className="font-bold text-gray-800">{currentUser.username}</p>
                       )}
                     </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 pt-2">Contact Details</h4>
                  <div className="grid grid-cols-1 gap-3">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><Mail size={14}/></div>
                       <div className="flex-1">
                         <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                         {isEditing ? (
                           <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Add email..." className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"/>
                         ) : (
                           <p className="font-bold text-gray-800">{currentUser.email || 'Not set'}</p>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><Phone size={14}/></div>
                       <div className="flex-1">
                         <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                         {isEditing ? (
                           <input type="tel" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Add phone..." className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"/>
                         ) : (
                           <p className="font-bold text-gray-800">{currentUser.phone || 'Not set'}</p>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><MapPin size={14}/></div>
                       <div className="flex-1">
                         <label className="text-xs text-gray-500 block mb-1">Address / Location</label>
                         {isEditing ? (
                           <input type="text" value={formData.address || formData.location || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Add address..." className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"/>
                         ) : (
                           <p className="font-bold text-gray-800">{currentUser.address || currentUser.location || 'Not set'}</p>
                         )}
                       </div>
                     </div>
                  </div>
                </div>

                {/* Medical Info - Only if not admin */}
                {currentUser.role !== UserRole.ADMIN && (
                  <div className="space-y-3">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 pt-2">Medical Info</h4>
                     <div className="p-4 bg-red-50 rounded-2xl flex justify-between items-center border border-red-100">
                        <div>
                           <span className="text-red-500 text-xs font-bold block">Blood Type</span>
                           {isEditing ? (
                             <select value={formData.bloodType || ''} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="mt-1 p-1 bg-white rounded border border-red-200 text-red-700 font-bold outline-none">
                               <option value="">Select</option>
                               {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                           ) : (
                             <span className="font-bold text-red-700 text-xl">{currentUser.bloodType || 'N/A'}</span>
                           )}
                        </div>
                        <Activity className="text-red-400 opacity-50" size={32} />
                     </div>
                  </div>
                )}
                
                {/* Security Section */}
                {isEditing && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1">Security</h4>
                     <div>
                       <label className="text-xs text-gray-500 block mb-1">New Password (Optional)</label>
                       <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"/>
                     </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-4">
                     <Button onClick={handleSave} className="w-full py-3 rounded-xl gap-2 shadow-lg"><Save size={18}/> Save Changes</Button>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  };

  // Notification Toast
  const NotificationToast = () => {
    if (!notification) return null;
    return (
      <div className="fixed top-24 right-6 z-50 max-w-sm animate-fade-in-up">
        <div className={`p-4 rounded-2xl shadow-2xl border-l-4 flex items-start gap-3 ${notification.type === 'urgent' ? 'bg-white border-red-500' : 'bg-white border-blue-500'}`}>
           <div className={`p-2 rounded-full ${notification.type === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
             <Bell size={20} />
           </div>
           <div>
             <h4 className={`font-bold ${notification.type === 'urgent' ? 'text-red-600' : 'text-blue-600'}`}>
               {notification.type === 'urgent' ? 'Emergency Alert' : 'System Update'}
             </h4>
             <p className="text-sm text-gray-600">{notification.msg}</p>
           </div>
           <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
        </div>
      </div>
    );
  };

  // Helper to simplify login dropdown item
  const LoginItem: React.FC<{ role: UserRole, label: string, icon: React.ReactNode }> = ({ role, label, icon }) => (
    <button 
      onClick={() => initiateLogin(role)} 
      className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
    >
      <div className="text-blood-600">{icon}</div>
      <div>
        <div className="font-bold text-sm text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">Access {label.split(' ')[0]} Dashboard</div>
      </div>
    </button>
  );

  // Dropdown Menu Item Helper
  const DropdownItem: React.FC<{ label: string, onClick?: () => void }> = ({ label, onClick }) => (
    <button 
      onClick={onClick}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blood-50 hover:text-blood-700 transition-colors rounded-lg"
    >
      {label}
    </button>
  );

  // Nav Item for complex structure (About, Donate, Looking)
  const NavDropdown: React.FC<{ label: string, items: {label: string, action: () => void}[] }> = ({ label, items }) => (
    <div className="relative group">
      <button className={`font-medium flex items-center gap-1 transition-colors hover:-translate-y-0.5 py-2 ${currentView === 'landing' ? 'text-white hover:text-blood-400' : 'text-gray-600 hover:text-blood-600'}`}>
        {label} <ChevronDown size={14} />
      </button>
      <div className="absolute top-full left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:delay-0 delay-1000">
         {items.map((item, idx) => (
           <DropdownItem key={idx} label={item.label} onClick={item.action} />
         ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${currentView === 'landing' ? 'bg-gray-900/95 border-b border-white/10' : 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { setCurrentView(currentUser ? 'dashboard' : 'landing'); }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blood-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blood-500 to-blood-700 text-white p-2.5 rounded-xl shadow-xl">
                  <Droplet size={24} fill="currentColor" />
                </div>
              </div>
              <span className={`text-2xl font-bold tracking-tight ${currentView === 'landing' ? 'text-white' : 'text-gray-900'}`}>
                Blood Bank
              </span>
            </div>

            {/* Desktop Navigation Links (Center/Left) - Now visible always */}
            <div className="hidden lg:flex items-center gap-8 ml-10 mr-auto">
              <button 
                onClick={() => setCurrentView(currentUser ? 'dashboard' : 'landing')} 
                className={`font-medium transition-colors hover:-translate-y-0.5 ${currentView === 'landing' ? 'text-white hover:text-blood-400' : 'text-gray-600 hover:text-blood-600'}`}
              >
                Home
              </button>
              
              <NavDropdown 
                label="About" 
                items={[
                  { label: "About Blood Bank", action: () => setShowAboutModal(true) },
                  { label: "Gallery", action: () => showDummyData("Gallery") },
                  { label: "Video Gallery", action: () => showDummyData("Video Gallery") },
                  { label: "Notifications", action: () => showDummyData("Notifications") },
                  { label: "FAQs", action: () => showDummyData("FAQs") },
                  { label: "Contact Us", action: () => showDummyData("Contact Us") }
                ]}
              />

              <NavDropdown 
                label="Want to Donate" 
                items={[
                  { label: "Blood Donation Camps", action: () => showDummyData("Camps") },
                  { label: "Register VBD Camp", action: () => showDummyData("Register Camp") },
                  { label: "Appointment", action: () => currentUser ? setCurrentView('dashboard') : initiateLogin(UserRole.DONOR) },
                  { label: "About Blood Donation", action: () => showDummyData("Donation Info") }
                ]}
              />
            </div>

            {/* Right Side: Profile OR Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                   {/* Logged In User Dropdown */}
                   <div className="group relative">
                      <button className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-all">
                         <div className="text-right hidden lg:block">
                            <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{currentUser.role}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blood-500 to-blood-700 flex items-center justify-center text-white shadow-md">
                           <span className="font-bold">{currentUser.name.charAt(0)}</span>
                         </div>
                         <ChevronDown size={16} className="text-gray-500" />
                      </button>

                      {/* The User Menu Dropdown */}
                      <div className="absolute top-full right-0 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 z-50 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:delay-0 delay-1000">
                         <div className="px-4 py-2 border-b border-gray-100 mb-2">
                           <p className="text-xs text-gray-400 uppercase">Signed in as</p>
                           <p className="font-bold text-gray-800 truncate">{currentUser.username}</p>
                         </div>
                         
                         <button onClick={() => setCurrentView('dashboard')} className="flex w-full items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-blood-50 hover:text-blood-700 transition-colors rounded-lg">
                            <Home size={16}/> Dashboard
                         </button>
                         <button onClick={() => setShowProfile(true)} className="flex w-full items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-blood-50 hover:text-blood-700 transition-colors rounded-lg">
                            <UserIcon size={16}/> My Profile
                         </button>
                         <button onClick={() => setShowSettings(true)} className="flex w-full items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-blood-50 hover:text-blood-700 transition-colors rounded-lg">
                            <Settings size={16}/> Settings
                         </button>
                         
                         <div className="h-px bg-gray-100 my-2"></div>
                         
                         <button onClick={handleLogout} className="flex w-full items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                            <LogOut size={16}/> Logout
                         </button>
                      </div>
                   </div>
                </div>
              ) : (
                /* Auth Buttons for Guests */
                <div className="flex items-center gap-4">
                   {/* Login Dropdown */}
                   <div className="group relative">
                      <button className={`flex items-center gap-1 font-bold px-4 py-2 rounded-lg transition-colors ${currentView === 'landing' ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Login <ChevronDown size={14} />
                      </button>
                      <div className="absolute top-full right-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 group-hover:delay-0 delay-1000">
                         <LoginItem role={UserRole.ADMIN} label="Admin Login" icon={<ShieldCheck size={18}/>} />
                         <LoginItem role={UserRole.DONOR} label="Donor Login" icon={<Heart size={18}/>} />
                         <LoginItem role={UserRole.USER} label="User Login" icon={<UserIcon size={18}/>} />
                      </div>
                   </div>

                   {/* Sign Up Button */}
                   <Button 
                    onClick={() => setCurrentView('register')} 
                    className="bg-blood-600 text-white hover:bg-blood-500 border-none shadow-lg shadow-blood-600/30 px-6 py-2.5 rounded-lg font-bold"
                   >
                     Sign Up
                   </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden text-gray-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
               {mobileMenuOpen ? <X className={currentView === 'landing' ? 'text-white' : 'text-gray-800'} /> : <Menu className={currentView === 'landing' ? 'text-white' : 'text-gray-800'} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t p-4 space-y-2 animate-fade-in-up text-gray-800 h-[80vh] overflow-y-auto">
             <div className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">Navigation</div>
             <button onClick={() => { setCurrentView(currentUser ? 'dashboard' : 'landing'); setMobileMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium">Home</button>
             <button onClick={() => { setShowAboutModal(true); setMobileMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium">About Us</button>
             
             <div className="h-px bg-gray-100 my-4"></div>
             <div className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">Account</div>
             
             {!currentUser ? (
               <>
                 <button onClick={() => initiateLogin(UserRole.ADMIN)} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"><ShieldCheck size={16}/> Admin Login</button>
                 <button onClick={() => initiateLogin(UserRole.DONOR)} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"><Heart size={16}/> Donor Login</button>
                 <button onClick={() => initiateLogin(UserRole.USER)} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"><UserIcon size={16}/> User Login</button>
                 <button onClick={() => { setCurrentView('register'); setMobileMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg bg-blood-600 text-white font-bold mt-2">Sign Up Now</button>
               </>
             ) : (
               <>
                 <button onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"><Home size={16}/> Dashboard</button>
                 <button onClick={() => { setShowProfile(true); setMobileMenuOpen(false); }} className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"><UserIcon size={16}/> My Profile</button>
                 <button onClick={handleLogout} className="block w-full text-left p-3 rounded-lg text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"><LogOut size={16}/> Logout</button>
               </>
             )}
          </div>
        )}
      </nav>

      <div className="pt-20"> {/* Spacer for fixed nav */}
        
        {/* Global Chatbot - Always Visible */}
        <SamratBot user={currentUser} />
        
        <ProfileModal />
        <SettingsModal />
        <AboutModal />
        <NotificationToast />

        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        
        {currentView === 'dashboard' && currentUser && (
          <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-160px)] animate-fade-in-up">
            {renderDashboard()}
          </main>
        )}

        {(currentView === 'login' || currentView === 'register') && (
          <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
             {/* Background Blobs */}
             <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blood-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
             </div>

             <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10">
                <button onClick={() => setCurrentView('landing')} className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition-colors" title="Back to Home"><ArrowLeft/></button>
                
                <div className="text-center mb-8 mt-4">
                   <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentView === 'login' ? `${loginRole === UserRole.ADMIN ? 'Admin' : loginRole === UserRole.DONOR ? 'Donor' : 'User'} Login` : 'Join the Mission'}</h2>
                   <p className="text-gray-500">{currentView === 'login' ? `Access your ${loginRole.toLowerCase()} dashboard` : 'Start saving lives today'}</p>
                </div>

                <form onSubmit={currentView === 'login' ? handleLogin : (e) => { e.preventDefault(); alert('Fake Account Created!'); setCurrentView('login'); }} className="space-y-5">
                   
                   {currentView === 'register' && (
                     <input 
                       type="text" 
                       placeholder="Full Name"
                       className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blood-500 transition-all outline-none"
                       required
                     />
                   )}

                   <input 
                      type="text" 
                      placeholder="Username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blood-500 transition-all outline-none"
                      required
                   />

                   <input 
                      type="password" 
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blood-500 transition-all outline-none"
                      required
                   />

                   {loginError && <p className="text-red-500 text-center text-sm">{loginError}</p>}

                   <Button className="w-full py-4 text-lg rounded-xl shadow-lg shadow-blood-500/20 bg-blood-600 text-white hover:bg-blood-700">
                     {currentView === 'login' ? 'Sign In' : 'Sign Up'}
                   </Button>

                   {currentView === 'login' && (
                     <p className="text-center text-sm text-gray-500 mt-4">
                       Not registered yet?{" "}
                       <span 
                        className="text-blood-600 font-bold cursor-pointer hover:underline"
                        onClick={() => { setCurrentView('register'); setLoginError(''); }}
                       >
                         Sign Up
                       </span>
                     </p>
                   )}
                   
                   {currentView === 'register' && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{" "}
                        <span 
                        className="text-blood-600 font-bold cursor-pointer hover:underline"
                        onClick={() => { initiateLogin(UserRole.USER); setLoginError(''); }}
                        >
                          Login
                        </span>
                      </p>
                   )}
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
