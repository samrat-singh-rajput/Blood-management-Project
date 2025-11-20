
import React, { useState, useEffect } from 'react';
import { Users, Activity, Key, MessageSquare, ShieldCheck, TrendingUp, BarChart2, AlertTriangle, Ban, CheckCircle, Trophy, Search, MapPin, Droplet, Phone, Lock, RefreshCcw } from 'lucide-react';
import { User, DonationRequest, Feedback, BloodStock, SecurityLog } from '../types';
import { MockBackend } from '../services/mockBackend';
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

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSearchCity, setAdminSearchCity] = useState('');
  const [adminSearchType, setAdminSearchType] = useState('All');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(MockBackend.getAllUsers());
    setRequests(MockBackend.getRequests());
    setFeedbacks(MockBackend.getFeedbacks());
    setStocks(MockBackend.getBloodStocks());
    setLogs(MockBackend.getSecurityLogs());
  };

  const generateKey = () => {
    setGeneratedKey(`BLOOD-KEY-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleBlockUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to toggle BLOCK status for ${name}?`)) {
      MockBackend.toggleUserStatus(id);
      refreshData(); // Refresh UI
      alert(`Status updated for ${name}`);
    }
  };

  const handlePromoteUser = (id: string, name: string) => {
    const newLevel = MockBackend.promoteDonor(id);
    if (newLevel) {
      refreshData();
      alert(`${name} promoted to Level ${newLevel}!`);
    }
  };

  const handleIssueKey = (id: string, name: string) => {
    const key = MockBackend.issueEmergencyKey(id);
    alert(`Emergency Key Issued to ${name}: ${key}`);
  };

  const handleAdminSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    // Mock Buffer
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
       const results = await findDonorsWithAI(adminSearchType, adminSearchCity);
       setSearchResults(results);
    } catch (e) {
       setSearchResults(MockBackend.searchDonors(adminSearchType, adminSearchCity));
    } finally {
       setIsSearching(false);
    }
  };

  const showFakeData = (msg: string) => {
    alert(`Mock Data: ${msg}`);
  };

  // --- Sub-Components ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blood-600 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Overview</h1>
            <p className="text-gray-300">Security status: <span className="text-green-400 font-bold">Optimal</span>. All systems operational.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2" onClick={refreshData}><RefreshCcw size={16}/> Refresh</Button>
            <Button className="bg-blood-600 text-white border-none gap-2" onClick={() => setActiveTab('search')}><Search size={16}/> Urgent Search</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveTab('users')}>
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
             <span className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp size={12} /> +12%</span>
           </div>
           <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
           <p className="text-gray-500 text-sm">Total Users</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blood-50 text-blood-600 rounded-xl"><Activity size={24} /></div>
           </div>
           <h3 className="text-3xl font-bold text-gray-800">{requests.length}</h3>
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
        {/* Recent Requests Table (Expanded) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-md border border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">Recent Donation Requests</h3>
              <Button variant="outline" className="text-xs">View All</Button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                   <th className="pb-3 font-medium">Donor/User</th>
                   <th className="pb-3 font-medium">Location/Hospital</th>
                   <th className="pb-3 font-medium">Type</th>
                   <th className="pb-3 font-medium">Urgency</th>
                   <th className="pb-3 font-medium">Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {requests.map(req => (
                   <tr key={req.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50">
                     <td className="py-4 font-medium text-gray-800">{req.donorName}</td>
                     <td className="py-4 text-gray-500">{req.hospital || 'General Request'}</td>
                     <td className="py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{req.bloodType}</span></td>
                     <td className="py-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${req.urgency === 'Critical' ? 'text-red-600 bg-red-50' : req.urgency === 'Medium' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                         {req.urgency}
                       </span>
                     </td>
                     <td className="py-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                         req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                       }`}>
                         {req.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Security Widget */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600"/> Security Alerts</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                 {logs.map(log => (
                   <div key={log.id} className={`p-3 rounded-xl border-l-4 text-sm ${log.severity === 'Critical' ? 'bg-red-50 border-red-500' : log.severity === 'High' ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-300'}`}>
                      <div className="flex justify-between items-center mb-1">
                         <span className={`text-xs font-bold uppercase ${log.severity === 'Critical' ? 'text-red-600' : 'text-gray-500'}`}>{log.severity}</span>
                         <span className="text-xs text-gray-400">{log.timestamp.split(' ')[1]}</span>
                      </div>
                      <p className="text-gray-700">{log.message}</p>
                      {log.user && <p className="text-xs text-gray-500 mt-1">User: {log.user}</p>}
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-xl">
             <h3 className="font-bold text-lg mb-2">Generate Access Key</h3>
             <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl text-center mb-4 border border-white/10">
               <span className="font-mono text-lg font-bold tracking-widest">{generatedKey || '••••-••••'}</span>
             </div>
             <Button onClick={generateKey} className="w-full !bg-white !text-gray-900 hover:!bg-gray-100 border-none">Generate New</Button>
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
              className="bg-gray-50 border-none rounded-xl px-4 py-2 w-64 focus:ring-2 focus:ring-blood-500"
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
                              {/* Mini Progress */}
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-blood-500" style={{ width: '45%' }}></div>
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
                                 <button onClick={() => handlePromoteUser(user.id, user.name)} className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg" title="Promote / Reward"><Trophy size={16}/></button>
                                 <button onClick={() => handleIssueKey(user.id, user.name)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Issue Emergency Key"><Key size={16}/></button>
                              </>
                           )}
                           <button 
                              onClick={() => handleBlockUser(user.id, user.name)} 
                              className={`p-2 rounded-lg ${user.status === 'Blocked' ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-600'}`} 
                              title={user.status === 'Blocked' ? 'Unblock' : 'Block'}
                           >
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
       <div className="bg-white p-6 rounded-3xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Feedback Inbox</h2>
       </div>
       <div className="grid grid-cols-1 gap-4">
          {feedbacks.map(f => (
             <div key={f.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blood-200 transition-all">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${f.userRole === 'DONOR' ? 'bg-red-100 text-red-700' : f.userRole === 'HOSPITAL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                         {f.userRole}
                      </span>
                      <span className="text-xs text-gray-400">{f.date}</span>
                   </div>
                   <Button variant="outline" className="text-xs h-8 px-3">Reply</Button>
                </div>
                <p className="text-gray-800 italic">"{f.message}"</p>
                <p className="text-xs text-gray-400 mt-2">User ID: {f.userId}</p>
             </div>
          ))}
       </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-6 animate-fade-in-up">
       <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Search className="text-blood-600"/> Admin Emergency Search</h2>
          <p className="text-gray-500 mb-8">Locate blood or donors immediately for critical hospital requests. This tool bypasses privacy filters for admin use.</p>
          
          <div className="flex flex-col md:flex-row gap-4">
              <select 
                 value={adminSearchType} 
                 onChange={(e) => setAdminSearchType(e.target.value)}
                 className="p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blood-500"
              >
                <option value="All">All Types</option>
                <option value="A+">A+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
              </select>
              <input 
                 type="text" 
                 placeholder="City or Region" 
                 value={adminSearchCity}
                 onChange={(e) => setAdminSearchCity(e.target.value)}
                 className="flex-1 p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blood-500"
              />
              <Button onClick={handleAdminSearch} disabled={isSearching} className="px-8">{isSearching ? 'Scanning...' : 'Locate'}</Button>
          </div>
       </div>

       {isSearching ? (
          <div className="text-center py-12">
             <div className="w-12 h-12 border-4 border-blood-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-gray-500">Accessing secure donor database...</p>
          </div>
       ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {searchResults.map(res => (
               <div key={res.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-blood-600 flex items-start gap-4">
                  <div className="w-12 h-12 bg-blood-100 text-blood-700 rounded-full flex items-center justify-center font-bold text-lg">{res.bloodType}</div>
                  <div className="flex-1">
                     <h4 className="font-bold text-gray-900 text-lg">{res.name}</h4>
                     <p className="text-gray-500 flex items-center gap-1 text-sm"><MapPin size={14}/> {res.location}</p>
                     <div className="mt-3 flex gap-2">
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-mono font-bold flex items-center gap-2"><Phone size={14}/> {res.phone}</div>
                        <Button className="text-xs h-auto py-1">Contact</Button>
                     </div>
                  </div>
               </div>
             ))}
          </div>
       ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <p className="text-gray-400">Results will appear here.</p>
          </div>
       )}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2 w-full md:w-auto">
         <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Dashboard</button>
         <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>User Management</button>
         <button onClick={() => setActiveTab('feedback')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'feedback' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Feedback</button>
         <button onClick={() => setActiveTab('search')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'search' ? 'bg-blood-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>Blood Search</button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'users' && renderUsers()}
         {activeTab === 'feedback' && renderFeedback()}
         {activeTab === 'search' && renderSearch()}
      </div>
    </div>
  );
};
