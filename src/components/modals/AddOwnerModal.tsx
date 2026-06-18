import React, { useState } from 'react';
import { FlatOwner } from '../../types';
import { UserPlus, ShieldCheck } from 'lucide-react';

interface AddOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOwner: (newOwner: FlatOwner) => void;
}

export const AddOwnerModal: React.FC<AddOwnerModalProps> = ({ isOpen, onClose, onAddOwner }) => {
  const [name, setName] = useState('');
  const [tower, setTower] = useState<'Tower A' | 'Tower B' | 'Tower C'>('Tower A');
  const [flatNumber, setFlatNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [residentType, setResidentType] = useState<'Owner Resident' | 'Owner (Rented Out)' | 'Tenant'>('Owner Resident');
  const [moveInDate, setMoveInDate] = useState('Jan 2026');
  const [profession, setProfession] = useState('');
  const [interestsStr, setInterestsStr] = useState('');
  const [committeeRole, setCommitteeRole] = useState('');

  if (!isOpen) return null;

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !flatNumber || !phone) return;

    const interests = interestsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const randomAvatar = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];

    const newOwner: FlatOwner = {
      id: `owner-${Date.now()}`,
      name,
      tower,
      flatNumber,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone,
      residentType,
      moveInDate,
      profession: profession || 'Resident Specialist',
      interests: interests.length > 0 ? interests : ['Community Activities', 'Fitness', 'Vizag Living'],
      avatar: randomAvatar,
      committeeRole: committeeRole.trim() ? committeeRole.trim() : undefined,
    };

    onAddOwner(newOwner);

    // Reset form
    setName('');
    setFlatNumber('');
    setEmail('');
    setPhone('');
    setProfession('');
    setInterestsStr('');
    setCommitteeRole('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-900">Add Flat Owner to Community Database</h3>
            <p className="text-xs text-slate-500">Register verified details for real-time networking & event RSVPs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name / Joint Names *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh & Kavita Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Profession / Designation</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Architect"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tower *</label>
              <select
                value={tower}
                onChange={(e: any) => setTower(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer"
              >
                <option value="Tower A">Tower A</option>
                <option value="Tower B">Tower B</option>
                <option value="Tower C">Tower C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Flat Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 504"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Resident Type *</label>
              <select
                value={residentType}
                onChange={(e: any) => setResidentType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer"
              >
                <option value="Owner Resident">Owner Resident</option>
                <option value="Owner (Rented Out)">Owner (Rented Out)</option>
                <option value="Tenant">Tenant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98490 XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hobbies & Interests (Comma Separated)</label>
            <input
              type="text"
              placeholder="Classical Music, Running, Organic Gardening, Baking"
              value={interestsStr}
              onChange={(e) => setInterestsStr(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-light"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Committee Role (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Sports Secretary or Auditor"
                value={committeeRole}
                onChange={(e) => setCommitteeRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Move-In Date</label>
              <input
                type="text"
                placeholder="e.g. March 2026"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
              />
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Adding to AFTOWA Hub creates a verified encrypted resident profile instantly accessible to all society members.</span>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-md transition"
            >
              Add Verified Flat Owner ✓
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
