import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, User, Building2, Clock, CheckCircle2, AlertTriangle, Send, FileText, Loader2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';
import { Database } from '../../types/database.types';

type ComplaintRow = Database['public']['Tables']['complaints']['Row'];

interface CommitteeContact {
  name: string;
  role: string;
  flat: string;
  phone: string;
  email: string;
  avatar: string;
}

const committeeContacts: CommitteeContact[] = [
  { name: 'Dr. Ramesh Nambiar', role: 'President, AFTOWA', flat: 'Tower A - 101', phone: '+91 98490 12345', email: 'aftowa.president@adityafortune.in', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { name: 'K. V. Satyanarayana', role: 'Treasurer', flat: 'Tower B - 202', phone: '+91 99123 45678', email: 'aftowa.treasurer@adityafortune.in', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { name: 'Ananya & Vikram Rao', role: 'Cultural Secretary', flat: 'Tower A - 405', phone: '+91 94401 98765', email: 'aftowa.cultural@adityafortune.in', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { name: 'Col. Rajeshwar Singh (Retd.)', role: 'Security Head', flat: 'Tower C - 1105', phone: '+91 91771 22334', email: 'aftowa.security@adityafortune.in', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
  { name: 'Lalitha Devi & S. K. Sharma', role: 'Social & Welfare', flat: 'Tower A - 904', phone: '+91 98481 55667', email: 'aftowa.welfare@adityafortune.in', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80' },
  { name: 'Pooja & Sriram Patnaik', role: 'Sports & Tech', flat: 'Tower C - 1401', phone: '+91 90002 77889', email: 'aftowa.sports@adityafortune.in', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
];

export const ContactUs: React.FC = () => {
  const { user, profile } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Maintenance');
  const [newDesc, setNewDesc] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isAdminOrCommittee = profile?.role === 'Admin' || profile?.role === 'Committee Member';

  useEffect(() => {
    fetchComplaints();
  }, [user, profile]);

  const fetchComplaints = async () => {
    if (!user || !profile) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let query = supabase.from('complaints').select('*').order('created_at', { ascending: false });
      
      if (!isAdminOrCommittee) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setComplaints(data as ComplaintRow[]);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !user || !profile) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('complaints')
        .insert({
          title: newTitle,
          category: newCategory,
          flat: `${profile.tower} - ${profile.flat_number}`,
          description: newDesc,
          user_id: user.id,
          status: 'Open'
        });

      if (error) throw error;

      await fetchComplaints();
      
      setNewTitle('');
      setNewDesc('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setShowForm(false);
      }, 2500);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      await fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Building2 className="w-4 h-4" />
            <span>AFTOWA Contact Center</span>
          </div>
          <h2 className="font-outfit text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Contact Us & <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Maintenance Requests</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-3xl font-light leading-relaxed">
            Club House address, executive committee members list, and online complaint lodging for all maintenance activities and facility issues.
          </p>
        </div>
      </div>

      {/* Clubhouse Address & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4"><MapPin className="w-6 h-6" /></div>
          <h4 className="font-outfit font-bold text-lg text-slate-900 mb-2">Club House Address</h4>
          <p className="text-sm text-slate-600 font-light leading-relaxed">Aditya Fortune Towers Clubhouse, Midhilapuri Vuda Colony, Madhurawada, Visakhapatnam, Andhra Pradesh 530041</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4"><Phone className="w-6 h-6" /></div>
          <h4 className="font-outfit font-bold text-lg text-slate-900 mb-2">Society Helpline</h4>
          <p className="text-sm text-slate-600 font-light leading-relaxed">Main: +91 891 2747 755<br />Emergency: +91 98490 55224<br />Security Gate: +91 891 2747 700</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4"><Clock className="w-6 h-6" /></div>
          <h4 className="font-outfit font-bold text-lg text-slate-900 mb-2">Office Hours</h4>
          <p className="text-sm text-slate-600 font-light leading-relaxed">Monday to Saturday: 9:00 AM - 6:00 PM<br />Sunday: 10:00 AM - 2:00 PM<br />24/7 Security & Emergency Support</p>
        </div>
      </div>

      {/* Executive Committee Contacts */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600"><User className="w-5 h-5" /></div>
          <div>
            <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Executive Committee Contact List</h3>
            <p className="text-xs text-slate-500">Direct contact numbers of all committee members for quick coordination.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {committeeContacts.map((c, idx) => (
            <div key={idx} className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all">
              <div className="flex items-start gap-3 mb-3">
                <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded mb-1">{c.role}</span>
                  <h4 className="font-outfit font-bold text-base text-slate-900 leading-tight">{c.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.flat}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 font-medium transition">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> {c.phone}
                </a>
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-slate-700 hover:text-indigo-700 font-medium transition">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> <span className="truncate">{c.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lodge Complaint Section */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <h3 className="font-outfit text-2xl font-extrabold text-slate-900">
                {isAdminOrCommittee ? 'All Community Complaints' : 'My Maintenance Complaints'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdminOrCommittee ? 'Manage and update the status of community issues.' : 'Members can raise complaints with reference to maintenance activities, electrical issues, plumbing, or housekeeping.'}
              </p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-outfit font-bold px-5 py-3 rounded-xl shadow text-xs hover:scale-102 transition cursor-pointer w-full sm:w-auto"
            >
              <FileText className="w-4 h-4" />
              <span>{showForm ? 'Close Form' : '+ Lodge New Complaint'}</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span><strong className="font-bold">Complaint lodged successfully!</strong> Our maintenance team will respond within 24 hours. A confirmation token has been generated for your reference.</span>
          </div>
        )}

        {/* Complaint Form */}
        {showForm && user && profile && (
          <form onSubmit={handleSubmitComplaint} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 space-y-4 text-sm animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Complaint Title *</label>
                <input type="text" required placeholder="Brief title of the issue" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-rose-500 font-semibold cursor-pointer">
                  {['Maintenance', 'Electrical', 'Plumbing', 'Housekeeping', 'Security', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Flat Number *</label>
              <input type="text" readOnly value={`${profile.tower} - ${profile.flat_number}`} className="w-full px-4 py-3 rounded-xl bg-slate-200 border border-slate-300 focus:outline-none font-semibold cursor-not-allowed text-slate-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Description *</label>
              <textarea rows={3} required placeholder="Describe the issue in detail - location, time of occurrence, and any photos reference..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-rose-500 font-light" />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-xs text-slate-700 transition cursor-pointer" disabled={isSubmitting}>Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-outfit font-extrabold text-sm shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        )}

        {/* Complaints List */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          </div>
        ) : !user ? (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
            Please login to view or submit complaints.
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500">
            No complaints found.
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      c.status === 'Open' ? 'bg-rose-100 text-rose-800' :
                      c.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-700">{c.category}</span>
                    <span className="text-[11px] text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <h5 className="font-outfit font-bold text-base text-slate-900 leading-tight">{c.title}</h5>
                  <p className="text-xs text-slate-600 mt-1.5 font-light">{c.description}</p>
                  <p className="text-[11px] text-slate-500 mt-2">Reported by: <span className="font-semibold">{c.flat}</span></p>
                </div>
                
                {isAdminOrCommittee && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Update Status:</span>
                    <select
                      disabled={updatingId === c.id}
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                      className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    {updatingId === c.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
