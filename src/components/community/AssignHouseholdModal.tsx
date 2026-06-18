import React, { useState, useEffect } from 'react';
import { X, Building2, UserCircle, Loader2, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Flat = Database['public']['Tables']['flats']['Row'];

interface AssignHouseholdModalProps {
  user: Profile;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignHouseholdModal: React.FC<AssignHouseholdModalProps> = ({ user, onClose, onSuccess }) => {
  const [tower, setTower] = useState(user.tower === 'Unassigned' ? 'A' : user.tower);
  const [flatNumber, setFlatNumber] = useState(user.flat_number === 'Unassigned' ? '' : user.flat_number);
  const [isPrimaryOwner, setIsPrimaryOwner] = useState(true);
  const [monthlyFee, setMonthlyFee] = useState(3500);

  const [existingFlat, setExistingFlat] = useState<Flat | null>(null);
  const [loadingFlat, setLoadingFlat] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if flat exists whenever tower or flatNumber changes
  useEffect(() => {
    const checkFlat = async () => {
      if (!tower || !flatNumber) return;
      setLoadingFlat(true);
      
      const { data, error } = await supabase
        .from('flats')
        .select('*')
        .eq('tower', tower)
        .eq('flat_number', flatNumber)
        .single();
        
      if (!error && data) {
        setExistingFlat(data);
        if (data.monthly_maintenance_fee) {
          setMonthlyFee(Number(data.monthly_maintenance_fee));
        }
      } else {
        setExistingFlat(null);
      }
      setLoadingFlat(false);
    };
    
    checkFlat();
  }, [tower, flatNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tower || !flatNumber) {
      setError('Please provide a Tower and Flat Number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Update Profile Role & Flat Info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'Member',
          tower: tower,
          flat_number: flatNumber
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Assign Primary Owner if requested
      if (isPrimaryOwner) {
        if (existingFlat) {
          // Update existing flat owner
          const { error: flatError } = await supabase
            .from('flats')
            .update({ owner_profile_id: user.id })
            .eq('id', existingFlat.id);
          if (flatError) throw flatError;
        } else {
          // Create new flat
          const { error: newFlatError } = await supabase
            .from('flats')
            .insert({
              tower: tower,
              flat_number: flatNumber,
              monthly_maintenance_fee: monthlyFee,
              owner_profile_id: user.id,
              is_active: true
            });
          if (newFlatError) throw newFlatError;
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to approve user');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-outfit font-extrabold text-slate-800">Assign Household</h2>
            <p className="text-sm text-slate-500 mt-1">Approve and link {user.name} to a flat.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tower</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={tower}
                    onChange={(e) => setTower(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    placeholder="e.g. A"
                    required
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flat Number</label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                  placeholder="e.g. 101"
                  required
                />
              </div>
            </div>

            {/* Flat Status Indicator */}
            <div className={`p-4 rounded-xl border ${loadingFlat ? 'bg-slate-50 border-slate-100' : existingFlat ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              {loadingFlat ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking flat database...
                </div>
              ) : existingFlat ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Flat Record Found</h4>
                    <p className="text-emerald-700 text-xs mt-0.5">
                      This flat already exists in the financial ledger.
                      {existingFlat.owner_profile_id && existingFlat.owner_profile_id !== user.id && (
                        <span className="block mt-1 text-red-600 font-medium">Warning: It currently has another assigned owner!</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">New Flat Entry</h4>
                    <p className="text-amber-700 text-xs mt-0.5">
                      This flat does not exist in the financial ledger yet.
                    </p>
                    
                    {isPrimaryOwner && (
                      <div className="mt-3">
                        <label className="block text-xs font-bold text-amber-900 mb-1">Set Monthly Maintenance Fee (₹)</label>
                        <input
                          type="number"
                          value={monthlyFee}
                          onChange={(e) => setMonthlyFee(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition text-sm"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={isPrimaryOwner}
                    onChange={(e) => setIsPrimaryOwner(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition"></div>
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition">Make Primary Owner</div>
                  <p className="text-xs text-slate-500 mt-1">
                    If checked, this user will be legally linked to the flat and responsible for all financial maintenance bills and ledgers. If unchecked, they will just be a standard family member with portal access.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingFlat}
              className="flex-[2] px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <UserCircle className="w-5 h-5" />
                  <span>{isPrimaryOwner ? (existingFlat ? 'Link Owner & Approve' : 'Create Flat & Approve') : 'Approve Member'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
