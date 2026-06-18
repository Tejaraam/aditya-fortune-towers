import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Calendar, User, CheckCircle2, BookOpen, MessageSquare, Loader2, Upload } from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdf';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';
import { Database } from '../../types/database.types';

type DocRow = Database['public']['Tables']['communications']['Row'] & {
  profiles?: { name: string } | null;
};

export const Communication: React.FC = () => {
  const { user, profile } = useAuth();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Minutes of Meeting' | 'Communication' | 'Letter to Authority'>('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Minutes of Meeting' | 'Communication' | 'Letter to Authority'>('Communication');
  const [newSummary, setNewSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('communications')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .order('doc_date', { ascending: false });

      if (error) throw error;
      setDocs(data as DocRow[]);
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary || !user) return;

    setIsUploading(true);

    try {
      let fileUrl = null;
      let fileName = `AFT_Communication_${Date.now()}.pdf`;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${newType.replace(/\s+/g, '-')}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('communications')
        .insert({
          title: newTitle,
          doc_type: newType,
          summary: newSummary,
          author_id: user.id,
          file_url: fileUrl,
          doc_date: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      await fetchDocs();
      
      setNewTitle('');
      setNewSummary('');
      setSelectedFile(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredDocs = docs.filter((d) => (filter === 'All' ? true : d.doc_type === filter));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>AFTOWA Official Communications</span>
          </div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">Meeting Minutes & Circulars</h3>
          <p className="text-xs text-slate-500 mt-1">Upload and share Minutes of Meeting, meeting communications, and official letters to authorities.</p>
        </div>

        {user && (profile?.role === 'Admin' || profile?.role === 'Committee Member') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-outfit font-bold px-5 py-3 rounded-xl shadow text-xs hover:scale-102 transition cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Minutes of Meeting', 'Communication', 'Letter to Authority'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filter === f ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 hover:shadow-xl hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  doc.doc_type === 'Minutes of Meeting' ? 'bg-amber-100 text-amber-800' :
                  doc.doc_type === 'Communication' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {doc.doc_type}
                </span>
              </div>

              <h4 className="font-outfit font-bold text-lg text-slate-900 leading-tight mb-2">{doc.title}</h4>

              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(doc.doc_date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {doc.profiles?.name || 'Unknown'}</span>
              </div>

              <p className="text-sm text-slate-600 font-light leading-relaxed">{doc.summary}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono truncate max-w-[60%]">
                {doc.file_url ? 'Attachment Available' : 'Generated Document'}
              </span>
              {doc.file_url ? (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Open
                </a>
              ) : (
                <button
                  onClick={() =>
                    generateAndDownloadPdf({
                      fileName: `AFT_Doc_${doc.id.substring(0, 5)}.pdf`,
                      title: doc.title,
                      subtitle: `${doc.doc_type}  •  ${new Date(doc.doc_date).toLocaleDateString()}  •  ${doc.profiles?.name || 'Unknown'}`,
                      bodyLines: [
                        'ADITYA FORTUNE TOWERS RESIDENTIAL FLAT OWNERS WELFARE ASSOCIATION (AFTOWA)',
                        'Midhilapuri Vuda Colony, Madhurawada, Visakhapatnam - 530041',
                        '',
                        'DOCUMENT TYPE: ' + doc.doc_type,
                        'DATE: ' + new Date(doc.doc_date).toLocaleDateString(),
                        'AUTHORIZED BY: ' + (doc.profiles?.name || 'Unknown'),
                        '',
                        'SUMMARY',
                        doc.summary,
                        '',
                        'This is a system-generated official document copy from the AFTOWA digital portal.',
                        'For the certified hard copy, please contact the AFTOWA office at the Clubhouse.',
                      ],
                      footer: 'AFTOWA Digital Portal  •  Confidential - For Members Only',
                    })
                  }
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No communications found.
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600"><BookOpen className="w-6 h-6" /></div>
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">Upload Official Document</h3>
                <p className="text-xs text-slate-500">Minutes, circulars, or letters to authorities</p>
              </div>
            </div>
            <form onSubmit={handleAddDoc} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Document Title *</label>
                <input type="text" required placeholder="e.g. Minutes of Monthly Committee Meeting" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Document Type</label>
                <select value={newType} onChange={(e: any) => setNewType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                  <option value="Minutes of Meeting">Minutes of Meeting</option>
                  <option value="Communication">Communication</option>
                  <option value="Letter to Authority">Letter to Authority</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Attachment (Optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-slate-400" />
                    <p className="text-xs text-slate-500">
                      {selectedFile ? (
                        <span className="font-bold text-indigo-600">{selectedFile.name}</span>
                      ) : (
                        <><span className="font-bold">Click to upload</span> or drag and drop</>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, DOCX, JPG (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Summary / Brief Description *</label>
                <textarea rows={4} required placeholder="Brief description of the document contents and key decisions..." value={newSummary} onChange={(e) => setNewSummary(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-light leading-relaxed" />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition cursor-pointer" disabled={isUploading}>Cancel</button>
                <button type="submit" disabled={isUploading} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-outfit font-extrabold text-sm shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                  {isUploading ? 'Publishing...' : 'Publish Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
