import React, { useEffect, useState } from 'react';
import { Heart, Activity, Users, ChevronRight, Info, Droplet, Calendar, MapPin, ShieldCheck, Phone, Mail } from 'lucide-react';
import { Button } from './Button';
import { MockBackend } from '../services/mockBackend';
import { Campaign } from '../types';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({ donors: 0, lives: 0, hospitals: 0 });

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

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Hero Section - Premium Gradient & Glassmorphism */}
      <div className="relative min-h-[700px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Animated Background blobs */}
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

          {/* Live Stats Strip */}
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

      {/* Campaign Carousel Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming <span className="text-blood-600">Campaigns</span></h2>
              <p className="text-gray-500 text-lg">Join our community events and make a difference together.</p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center gap-2" onClick={() => showFeatureAlert('Full Events Calendar')}>View All Events <ChevronRight size={16} /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => showFeatureAlert(`Event Details: ${campaign.title}`)}>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10"></div>
                <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700" />
                
                <div className="absolute bottom-0 left-0 p-8 z-20 text-white w-full">
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

      {/* Why Choose Us Grid */}
      <div id="learn-more" className="bg-white py-24 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Blood Bank?</h2>
            <p className="text-xl text-gray-600">
              We combine advanced technology with human compassion to create the most efficient blood management system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer" onClick={() => showFeatureAlert('Safety Protocols Document')}>
              <div className="w-16 h-16 bg-blood-100 rounded-2xl flex items-center justify-center text-blood-600 mb-8 group-hover:rotate-6 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Verified & Safe</h3>
              <p className="text-gray-600 leading-relaxed">
                Every donor is screened and verified. We use blockchain-inspired keys to ensure the integrity of every donation.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer" onClick={() => showFeatureAlert('Live Network Map')}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:rotate-6 transition-transform">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Real-Time Network</h3>
              <p className="text-gray-600 leading-relaxed">
                Our live tracking system means no blood goes to waste. Hospitals and recipients connect instantly.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer" onClick={() => showFeatureAlert('Rewards Program Details')}>
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:rotate-6 transition-transform">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Rewards Program</h3>
              <p className="text-gray-600 leading-relaxed">
                Gamified experience for donors. Earn badges, track your impact, and feel the joy of saving lives.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blood-900 py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl font-bold text-white mb-8">Ready to Save a Life?</h2>
            <p className="text-xl text-blood-200 mb-10 max-w-2xl mx-auto">
              Join 50,000+ registered donors making a difference today. It only takes a minute to sign up.
            </p>
            <Button 
              onClick={() => onNavigate('register')} 
              className="px-12 py-6 text-xl !bg-white !text-blood-900 hover:!bg-gray-100 shadow-2xl border-none font-bold"
            >
              Get Started Now
            </Button>
         </div>
      </div>

      {/* Detailed Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-20 pb-10 border-t border-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            {/* Contact Info */}
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

            {/* Important Links */}
            <div className="space-y-6">
               <h4 className="text-white text-lg font-bold mb-4 border-l-4 border-blood-600 pl-3">Important Links</h4>
               <ul className="space-y-3">
                 {['Search Blood Availability', 'Search Blood Center Directory', 'Search Blood Donation Camps', 'Blood Center Login', 'Donor Login'].map((link) => (
                   <li key={link}>
                     <button onClick={() => showFeatureAlert(link)} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
                       <ChevronRight size={14} className="text-blood-600" /> {link}
                     </button>
                   </li>
                 ))}
               </ul>
            </div>

            {/* Policies */}
            <div className="space-y-6">
               <h4 className="text-white text-lg font-bold mb-4 border-l-4 border-blood-600 pl-3">Policies</h4>
               <ul className="space-y-3">
                 {['Terms & Conditions', 'Privacy Policy', 'Accessibility Statement', 'Site Map', 'Hyperlink Policy'].map((link) => (
                   <li key={link}>
                     <button onClick={() => showFeatureAlert(link)} className="hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">
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
    </div>
  );
};