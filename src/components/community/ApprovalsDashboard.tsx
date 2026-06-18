import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { CheckCircle, XCircle, ShieldAlert, Users, Loader2 } from 'lucide-react';
import { AssignHouseholdModal } from './AssignHouseholdModal';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const ApprovalsDashboard: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'Visitor')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPendingUsers(data);
    }
    setLoading(false);
  };

  const handleApproveClick = (user: Profile) => {
    setSelectedUser(user);
  };

  const handleApproveSuccess = () => {
    if (selectedUser) {
      setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    // Rejection could either mean deleting the profile, or leaving it as Visitor. 
    // We will leave it as Visitor but maybe flag it? For now, we'll just remove from list by ignoring, 
    // or we can just delete the profile. Let's do a soft rejection by deleting the profile to clean up.
    // However, deleting profile requires cascading to auth.users which we can't easily do from client.
    // So for MVP, we just don't have a "Reject" that deletes. We just don't approve them.
    // We can show a toast or alert instead.
    alert("To permanently reject, you must delete their account from the Supabase dashboard.");
    setProcessingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-outfit font-extrabold text-slate-800 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              Pending Approvals
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Verify and grant portal access to new registrations
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl text-red-600 font-semibold border border-red-100">
            <Users className="w-5 h-5" />
            {pendingUsers.length} Pending
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-outfit font-bold text-slate-800 text-lg">All Caught Up!</h4>
            <p className="text-slate-500 text-sm">There are no pending user registrations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUsers.map(user => (
              <div key={user.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{user.name}</h4>
                    <span className="inline-block mt-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-md">
                      Claimed: {user.tower === 'Unassigned' ? '' : 'Tower'} {user.tower} - {user.flat_number}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-6">
                  <button
                    onClick={() => handleApproveClick(user)}
                    disabled={processingId === user.id}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Assign & Approve
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processingId === user.id}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    title="Reject"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <AssignHouseholdModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onSuccess={handleApproveSuccess} 
        />
      )}
    </div>
  );
};
