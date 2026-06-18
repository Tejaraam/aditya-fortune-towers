import React, { useState, useEffect } from 'react';
import { History, Users, Building2, Award, CheckCircle2, FileText, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const AboutAftowa: React.FC = () => {
  const [committeeMembers, setCommitteeMembers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommittee = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['Committee Member', 'Admin'])
          .order('name');
          
        if (error) throw error;
        setCommitteeMembers(data || []);
      } catch (err) {
        console.error('Error fetching committee members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommittee();
  }, []);
  const timeline = [
    {
      year: 'Dec 2014',
      title: 'Project Handover',
      desc: 'Aditya Construction Company officially handed over all 3 Towers (A, B, C) to the first set of flat owners.',
    },
    {
      year: 'Jun 2015',
      title: 'Formation of AFTOWA',
      desc: 'The Aditya Fortune Towers Owners Welfare Association was registered under the Andhra Pradesh Apartment Ownership Act.',
    },
    {
      year: '2017 - 2020',
      title: 'Clubhouse & Amenities Go Live',
      desc: 'Swimming pool, badminton courts, banquet hall, and multi-tier security infrastructure were progressively commissioned.',
    },
    {
      year: '2021 - 2024',
      title: 'Green & Solar Initiative',
      desc: 'Solar panels installed on the Clubhouse rooftop. Rainwater harvesting systems upgraded. Waste composting program launched.',
    },
    {
      year: '2025 - 2026',
      title: 'Digital Community Portal Launch',
      desc: 'AFTOWA launches this secure digital portal for all flat owners to share event details, book facilities, and communicate online.',
    },
  ];



  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-4 h-4" />
            <span>AFTOWA Registered Society</span>
          </div>
          <h2 className="font-outfit text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            About Aditya Fortune Towers <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Residential Flat Owners Welfare Association
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-3xl font-light leading-relaxed">
            AFTOWA is the official, democratically elected body representing all flat owners of Towers A, B, and C at Aditya Fortune Towers, Madhurawada, Visakhapatnam. This page documents our history, formation, and executive leadership.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Flats', value: '~240', icon: Building2, color: 'text-amber-600' },
          { label: 'Executive Members', value: loading ? '...' : committeeMembers.length.toString(), icon: Users, color: 'text-indigo-600' },
          { label: 'Years of Service', value: '10+', icon: History, color: 'text-emerald-600' },
          { label: 'AGMs Conducted', value: '12', icon: FileText, color: 'text-rose-600' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col items-start gap-2">
              <Icon className={`w-6 h-6 ${stat.color}`} />
              <div className="font-outfit text-3xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Formation & Timeline */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Formation & Historical Timeline</h3>
            <p className="text-xs text-slate-500">A decade of community building, transparency, and progress at Aditya Fortune Towers.</p>
          </div>
        </div>

        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-300" />
          {timeline.map((item, idx) => (
            <div key={idx} className="relative mb-10 last:mb-0">
              <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-amber-400 transition">
                <span className="inline-block text-xs font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg mb-2">{item.year}</span>
                <h4 className="font-outfit font-bold text-lg text-slate-900">{item.title}</h4>
                <p className="text-sm text-slate-600 mt-1.5 font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Committee Members */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Executive Committee Members (2025-2027)</h3>
            <p className="text-xs text-slate-500">Elected unanimously at the Annual General Body Meeting held on April 12, 2025.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 w-full col-span-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : committeeMembers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-100">
            No executive committee members currently assigned.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committeeMembers.map((member) => (
              <div key={member.id} className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-amber-400 transition-all flex items-start gap-4">
                <img
                  src={member.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                  alt={member.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded mb-1.5 ${
                    member.role === 'Admin' ? 'text-rose-700 bg-rose-100' : 'text-indigo-700 bg-indigo-100'
                  }`}>
                    {member.committee_role || member.role}
                  </span>
                  <h4 className="font-outfit font-bold text-base text-slate-900 leading-tight truncate">{member.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{member.tower} - #{member.flat_number}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rights & Permissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200">
          <h3 className="font-outfit font-extrabold text-2xl text-emerald-900 mb-4">✓ Viewing Rights for All Residents</h3>
          <ul className="space-y-3 text-sm text-emerald-900 font-light">
            {['View society history & committee profiles', 'Access all event details & RSVP', 'Read official notices and circulars', 'View financial summary reports', 'Browse pictures & documents'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200">
          <h3 className="font-outfit font-extrabold text-2xl text-amber-900 mb-4">⚙ Admin Rights (Executive Committee)</h3>
          <ul className="space-y-3 text-sm text-amber-900 font-light">
            {['Post new events and broadcast alerts', 'Update flat owner master list', 'Enter financial transactions & accounts', 'Upload meeting minutes & documents', 'Publish approved pictures & approvals'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
