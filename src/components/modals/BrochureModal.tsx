import React, { useState } from 'react';
import { Download, PhoneCall, Mail, User, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdf';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'brochure' | 'visit'>('brochure');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitType, setUnitType] = useState('3 BHK Ultra Luxury (1980 sft)');
  const [visitDate, setVisitDate] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setIsSuccess(true);
    setTimeout(() => {
      if (tab === 'brochure') {
        generateAndDownloadPdf({
          fileName: 'Aditya_Fortune_Towers_Official_Brochure_2026.pdf',
          title: 'Aditya Fortune Towers',
          subtitle: 'Premium 3 BHK Residences  •  Madhurawada, Visakhapatnam',
          bodyLines: [
            'AN ULTIMATE REFLECTION OF URBAN CHIC LIFESTYLE',
            '',
            'PROJECT OVERVIEW',
            'Developer        : Aditya Construction Company India (P) Ltd.',
            'Location         : Midhilapuri Vuda Colony, Madhurawada, Vizag - 530041',
            'Project Area     : 6.73 Acres of premium greenery',
            'Towers           : 3 stately high-rise towers (A, B & C)',
            'Configuration    : 3 BHK luxury residences',
            'Super Built-up   : 1,640 - 1,980 Sq.Ft.',
            'Vastu            : 100% Vastu compliant layouts',
            '',
            'AVAILABLE CONFIGURATIONS',
            '3 BHK Executive (1,640 Sq.Ft.)     - Rs. 82.00 Lakhs*',
            '3 BHK Premier (1,750 Sq.Ft.)       - Rs. 87.50 Lakhs*',
            '3 BHK Ultra Luxury (1,980 Sq.Ft.)  - Rs. 99.00 Lakhs*',
            '',
            'KEY AMENITIES',
            '- 25,000 Sq.Ft. multi-level clubhouse',
            '- Semi-covered temperature controlled swimming pool',
            '- State-of-the-art air-conditioned gymnasium',
            '- Indoor badminton & squash courts',
            '- Multipurpose banquet hall & party lawn',
            '- 24/7 multi-tier security with CCTV surveillance',
            '- 100% power backup & landscaped gardens',
            '',
            'ENQUIRY DETAILS',
            'Name             : ' + fullName,
            'Phone            : ' + phone,
            'Email            : ' + (email || 'Not provided'),
            'Interested Unit  : ' + unitType,
            '',
            'Contact our Visakhapatnam Sales Team: +91 98490 55224 / 0891-2747755',
            'Zero brokerage. Direct from Aditya Construction Company.',
          ],
          footer: 'Aditya Fortune Towers  •  www.adityacc.com/vizag  •  *Prices indicative',
        });
      }
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center justify-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-outfit font-extrabold text-3xl text-slate-900">
              {tab === 'brochure' ? 'Brochure Token Generated!' : 'VIP Site Tour Scheduled!'}
            </h3>
            <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto font-light">
              {tab === 'brochure'
                ? `Thank you, ${fullName}. Your copy of the official Aditya Fortune Towers 3BHK brochure is downloading.`
                : `Thank you, ${fullName}. Our Visakhapatnam Senior Sales Manager will welcome you at our Madhurawada / VIP Road lounge on ${visitDate || 'your preferred date'}.`}
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900 leading-tight">
                  Aditya Fortune Towers
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Visakhapatnam Sales & Corporate Enquiry Hub</p>
              </div>
            </div>

            {/* Switcher Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setTab('brochure')}
                className={`flex-1 py-3 rounded-xl font-outfit font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  tab === 'brochure'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Official Brochure</span>
              </button>
              
              <button
                type="button"
                onClick={() => setTab('visit')}
                className={`flex-1 py-3 rounded-xl font-outfit font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  tab === 'visit'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Book VIP Site Visit</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Satyanarayana"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Phone Number *</label>
                  <div className="relative">
                    <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98490 XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="anand@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Interested 3 BHK Configuration</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer"
                >
                  <option value="3 BHK Executive (1640 sft)">3 BHK Executive (1,640 Sq.Ft.) - ₹ 82 Lakhs*</option>
                  <option value="3 BHK Premier (1750 sft)">3 BHK Premier (1,750 Sq.Ft.) - ₹ 87.5 Lakhs*</option>
                  <option value="3 BHK Ultra Luxury (1980 sft)">3 BHK Ultra Luxury (1,980 Sq.Ft.) - ₹ 99 Lakhs*</option>
                </select>
              </div>

              {tab === 'visit' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preferred Site Visit Date *</label>
                  <input
                    type="date"
                    required={tab === 'visit'}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                  />
                </div>
              )}

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Direct consultation from Aditya Construction Company Visakhapatnam. Zero brokerage fee guaranteed.</span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:scale-102 transition cursor-pointer flex items-center gap-2"
                >
                  {tab === 'brochure' ? (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Unlock Complete PDF Brochure ⚡</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-4 h-4" />
                      <span>Confirm VIP Site Tour ✓</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
};
