import React, { useState, useEffect } from 'react';
import { Image, Plus, Download, Calendar, User, FileText, Sparkles, Loader2, Upload } from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdf';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';
import { Database } from '../../types/database.types';

type PictureRow = Database['public']['Tables']['pictures']['Row'] & {
  profiles?: { name: string } | null;
};

export const Pictures: React.FC = () => {
  const { user, profile } = useAuth();
  const [pictures, setPictures] = useState<PictureRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<'All' | 'Event Photos' | 'Project Drawings' | 'Approvals & Documents' | 'Infrastructure'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Event Photos' | 'Project Drawings' | 'Approvals & Documents' | 'Infrastructure'>('Event Photos');
  const [newDesc, setNewDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPictures();
  }, []);

  const fetchPictures = async () => {
    try {
      const { data, error } = await supabase
        .from('pictures')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .order('pic_date', { ascending: false });

      if (error) throw error;
      setPictures(data as PictureRow[]);
    } catch (error) {
      console.error('Error fetching pictures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPicture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !selectedFile || !user) return;

    setIsUploading(true);

    try {
      // 1. Upload to Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${newCategory.replace(/\s+/g, '-')}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // 3. Insert into DB
      const { error: dbError } = await supabase
        .from('pictures')
        .insert({
          title: newTitle,
          category: newCategory,
          description: newDesc,
          image_url: publicUrl,
          file_name: selectedFile.name,
          uploaded_by_id: user.id,
          pic_date: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      // Refresh list
      await fetchPictures();
      
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Failed to upload picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredPictures = pictures.filter((p) => (filter === 'All' ? true : p.category === filter));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Image className="w-4 h-4" />
            <span>AFTOWA Gallery & Documents</span>
          </div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">Pictures, Drawings & Approvals</h3>
          <p className="text-xs text-slate-500 mt-1">All the pictures, drawings, approvals, and project documents uploaded from time to time.</p>
        </div>

        {user && (profile?.role === 'Admin' || profile?.role === 'Committee Member') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-outfit font-bold px-5 py-3 rounded-xl shadow text-xs hover:scale-102 transition cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Picture</span>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Event Photos', 'Project Drawings', 'Approvals & Documents', 'Infrastructure'] as const).map((f) => (
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

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPictures.map((pic) => (
          <div key={pic.id} className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl hover:border-amber-400 transition-all flex flex-col">
            <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
              <img src={pic.image_url} alt={pic.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                pic.category === 'Event Photos' ? 'bg-amber-500 text-white' :
                pic.category === 'Project Drawings' ? 'bg-indigo-600 text-white' :
                pic.category === 'Approvals & Documents' ? 'bg-emerald-600 text-white' :
                'bg-rose-600 text-white'
              }`}>
                {pic.category}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h4 className="font-outfit font-bold text-base text-slate-900 leading-tight mb-2">{pic.title}</h4>
              <p className="text-xs text-slate-600 font-light leading-relaxed flex-1">{pic.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(pic.pic_date).toLocaleDateString()}</span>
                <button
                  onClick={() =>
                    generateAndDownloadPdf({
                      fileName: pic.file_name || 'Document.pdf',
                      title: pic.title,
                      subtitle: `${pic.category}  •  ${new Date(pic.pic_date).toLocaleDateString()}`,
                      bodyLines: [
                        'ADITYA FORTUNE TOWERS - AFTOWA GALLERY & ARCHIVES',
                        'Madhurawada, Visakhapatnam - 530041',
                        '',
                        'CATEGORY: ' + pic.category,
                        'DATE: ' + new Date(pic.pic_date).toLocaleDateString(),
                        'UPLOADED BY: ' + (pic.profiles?.name || 'Unknown'),
                        '',
                        'DESCRIPTION',
                        pic.description,
                        '',
                        'Image reference URL:',
                        pic.image_url,
                        '',
                        'This document is a system-generated record from the AFTOWA digital archive.',
                      ],
                      footer: 'AFTOWA Digital Portal  •  Pictures, Drawings & Approvals',
                    })
                  }
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
              <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3" /> Uploaded by: {pic.profiles?.name || 'Unknown'}
              </div>
            </div>
          </div>
        ))}
        {filteredPictures.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No pictures found in this category.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600"><Sparkles className="w-6 h-6" /></div>
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">Upload Picture</h3>
                <p className="text-xs text-slate-500">Add to the official AFTOWA gallery & archives</p>
              </div>
            </div>
            <form onSubmit={handleAddPicture} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title *</label>
                <input type="text" required placeholder="e.g. New Year Party 2026 Highlights" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select value={newCategory} onChange={(e: any) => setNewCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                  {['Event Photos', 'Project Drawings', 'Approvals & Documents', 'Infrastructure'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Image File *</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 mb-2 text-slate-400" />
                    <p className="text-xs text-slate-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG or GIF (MAX. 5MB)</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} required />
                </label>
                {previewUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden h-32 bg-slate-100 border border-slate-200">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description *</label>
                <textarea rows={3} required placeholder="Brief description of the picture..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-light" />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition cursor-pointer" disabled={isUploading}>Cancel</button>
                <button type="submit" disabled={isUploading || !selectedFile} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} 
                  {isUploading ? 'Uploading...' : 'Publish to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
