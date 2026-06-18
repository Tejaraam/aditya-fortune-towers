import React, { useState } from 'react';
import { SocietyNotice } from '../../types';
import { FileText, AlertTriangle, Download, Plus, Clock, User } from 'lucide-react';

interface NoticeBoardProps {
  notices: SocietyNotice[];
  onAddNotice: (newNotice: SocietyNotice) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices, onAddNotice }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal'>('Normal');
  const [department, setDepartment] = useState<'Maintenance' | 'Security' | 'Management' | 'Finance'>('Maintenance');
  const [author, setAuthor] = useState('Dr. Ramesh Nambiar (President)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNotice: SocietyNotice = {
      id: `not-${Date.now()}`,
      title,
      date: 'Today',
      priority,
      author,
      department,
      content,
      attachmentName: `AFT_Notice_${Date.now()}.pdf`,
    };

    onAddNotice(newNotice);
    setTitle('');
    setContent('');
    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Official Society Circulars</span>
          </div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">
            AFTOWA Notice Board ({notices.length})
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Important announcements, maintenance protocols, and safety guidelines from the management committee.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-outfit font-bold px-6 py-3.5 rounded-2xl shadow text-xs transition cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Post Official Society Notice</span>
        </button>
      </div>

      {/* Notices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-3xl p-7 shadow-md hover:shadow-xl border border-slate-200/80 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
          >
            {/* Top Border Priority indicator */}
            <div
              className={`absolute top-0 left-0 right-0 h-2 ${
                notice.priority === 'Urgent'
                  ? 'bg-red-500'
                  : notice.priority === 'High'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />

            <div>
              {/* Header metadata */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 font-outfit font-extrabold text-[11px] rounded-lg">
                  {notice.department}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    notice.priority === 'Urgent'
                      ? 'bg-red-100 text-red-800 animate-pulse'
                      : notice.priority === 'High'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {notice.priority}
                </span>
              </div>

              <h4 className="font-outfit font-extrabold text-xl text-slate-900 leading-snug mb-3 group-hover:text-amber-600 transition">
                {notice.title}
              </h4>

              <p className="text-slate-600 text-xs leading-relaxed font-light mb-6">
                {notice.content}
              </p>
            </div>

            {/* Bottom Section */}
            <div>
              {notice.attachmentName && (
                <button
                  onClick={() => {
                    alert(`Simulating secure download of official document: ${notice.attachmentName}...`);
                  }}
                  className="mb-4 w-full flex items-center justify-between gap-2 p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/60 transition cursor-pointer text-xs font-semibold group/btn"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate">{notice.attachmentName}</span>
                  </span>
                  <Download className="w-4 h-4 text-indigo-600 shrink-0 group-hover/btn:translate-y-0.5 transition-transform" />
                </button>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {notice.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {notice.date}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Post Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">Publish Society Circular</h3>
                <p className="text-xs text-slate-500">Official broadcast to all Towers A, B, and C flat owners</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Lift Maintenance Protocol for Tower B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent 🚨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e: any) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Security">Security</option>
                    <option value="Management">Management</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Authorized By *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name & Designation"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Notice Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the maintenance timing, instructions, or society guidelines clearly..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-light"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-md transition"
                >
                  Broadcast Notice ⚡
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
