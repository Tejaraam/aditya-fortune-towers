import React from 'react';
import { MapPin, Navigation, ExternalLink, Briefcase, GraduationCap, HeartPulse, ShoppingBag, Car } from 'lucide-react';

export const LocationMap: React.FC = () => {
  const landmarks = [
    { name: 'Rushikonda Beach & Coastal Drive', distance: '10 Mins (5.2 km)', icon: Navigation, type: 'Leisure' },
    { name: 'Madhurawada IT SEZ (Infosys, Tech Mahindra)', distance: '8 Mins (3.8 km)', icon: Briefcase, type: 'Employment Hub' },
    { name: 'GITAM Deemed to be University', distance: '12 Mins (6.1 km)', icon: GraduationCap, type: 'Education' },
    { name: 'Dr. Y.S.R. ACA VDCA International Cricket Stadium', distance: '5 Mins (2.5 km)', icon: Car, type: 'Sports & Events' },
    { name: 'Apollo Medical Center & Care Hospital', distance: '15 Mins (7.5 km)', icon: HeartPulse, type: 'Healthcare' },
    { name: 'Premium Supermarkets & D-Mart', distance: '2 Mins Walk (300 m)', icon: ShoppingBag, type: 'Shopping' },
  ];

  return (
    <section id="location-section" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-300">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Flawless Visakhapatnam Connectivity</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Strategic Location in the Heart of <br className="hidden sm:inline" />
            <span className="text-emerald-600">Madhurawada, Visakhapatnam</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed font-light">
            Situated in Midhilapuri Vuda Colony, Aditya Fortune Towers provides peaceful pollution-free surroundings while remaining effortlessly connected to NH16, top IT hubs, and gorgeous beaches.
          </p>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Connectivity Matrix */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h3 className="font-outfit font-extrabold text-2xl text-slate-900 mb-2">
              Key Landmarks & Proximity Guide
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {landmarks.map((landmark, idx) => {
                const Icon = landmark.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-200/70 text-slate-700 rounded-md uppercase tracking-wider">
                          {landmark.type}
                        </span>
                      </div>
                      <h4 className="font-outfit font-bold text-slate-900 text-base leading-snug">
                        {landmark.name}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs">
                      <Navigation className="w-3.5 h-3.5 animate-spin duration-3000" />
                      <span>{landmark.distance}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Google Maps link button */}
            <div className="pt-4">
              <a
                href="https://maps.google.com/?q=Aditya+Fortune+Towers+Madhurawada+Visakhapatnam"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-outfit font-bold px-8 py-4 rounded-2xl shadow-lg transition"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-5 h-5 text-amber-400" />
              </a>
            </div>
          </div>

          {/* Right Beautiful Interactive Stylized Map Concept */}
          <div className="lg:col-span-6 bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden border border-slate-800">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Vizag Master Guide</span>
                <h3 className="font-outfit text-2xl font-bold text-white mt-1">Visakhapatnam Corridor</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-semibold">
                GPS Verified
              </span>
            </div>

            {/* Map Visual Simulation Container */}
            <div className="relative bg-slate-950 rounded-2xl p-6 h-96 border border-slate-800 flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Simulated Roadmap lines */}
              <div className="absolute inset-0 opacity-40 pointer-events-none">
                <svg className="w-full h-full stroke-emerald-500/30 fill-none" strokeWidth="2">
                  <path d="M 0,80 Q 200,120 400,60 T 800,100" />
                  <path d="M 100,0 L 100,400" strokeDasharray="4 4" />
                  <path d="M 350,0 L 350,400" strokeDasharray="4 4" />
                  <path d="M 0,280 Q 300,220 800,290" strokeWidth="4" className="stroke-amber-500/40" />
                </svg>
              </div>

              {/* Pin 1: AFT Project */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-bounce duration-2000">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3 py-1.5 rounded-xl font-outfit font-black text-xs shadow-xl flex items-center gap-1 border border-white/40">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  <span>Aditya Fortune Towers</span>
                </div>
                <div className="w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-8 border-t-orange-500" />
              </div>

              {/* Pin 2: Rushikonda Beach */}
              <div className="absolute top-12 right-12 flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/50 px-3 py-1 rounded-lg text-blue-300 text-xs font-semibold">
                <span>🌊 Rushikonda Beach</span>
              </div>

              {/* Pin 3: IT SEZ */}
              <div className="absolute bottom-16 left-12 flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-500/50 px-3 py-1 rounded-lg text-indigo-300 text-xs font-semibold">
                <span>💻 IT SEZ Hub</span>
              </div>

              {/* Pin 4: NH16 Highway */}
              <div className="absolute top-20 left-16 flex items-center gap-1.5 bg-slate-800/80 border border-slate-600 px-3 py-1 rounded-lg text-slate-300 text-xs font-semibold">
                <span>🛣️ NH-16 Highway</span>
              </div>

              <div className="relative z-10 self-start bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs max-w-xs leading-snug">
                The most sought-after upscale neighborhood in Vizag. Exceptional capital appreciation and rental yield potential.
              </div>

              <div className="relative z-10 self-end text-[10px] text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded">
                Map conceptual layout
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
