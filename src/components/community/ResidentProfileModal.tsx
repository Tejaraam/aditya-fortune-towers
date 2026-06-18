import React from 'react';
import { X, User, Mail, Phone, Calendar, Briefcase, Heart, Shield, Link } from 'lucide-react';
import { Database } from '../../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ResidentProfileModalProps {
  profile: Profile;
  onClose: () => void;
}

export const ResidentProfileModal: React.FC<ResidentProfileModalProps> = ({ profile, onClose }) => {
  const isVisible = profile.profile_visibility !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header / Banner */}
        <div className="relative pt-6 pr-6 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content (Scrollable) */}
        <div className="px-8 pb-8 pt-2 overflow-y-auto relative">
          
          {/* Avatar and Name Section */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-10 text-center sm:text-left">
            <div className="w-28 h-28 rounded-full border-4 border-slate-50 bg-slate-100 overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>
            <div className="flex-1 sm:pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <h2 className="text-3xl font-outfit font-extrabold text-slate-900 leading-none">{profile.name}</h2>
                {profile.role !== 'Member' && (
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {profile.role}
                  </span>
                )}
              </div>
              <p className="text-slate-500 font-medium">
                {profile.tower} - Flat {profile.flat_number} • {profile.resident_type}
              </p>
            </div>
          </div>

          {!isVisible ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-outfit font-bold text-slate-700 mb-1">Private Profile</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                This resident has chosen to keep their detailed profile private. You can only see basic identification information.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Bio */}
              {profile.bio && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Me</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Mail className="w-3.5 h-3.5" /> Contact
                  </h4>
                  {profile.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                      <a href={`mailto:${profile.email}`} className="text-slate-700 hover:text-indigo-600 truncate">{profile.email}</a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                      <a href={`tel:${profile.phone}`} className="text-slate-700 hover:text-emerald-600">{profile.phone}</a>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div className="flex items-center gap-3 text-sm">
                      <Link className="w-4 h-4 text-blue-600 shrink-0" />
                      <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">LinkedIn Profile</a>
                    </div>
                  )}
                  {!profile.email && !profile.phone && !profile.linkedin_url && (
                    <p className="text-xs text-slate-400 italic">No contact details provided.</p>
                  )}
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Briefcase className="w-3.5 h-3.5" /> Professional
                  </h4>
                  {profile.occupation ? (
                    <div className="flex items-start gap-3 text-sm">
                      <Briefcase className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{profile.occupation}</span>
                    </div>
                  ) : profile.profession ? (
                    <div className="flex items-start gap-3 text-sm">
                      <Briefcase className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{profile.profession}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No occupation provided.</p>
                  )}
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Calendar className="w-3.5 h-3.5" /> Important Dates
                  </h4>
                  <div className="flex flex-col gap-2 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Move-in Date:</span>
                      <span className="font-medium">{profile.move_in_date ? new Date(profile.move_in_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {profile.date_of_birth && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Birthday:</span>
                        <span className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                    {profile.marriage_anniversary && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Anniversary:</span>
                        <span className="font-medium">{new Date(profile.marriage_anniversary).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Heart className="w-3.5 h-3.5" /> Interests
                  </h4>
                  {profile.interests && profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, i) => (
                        <span key={i} className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No interests provided.</p>
                  )}
                </div>

                {/* Emergency Contact */}
                {profile.emergency_contact_name && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Shield className="w-3.5 h-3.5" /> Emergency Contact
                    </h4>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium">{profile.emergency_contact_name}</span>
                        {profile.emergency_contact_phone && (
                          <a href={`tel:${profile.emergency_contact_phone}`} className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mt-1">
                            <Phone className="w-3 h-3" /> {profile.emergency_contact_phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
