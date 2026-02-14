
import React, { useState, useRef, useEffect } from 'react';
import { 
  Droplet, LogOut, Menu, X, ArrowLeft, User as UserIcon, MessageSquare, 
  Send, Minus, Bell, ChevronDown, Heart, Activity, Phone, ShieldCheck, 
  Mail, MapPin, Save, Settings, Loader2, UserPlus, LogIn, Database, 
  CheckCircle, AlertTriangle, Mic, Camera, BrainCircuit, Headphones,
  Sun, Moon, ShieldAlert, KeyRound, Check, Inbox, Timer, Hash, Smartphone
} from 'lucide-react';
import { User, UserRole } from './types';
import { API } from './services/api';
import { AdminPanel } from './components/AdminPanel';
import { DonorPanel } from './components/DonorPanel';
import { UserPanel } from './components/UserPanel';
import { LandingPage } from './components/LandingPage';
import { Button } from './components/Button';
import { SettingsModal } from './components/SettingsModal';
import { chatWithSamrat, analyzeMedicalImage, transcribeAudio } from './services/geminiService';
import { auth } from './services/firebase';

const ThemeToggle: React.FC<{ isDark: boolean; onToggle: () => void }> = ({ isDark, onToggle }) => (
  <button 
    onClick={onToggle}
    className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-all duration-300 flex items-center shadow-inner border border-gray-300 dark:border-white/10"
    aria-label="Toggle Dark Mode"
  >
    <div className="flex items-center justify-between w-full px-1">
      <Sun size={10} className={`${isDark ? 'text-gray-400' : 'text-yellow-500'} z-0`} />
      <Moon size={10} className={`${!isDark ? 'text-gray-400' : 'text-yellow-200'} z-0`} />
    </div>
    <div 
      className={`absolute top-0.5 bottom-0.5 w-6 h-6 bg-white dark:bg-blood-600 rounded-full shadow-md transition-transform duration-300 transform flex items-center justify-center`}
      style={{ transform: isDark ? 'translateX(1.75rem)' : 'translateX(0)' }}
    >
      {isDark ? <Moon size={12} className="text-white" /> : <Sun size={12} className="text-yellow-600" />}
    </div>
  </button>
);

