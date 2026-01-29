
import React, { useEffect, useState } from 'react';
import { Heart, Activity, Users, ChevronRight, Info, Droplet, Calendar, MapPin, ShieldCheck, Phone, Mail, X, ShieldAlert, FileText, Globe } from 'lucide-react';
import { Button } from './Button';
import { MockBackend } from '../services/mockBackend';
import { Campaign } from '../types';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'register') => void;
}

interface InfoContent {
  title: string;
  body: React.ReactNode;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({ donors: 0, lives: 0, hospitals: 0 });
  const [activeInfo, setActiveInfo] = useState<InfoContent | null>(null);

  useEffect(() => {
    setCampaigns(MockBackend.getCampaigns());
    
    // Animate stats on mount
    const interval = setInterval(() => {
      setStats(prev => ({
        donors: Math.min(prev.donors + 120, 15000),
        lives: Math.min(prev.lives + 350, 45000),
        hospitals: Math.min(prev.hospitals + 1, 120),
      }));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const scrollToLearnMore = () => {
    const element = document.getElementById('learn-more');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const showFeatureAlert = (feature: string) => {
    alert(`Mock Data: Loading details for ${feature}...`);
  };

  const handleInfoLink = (title: string) => {
    const contents: Record<string, React.ReactNode> = {
      'Terms & Conditions': (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-bold text-gray-900 dark:text-white">1. User Eligibility</p>
          <p>By using the LifeFlow platform, you confirm that you are at least 18 years of age (or have parental consent for donation in specific jurisdictions) and are mentally sound to enter into this agreement.</p>
          <p className="font-bold text-gray-900 dark:text-white">2. Medical Accuracy</p>
          <p>Users and Donors are responsible for providing accurate medical history. LifeFlow is a connection platform and does not perform medical screening; this is the responsibility of the receiving hospital facility.</p>
          <p className="font-bold text-gray-900 dark:text-white">3. System Misuse</p>
          <p>Any attempt to falsify blood requests or donor credentials will result in an immediate permanent ban and reported to relevant medical authorities.</p>
        </div>
      ),
      'Privacy Policy': (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p className="font-bold text-gray-900 dark:text-white">Data Encryption</p>
          <p>Your personal health data is encrypted using AES-256 standards. We do not sell user data to third-party insurance or pharmaceutical companies.</p>
          <p className="font-bold text-gray-900 dark:text-white">Anonymity</p>
          <p>Donors have the right to remain anonymous to the general public. Contact details are only shared with verified medical administrators upon a successful match.</p>
          <p className="font-bold text-gray-900 dark:text-white">Data Retention</p>
          <p>You can purge your entire medical record from our servers at any time via the Settings panel.</p>
        </div>
      ),
      'Accessibility Statement': (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>LifeFlow is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards, including WCAG 2.1 Level AA.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Dynamic font scaling support.</li>
            <li>High-contrast "Dark Mode" for visual impairment.</li>
            <li>ARIA compliant components for screen readers.</li>
          </ul>
        </div>
      ),
      'Search Blood Availability': (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Our real-time database synchronizes every 60 seconds with 120+ partner hospitals. You can filter by:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Blood Group (A+, O-, etc.)</li>
            <li>Geographical Proximity (using browser geolocation)</li>
            <li>Stock levels (Units available)</li>
          </ul>
        </div>
      ),
      'Hyperlink Policy': (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>We do not object to you linking directly to the information that is hosted on our site and no prior permission is required for the same. However, we would like you to inform us about any links provided to our site so that you may be informed of any changes or updations therein.</p>
        </div>
      ),
      'Search Blood Center Directory': (
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Explore a comprehensive directory of all verified blood collection centers, storage units, and emergency hospitals across the national network. Each listing includes certified phone numbers and active operational hours.</p>
        </div>
      )
    };

    setActiveInfo({
      title: title,
      body: contents[title] || <p className="text-gray-500 italic">Detailed information for this section is being updated by the Administrative team. Please check back shortly.</p>
    });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blood-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/4 -right-24 w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <img 
          src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=2000" 
          alt="Medical Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 animate-fade-in-up cursor-pointer hover:bg-white/20 transition-colors" onClick={() => showFeatureAlert('Live Status Monitor')}>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blood-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blood-500"></span>
            </span>
            <span className="text-sm font-medium text-white tracking-wide">Saving Lives 24/7</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-fade-in-up delay-100">
            Be the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-400 to-orange-400">Hero</span> <br />
            Someone Needs.
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            The Blood Bank connects you to a network of hope. Whether you give or receive, you are part of a powerful community dedicated to life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <Button 
              onClick={() => onNavigate('register')} 
              className="px-10 py-5 text-lg !bg-white !text-blood-900 hover:!bg-gray-100 shadow-lg rounded-full transition-transform hover:scale-105 border-2 border-white"
            >
              Donate Now
            </Button>
            <Button 
              onClick={scrollToLearnMore}
              className="px-10 py-5 text-lg bg-transparent text-white hover:bg-white/10 border-2 border-white/30 shadow-lg rounded-full transition-transform hover:scale-105"
            >
              Explore Impact
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-white border-t border-white/10 pt-10">
             <div className="cursor-pointer hover:scale-110 transition-transform" onClick={() => showFeatureAlert('Real-time Donor Stats')}>
                <p className="text-4xl font-bold mb-1">{stats.donors.toLocaleString()}+</p>
                <p className="text-gray-400 text-sm uppercase tracking-widest">Donors</p>
             </div>
             <div className="cursor-pointer hover:scale-110 transition-transform" onClick={() => showFeatureAlert('Lives Saved Report')}>
                <p className="text-4xl font-bold mb-1">{stats.lives.toLocaleString()}+</p>
                <p className="text-gray-400 text-sm uppercase tracking-widest">Lives Saved</p>
             </div>
             <div className="cursor-pointer hover:scale-110 transition-transform" onClick={() => showFeatureAlert('Partner Hospitals Map')}>
                <p className="text-4xl font-bold mb-1">{stats.hospitals}+</p>
                <p className="text-gray-400 text-sm uppercase tracking-widest">Partners</p>
             </div>
             <div className="cursor-pointer hover:scale-110 transition-transform" onClick={() => showFeatureAlert('Security Audit Certificate')}>
                <p className="text-4xl font-bold mb-1">100%</p>
                <p className="text-gray-400 text-sm uppercase tracking-widest">Secure</p>
             </div>
          </div>
        </div>
      </div>

      {/* Campaigns carousel */}
      <div className="bg-gray-50 dark:bg-gray-950 py-24 transition-colors">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Upcoming <span className="text-blood-600">Campaigns</span></h2>
              <p className="text-gray-500 text-lg">Join our community events and make a difference together.</p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center gap-2 dark:border-gray-700 dark:text-gray-300" onClick={() => showFeatureAlert('Full Events Calendar')}>View All Events <ChevronRight size={16} /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => showFeatureAlert(`Event Details: ${campaign.title}`)}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10"></div>
                <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700" />
                
                <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-blood-200 mb-2">
                        <Calendar size={16} /> {campaign.date}
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{campaign.title}</h3>
                      <p className="text-gray-200 line-clamp-1">{campaign.description}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-center min-w-[80px]">
                       <span className="block text-xl font-bold">{campaign.attendees}</span>
                       <span className="text-xs text-gray-200">Going</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-20 pb-10 border-t border-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 text-left">
            <div className="space-y-6">
               <h4 className="text-white text-lg font-bold mb-4 border-l-4 border-blood-600 pl-3">Contact</h4>
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <MapPin className="mt-1 text-blood-600 shrink-0" size={20} />
                   <p>Nepal, Biratnagar</p>
                 </div>
                 <div className="flex items-center gap-3 cursor-pointer hover:text-white" onClick={() => showFeatureAlert('Calling Support...')}>
                   <Phone className="text-blood-600 shrink-0" size={20} />
                   <p>6207286891</p>
                 </div>
                 <div className="flex items-center gap-3 cursor-pointer hover:text-white" onClick={() => showFeatureAlert('Opening Email Client...')}>
                   <Mail className="text-blood-600 shrink-0" size={20} />
                   <p>asrajputchauhan@gmail.com</p>
                 </div>
               </div>
               <div className="pt-4">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-2">Administrative Queries</p>
                 <p className="text-sm leading-relaxed">Blood Cell, National Health Mission, Ministry of Health & Family Welfare, New Delhi-110011</p>
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-white text-lg font-bold mb-4 border-l-4 border-blood-600 pl-3">Important Links</h4>
               <ul className="space-y-3">
                 {['Search Blood Availability', 'Search Blood Center Directory', 'Search Blood Donation Camps', 'Blood Center Login', 'Donor Login'].map((link) => (
                   <li key={link}>
                     <button onClick={() => handleInfoLink(link)} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                       <ChevronRight size={14} className="text-blood-600" /> {link}
                     </button>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="text-white text-lg font-bold mb-4 border-l-4 border-blood-600 pl-3">Policies</h4>
               <ul className="space-y-3">
                 {['Terms & Conditions', 'Privacy Policy', 'Accessibility Statement', 'Site Map', 'Hyperlink Policy'].map((link) => (
                   <li key={link}>
                     <button onClick={() => handleInfoLink(link)} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                       <ChevronRight size={14} className="text-blood-600" /> {link}
                     </button>
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-sm text-gray-600">© 2023 Blood Bank Management System. All rights reserved.</p>
             <div className="flex gap-4">
               <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-blood-600 hover:text-white transition-colors cursor-pointer">fb</span>
               <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-blood-600 hover:text-white transition-colors cursor-pointer">tw</span>
               <span className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:bg-blood-600 hover:text-white transition-colors cursor-pointer">in</span>
             </div>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      {activeInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="p-8 bg-blood-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldAlert size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tight">{activeInfo.title}</h3>
              </div>
              <button onClick={() => setActiveInfo(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar text-left">
              <div className="prose prose-blood dark:prose-invert max-w-none">
                {activeInfo.body}
              </div>
            </div>

            <div className="p-8 border-t border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/20 flex justify-end items-center">
               <Button onClick={() => setActiveInfo(null)} className="rounded-xl px-10 font-black uppercase text-xs tracking-widest">
                 Close Document
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
