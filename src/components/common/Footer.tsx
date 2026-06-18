import React from 'react';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, Globe, Shield, Award, Sparkles } from 'lucide-react';

interface FooterProps {
  setActiveSection: (section: string) => void;
  onOpenBrochure: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveSection, onOpenBrochure }) => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo size="lg" dark={true} />
            <p className="text-slate-300 text-sm leading-relaxed mt-2 pr-6">
              Aditya Fortune Towers is Visakhapatnam’s most admired residential luxury high-rise. An ultimate reflection of urban chic lifestyle in Madhurawada, Vizag with premium 3 BHK Vastu compliant residences.
            </p>
            <div className="flex items-center gap-3 text-amber-500 font-semibold text-sm mt-1">
              <Award className="w-5 h-5 shrink-0" />
              <span>Built by Aditya Construction Company India (P) Ltd.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-outfit font-bold text-base tracking-wide border-b border-amber-500/30 pb-2 inline-block">
              Explore Project
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm mt-1">
              <li>
                <button
                  onClick={() => {
                    setActiveSection('overview');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Project Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection('floor-plans');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  3 BHK Floor Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection('amenities');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Luxurious Amenities
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveSection('location');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Vizag Connectivity Map
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBrochure}
                  className="text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <span>Download E-Brochure</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Community Portal Link */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-outfit font-bold text-base tracking-wide border-b border-amber-500/30 pb-2 inline-block">
              Resident Hub
            </h4>
            <p className="text-xs text-slate-400 leading-snug">
              Exclusive digital portal for verified flat owners of Towers A, B, and C.
            </p>
            <button
              onClick={() => {
                setActiveSection('community');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md hover:scale-102 transition cursor-pointer"
            >
              <span>👑 Owners Portal</span>
            </button>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/50 p-2 rounded-lg border border-indigo-800/40">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Secure digital portal for verified residents</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-outfit font-bold text-base tracking-wide border-b border-amber-500/30 pb-2 inline-block">
              Site & Sales Office
            </h4>
            <ul className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300 mt-1">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Midhilapuri Vuda Colony, Madhurawada, Visakhapatnam, Andhra Pradesh 530041</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+91 98490 55224 / 0891-2747755</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>enquiry@adityacc.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                <span>www.adityacc.com/vizag</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-slate-500 gap-4">
          <p>© 2026 Aditya Construction Company India (P) Ltd. All Rights Reserved. AFTOWA Community Hub.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 hover:text-slate-400 cursor-pointer">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Privacy Policy
            </span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">RERA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
