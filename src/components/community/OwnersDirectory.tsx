import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Building2, Phone, Mail, Award, Calendar, CheckCircle2, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { useAuth } from '../common/AuthContext';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const OwnersDirectory: React.FC = () => {
  const { user, profile } = useAuth();
  const [owners, setOwners] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTower, setSelectedTower] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setOwners(data || []);
    } catch (err) {
      console.error('Error fetching owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (owner.profession || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTower = selectedTower === 'All' || owner.tower === selectedTower;
    const matchesType = selectedType === 'All' || owner.resident_type === selectedType;
    const matchesRole = selectedRoleFilter === 'All' || owner.role === selectedRoleFilter;

    return matchesSearch && matchesTower && matchesType && matchesRole;
  });

  const handleRoleChange = async (ownerId: string, newRole: string) => {
    // Prevent changing your own role if you are the only Admin (basic safety)
    if (ownerId === user?.id && newRole !== 'Admin') {
      const confirmDemote = window.confirm('Are you sure you want to demote yourself? You will lose Admin access.');
      if (!confirmDemote) return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', ownerId);
        
      if (error) throw error;
      fetchOwners(); // refresh the list
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role. Ensure you have Admin privileges.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Official Society Database</span>
          </div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">
            Aditya Fortune Towers Flat Owners ({owners.length})
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Verified members of AFTOWA Hub. Connect with your neighbors to organize events and community activities.
          </p>
        </div>

        {user && (profile?.role === 'Admin' || profile?.role === 'Committee Member') && (
          <button
            onClick={() => alert('New members can join the directory by registering an account via the Login modal.')}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-102 transition cursor-pointer text-sm shrink-0 w-full lg:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New Flat Owner</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, flat #, or profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/50 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Tower:</span>
          </div>
          <select
            value={selectedTower}
            onChange={(e) => setSelectedTower(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="All">All Towers</option>
            <option value="Tower A">Tower A</option>
            <option value="Tower B">Tower B</option>
            <option value="Tower C">Tower C</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 ml-2 hidden lg:flex">
            <span>Status:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none hidden lg:block"
          >
            <option value="All">All Residents</option>
            <option value="Owner Resident">Owner Resident</option>
            <option value="Owner (Rented Out)">Owner (Rented Out)</option>
            <option value="Tenant">Tenant</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 ml-2">
            <span>Role:</span>
          </div>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Committee Member">Executive Member</option>
            <option value="Member">Member</option>
          </select>
        </div>

      </div>

      {/* Directory Cards Grid */}
      {filteredOwners.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
          <h4 className="font-outfit font-bold text-xl text-slate-800">No Flat Owners Found</h4>
          <p className="text-xs text-slate-500 mt-2">
            We couldn't find any community members matching your current filters. Try resetting the search query or invite a new flat owner.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTower('All');
              setSelectedType('All');
            }}
            className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow hover:bg-slate-800 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent line based on Tower */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  owner.tower === 'Tower A'
                    ? 'bg-amber-500'
                    : owner.tower === 'Tower B'
                    ? 'bg-orange-500'
                    : 'bg-indigo-600'
                }`}
              />

              <div>
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={owner.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                      alt={owner.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform bg-slate-200"
                    />
                    <div>
                      <h4 className="font-outfit font-bold text-lg text-slate-900 leading-tight">
                        {owner.name}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">
                        {owner.profession || 'Resident'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-400 font-outfit font-extrabold text-xs shadow-xs">
                      {owner.tower} • #{owner.flat_number}
                    </span>
                    
                    {/* Role Display */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                      owner.role === 'Admin' ? 'bg-rose-100 text-rose-800' :
                      owner.role === 'Committee Member' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {owner.role === 'Committee Member' ? 'Executive Member' : (owner.role || 'Member')}
                    </span>
                  </div>
                </div>
                
                {/* Admin Role Assignment Tools */}
                {user && profile?.role === 'Admin' && (
                  <div className="mb-4 bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Manage Access Role</span>
                    <select
                      value={owner.role || 'Member'}
                      onChange={(e) => handleRoleChange(owner.id, e.target.value)}
                      className="text-xs bg-white border border-rose-200 text-rose-900 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-400"
                    >
                      <option value="Member">Member</option>
                      <option value="Committee Member">Executive Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                )}

                {/* Committee Role Ribbon if applicable */}
                {owner.committee_role && (
                  <div className="mb-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-l-3 border-amber-500 py-1.5 px-3 rounded-r-lg flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{owner.committee_role}</span>
                  </div>
                )}

                {/* Contact details */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4">
                  {owner.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-mono font-medium">{owner.phone}</span>
                    </div>
                  )}
                  {owner.move_in_date && (
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Member since {new Date(owner.move_in_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Interests Pills */}
                {owner.interests && owner.interests.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Interests & Hobbies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {owner.interests.map((interest: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-amber-400 hover:bg-amber-50/50 transition"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Verification status */}
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Society Resident
                </span>
                <button
                  onClick={() => alert(`Initiating secure chat with ${owner.name} (${owner.tower} #${owner.flat_number})...`)}
                  className="font-bold text-slate-800 hover:text-amber-600 transition cursor-pointer"
                >
                  Send Direct Message →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
