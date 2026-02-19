
import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Camera, Mail, Phone, Lock, Eye, EyeOff, 
  Palette, Type, Globe, Clock, Calendar, 
  Trash2, AlertTriangle, CheckCircle2, X, Save, ShieldAlert, Droplet,
  Server, Link, Settings
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

type SettingsTab = 'profile' | 'network' | 'security';

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  user, onClose, onUpdate, onLogout, isDarkMode, onToggleTheme 
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(user._id === 'guest' ? 'network' : 'profile');
  const [isLoading, setIsLoading] = useState(false);
  const [serverIp, setServerIp] = useState(() => localStorage.getItem('bloodbank_server_ip') || 'localhost');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    bloodType: user.bloodType || 'O+',
    accentColor: user.accentColor || 'blood',
    fontSize: user.fontSize || 'medium',
    avatarUrl: user.avatarUrl || ''
  });
  
  const handleSaveNetwork = () => {
    localStorage.setItem('bloodbank_server_ip', serverIp);
    alert(`Network Target Set to: ${serverIp}. App will now attempt to sync with this MySQL host.`);
    window.location.reload();
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updated = await API.updateUserProfile(user._id, formData);
      onUpdate(updated);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile record.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Display Identity</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Blood Group</label>
                <select value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold appearance-none">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleSaveProfile} isLoading={isLoading} className="w-full py-4 rounded-2xl">Update Profile</Button>
          </div>
        );
      
      case 'network':
        return (
          <div className="space-y-8 text-left">
            <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
               <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Globe size={24}/></div>
               <div>
                  <h4 className="font-black text-blue-900 uppercase text-sm">XAMPP Centralized Storage</h4>
                  <p className="text-xs text-blue-700 mt-1">To see data on other laptops, enter the IP address of the laptop running XAMPP.</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><Server size={12}/> Host IP Address</label>
                  <input 
                    type="text" 
                    value={serverIp} 
                    onChange={e => setServerIp(e.target.value)}
                    placeholder="e.g. 192.168.1.15"
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-mono font-bold text-gray-900 border-2 border-transparent focus:border-blood-500 transition-all"
                  />
                  <p className="text-[10px] text-gray-400 font-medium px-1">Default: 'localhost' (for same machine). Use IPv4 for network sync.</p>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2"><Link size={12}/> API Endpoint</label>
                  <div className="p-4 bg-gray-100 rounded-2xl text-[10px] font-mono text-gray-500 break-all">
                    http://{serverIp}/bloodbank-api/api.php
                  </div>
               </div>

               <Button onClick={handleSaveNetwork} className="w-full py-5 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest">
                  Establish Network Link
               </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-fade-in-up">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[70vh]">
        <div className="w-full md:w-72 border-r border-gray-100 bg-gray-50/50 p-8 flex flex-col gap-3">
          {(['profile', 'network', 'security'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-blood-600 text-white shadow-xl' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'network' ? <Globe size={18} /> : tab === 'profile' ? <UserIcon size={18} /> : <Settings size={18} />}
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{activeTab} configuration</h4>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-blood-600 transition-colors"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
