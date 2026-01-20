
import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Camera, Mail, Phone, Lock, Eye, EyeOff, 
  Sun, Moon, Palette, Type, Globe, Clock, Calendar, 
  Trash2, AlertTriangle, CheckCircle2, X, Save, ShieldAlert, Droplet
} from 'lucide-react';
import { User } from '../types';
import { API } from '../services/api';
import { Button } from './Button';

interface SettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'preferences' | 'security';

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  user, onClose, onUpdate, onLogout, isDarkMode, onToggleTheme 
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    bloodType: user.bloodType || 'O+',
    accentColor: user.accentColor || 'blood',
    fontSize: user.fontSize || 'medium',
    language: user.language || 'en',
    timeFormat: user.timeFormat || '12',
    dateFormat: user.dateFormat || 'DD/MM/YYYY',
    avatarUrl: user.avatarUrl || ''
  });
  
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updated = await API.updateUserProfile(user.id, formData);
      onUpdate(updated);
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Failed to update settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    try {
      await API.changePassword(user.id, passwords.new);
      setPasswords({ old: '', new: '', confirm: '' });
      alert("Password changed successfully!");
    } catch (err) {
      alert("Error changing password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, avatarUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (confirm("THIS ACTION IS PERMANENT. Are you absolutely sure?")) {
      await API.deleteAccount(user.id);
      onLogout();
    }
  };

  const handleDeactivate = async () => {
    if (confirm("Deactivating your account will hide your profile from search until you log back in. Continue?")) {
      await API.updateUserProfile(user.id, { status: 'Inactive' });
      onLogout();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in-up text-left">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full bg-blood-100 dark:bg-blood-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-blood-600" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Change Identity Image</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Display Identity</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none font-bold dark:text-white border-none focus:ring-2 focus:ring-blood-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Blood Group</label>
                <div className="relative">
                  <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    value={formData.bloodType} 
                    onChange={e => setFormData({...formData, bloodType: e.target.value})} 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none font-bold dark:text-white border-none focus:ring-2 focus:ring-blood-500 appearance-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Gmail System Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none font-bold dark:text-white border-none focus:ring-2 focus:ring-blood-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Authenticated Mobile Node</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none font-bold dark:text-white border-none focus:ring-2 focus:ring-blood-500" />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'appearance':
        return (
          <div className="space-y-8 animate-fade-in-up text-left">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="text-blue-400" /> : <Sun className="text-orange-400" />}
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Illumination Mode</p>
                  <p className="text-xs text-gray-500">Toggle dark or light system interface</p>
                </div>
              </div>
              <button onClick={onToggleTheme} className={`w-14 h-8 rounded-full transition-colors relative ${isDarkMode ? 'bg-blood-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Chromatic Accent</p>
              <div className="grid grid-cols-4 gap-3">
                {(['blood', 'blue', 'green', 'purple'] as const).map(color => (
                  <button 
                    key={color} 
                    onClick={() => setFormData({...formData, accentColor: color})}
                    className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center ${formData.accentColor === color ? 'border-gray-900 dark:border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: color === 'blood' ? '#e11d48' : color === 'blue' ? '#2563eb' : color === 'green' ? '#16a34a' : '#9333ea' }}
                  >
                    {formData.accentColor === color && <CheckCircle2 size={20} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Typography Scale</p>
              <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button 
                    key={size} 
                    onClick={() => setFormData({...formData, fontSize: size})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${formData.fontSize === size ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6 animate-fade-in-up text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} /> System Dialect
                </label>
                <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value as any})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white focus:ring-2 focus:ring-blood-500">
                  <option value="en">English (Universal)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Temporal Format
                </label>
                <select value={formData.timeFormat} onChange={e => setFormData({...formData, timeFormat: e.target.value as any})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white focus:ring-2 focus:ring-blood-500">
                  <option value="12">12-Hour Cycle (AM/PM)</option>
                  <option value="24">24-Hour Military Cycle</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Chronology Display
                </label>
                <select value={formData.dateFormat} onChange={e => setFormData({...formData, dateFormat: e.target.value as any})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white focus:ring-2 focus:ring-blood-500">
                  <option value="DD/MM/YYYY">DD / MM / YYYY (International)</option>
                  <option value="MM/DD/YYYY">MM / DD / YYYY (US)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-10 animate-fade-in-up text-left">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><Lock size={12}/> Secure Passcode Update</p>
              <div className="space-y-3">
                <input required type={showPass ? "text" : "password"} placeholder="Current Passcode" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white focus:ring-2 focus:ring-blood-500" />
                <div className="relative">
                  <input required type={showPass ? "text" : "password"} placeholder="New Secure Passcode" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white focus:ring-2 focus:ring-blood-500" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input required type={showPass ? "text" : "password"} placeholder="Confirm New Passcode" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none font-bold dark:text-white focus:ring-2 focus:ring-blood-500" />
              </div>
              <Button type="submit" className="w-full py-4 text-xs uppercase font-black tracking-widest">Update Security Credentials</Button>
            </form>

            <div className="pt-6 border-t dark:border-gray-800 space-y-6">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1 flex items-center gap-2"><ShieldAlert size={12}/> Critical Zone</p>
              
              <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30 space-y-6">
                <div>
                  <h4 className="font-black text-red-600 text-sm uppercase">Deactivate Presence</h4>
                  <p className="text-xs text-gray-500 mt-1">Temporarily hide your node from the registry. You can restore access by logging in again.</p>
                  <Button variant="outline" onClick={handleDeactivate} className="mt-4 !border-red-200 !text-red-600 hover:!bg-red-600 hover:!text-white text-[10px] uppercase font-black px-6">Deactivate Now</Button>
                </div>

                <div className="pt-6 border-t border-red-100 dark:border-red-900/30">
                  <h4 className="font-black text-red-600 text-sm uppercase">Purge Database Record</h4>
                  <p className="text-xs text-gray-500 mt-1">Permanently remove all your donor history, certificates, and identity data.</p>
                  <div className="mt-4 flex gap-2">
                    <input type="text" placeholder="Type 'DELETE' to confirm" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} className="flex-1 p-3 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl outline-none text-xs font-black text-red-600 uppercase tracking-widest" />
                    <Button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'} className="bg-red-600 text-white text-[10px] uppercase font-black px-6 rounded-xl hover:bg-red-700">Purge Record</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in-up">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-gray-100 dark:border-gray-800 transition-colors">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-950/50 border-r border-gray-100 dark:border-gray-800 p-8 flex flex-col gap-2">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Settings</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Node Preferences</p>
          </div>

          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-black uppercase transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-gray-800 shadow-xl text-blood-600' : 'text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
            <UserIcon size={18} /> Identity
          </button>
          <button onClick={() => setActiveTab('appearance')} className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-black uppercase transition-all ${activeTab === 'appearance' ? 'bg-white dark:bg-gray-800 shadow-xl text-blood-600' : 'text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
            <Sun size={18} /> Interface
          </button>
          <button onClick={() => setActiveTab('preferences')} className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-black uppercase transition-all ${activeTab === 'preferences' ? 'bg-white dark:bg-gray-800 shadow-xl text-blood-600' : 'text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
            <Globe size={18} /> Regional
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-black uppercase transition-all ${activeTab === 'security' ? 'bg-white dark:bg-gray-800 shadow-xl text-blood-600' : 'text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
            <Lock size={18} /> Security
          </button>

          <div className="mt-auto pt-8">
            <button onClick={onLogout} className="flex items-center gap-3 p-4 rounded-2xl text-sm font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all w-full">
              <Trash2 size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Database Stream</span>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400"><X/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white dark:bg-gray-900">
             {renderTabContent()}
          </div>

          <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20 flex justify-between items-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Changes will synchronize to all cluster nodes</p>
             <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="rounded-xl px-10 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">Cancel</Button>
                <Button onClick={handleSave} isLoading={isLoading} className="rounded-xl px-14 font-black uppercase text-xs tracking-widest shadow-xl shadow-blood-500/20">
                  <Save size={16} className="mr-2" /> Save Config
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
