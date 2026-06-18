import React, { useState } from 'react';
import { unitConfigs } from '../../data/mockData';
import { Compass, Check, ArrowRight, Bath, Grid, Expand, Sparkles } from 'lucide-react';

interface FloorPlansProps {
  onOpenBrochure: () => void;
}

export const FloorPlans: React.FC<FloorPlansProps> = ({ onOpenBrochure }) => {
  const [activeUnitId, setActiveUnitId] = useState(unitConfigs[0].id);
  const activeUnit = unitConfigs.find((u) => u.id === activeUnitId) || unitConfigs[0];

  const specsList = [
    'Super Quality R.C.C. Framed Structure (Earthquake resistant)',
    'Premium Vitrified Tile Flooring (800mm x 800mm)',
    'Main Door: Teak wood frame with elegant melamine polish',
    'Windows: UPVC sliding windows with mosquito mesh',
    'Kitchen: Polished granite platform with stainless steel sink',
    'Bathrooms: Premium Jaguar / Kohler CP fittings and sanitaryware',
    'Electrical: Concealed copper wiring with modular Havells switches',
    'Security: Biometric keyless video door phone for every flat',
  ];

  return (
    <section id="floor-plans-section" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>3 BHK Unit Floor Plans & Layouts</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Spacious 3 BHK Luxury Flat <span className="text-amber-400">Configurations</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 font-light max-w-2xl mx-auto">
            Explore the masterfully engineered 3 Bedroom Hall Kitchen floor plans of Aditya Fortune Towers. Each apartment is a private sanctuary of optimal space and ventilation.
          </p>
        </div>

        {/* Configuration Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {unitConfigs.map((unit) => {
            const isActive = unit.id === activeUnitId;
            return (
              <button
                key={unit.id}
                onClick={() => setActiveUnitId(unit.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-outfit font-bold text-base sm:text-lg transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/80'
                }`}
              >
                <Grid className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <div>
                  <div className="text-left leading-tight">{unit.type}</div>
                  <div className={`text-xs font-normal ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {unit.area} • {unit.facing}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Unit Showcase Box */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 sm:p-12 backdrop-blur-md shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Details */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-6">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">{activeUnit.facing}</span>
                <h3 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white mt-1">{activeUnit.type}</h3>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Super Built-up Area</div>
                <div className="font-outfit text-2xl sm:text-3xl font-black text-amber-400">{activeUnit.area}</div>
              </div>
            </div>

            <p className="text-slate-300 text-base leading-relaxed font-light">
              {activeUnit.description}
            </p>

            {/* Spec tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex flex-col items-center text-center">
                <Expand className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-xs text-slate-400 font-medium">Bedrooms</span>
                <span className="font-outfit font-bold text-lg text-white">3 Premium BHK</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex flex-col items-center text-center">
                <Bath className="w-6 h-6 text-indigo-400 mb-1" />
                <span className="text-xs text-slate-400 font-medium">Bathrooms</span>
                <span className="font-outfit font-bold text-lg text-white">{activeUnit.bathrooms} Luxurious</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex flex-col items-center text-center sm:col-span-1 col-span-2">
                <Sparkles className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-xs text-slate-400 font-medium">Balconies</span>
                <span className="font-outfit font-bold text-lg text-white">{activeUnit.balconies} Sit-outs</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={onOpenBrochure}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-outfit font-extrabold px-8 py-4 rounded-2xl shadow-lg transition cursor-pointer text-base"
              >
                <span>Download Floor Plan PDF</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button
                onClick={onOpenBrochure}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-outfit font-semibold px-8 py-4 rounded-2xl transition cursor-pointer text-base"
              >
                <span>Request Custom Pricing</span>
              </button>
            </div>
          </div>

          {/* Right Preview Floor Plan Image */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-900/90 p-4 sm:p-6 rounded-3xl border border-slate-700 shadow-inner group relative">
            <span className="absolute top-4 right-4 bg-slate-800 text-amber-400 text-xs px-3 py-1 rounded-full border border-slate-600 shadow font-medium">
              Click to Zoom
            </span>
            <img
              src={activeUnit.image}
              alt={activeUnit.type}
              className="w-full h-80 sm:h-96 object-cover rounded-2xl shadow-lg group-hover:scale-102 transition duration-300"
            />
            <p className="text-xs text-slate-500 mt-4 italic text-center">
              *Layout representation is for illustrative conceptualization. Exact room dimensions available in official sales brochure.
            </p>
          </div>

        </div>

        {/* Flawless Technical Specifications */}
        <div className="mt-20">
          <h3 className="font-outfit font-extrabold text-2xl text-white text-center mb-10">
            Premium Engineering Specifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specsList.map((spec, idx) => (
              <div
                key={idx}
                className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/60 flex items-start gap-3 hover:border-indigo-500/50 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-snug font-light">
                  {spec}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
