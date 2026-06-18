import React from 'react';
import { showcaseStats } from '../../data/mockData';
import { ArrowRight, Users, Sparkles, Building2, MapPin, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
  onOpenBrochure: () => void;
}

export const Hero: React.FC<HeroProps> = ({ setActiveSection, onOpenBrochure }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden pt-24 pb-16">
      {/* Premium Background Visual with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=85"
          alt="Aditya Fortune Towers Vizag High Rise"
          className="w-full h-full object-cover object-center opacity-35 scale-105 animate-pulse duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto gap-6 mt-8">
          
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 backdrop-blur-md shadow-lg shadow-amber-500/10 animate-bounce duration-1000">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Visakhapatnam’s Most Awarded Luxury High-Rise
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-outfit text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-none">
            An Ultimate Reflection of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Urban Chic Lifestyle
            </span>
          </h1>

          {/* Location & Summary Description */}
          <p className="text-lg sm:text-2xl font-light text-slate-300 max-w-3xl leading-relaxed">
            Welcome to <span className="font-semibold text-white">Aditya Fortune Towers</span> in Madhurawada, Visakhapatnam. Offering masterfully crafted premium 3 BHK residences embedded with ultra-luxurious amenities and ocean breeze.
          </p>

          {/* Quick Verification Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base font-medium text-slate-200 my-2">
            <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Vastu Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>1,640 - 1,980 Sq.Ft. Range</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-lg backdrop-blur-xs border border-white/10">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>Near IT SEZ & Rushikonda</span>
            </div>
          </div>

          {/* Master CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4">
            <button
              onClick={() => {
                setActiveSection('floor-plans');
                const element = document.getElementById('floor-plans-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 hover:text-white font-outfit font-extrabold px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all duration-300 cursor-pointer text-base"
            >
              <span>Explore 3BHK Residences</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setActiveSection('community');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-outfit font-bold px-6 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all duration-300 cursor-pointer text-base border border-indigo-400/30"
            >
              <Users className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>👑 Flat Owners Hub</span>
            </button>

            <button
              onClick={onOpenBrochure}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-outfit font-semibold px-6 py-4 rounded-2xl backdrop-blur-xs border border-white/20 hover:scale-105 transition-all duration-300 cursor-pointer text-base"
            >
              <span>E-Brochure</span>
            </button>
          </div>

        </div>

        {/* Floating Bottom Project Stats Counter Grid */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {showcaseStats.map((stat, idx) => (
            <div
              key={idx}
              className="glass-panel-dark p-6 rounded-2xl border border-white/10 shadow-2xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="font-outfit text-2xl sm:text-4xl font-extrabold text-amber-400 tracking-tight group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-white font-semibold text-sm sm:text-base mt-2">
                {stat.label}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-light">
                {stat.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Announcement ticker */}
        <div className="mt-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-r-2xl backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-200">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-md uppercase">Notice</span>
            <p className="text-xs sm:text-sm font-medium">
              🚨 <span className="font-bold text-amber-400">Attention Flat Owners:</span> Ugadi Mahotsavam RSVPs are now live in the Community Portal. Please add your family details to confirm dinner plates!
            </p>
          </div>
          <button
            onClick={() => setActiveSection('community')}
            className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition shrink-0 cursor-pointer"
          >
            Go to Event Feed →
          </button>
        </div>

      </div>
    </div>
  );
};
