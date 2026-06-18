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
import { Users, Calendar, Sparkles, Shield, Award, Building2, DollarSign, MessageSquare, Phone, Image as ImageIcon } from 'lucide-react';

export const CommunityPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('about');

  const tabs = [
    { id: 'about', label: '1. About AFTOWA', icon: Building2, color: 'text-indigo-600' },
    { id: 'accounts', label: '2. Accounts', icon: DollarSign, color: 'text-emerald-600' },
    { id: 'events', label: '3. Events', icon: Calendar, color: 'text-amber-600' },
    { id: 'directory', label: '4. Members List', icon: Users, color: 'text-rose-600' },
    { id: 'communication', label: '5. Communication', icon: MessageSquare, color: 'text-purple-600' },
    { id: 'contact', label: '6. Complaints & Contact', icon: Phone, color: 'text-blue-600' },
    { id: 'pictures', label: '7. Pictures', icon: ImageIcon, color: 'text-orange-600' },
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

        {/* Community Master Navigation Switcher - 7 Screens from the Image */}
        <div className="bg-white p-3 rounded-3xl shadow-md border border-slate-200 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {tabs.map((tab: any) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-2xl font-outfit font-bold text-xs transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg scale-105'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : tab.color}`} />
                  <span className="text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-300">
          {activeTab === 'about' && <AboutAftowa />}
          {activeTab === 'accounts' && <Accounts />}
          {activeTab === 'events' && (
            <EventSharing />
          )}
          {activeTab === 'directory' && (
            <OwnersDirectory />
          )}
          {activeTab === 'communication' && <Communication />}
          {activeTab === 'contact' && <ContactUs />}
          {activeTab === 'pictures' && <Pictures />}
        </div>

      </div>

    </section>
  );
};
