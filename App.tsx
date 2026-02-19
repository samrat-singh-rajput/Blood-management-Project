
import React, { useState, useEffect } from 'react';
import { 
  Droplet, LogOut, ArrowLeft, Settings, Mail, ShieldCheck, 
  Lock, UserPlus, LogIn, CheckCircle2, AlertTriangle, AlertCircle, User as UserIcon,
  ChevronRight, Globe, Shield, Eye, EyeOff, Loader2, Sparkles, UserCheck, Search, Database
} from 'lucide-react';
import { User, UserRole } from './types';
import { API } from './services/api';
import { AdminPanel } from './components/AdminPanel';
import { DonorPanel } from './components/DonorPanel';
import { UserPanel } from './components/UserPanel';
import { LandingPage } from './components/LandingPage';
import { Button } from './components/Button';
import { SettingsModal } from './components/SettingsModal';

type ViewState = 'landing' | 'login' | 'register' | 'dashboard';
type SignupStep = 'identity' | 'verify_pass' | 'profile_setup';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Identity-First Signup States
  const [regStep, setRegStep] = useState<SignupStep>('identity');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [isExistingIdentity, setIsExistingIdentity] = useState(false);
  const [existingUserRef, setExistingUserRef] = useState<User | null>(null);
  const [regDetails, setRegDetails] = useState({ username: '', bloodType: 'O+', role: UserRole.USER });

  // Original Manual Login State (Maintained as requested)
  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: UserRole.USER });

  /**
   * Enhanced Strict Email Validation
   * Rejects: Internal spaces, special symbols (!#$% etc), symbols at start/end.
   */
  const validateEmailStrict = (email: string) => {
    const raw = email.trim().toLowerCase();
    
    // Check for any whitespace inside the email
    if (/\s/.test(raw)) return false;
    
    // Basic character set: lowercase, numbers, dot, underscore, hyphen
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(raw)) return false;

    const [local] = raw.split('@');
    
    // Extra strict: No symbols at the very beginning or end of local part
    if (/^[._-]/.test(local) || /[._-]$/.test(local)) return false;
    
    // Reject common symbols that users might try to use
    if (/[!#\$%^&*()+=]/.test(local)) return false;

    return true;
  };

  const handleSignupIdentityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (!validateEmailStrict(regEmail)) {
      setAuthError("Format error: Only lowercase a-z, 0-9, and ._- (not at start/end) are allowed. No spaces or special symbols.");
      return;
    }

    setIsAuthLoading(true);
    try {
      // Direct Database Query for the email
      const user = await API.isEmailRegistered(regEmail.toLowerCase());
      if (user) {
        setIsExistingIdentity(true);
        setExistingUserRef(user);
      } else {
        setIsExistingIdentity(false);
        setExistingUserRef(null);
      }
      setRegStep('verify_pass');
    } catch (err: any) {
      setAuthError(err.message || "Database connection error.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return;
    }
    setAuthError('');

    if (isExistingIdentity && existingUserRef) {
      // If identity exists, we must verify the password matches the DB
      setIsAuthLoading(true);
      try {
        await API.login(regEmail.toLowerCase(), regPass, existingUserRef.role);
        // If login successful, skip to profile to allow updates or proceed to dashboard
        setRegDetails({
          username: existingUserRef.username,
          bloodType: existingUserRef.bloodType || 'O+',
          role: existingUserRef.role
        });
        setRegStep('profile_setup');
      } catch (err: any) {
        setAuthError("Incorrect password for this registered email.");
      } finally {
        setIsAuthLoading(false);
      }
    } else {
      // New User path: proceed to capture details
      setRegStep('profile_setup');
    }
  };

  const handleSignupFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDetails.username) {
      setAuthError("Display name is required.");
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');
    try {
      if (isExistingIdentity && existingUserRef) {
        // Update profile and entry
        const updated = await API.updateUserProfile(existingUserRef._id, {
          username: regDetails.username,
          name: regDetails.username,
          bloodType: regDetails.bloodType,
          role: regDetails.role
        });
        setCurrentUser(updated);
      } else {
        // Create brand new database record
        const newUser = await API.completeSignup({
          email: regEmail.toLowerCase(),
          password: regPass,
          username: regDetails.username,
          name: regDetails.username,
          bloodType: regDetails.bloodType,
          role: regDetails.role
        });
        setCurrentUser(newUser);
      }
      setCurrentView('dashboard');
    } catch (err: any) {
      setAuthError(err.message || "Registration protocol failure.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const user = await API.login(loginForm.username, loginForm.password, loginForm.role);
      setCurrentUser(user);
      setCurrentView('dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Access Denied: Invalid credentials.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setRegStep('identity');
    setRegEmail('');
    setRegPass('');
    setAuthError('');
  };

  const renderSignupFlow = () => {
    switch(regStep) {
      case 'identity':
        return (
          <form onSubmit={handleSignupIdentityCheck} className="space-y-6 animate-fade-in-up text-center">
            <h2 className="text-3xl font-black text-gray-900 uppercase">Registry Link</h2>
            <p className="text-sm text-gray-500">Enter your email to join or sync your existing node.</p>
            <div className="text-left space-y-2">
              <input 
                type="text" required placeholder="user@domain.com" 
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blood-500 outline-none font-bold shadow-inner" 
              />
            </div>
            {authError && <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 text-left flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {authError}
            </div>}
            <div className="flex justify-between items-center pt-6">
              <button type="button" onClick={() => setCurrentView('landing')} className="flex items-center gap-1.5 text-gray-500 font-bold text-sm hover:underline">
                <ArrowLeft size={16} /> Home
              </button>
              <Button isLoading={isAuthLoading} className="px-12 rounded-xl shadow-lg border-none font-black uppercase text-[11px] tracking-widest">Identify</Button>
            </div>
          </form>
        );
      case 'verify_pass':
        return (
          <form onSubmit={handleSignupPassword} className="space-y-6 animate-fade-in-up text-center">
            <div className="flex justify-center mb-2">
               <div className="px-4 py-2 border border-gray-200 rounded-full flex items-center gap-2 bg-gray-50 text-[10px] font-black uppercase text-gray-400">
                 <Mail size={12}/> {regEmail}
               </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">
              {isExistingIdentity ? 'Welcome Back' : 'Security Setup'}
            </h2>
            <p className="text-sm text-gray-500">
              {isExistingIdentity ? 'Account confirmed. Enter password to authorize.' : 'New email. Set a secure password for your record.'}
            </p>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} required placeholder="Account Password" 
                value={regPass} onChange={e => setRegPass(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blood-500 shadow-inner" 
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
            {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
            <div className="flex justify-between items-center pt-6">
              <button type="button" onClick={() => setRegStep('identity')} className="flex items-center gap-1.5 text-gray-500 font-bold text-sm hover:underline">
                <ArrowLeft size={16} /> Back
              </button>
              <Button isLoading={isAuthLoading} className="px-12 rounded-xl shadow-lg border-none font-black uppercase text-[11px] tracking-widest">
                {isExistingIdentity ? 'Verify' : 'Next'}
              </Button>
            </div>
          </form>
        );
      case 'profile_setup':
        return (
          <form onSubmit={handleSignupFinalize} className="space-y-6 animate-fade-in-up text-left">
            <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-100 rounded-[2.5rem] mb-2">
               <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg"><CheckCircle2 size={24}/></div>
               <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{isExistingIdentity ? 'Record Authenticated' : 'Identity Verified'}</p>
                 <p className="text-sm font-bold text-gray-800 truncate">{regEmail}</p>
               </div>
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase">Node Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Username</label>
                <input required type="text" value={regDetails.username} onChange={e => setRegDetails({...regDetails, username: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blood-500 shadow-inner" placeholder="Display name"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Blood Group</label>
                <select value={regDetails.bloodType} onChange={e => setRegDetails({...regDetails, bloodType: e.target.value})} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold outline-none appearance-none focus:ring-2 focus:ring-blood-500 shadow-inner">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Network Role</label>
               <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl">
                 {(['USER', 'DONOR'] as UserRole[]).map(r => (
                   <button key={r} type="button" onClick={() => setRegDetails({...regDetails, role: r})} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${regDetails.role === r ? 'bg-white text-blood-600 shadow-sm' : 'text-gray-500'}`}>{r}</button>
                 ))}
               </div>
            </div>
            {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
            <div className="flex justify-between items-center pt-6">
              <button type="button" onClick={() => setRegStep('verify_pass')} className="flex items-center gap-1.5 text-gray-500 font-bold text-sm hover:underline">
                <ArrowLeft size={16} /> Back
              </button>
              <Button isLoading={isAuthLoading} className="px-14 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl border-none text-[12px]">Finalize Registry</Button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <nav className={`fixed w-full z-40 transition-all ${currentView === 'landing' ? 'bg-gray-900/95 border-b border-white/10 py-5' : 'bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6" onClick={() => !currentUser && setCurrentView('landing')}>
            <div className="bg-blood-600 text-white p-2.5 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform"><Droplet size={26} fill="currentColor"/></div>
            <span className={`text-2xl font-black tracking-tighter cursor-pointer ${currentView === 'landing' ? 'text-white' : 'text-gray-900'}`}>BloodBank</span>
          </div>
          <div className="flex items-center gap-4">
             {!currentUser ? (
               <div className="flex items-center gap-4">
                  <Button onClick={() => { setAuthError(''); setCurrentView('login'); }} variant="outline" className={`border-none ${currentView === 'landing' ? 'text-white' : 'text-gray-600'}`}>Login</Button>
                  <Button onClick={() => { setAuthError(''); setCurrentView('register'); setRegStep('identity'); }} className="bg-blood-600 text-white px-8 rounded-xl shadow-xl border-none font-black uppercase tracking-widest text-[11px]">Join Network</Button>
               </div>
             ) : (
               <div className="flex items-center gap-3">
                  <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-blood-600 transition-colors"><Settings size={22}/></button>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={22}/></button>
               </div>
             )}
          </div>
        </div>
      </nav>

      <div className="pt-24 lg:pt-32">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}

        {currentView === 'login' && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
              <button onClick={() => setCurrentView('landing')} className="mb-8 text-gray-400 hover:text-gray-800 flex items-center gap-2 font-bold text-sm transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
              </button>
              <h2 className="text-4xl font-black text-gray-900 mb-8 uppercase tracking-tight">Access Hub</h2>
              <form onSubmit={handleManualLogin} className="space-y-5">
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                  {(['ADMIN', 'DONOR', 'USER'] as UserRole[]).map(r => (
                    <button key={r} type="button" onClick={() => setLoginForm({...loginForm, role: r})} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${loginForm.role === r ? 'bg-white text-blood-600 shadow-sm' : 'text-gray-500'}`}>{r}</button>
                  ))}
                </div>
                <input 
                  type="text" placeholder="Username / ID" 
                  value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                  className="w-full p-4 bg-gray-50 text-gray-900 rounded-2xl border-none font-bold shadow-inner focus:ring-2 focus:ring-blood-500 outline-none" required 
                />
                <input 
                  type="password" placeholder="Passcode" 
                  value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                  className="w-full p-4 bg-gray-50 text-gray-900 rounded-2xl border-none font-bold shadow-inner focus:ring-2 focus:ring-blood-500 outline-none" required 
                />
                {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
                <Button isLoading={isAuthLoading} className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-xl border-none text-[12px]">Authorize Entry</Button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-gray-100 relative overflow-hidden transition-all min-h-[500px] flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-blood-600"></div>
              {renderSignupFlow()}
              <p className="mt-10 text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] text-center">
                Secure Registry Synchronization Node
              </p>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && currentUser && (
          <main className="container mx-auto px-6 py-12 animate-fade-in-up">
            {currentUser.role === UserRole.ADMIN ? <AdminPanel /> : currentUser.role === UserRole.DONOR ? <DonorPanel user={currentUser} /> : <UserPanel />}
          </main>
        )}
      </div>

      {showSettings && (
        <SettingsModal 
          user={currentUser || { _id: 'guest', role: UserRole.GUEST, name: 'Guest', username: 'guest' } as User} 
          onClose={() => setShowSettings(false)} 
          onUpdate={(updated) => { if(currentUser) setCurrentUser(updated); }}
          onLogout={handleLogout}
          isDarkMode={false}
          onToggleTheme={() => {}}
        />
      )}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
