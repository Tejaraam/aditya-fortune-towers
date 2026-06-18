import React, { useState } from 'react';
import { initialFlatOwners } from '../../data/mockData';
import { FlatOwner } from '../../types';
import { OwnersDirectory } from './OwnersDirectory';
import { EventSharing } from './EventSharing';
import { AboutAftowa } from './AboutAftowa';
import { Accounts } from './Accounts';
import { Communication } from './Communication';
import { ContactUs } from './ContactUs';
import { Pictures } from './Pictures';
import { Dashboard } from './Dashboard';
import { ProfilePage } from './ProfilePage';
import { ResidentPaymentHistory } from './ResidentPaymentHistory';
import { Users, Calendar, Sparkles, Shield, Award, Building2, DollarSign, MessageSquare, Phone, Image as ImageIcon, LayoutDashboard, UserCircle } from 'lucide-react';
import { useAuth } from '../common/AuthContext';

export const CommunityPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-600' },
    { id: 'about', label: 'About AFTOWA', icon: Building2, color: 'text-indigo-600' },
    { id: 'accounts', label: 'Accounts', icon: DollarSign, color: 'text-emerald-600' },
    { id: 'events', label: 'Events', icon: Calendar, color: 'text-amber-600' },
    { id: 'directory', label: 'Members List', icon: Users, color: 'text-rose-600' },
    { id: 'communication', label: 'Communication', icon: MessageSquare, color: 'text-purple-600' },
    { id: 'contact', label: 'Complaints', icon: Phone, color: 'text-blue-600' },
    { id: 'pictures', label: 'Pictures', icon: ImageIcon, color: 'text-orange-600' },
    ...(user ? [
      { id: 'payment-history', label: 'My Payments', icon: DollarSign, color: 'text-emerald-600' },
      { id: 'profile', label: 'My Profile', icon: UserCircle, color: 'text-slate-700' }
    ] : [])
  ];

  return (
    <section id="community-portal-section" className="py-24 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Superior Top Digital Community Identity */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-900 shadow-sm mb-3">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin duration-3000" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide">
              Official Visakhapatnam Society Hub
            </span>
          </div>

          <h2 className="font-outfit text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Aditya Fortune Towers <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 bg-clip-text text-transparent">
              Flat Owners Welfare Association
            </span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed font-light max-w-3xl mx-auto">
            AFTOWA complete digital portal. Manage accounts, share event details, maintain members list, publish communications, and store all pictures, drawings & approvals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs sm:text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Tower A, B, C Fully Integrated</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Secure Members-Only Digital Portal</span>
            </span>
          </div>
        </div>

        {/* Community Master Navigation Switcher */}
        <div className="bg-white/80 backdrop-blur-xl p-3 rounded-[2.5rem] shadow-sm border border-slate-200/60 mb-12 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tabs.map((tab: any) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full font-outfit font-bold text-base transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-amber-400' : tab.color}`} />
                  <span className="whitespace-nowrap truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'about' && <AboutAftowa />}
          {activeTab === 'accounts' && <Accounts />}
          {activeTab === 'events' && <EventSharing />}
          {activeTab === 'directory' && <OwnersDirectory />}
          {activeTab === 'communication' && <Communication />}
          {activeTab === 'contact' && <ContactUs />}
          {activeTab === 'pictures' && <Pictures />}
          {activeTab === 'profile' && user && <ProfilePage />}
          {activeTab === 'payment-history' && <ResidentPaymentHistory />}
        </div>

      </div>

    </section>
  );
};
