
import React, { useState, useEffect } from 'react';
import { 
  Droplet, LogOut, ArrowLeft, Settings, Mail, ShieldCheck, 
  Lock, UserPlus, LogIn, CheckCircle2, AlertTriangle, User as UserIcon,
  ChevronRight, Globe, Shield
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
type SignupStep = 'google_login' | 'google_pass' | 'details';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const saved = localStorage.getItem('bloodbank_current_user');
    return saved ? 'dashboard' : 'landing';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bloodbank_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('bloodbank_theme') === 'dark');

  // Multi-Step Registration States
  const [regStep, setRegStep] = useState<SignupStep>('google_login');
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regDetails, setRegDetails] = useState({ username: '', password: '', role: UserRole.USER });

  const [loginForm, setLoginForm] = useState({ username: '', password: '', role: UserRole.USER });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('bloodbank_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bloodbank_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bloodbank_current_user');
    }
  }, [currentUser]);

  const handleSimulatedGoogleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await API.checkEmail(regEmail);
      if (res.success) {
        setRegStep('google_pass');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Verification Error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSimulatedGooglePass = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    // Simulate short network delay for realism
    setTimeout(() => {
      setRegStep('details');
      setIsAuthLoading(false);
    }, 800);
  };

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

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      const user = await API.completeSignup({
        email: regEmail,
        name: regName || regEmail.split('@')[0],
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
    setRegStep('google_login');
    setRegEmail('');
  };

  const renderRegisterContent = () => {
    switch(regStep) {
      case 'google_login':
        return (
          <form onSubmit={handleSimulatedGoogleEmail} className="space-y-6 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in with Google</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use your Google Account to continue to BloodBank</p>
            
            <div className="text-left space-y-1">
              <div className="relative">
                <input 
                  type="email" required placeholder="Email or phone" 
                  value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-base" 
                />
              </div>
              <button type="button" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">Forgot email?</button>
            </div>

            {authError && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 text-left">{authError}</div>}
            
            <div className="pt-4 flex justify-between items-center">
              <button type="button" onClick={() => setCurrentView('landing')} className="text-blue-600 dark:text-blue-400 font-bold text-sm">Create account</button>
              <Button isLoading={isAuthLoading} className="!bg-blue-600 text-white px-8 rounded-lg shadow-md">Next</Button>
            </div>
          </form>
        );
      case 'google_pass':
        return (
          <form onSubmit={handleSimulatedGooglePass} className="space-y-6 animate-fade-in-up">
            <div className="flex justify-center mb-2">
              <div className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                  {(regEmail || '').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{regEmail}</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome</h2>
            
            <div className="text-left space-y-1">
              <input 
                type="password" required placeholder="Enter your password" 
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-base" 
              />
              <button type="button" className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">Forgot password?</button>
            </div>

            <div className="pt-6 flex justify-between items-center">
              <button type="button" onClick={() => setRegStep('google_login')} className="text-blue-600 dark:text-blue-400 font-bold text-sm">Back</button>
              <Button isLoading={isAuthLoading} className="!bg-blue-600 text-white px-8 rounded-lg shadow-md">Verify</Button>
            </div>
          </form>
        );
      case 'details':
        return (
          <form onSubmit={handleCompleteSignup} className="space-y-5 animate-fade-in-up text-left">
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Google Verified</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{regEmail}</p>
              </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Setup Local Profile</h3>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
               {(['USER', 'DONOR'] as UserRole[]).map(r => (
                 <button key={r} type="button" onClick={() => setRegDetails({...regDetails, role: r})} className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${regDetails.role === r ? 'bg-white dark:bg-gray-700 text-blood-600 shadow-sm' : 'text-gray-500'}`}>{r} NODE</button>
               ))}
            </div>

            <input 
              type="text" placeholder="Desired Username" required 
              value={regDetails.username} onChange={e => setRegDetails({...regDetails, username: e.target.value})} 
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-none font-bold shadow-inner focus:ring-2 focus:ring-blood-500 outline-none" 
            />
            <input 
              type="password" placeholder="System Password" required 
              value={regDetails.password} onChange={e => setRegDetails({...regDetails, password: e.target.value})} 
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-none font-bold shadow-inner focus:ring-2 focus:ring-blood-500 outline-none" 
            />
            
            {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
            
            <Button isLoading={isAuthLoading} className="w-full py-5 rounded-2xl bg-blood-600 text-white font-black uppercase tracking-widest shadow-xl">Join the Network</Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <nav className={`fixed w-full z-40 transition-all ${currentView === 'landing' ? 'bg-gray-900/95 border-b border-white/10 py-5' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b dark:border-gray-800 shadow-sm py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6" onClick={() => !currentUser && setCurrentView('landing')}>
            <div className="bg-blood-600 text-white p-2.5 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform"><Droplet size={26} fill="currentColor"/></div>
            <span className={`text-2xl font-black tracking-tighter cursor-pointer ${currentView === 'landing' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>BloodBank</span>
          </div>
          <div className="flex items-center gap-4">
             {!currentUser ? (
               <div className="flex items-center gap-4">
                  <Button onClick={() => setCurrentView('login')} variant="outline" className={`border-none ${currentView === 'landing' ? 'text-white' : 'text-gray-600'}`}>Login</Button>
                  <Button onClick={() => setCurrentView('register')} className="bg-blood-600 text-white px-8 rounded-xl shadow-xl">Sign Up</Button>
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
            <div className="bg-white dark:bg-gray-900 p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
              <button onClick={() => setCurrentView('landing')} className="mb-8 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2 font-bold text-sm transition-colors group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight">Access Node</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                  {(['ADMIN', 'DONOR', 'USER'] as UserRole[]).map(r => (
                    <button key={r} type="button" onClick={() => setLoginForm({...loginForm, role: r})} className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${loginForm.role === r ? 'bg-white dark:bg-gray-700 text-blood-600 shadow-sm' : 'text-gray-500'}`}>{r}</button>
                  ))}
                </div>
                <input 
                  type="text" placeholder="Username / Email" 
                  value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-none font-bold shadow-inner focus:ring-2 focus:ring-blood-500 outline-none" required 
                />
                <input 
                  type="password" placeholder="Password" 
                  value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl border-none font-bold shadow-inner focus:ring-2 focus:ring-blood-500 outline-none" required 
                />
                {authError && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{authError}</div>}
                <Button isLoading={isAuthLoading} className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-xl">Authorize Access</Button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 relative overflow-hidden text-center transition-all">
              {regStep !== 'details' && <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>}
              {regStep === 'details' && <div className="absolute top-0 left-0 w-full h-1.5 bg-blood-600"></div>}
              
              {renderRegisterContent()}

              <p className="mt-8 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                Protected by Google Safety Protocol 
              </p>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && currentUser && (
          <main className="container mx-auto px-6 py-12 animate-fade-in-up">
            {currentUser.role === UserRole.ADMIN ? <AdminPanel user={currentUser} /> : currentUser.role === UserRole.DONOR ? <DonorPanel user={currentUser} /> : <UserPanel user={currentUser} />}
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
