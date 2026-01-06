
import React, { useState, useEffect } from 'react';
import { Users, Activity, Key, MessageSquare, ShieldCheck, TrendingUp, BarChart2, Ban, CheckCircle, Trophy, Search, MapPin, RefreshCcw, Send, X, Phone, Building2, CheckCircle2, HeartHandshake } from 'lucide-react';
import { User, DonationRequest, Feedback, BloodStock, SecurityLog } from '../types';
import { API } from '../services/api';
import { Button } from './Button';
import { findDonorsWithAI } from '../services/geminiService';

type AdminTab = 'dashboard' | 'users' | 'feedback' | 'search';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI States for Feedback
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSearchCity, setAdminSearchCity] = useState('');
  const [adminSearchType, setAdminSearchType] = useState('All');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [u, r, f, s, l] = await Promise.all([
        API.getUsers(),
        API.getDonationRequests(),
        API.getFeedbacks(),
        API.getBloodStocks(),
        API.getSecurityLogs()
      ]);
      setUsers(u);
      setRequests(r);
      setFeedbacks(f);
      setStocks(s);
      setLogs(l);
    } catch (e) {
      console.error("Failed to sync admin data", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'Pending' | 'Approved' | 'Completed' | 'Rejected') => {
    try {
      await API.updateDonationRequestStatus(requestId, newStatus);
      await refreshData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleBlockUser = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to toggle BLOCK status for ${name}?`)) {
      await API.toggleUserStatus(id);
      refreshData();
    }
  };

  const handlePromoteUser = async (id: string, name: string) => {
    const newLevel = await API.promoteDonor(id);
    if (newLevel) {
      refreshData();
    }
  };

  const handleIssueKey = async (id: string, name: string) => {
    const key = await API.issueEmergencyKey(id);
    alert(`Emergency Key Issued to ${name}: ${key}`);
  };

  const submitReply = async (fId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      await API.replyToFeedback(fId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      await refreshData();
    } catch (error) {
      alert("Failed to send reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleAdminSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
       const results = await findDonorsWithAI(adminSearchType, adminSearchCity);
       setSearchResults(results);
    } catch (e) {
       console.error("AI Search failed", e);
    } finally {
       setIsSearching(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blood-600 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Overview</h1>
            <p className="text-gray-300">Security status: <span className="text-green-400 font-bold">Optimal</span>. All systems operational.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" isLoading={isRefreshing} className="border-white/20 text-white hover:bg-white/10 gap-2" onClick={refreshData}><RefreshCcw size={16}/> Sync Now</Button>
            <Button className="bg-blood-600 text-white border-none gap-2" onClick={() => setActiveTab('search')}><Search size={16}/> Urgent Search</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveTab('users')}>
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
             <span className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp size={12} /> Live</span>
           </div>
           <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
           <p className="text-gray-500 text-sm">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blood-50 text-blood-600 rounded-xl"><Activity size={24} /></div>
           </div>
           <h3 className="text-3xl font-bold text-gray-800">{requests.filter(r => r.status === 'Pending').length}</h3>
           <p className="text-gray-500 text-sm">Active Requests</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BarChart2 size={24} /></div>
           </div>
           <h3 className="text-3xl font-bold text-gray-800">{stocks.reduce((acc, s) => acc + s.units, 0)}</h3>
           <p className="text-gray-500 text-sm">Total Units</p>
        </div>
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveTab('feedback')}>
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><MessageSquare size={24} /></div>
           </div>
           <h3 className="text-3xl font-bold text-gray-800">{feedbacks.length}</h3>
           <p className="text-gray-500 text-sm">Feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active System Donor Feed */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                <HeartHandshake className="text-blood-600" /> Active System Donor Feed
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" isLoading={isRefreshing} className="text-xs py-1 h-auto gap-2" onClick={refreshData}>
                  <RefreshCcw size={12} /> Refresh Scan
                </Button>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] border-b border-gray-100 bg-gray-50/50">
                   <th className="p-4">Username / Identity</th>
                   <th className="p-4">City / Region</th>
                   <th className="p-4">Contact</th>
                   <th className="p-4 text-center">Group</th>
                   <th className="p-4 text-center">Date to Give</th>
                   <th className="p-4 text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {requests.filter(r => r.type === 'Donation').length > 0 ? (
                   requests.filter(r => r.type === 'Donation').map(req => (
                    <tr key={req.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50">
                      <td className="p-4 font-black text-gray-900">{req.donorName}</td>
                      <td className="p-4 text-gray-500 font-medium">{req.location || 'Local'}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-green-600 font-black font-mono text-xs">
                          <Phone size={12} /> {req.phone}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-blood-50 text-blood-700 rounded-lg font-black text-xs">
                          {req.bloodType}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-gray-600">{req.date}</td>
                      <td className="p-4 text-right">
                        {req.status === 'Pending' ? (
                          <button 
                            onClick={() => handleStatusUpdate(req.id, 'Completed')}
                            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          >
                            Pending
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800 flex items-center justify-end gap-1 ml-auto w-fit">
                            <CheckCircle2 size={10} /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                   ))
                 ) : (
                   <tr><td colSpan={6} className="py-20 text-center text-gray-300 font-black uppercase text-xs tracking-[0.2em] opacity-30">No active donor registrations</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Active System Requests Feed */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 uppercase tracking-tight">
                <Activity className="text-blood-600" /> Active System Patient Feed
              </h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
                   <th className="pb-4">Identity / Type</th>
                   <th className="pb-4">Medical Facility</th>
                   <th className="pb-4">City / Region</th>
                   <th className="pb-4">Contact Info</th>
                   <th className="pb-4 text-center">Group</th>
                   <th className="pb-4 text-center">Urgency</th>
                   <th className="pb-4 text-right">Action / Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {requests.filter(r => r.type === 'Request' || !r.type).length > 0 ? requests.filter(r => r.type === 'Request' || !r.type).map(req => (
                   <tr key={req.id} className="group hover:bg-gray-50/80 transition-colors border-b border-gray-50">
                     <td className="py-5 pr-4">
                       <div>
                         <p className="font-black text-gray-900">{req.donorName}</p>
                         <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${req.type === 'Request' ? 'text-orange-500' : 'text-blue-500'}`}>
                           {req.type || 'Request'}
                         </p>
                       </div>
                     </td>
                     <td className="py-5 pr-4">
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <Building2 size={14} className="text-gray-300" /> {req.hospital || 'General'}
                        </div>
                     </td>
                     <td className="py-5 pr-4">
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <MapPin size={14} className="text-gray-300" /> {req.location || 'N/A'}
                        </div>
                     </td>
                     <td className="py-5 pr-4">
                        <div className="flex items-center gap-2 text-green-600 font-black font-mono text-xs">
                          <Phone size={14} className="text-green-400" /> {req.phone || 'System Admin'}
                        </div>
                     </td>
                     <td className="py-5 text-center">
                       <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-black shadow-inner">
                         {req.bloodType}
                       </span>
                     </td>
                     <td className="py-5 text-center">
                       <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                         req.urgency === 'Critical' ? 'text-red-600 bg-red-50 border border-red-100' : 
                         req.urgency === 'Medium' ? 'text-orange-600 bg-orange-50 border border-orange-100' : 
                         'text-green-600 bg-green-50 border border-green-100'
                       }`}>
                         {req.urgency}
                       </span>
                     </td>
                     <td className="py-5 text-right">
                       {req.status === 'Pending' ? (
                         <button 
                          onClick={() => handleStatusUpdate(req.id, 'Completed')}
                          className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-green-600 hover:text-white hover:border-green-700 transition-all shadow-sm"
                         >
                           Pending
                         </button>
                       ) : (
                         <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-800 flex items-center justify-end gap-1 ml-auto w-fit">
                           <CheckCircle2 size={10} /> Done
                         </span>
                       )}
                     </td>
                   </tr>
                 )) : (
                   <tr><td colSpan={7} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-3 opacity-30">
                        <Activity size={48} />
                        <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No patient requests found</p>
                     </div>
                   </td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        <div className="lg:col-span-3 mt-8">
           <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600"/> Security Alerts</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {logs.map(log => (
                   <div key={log.id} className={`p-3 rounded-xl border-l-4 text-sm ${log.severity === 'Critical' ? 'bg-red-50 border-red-500' : log.severity === 'High' ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex justify-between items-center mb-1">
                         <span className={`text-xs font-bold uppercase ${log.severity === 'Critical' ? 'text-red-600' : 'text-gray-500'}`}>{log.severity}</span>
                         <span className="text-xs text-gray-400">{log.timestamp}</span>
                      </div>
                      <p className="text-gray-700">{log.message}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100">
         <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
         <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-50 border-none rounded-xl px-4 py-2 w-64 focus:ring-2 focus:ring-blood-500 font-bold"
            />
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
               <tr>
                  <th className="p-4 font-bold text-gray-600">User</th>
                  <th className="p-4 font-bold text-gray-600">Role</th>
                  <th className="p-4 font-bold text-gray-600">Performance</th>
                  <th className="p-4 font-bold text-gray-600">Status</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.role.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                     <td className="p-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                              {user.name.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.location || 'Unknown'}</p>
                           </div>
                        </div>
                     </td>
                     <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'DONOR' ? 'bg-red-100 text-red-700' : user.role === 'ADMIN' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                           {user.role}
                        </span>
                     </td>
                     <td className="p-4">
                        {user.role === 'DONOR' ? (
                           <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-blood-600">Lvl {user.level || 1}</span>
                                 <span className="text-xs text-gray-400">{user.xp || 0} XP</span>
                              </div>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blood-500" style={{ width: `${(user.xp || 0) % 100}%` }}></div>
                              </div>
                           </div>
                        ) : (
                           <span className="text-gray-400 text-xs">-</span>
                        )}
                     </td>
                     <td className="p-4">
                        {user.status === 'Blocked' ? (
                           <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold flex items-center gap-1 w-fit"><Ban size={12}/> Blocked</span>
                        ) : (
                           <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Active</span>
                        )}
                     </td>
                     <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                           {user.role === 'DONOR' && (
                              <>
                                 <button onClick={() => handlePromoteUser(user.id, user.name)} className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg" title="Promote"><Trophy size={16}/></button>
                                 <button onClick={() => handleIssueKey(user.id, user.name)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Issue Key"><Key size={16}/></button>
                              </>
                           )}
                           <button onClick={() => handleBlockUser(user.id, user.name)} className={`p-2 rounded-lg ${user.status === 'Blocked' ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-600'}`}>
                              {user.status === 'Blocked' ? <CheckCircle size={16}/> : <Ban size={16}/>}
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6 animate-fade-in-up">
       <div className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Feedback Inbox</h2>
          <span className="bg-blood-100 text-blood-700 px-4 py-1 rounded-full text-xs font-bold">{feedbacks.length} Messages</span>
       </div>
       <div className="grid grid-cols-1 gap-6">
          {feedbacks.length > 0 ? feedbacks.map(f => (
             <div key={f.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blood-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                         {f.userRole.charAt(0)}
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${f.userRole === 'DONOR' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                           {f.userRole}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">{f.date}</p>
                      </div>
                   </div>
                   {!f.reply && replyingTo !== f.id && (
                     <Button variant="outline" className="text-xs h-8 px-4 gap-2 font-black uppercase tracking-widest" onClick={() => setReplyingTo(f.id)}>
                        <MessageSquare size={12} /> Reply
                     </Button>
                   )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                  <p className="text-gray-800 font-medium italic">"{f.message}"</p>
                </div>
                
                {f.reply ? (
                  <div className="bg-blood-50 p-4 rounded-xl border border-blood-100 border-l-4 border-l-blood-600">
                    <p className="text-[10px] font-black text-blood-600 uppercase tracking-[0.2em] mb-1">Administrative Reply</p>
                    <p className="text-blood-900 text-sm font-bold">"{f.reply}"</p>
                  </div>
                ) : replyingTo === f.id ? (
                  <div className="mt-4 space-y-3 animate-fade-in-up">
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your official response here..."
                      className="w-full h-24 p-4 bg-white border border-blood-200 rounded-xl outline-none focus:ring-2 focus:ring-blood-500 font-medium text-sm transition-all"
                    />
                    <div className="flex justify-end gap-2">
                       <Button variant="outline" className="text-xs px-4" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                          <X size={14} className="mr-1"/> Cancel
                       </Button>
                       <Button 
                        onClick={() => submitReply(f.id)} 
                        isLoading={isSubmittingReply}
                        disabled={!replyText.trim()}
                        className="text-xs px-6 gap-2 font-black uppercase tracking-widest"
                       >
                          <Send size={14} /> Send Reply
                       </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Awaiting response from Control Center...</p>
                )}
             </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <MessageSquare className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest">No feedback received in this cycle.</p>
            </div>
          )}
       </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-fade-in-up">
       <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Search className="text-blood-600"/> Admin Emergency Search</h2>
          <div className="flex flex-col md:flex-row gap-4">
              <select value={adminSearchType} onChange={(e) => setAdminSearchType(e.target.value)} className="p-4 rounded-xl bg-gray-50 border-none font-bold">
                <option value="All">All Types</option>
                <option value="A+">A+</option><option value="O+">O+</option>
              </select>
              <input type="text" placeholder="City or Region" value={adminSearchCity} onChange={(e) => setAdminSearchCity(e.target.value)} className="flex-1 p-4 rounded-xl bg-gray-50 border-none font-bold" />
              <Button onClick={handleAdminSearch} disabled={isSearching} className="px-8 font-black uppercase tracking-widest">{isSearching ? 'Scanning...' : 'Locate'}</Button>
          </div>
       </div>
       {isSearching ? (
          <div className="text-center py-12">
             <div className="w-12 h-12 border-4 border-blood-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-gray-500 font-bold">Scanning network...</p>
          </div>
       ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {searchResults.map(res => (
               <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-blood-600 flex items-start gap-4">
                  <div className="w-12 h-12 bg-blood-100 text-blood-700 rounded-full flex items-center justify-center font-bold text-lg">{res.bloodType}</div>
                  <div className="flex-1">
                     <h4 className="font-bold text-gray-900 text-lg">{res.name}</h4>
                     <p className="text-gray-500 flex items-center gap-1 text-sm"><MapPin size={14}/> {res.location}</p>
                     <div className="mt-3 flex gap-2"><Button className="text-xs h-auto py-1 px-4">Secure Contact</Button></div>
                  </div>
               </div>
             ))}
          </div>
       ) : null}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2 w-full md:w-auto">
         <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Dashboard</button>
         <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>User Management</button>
         <button onClick={() => setActiveTab('feedback')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'feedback' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Feedback Inbox</button>
         <button onClick={() => setActiveTab('search')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-blood-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Blood Search</button>
      </div>
      <div className="min-h-[500px]">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'users' && renderUsers()}
         {activeTab === 'feedback' && renderFeedback()}
         {activeTab === 'search' && renderSearch()}
      </div>
    </div>
  );
};
