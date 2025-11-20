import React, { useState, useEffect } from 'react';
import { Search, MapPin, Droplet, Phone, MessageCircle, Activity, AlertTriangle, Filter, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { User, Hospital, BloodStock } from '../types';
import { MockBackend } from '../services/mockBackend';
import { findDonorsWithAI } from '../services/geminiService';
import { Button } from './Button';

export const UserPanel: React.FC = () => {
  const [bloodType, setBloodType] = useState('All');
  const [city, setCity] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodStocks, setBloodStocks] = useState<BloodStock[]>([]);
  const [sosActive, setSosActive] = useState(false);
  
  // UI States
  const [isSearching, setIsSearching] = useState(false);
  const [showAllHospitals, setShowAllHospitals] = useState(false);
  const [showAllStocks, setShowAllStocks] = useState(false);

  useEffect(() => {
    setHospitals(MockBackend.getHospitals());
    setBloodStocks(MockBackend.getBloodStocks());
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]); // Clear previous results

    // 1. Simulated Buffer (2 seconds) for effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Fetch AI Data (or fallback)
    try {
      const results = await findDonorsWithAI(bloodType, city);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed", error);
      // Fallback to mock backend if extremely critical error
      setSearchResults(MockBackend.searchDonors(bloodType, city));
    } finally {
      setIsSearching(false);
    }
  };

  const showFakeAlert = (msg: string) => alert(`Mock Data: ${msg}`);

  const displayedHospitals = showAllHospitals ? hospitals : hospitals.slice(0, 3);
  const displayedStocks = showAllStocks ? bloodStocks : bloodStocks.slice(0, 3);

  return (
    <div className="space-y-10 pb-12">
      {/* Top Action Bar & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOS Section */}
        <div className={`rounded-3xl p-8 shadow-xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${sosActive ? 'bg-red-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
               <div className={`p-3 rounded-full ${sosActive ? 'bg-white/20' : 'bg-red-50 text-red-600'}`}>
                 <AlertTriangle size={24} />
               </div>
               <h2 className="text-2xl font-bold">Emergency SOS</h2>
             </div>
             <p className={`mb-6 text-lg ${sosActive ? 'text-red-100' : 'text-gray-500'}`}>
               {sosActive ? 'Broadcasting urgent need to 124 donors nearby...' : 'Instantly notify all donors in your area for critical blood needs.'}
             </p>
             <Button 
              onClick={() => setSosActive(!sosActive)}
              className={`w-full py-4 text-lg rounded-xl border-none ${sosActive ? 'bg-white text-red-600 hover:bg-gray-100' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30'}`}
             >
               {sosActive ? 'Cancel Broadcast' : 'Broadcast Alert'}
             </Button>
          </div>
          {sosActive && (
             <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-red-600 animate-pulse"></div>
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
             </div>
          )}
        </div>

        {/* Blood Stock Visuals */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="text-blood-600"/> Live Stock Levels</h2>
             <Button 
                variant="outline" 
                className="text-xs gap-1" 
                onClick={() => setShowAllStocks(!showAllStocks)}
             >
               {showAllStocks ? 'Show Less' : 'View All Stocks'} {showAllStocks ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
             </Button>
           </div>
           
           {/* Horizontal Liquid Bars */}
           <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {displayedStocks.map(stock => (
                <div key={stock.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors" onClick={() => showFakeAlert(`Stock Info: ${stock.hospitalName}`)}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs">{stock.bloodType}</span>
                      <span className="truncate max-w-[150px] md:max-w-none">{stock.hospitalName}</span>
                    </span>
                    <span className={stock.units < 10 ? 'text-red-500' : 'text-green-500'}>{stock.units} Units</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full relative overflow-hidden ${stock.units < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((stock.units / stock.maxCapacity) * 100, 100)}%` }}
                    >
                       <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Search & Results */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
           <h2 className="text-2xl font-bold mb-6">Find a Donor</h2>
           <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                 <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                 <select 
                    value={bloodType} 
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blood-500 appearance-none"
                  >
                    <option value="All">All Blood Types</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
              </div>
              <div className="flex-[2] relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                 <input 
                  type="text" 
                  placeholder="Enter City or Zip Code (e.g., New York)" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-blood-500"
                 />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="px-8 py-4 rounded-xl shadow-lg shadow-blood-500/20 min-w-[160px]"
              >
                {isSearching ? 'Searching...' : 'Search Donors'}
              </Button>
           </div>
        </div>

        <div className="p-8 bg-gray-50 min-h-[300px]">
           {isSearching ? (
              <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
                <div className="w-12 h-12 border-4 border-blood-200 border-t-blood-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Scanning donor network via Gemini AI...</p>
              </div>
           ) : searchResults.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {searchResults.map(donor => (
                 <div key={donor.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blood-100 to-blood-200 flex items-center justify-center text-blood-700 font-bold text-lg shadow-inner">
                          {donor.bloodType}
                       </div>
                       <div className="flex-1">
                         <h3 className="font-bold text-gray-800">{donor.name}</h3>
                         <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><MapPin size={10} /> {donor.location}</p>
                         {donor.phone && (
                           <p className="text-xs font-bold text-green-600 flex items-center gap-1"><Phone size={10} /> {donor.phone}</p>
                         )}
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 text-sm h-10 rounded-lg bg-blood-600" onClick={() => showFakeAlert(`Request sent to ${donor.name}`)}>Request</Button>
                      <Button variant="secondary" className="h-10 w-10 p-0 rounded-lg flex items-center justify-center bg-gray-100" onClick={() => showFakeAlert(`Opening chat with ${donor.name}`)}><MessageCircle size={18}/></Button>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                   <Search size={32} className="text-gray-400" />
                </div>
                <p>Enter a city or select a blood type to find donors.</p>
                <p className="text-xs mt-2 text-gray-300">Try searching "New York" or "Seattle"</p>
             </div>
           )}
        </div>
      </div>

      {/* Partner Hospitals */}
      <div>
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-gray-800">Nearby Medical Centers</h2>
           <Button 
              variant="outline" 
              onClick={() => setShowAllHospitals(!showAllHospitals)}
              className="flex items-center gap-2"
           >
             {showAllHospitals ? 'View Less' : 'View All Hospitals'} {showAllHospitals ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
           </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
           {displayedHospitals.map(h => (
             <div key={h.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blood-200 transition-colors cursor-pointer group" onClick={() => showFakeAlert(`Navigating to hospital details: ${h.name}`)}>
                <h3 className="font-bold text-lg group-hover:text-blood-600 transition-colors mb-1">{h.name}</h3>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2"><MapPin size={12}/> {h.address}</p>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2"><MapPin size={12} className="opacity-0"/> {h.city}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                   <span className="text-xs font-mono text-gray-400 flex items-center gap-1"><Phone size={12}/> {h.phone}</span>
                   <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blood-600 group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};