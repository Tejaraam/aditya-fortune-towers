import React from 'react';
import { ShieldAlert, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../common/AuthContext';

export const PendingVerification: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-amber-100 max-w-lg w-full relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-orange-500/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-100">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>

          <h2 className="font-outfit text-3xl font-extrabold text-slate-900 mb-4">
            Verification Pending
          </h2>

          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Your account has been successfully created and is currently awaiting verification from the AFTOWA Committee. 
          </p>

          <div className="bg-amber-50/50 rounded-2xl p-4 mb-8 w-full border border-amber-100/50">
            <div className="flex items-start gap-3 text-left">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                To protect community data, manual verification is required. You will gain access to the portal once an admin approves your profile.
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
