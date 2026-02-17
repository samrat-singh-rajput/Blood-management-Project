import React, { useState, useRef, useEffect } from 'react';
import { 
  Droplet, LogOut, ArrowLeft, User as UserIcon, ShieldCheck, 
  Heart, ChevronDown, Settings, LogIn, Lock, Smartphone,
  Mail, Send, RefreshCcw, Loader2, CheckCircle2, AlertTriangle, KeyRound, UserPlus
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
type SignupStep = 'email' | 'otp' | 'details';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('bloodbank_theme') === 'dark');

  // Multi-Step Registration States
  const [regStep, setRegStep] = useState<SignupStep>('email');
  const [regEmail, setRegEmail] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [regDetails, setRegDetails] = useState({ name: '', username: '', password: '', role: UserRole.USER });

  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: UserRole.USER });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('bloodbank_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const user = await API.login(loginForm.username, loginForm.password, loginForm.role);
      setCurrentUser(user);
      setCurrentView('dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await API.sendSignupOtp(regEmail);
      if (res.success) {
        if (res.debug_otp) setDebugOtp(res.debug_otp);
        setRegStep('otp');
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await API.verifySignupOtp(regEmail, regOtp);
      if (res.success) {
        setRegStep('details');
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Step 3: Complete Account
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const user = await API.completeSignup({
        email: regEmail,
        ...regDetails
      });
      setCurrentUser(user);
      setCurrentView('dashboard');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setRegStep('email');
    setRegEmail('');
    setRegOtp('');
  };

  const renderRegisterSteps = () => {
    switch(regStep) {
      case 'email':
        return (
          <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in-up">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Institutional Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blood-600" size={18} />
                <input 
                  type="email" required placeholder="name@example.com" 
                  value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" 
                />
              </div>
            </div>
            {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
            <Button isLoading={isAuthLoading} className="w-full py-5 rounded-2xl bg-blood-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blood-500/20">
              Generate Verification Code
            </Button>
          </form>
        );
      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 font-medium">Verification code sent to <br/><span className="text-blood-600 font-bold">{regEmail}</span></p>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">6-Digit Code</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-blood-600" size={18} />
                <input 
                  type="text" required maxLength={6} placeholder="000000" 
                  value={regOtp} onChange={e => setRegOtp(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-black tracking-[0.5em] text-center dark:text-white shadow-inner" 
                />
              </div>
            </div>
            {debugOtp && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] font-black text-amber-700 uppercase tracking-widest text-center">
                Debug Mode: {debugOtp}
              </div>
            )}
            {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setRegStep('email')}>Back</Button>
              <Button isLoading={isAuthLoading} className="flex-[2] py-5 rounded-2xl bg-blood-600 text-white font-black uppercase tracking-widest">Verify Email</Button>
            </div>
          </form>
        );
      case 'details':
        return (
          <form onSubmit={handleCompleteSignup} className="space-y-5 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
               {(['USER', 'DONOR'] as UserRole[]).map(r => (
                 <button key={r} type="button" onClick={() => setRegDetails({...regDetails, role: r})} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${regDetails.role === r ? 'bg-white dark:bg-gray-700 text-blood-600 shadow-sm' : 'text-gray-500'}`}>{r} NODE</button>
               ))}
            </div>
            <input type="text" placeholder="Full Name" required value={regDetails.name} onChange={e => setRegDetails({...regDetails, name: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" />
            <input type="text" placeholder="Username" required value={regDetails.username} onChange={e => setRegDetails({...regDetails, username: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" />
            <input type="password" placeholder="Set Password" required value={regDetails.password} onChange={e => setRegDetails({...regDetails, password: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" />
            {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
            <Button isLoading={isAuthLoading} className="w-full py-5 rounded-2xl bg-blood-600 text-white font-black uppercase tracking-widest shadow-xl">Complete Registration</Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <nav className={`fixed w-full z-40 transition-all ${currentView === 'landing' ? 'bg-gray-900/95 border-b border-white/10 py-5' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b dark:border-gray-800 shadow-sm py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6" onClick={() => !currentUser && setCurrentView('landing')}>
            <div className="bg-blood-600 text-white p-2.5 rounded-2xl shadow-xl cursor-pointer"><Droplet size={26} fill="currentColor"/></div>
            <span className={`text-2xl font-black tracking-tighter cursor-pointer ${currentView === 'landing' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>BloodBank</span>
          </div>

          <div className="flex items-center gap-4">
            {!currentUser ? (
              <div className="flex items-center gap-4">
                <Button onClick={() => setCurrentView('login')} variant="outline" className={`border-none ${currentView === 'landing' ? 'text-white' : 'text-gray-600'}`}>Login</Button>
                <Button onClick={() => setCurrentView('register')} className="bg-blood-600 text-white px-8 rounded-xl shadow-xl">Sign Up</Button>
                <button onClick={() => setShowSettings(true)} className={`p-2 rounded-xl transition-colors ${currentView === 'landing' ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <Settings size={22} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-blood-600 text-white flex items-center justify-center font-black">{currentUser.name.charAt(0)}</div>
                <div className="text-left hidden lg:block pr-2">
                  <p className="text-sm font-black text-gray-800 dark:text-gray-200 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{currentUser.role}</p>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-blood-600"><Settings size={20}/></button>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500"><LogOut size={20}/></button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-24 lg:pt-32">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}

        {currentView === 'login' && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
              <button onClick={() => setCurrentView('landing')} className="mb-8 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 font-bold text-sm group transition-colors">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
              
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight">Access Node</h2>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                  {(['ADMIN', 'DONOR', 'USER'] as UserRole[]).map(r => (
                    <button key={r} type="button" onClick={() => setLoginForm({...loginForm, role: r})} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${loginForm.role === r ? 'bg-white dark:bg-gray-700 text-blood-600 shadow-sm' : 'text-gray-500'}`}>{r}</button>
                  ))}
                </div>
                <input type="text" placeholder="Username / Email" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white shadow-inner" required />
                
                {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
                
                <Button isLoading={isAuthLoading} className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-xl">Authorize Access</Button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-blood-600"></div>
              
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => { if(regStep === 'email') setCurrentView('landing'); else setRegStep(regStep === 'details' ? 'otp' : 'email'); }} className="text-gray-400 hover:text-gray-800 flex items-center gap-2 font-bold text-sm transition-colors group">
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
                </button>
                <div className="flex gap-1">
                   {[1,2,3].map(s => (
                     <div key={s} className={`w-6 h-1 rounded-full ${(['email','otp','details'].indexOf(regStep) + 1) >= s ? 'bg-blood-600' : 'bg-gray-200'}`}></div>
                   ))}
                </div>
              </div>
              
              <div className="mb-10">
                <div className="w-16 h-16 bg-blood-50 dark:bg-blood-900/20 text-blood-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   {regStep === 'email' ? <Mail size={32}/> : regStep === 'otp' ? <KeyRound size={32}/> : <UserPlus size={32}/>}
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {regStep === 'email' ? 'Verify Email' : regStep === 'otp' ? 'Authorization' : 'Create Profile'}
                </h2>
              </div>

              {renderRegisterSteps()}

              <p className="mt-8 text-xs text-gray-400 font-medium">Already part of the network? <button onClick={() => setCurrentView('login')} className="text-blood-600 font-bold hover:underline">Log in</button></p>
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
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      )}
    </div>
  );
};

export default App;
