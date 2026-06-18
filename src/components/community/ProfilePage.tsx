import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Calendar, Briefcase, Heart, Camera, Shield, FileText, CheckCircle2, Loader2, Link, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Profile state
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [visibility, setVisibility] = useState(true);
  
  // Local Settings
  const [remindBirthday, setRemindBirthday] = useState(true);
  const [remindAnniversary, setRemindAnniversary] = useState(true);

  useEffect(() => {
    if (user) {
      const bday = localStorage.getItem(`remind_birthday_${user.id}`);
      if (bday !== null) setRemindBirthday(bday === 'true');
      
      const anniv = localStorage.getItem(`remind_anniversary_${user.id}`);
      if (anniv !== null) setRemindAnniversary(anniv === 'true');
    }
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setDob(profile.date_of_birth || '');
      setAnniversary(profile.marriage_anniversary || '');
      setGender(profile.gender || '');
      setBio(profile.bio || '');
      setOccupation(profile.occupation || '');
      setInterests(profile.interests?.join(', ') || '');
      setLinkedin(profile.linkedin_url || '');
      setEmergencyName(profile.emergency_contact_name || '');
      setEmergencyPhone(profile.emergency_contact_phone || '');
      setVisibility(profile.profile_visibility ?? true);
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);

      const updates = {
        email,
        phone,
        date_of_birth: dob || null,
        marriage_anniversary: anniversary || null,
        gender,
        bio,
        occupation,
        interests: interestsArray.length > 0 ? interestsArray : null,
        linkedin_url: linkedin,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        profile_visibility: visibility,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Save local preferences
      localStorage.setItem(`remind_birthday_${user.id}`, remindBirthday.toString());
      localStorage.setItem(`remind_anniversary_${user.id}`, remindAnniversary.toString());

      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!e.target.files || e.target.files.length === 0 || !user) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-indigo-400 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-indigo-500 text-white p-2 rounded-full border-2 border-slate-900 shadow-lg hover:bg-indigo-400 transition cursor-pointer"
              title="Change Photo"
            >
              {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>{profile.role}</span>
            </div>
            <h2 className="font-outfit text-3xl font-extrabold tracking-tight">{profile.name}</h2>
            <p className="text-indigo-200 mt-1 flex items-center gap-2">
              <span className="font-semibold">{profile.tower} - {profile.flat_number}</span>
              <span className="opacity-50">•</span>
              <span>{profile.resident_type}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-outfit text-xl font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500 mt-1">Update your profile details and privacy settings.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Visibility</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={visibility} onChange={(e) => setVisibility(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-8 fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="p-6 space-y-8">
          
          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Mail className="w-4 h-4 text-indigo-500" /> Contact Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" placeholder="your.email@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">LinkedIn Profile</label>
                <div className="relative">
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-indigo-500" /> Basic Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Marriage Anniversary</label>
                <input type="date" value={anniversary} onChange={e => setAnniversary(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm">
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional & Bio */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Professional & About
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Occupation</label>
                <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" placeholder="e.g. Software Engineer, Doctor" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Interests & Hobbies</label>
                <input type="text" value={interests} onChange={e => setInterests(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" placeholder="Cricket, Reading, Photography (comma separated)" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Bio</label>
              <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white transition text-sm" placeholder="Tell the community a little bit about yourself..."></textarea>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-4 border-b border-rose-200 pb-2">
              <Heart className="w-4 h-4 text-rose-500" /> Emergency Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Contact Name</label>
                <input type="text" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none focus:border-rose-400 transition text-sm" placeholder="Relative or Friend Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Contact Phone</label>
                <input type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-none focus:border-rose-400 transition text-sm" placeholder="Emergency Number" />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Reminder Preferences
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">Birthday Reminder</p>
                  <p className="text-xs text-slate-500 mt-1">Automatically add your Birthday to Personal Reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={remindBirthday} onChange={(e) => setRemindBirthday(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">Anniversary Reminder</p>
                  <p className="text-xs text-slate-500 mt-1">Automatically add your Anniversary to Personal Reminders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={remindAnniversary} onChange={(e) => setRemindAnniversary(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-outfit font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