const SamratBot: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string, type?: 'image' | 'audio' }[]>([
    { sender: 'bot', text: `Namaste! I'm Samrat. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (overrideMsg?: string) => {
    const userMsg = overrideMsg || input;
    if (!userMsg.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    if (!overrideMsg) setInput('');
    setIsLoading(true);
    
    const context = user ? `Role: ${user.role}, Name: ${user.name}` : "Guest";
    const response = await chatWithSamrat(userMsg, context, isThinking);
    
    setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    setIsLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      setMessages(prev => [...prev, { sender: 'user', text: "Uploaded an image for analysis...", type: 'image' }]);
      setIsLoading(true);
      
      const analysis = await analyzeMedicalImage(base64Data, file.type);
      setMessages(prev => [...prev, { sender: 'bot', text: analysis }]);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          const transcript = await transcribeAudio(base64Audio);
          if (transcript) {
            setInput(transcript);
            handleSend(transcript);
          }
          setIsLoading(false);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access failed", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const toggleLiveVoice = async () => {
    setIsLiveActive(!isLiveActive);
    if (!isLiveActive) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Voice session active. I'm listening..." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[550px] animate-fade-in-up">
          <div className="bg-blood-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
              <div>
                <h3 className="font-bold">Samrat AI</h3>
                <p className="text-[10px] opacity-70">Powered by Gemini 3 Pro</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsThinking(!isThinking)} 
                className={`p-1.5 rounded-lg transition-colors ${isThinking ? 'bg-white text-blood-600' : 'hover:bg-white/20'}`}
                title="Thinking Mode (Deep Reasoning)"
              >
                <BrainCircuit size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg"><Minus size={18} /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blood-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 pl-2">
                <Loader2 size={14} className="animate-spin text-blood-600" />
                <p className="text-xs text-gray-400 font-medium">{isThinking ? 'Processing complex query...' : 'Thinking...'}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-2">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSend()} 
                placeholder="Ask Samrat..." 
                className="flex-1 pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blood-500 outline-none text-sm dark:text-white"
              />
              <button 
                onClick={() => handleSend()} 
                className="p-3 bg-blood-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
            
            <div className="flex justify-between items-center px-1">
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blood-600 hover:bg-blood-50 rounded-lg transition-all"
                  title="Analyze Image"
                >
                  <Camera size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={isRecording ? stopRecording : undefined}
                  className={`p-2 rounded-lg transition-all ${isRecording ? 'text-blood-600 bg-blood-50 animate-pulse' : 'text-gray-500 hover:text-blood-600 hover:bg-blood-50'}`}
                  title="Push to Transcribe"
                >
                  <Mic size={20} />
                </button>
              </div>

              <button 
                onClick={toggleLiveVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isLiveActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Headphones size={14} />
                {isLiveActive ? 'Live Active' : 'Voice Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blood-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
      >
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
        {isLiveActive && <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
      </button>
    </div>
  );
};

type ViewState = 'landing' | 'login' | 'register' | 'dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('bloodbank_theme') === 'dark');

  // Form States
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: UserRole.USER });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    password: '', 
    role: UserRole.USER, 
    bloodType: 'O+', 
    email: '' 
  });

  const resetAuthForms = (targetRole?: UserRole) => {
    const selectedRole = targetRole !== undefined ? targetRole : loginForm.role;
    const safeRegisterRole = selectedRole === UserRole.ADMIN ? UserRole.USER : selectedRole;

    setLoginForm({ username: '', password: '', role: selectedRole });
    setRegisterForm({ 
      username: '', 
      password: '', 
      role: safeRegisterRole, 
      bloodType: 'O+', 
      email: '' 
    });
    setAuthError('');
  };

  const navigateToLogin = (role: UserRole) => {
    resetAuthForms(role);
    setCurrentView('login');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bloodbank_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bloodbank_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentUser) {
      const fontSize = currentUser.fontSize || 'medium';
      const rootSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
      document.documentElement.style.fontSize = rootSize;
      const color = currentUser.accentColor || 'blood';
      document.body.className = `accent-${color}`;
    } else {
      document.body.className = 'accent-blood';
      document.documentElement.style.fontSize = '16px';
    }
  }, [currentUser]);

  // Firebase Auth State Listener for Persistence - Use namespaced API
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // User is logged in, fetch their Firestore profile
        const users = await API.getUsers();
        const freshUser = users.find(u => u._id === user.uid);
        
        if (freshUser) {
           if (freshUser.status === 'Blocked') {
              auth.signOut();
              setCurrentUser(null);
              setCurrentView('landing');
           } else {
              setCurrentUser(freshUser);
              setCurrentView('dashboard');
           }
        }
      } else {
        setCurrentUser(null);
        setCurrentView('landing');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const user = await API.login(loginForm.username, loginForm.password, loginForm.role);
      if (user) {
        setCurrentUser(user);
        setCurrentView('dashboard');
        setNotification(`Cloud Sync: Node Authorized`);
        resetAuthForms();
        setTimeout(() => setNotification(null), 4000);
      } else {
        setAuthError('Authentication Error: Invalid Credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Cloud Server Unavailable.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);
    try {
      if (!registerForm.email || !registerForm.username || !registerForm.password) {
        throw new Error("Missing critical identity fields.");
      }
      const user = await API.register({ ...registerForm });
      setCurrentUser(user);
      setCurrentView('dashboard');
      setNotification(`Registry Permanent: Node ${user.username} Established.`);
      resetAuthForms();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setAuthError(err.message || "Cloud Enrollment Failure.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setShowSettings(false);
    resetAuthForms();
    setCurrentView('landing');
  };

  const getPortalTheme = () => {
    switch (loginForm.role) {
      case UserRole.ADMIN: return { name: 'Admin Portal', loginTitle: 'Admin Access', color: 'bg-gray-900', icon: <ShieldCheck className="text-white"/> };
      case UserRole.DONOR: return { name: 'Donor Portal', loginTitle: 'Donor Login', color: 'bg-blood-600', icon: <Heart className="text-white"/> };
      default: return { name: 'User Portal', loginTitle: 'User Login', color: 'bg-blue-600', icon: <UserIcon className="text-white"/> };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className={`fixed w-full z-40 transition-all duration-500 ${currentView === 'landing' ? 'bg-gray-900/95 border-b border-white/10 py-5' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b dark:border-gray-800 shadow-sm py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { if(currentUser) { setCurrentView('dashboard'); } else { setCurrentView('landing'); resetAuthForms(); } }}>
            <div className="bg-blood-600 text-white p-2.5 rounded-2xl shadow-xl group-hover:scale-110 transition-transform"><Droplet size={26} fill="currentColor"/></div>
            <span className={`text-2xl font-black tracking-tighter ${currentView === 'landing' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>BloodBank</span>
          </div>

          <div className="flex items-center gap-4">
            {currentView !== 'landing' && (
              <div className="mr-2">
                <ThemeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
              </div>
            )}

            {!currentUser ? (
              <div className="flex items-center gap-4">
                <div className="group relative">
                  <button className={`font-bold flex items-center gap-2 transition-colors px-4 py-2 rounded-xl hover:bg-white/10 ${currentView === 'landing' ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <LogIn size={18}/> Login <ChevronDown size={14} className="group-hover:rotate-180 transition-transform"/>
                  </button>
                  <div className="absolute top-full right-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 z-50 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 text-left">Select Node Access</p>
                    <button onClick={() => navigateToLogin(UserRole.ADMIN)} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-gray-800 dark:text-gray-200"><ShieldCheck size={18} className="text-blood-600"/> <div>Admin Login <p className="text-[10px] text-gray-400 font-medium">System Administrator</p></div></button>
                    <button onClick={() => navigateToLogin(UserRole.DONOR)} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-gray-800 dark:text-gray-200"><Heart size={18} className="text-blood-600"/> <div>Donor Login <p className="text-[10px] text-gray-400 font-medium">Donor Hub Access</p></div></button>
                    <button onClick={() => navigateToLogin(UserRole.USER)} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors text-gray-800 dark:text-gray-200"><UserIcon size={18} className="text-blood-600"/> <div>User Login <p className="text-[10px] text-gray-400 font-medium">General Public Login</p></div></button>
                  </div>
                </div>
                <Button onClick={() => { resetAuthForms(UserRole.USER); setCurrentView('register'); }} className="bg-blood-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-blood-500/20 hover:-translate-y-0.5 transition-all">Sign Up</Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="group relative">
                  <button className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl border border-transparent hover:border-blood-200 transition-all shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-blood-600 text-white flex items-center justify-center font-black text-lg shadow-inner overflow-hidden">
                      {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                    </div>
                    <div className="text-left hidden lg:block pr-2">
                       <p className="text-sm font-black text-gray-800 dark:text-gray-200 leading-tight">{currentUser.name.split(' ')[0]}</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{currentUser.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400 mr-1"/>
                  </button>
                  <div className="absolute top-full right-0 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 z-50 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 border border-gray-100 dark:border-gray-700">
                    <button onClick={() => setShowSettings(true)} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-bold flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"><Settings size={18} className="text-gray-400"/> Settings</button>
                    <div className="h-px bg-gray-50 dark:bg-gray-700 my-2 mx-3"></div>
                    <button onClick={handleLogout} className="w-full text-left p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors"><LogOut size={18}/> Logout</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-24 lg:pt-32">
        <SamratBot user={currentUser} />
        {notification && (
          <div className="fixed top-28 right-6 bg-gray-900 text-white p-5 rounded-2xl shadow-2xl animate-fade-in-up z-50 flex items-center gap-3 border border-white/10 backdrop-blur-md max-w-sm">
            <div className="bg-green-500 p-1.5 rounded-lg shrink-0"><CheckCircle size={18}/></div>
            <p className="font-bold text-sm leading-tight">{notification}</p>
          </div>
        )}

        {currentView === 'landing' && <LandingPage onNavigate={(view) => { resetAuthForms(UserRole.USER); setCurrentView(view); }} />}

        {(currentView === 'login' || currentView === 'register') && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-colors duration-300">
              <div className={`absolute top-0 left-0 w-full h-2 ${currentView === 'register' ? 'bg-blood-600' : getPortalTheme().color}`}></div>
              
              <button onClick={() => { setCurrentView('landing'); resetAuthForms(UserRole.USER); }} className="mb-8 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 transition-colors font-bold text-sm group"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back</button>
              
              <div className="mb-8 text-left">
                {currentView === 'login' && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${getPortalTheme().color} text-white text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg`}>
                    {getPortalTheme().icon} {getPortalTheme().name}
                  </div>
                )}
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight uppercase tracking-tight">
                  {currentView === 'login' ? getPortalTheme().loginTitle : 'Join the Registry'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                  {currentView === 'login' ? `Welcome back to the BloodBank identity terminal.` : 'Fill out the form below to become a member of the network.'}
                </p>
              </div>

              {currentView === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username</p>
                    <input type="text" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                  </div>
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</p>
                    <input type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                  </div>
                  {authError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30">
                      <ShieldAlert size={14}/> {authError}
                    </div>
                  )}
                  <Button isLoading={isAuthLoading} className={`w-full py-5 text-lg rounded-2xl shadow-2xl font-black ${getPortalTheme().color} text-white shadow-blood-500/30 uppercase tracking-widest`}>Authorize Session</Button>
                  <p className="text-center text-xs text-gray-400 font-medium">New member? <button type="button" onClick={() => { resetAuthForms(UserRole.USER); setCurrentView('register'); }} className="text-blood-600 dark:text-blood-400 font-black ml-1 hover:underline">Enroll Now</button></p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5 animate-fade-in-up">
                  <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4">
                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: UserRole.USER})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${registerForm.role === UserRole.USER ? 'bg-white dark:bg-gray-700 shadow-sm text-blood-600 dark:text-blood-400' : 'text-gray-500'}`}>New User</button>
                    <button type="button" onClick={() => setRegisterForm({...registerForm, role: UserRole.DONOR})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${registerForm.role === UserRole.DONOR ? 'bg-white dark:bg-gray-700 shadow-sm text-blood-600 dark:text-blood-400' : 'text-gray-500'}`}>New Donor</button>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</p>
                    <input type="email" placeholder="example@email.com" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                  </div>

                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Choose Username</p>
                    <input type="text" placeholder="Unique ID" value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                  </div>

                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Set Password</p>
                    <input type="password" placeholder="••••••••" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                  </div>

                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Blood Classification</p>
                    <div className="relative">
                      <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-blood-500" size={18}/>
                      <select value={registerForm.bloodType} onChange={e => setRegisterForm({...registerForm, bloodType: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-black appearance-none dark:text-white shadow-inner outline-none focus:ring-2 focus:ring-blood-500">
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30">
                      <ShieldAlert size={14}/> {authError}
                    </div>
                  )}

                  <Button isLoading={isAuthLoading} className="w-full py-5 text-lg rounded-3xl shadow-2xl font-black bg-blood-600 text-white shadow-blood-500/30 uppercase tracking-widest">Register Account</Button>
                  
                  <p className="text-center text-xs text-gray-400 font-medium">Already online? <button type="button" onClick={() => { resetAuthForms(); setCurrentView('login'); }} className="text-blood-600 dark:text-blood-400 font-black ml-1 hover:underline">Authorize Hub</button></p>
                </form>
              )}
            </div>
          </div>
        )}

        {currentView === 'dashboard' && currentUser && (
          <main className="container mx-auto px-6 py-12 animate-fade-in-up">
            {currentUser.role === UserRole.ADMIN ? <AdminPanel /> : currentUser.role === UserRole.DONOR ? <DonorPanel user={currentUser} /> : <UserPanel />}
          </main>
        )}
      </div>

      {showSettings && currentUser && (
        <SettingsModal 
          user={currentUser} 
          onClose={() => setShowSettings(false)} 
          onUpdate={(updated) => {
            setCurrentUser(updated);
          }}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      )}
    </div>
  );
};

export default App;
