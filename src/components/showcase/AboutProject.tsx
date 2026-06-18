import React from 'react';
import { Award, ShieldCheck, MapPin, Sparkles, Home, Layers, CheckCircle } from 'lucide-react';

export const AboutProject: React.FC = () => {
  const tableData = [
    { label: 'Project Name', value: 'Aditya Fortune Towers' },
    { label: 'Developer', value: 'Aditya Construction Company India (P) Ltd.' },
    { label: 'Property Location', value: 'Midhilapuri Vuda Colony, Madhurawada, Visakhapatnam' },
    { label: 'Property Type', value: 'Premium Residential High-Rise Apartments' },
    { label: 'Unit Configurations', value: '3 BHK Elegant Residences' },
    { label: 'Super Built-up Area', value: '1,640 Sq.Ft. - 1,980 Sq.Ft.' },
    { label: 'Total Project Land Area', value: '6.73 Acres of Premium Greenery' },
    { label: 'Architectural Scale', value: '3 Stately Towers (Tower A, Tower B, Tower C)' },
    { label: 'Vastu Compliance', value: '100% Vastu Approved East & North Entrances' },
  ];

  return (
    <section id="about-section" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-300">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Project Overview & Highlights</span>
          </div>
          <h2 className="font-outfit text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            An Epitome of Elegance & <span className="text-amber-500">Sophisticated Simplicity</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed font-light">
            Aditya Fortune Towers is Visakhapatnam’s second premier residential project by Aditya Constructions. Designed to give verified flat owners an unmatched balance of natural tranquility, premium high-rise engineering, and an active close-knit community.
          </p>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Visual Gallery */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="absolute -top-6 -left-6 bg-gradient-to-br from-amber-400 to-amber-600 w-24 h-24 rounded-3xl -z-10 blur-xl opacity-60" />
            
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
              alt="Tower exterior"
              className="rounded-3xl shadow-lg object-cover w-full aspect-4/5 hover:scale-102 transition duration-300"
            />
            
            <div className="flex flex-col gap-4">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
                alt="Interior luxury"
                className="rounded-3xl shadow-lg object-cover w-full aspect-square hover:scale-102 transition duration-300"
              />
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-center border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  <span>AFTOWA Hub</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Every flat owner gets instant access to our real-time Community Event Hub to organize celebrations and society activities.
                </p>
              </div>
            </div>
          </div>

          {/* Right Detailed Configurations Table */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-2xl text-slate-900">Project Configuration Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Official details from Aditya Construction Company Visakhapatnam</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {tableData.map((row, idx) => (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                  <span className="font-medium text-slate-500 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {row.label}:
                  </span>
                  <span className="font-semibold text-slate-900 sm:text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900">Approved by Leading Banks</span>
                  <p>SBI, HDFC Bank, ICICI Bank & Axis Bank pre-approved housing loans.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 3 Core Highlights Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200/80 hover:shadow-xl transition">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mb-6">
              <MapPin className="w-7 h-7" />
            </div>
            <h4 className="font-outfit font-bold text-xl text-slate-900 mb-2">Prime Vizag Location</h4>
            <p className="text-slate-600 text-sm font-light leading-relaxed">
              Situated in Midhilapuri Vuda Colony, Madhurawada. Only 10 mins from the pristine Rushikonda beach, IT hills, and prestigious schools.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200/80 hover:shadow-xl transition">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
              <Home className="w-7 h-7" />
            </div>
            <h4 className="font-outfit font-bold text-xl text-slate-900 mb-2">Unmatched 3 BHK Luxury</h4>
            <p className="text-slate-600 text-sm font-light leading-relaxed">
              Expansive apartment sizes ranging up to 1,980 sqft. Featuring large sit-out balconies, designer fittings, and flawless ventilation.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200/80 hover:shadow-xl transition">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="font-outfit font-bold text-xl text-slate-900 mb-2">Interactive Owners Hub</h4>
            <p className="text-slate-600 text-sm font-light leading-relaxed">
              A built-in smart Community Portal for flat owners to share event details, manage accounts, publish communications, and discuss society matters.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
