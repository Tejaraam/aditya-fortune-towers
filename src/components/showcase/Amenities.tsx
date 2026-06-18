import React, { useState } from 'react';
import { amenities } from '../../data/mockData';
import {
  Sparkles,
  Dumbbell,
  Waves,
  PartyPopper,
  Trophy,
  Trees,
  ShieldCheck,
  Baby,
  Zap,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

interface AmenitiesProps {
  onOpenBrochure: () => void;
}

export const Amenities: React.FC<AmenitiesProps> = ({ onOpenBrochure }) => {
  const [filter, setFilter] = useState<string>('all');

  const iconMap: Record<string, any> = {
    Dumbbell,
    Waves,
    PartyPopper,
    Trophy,
    Trees,
    ShieldCheck,
    Baby,
    Zap,
  };

  const categories = [
    { id: 'all', label: 'All Premium Amenities' },
    { id: 'wellness', label: 'Wellness & Health' },
    { id: 'leisure', label: 'Leisure & Club' },
    { id: 'sports', label: 'Sports & Kids' },
    { id: 'essentials', label: 'Advanced Essentials' },
  ];

  const filteredAmenities =
    filter === 'all' ? amenities : amenities.filter((a) => a.category === filter);

  return (
    <section id="amenities-section" className="py-20 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>25,000 Sq.Ft. Royal Clubhouse & Leisure</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            World-Class Amenities Designed for <br className="hidden sm:inline" />
            <span className="text-amber-500">Urban Serenity & Active Living</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed font-light">
            Indulge in an extraordinary multi-level lifestyle. From invigorating morning swims to vibrant evening matches, Aditya Fortune Towers provides the ultimate recreational space.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-5 py-2.5 rounded-2xl font-outfit font-semibold text-sm transition-all duration-200 cursor-pointer ${
                filter === cat.id
                  ? 'bg-slate-900 text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAmenities.map((amenity) => {
            const Icon = iconMap[amenity.iconName] || Sparkles;
            return (
              <div
                key={amenity.id}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-slate-100 hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-outfit font-bold text-xl text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                    {amenity.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-light">
                    {amenity.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Fully Operational & Impeccably Maintained</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom VIP Callout Banner */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-800">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 hidden sm:flex">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-outfit font-bold text-2xl sm:text-3xl text-white">
                Experience the Clubhouse in Person
              </h3>
              <p className="text-slate-300 text-sm mt-2 max-w-xl font-light">
                Schedule an exclusive VIP site visit with our Visakhapatnam Sales Team. Walk through the pristine landscaping, view our sample flat, and inspect the sports facilities.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
            <button
              onClick={onOpenBrochure}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-outfit font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition cursor-pointer text-base"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Book VIP Site Tour</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
