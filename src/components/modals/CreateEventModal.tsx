import React, { useState } from 'react';
import { Calendar, Sparkles, Wand2, User, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isStitching, setIsStitching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Celebration' | 'Sports' | 'Meeting' | 'Cultural' | 'Kids' | 'Workshop'>('Celebration');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Clubhouse Central Banquet Hall');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleImages: Record<string, string> = {
    Celebration: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    Sports: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    Workshop: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    Meeting: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    Cultural: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    Kids: 'https://images.unsplash.com/photo-1485518994577-6cd6324ade8f?auto=format&fit=crop&w=800&q=80',
  };

  const handleSimulateGoogleStitch = () => {
    if (!aiPrompt.trim()) return;
    setIsStitching(true);

    setTimeout(() => {
      const pLower = aiPrompt.toLowerCase();
      let pickedCat: any = 'Celebration';
      let pickedImg = sampleImages.Celebration;
      let genTitle = '🌟 Full Moon Musical Potluck & Community Fest';
      let genLoc = 'Central Party Lawn & Amphitheater';
      let genDesc = `Join your Aditya Fortune Towers neighbors for an exquisite evening of wonderful music, homemade specialties, and laughter. ${aiPrompt}`;
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      let genDate = tomorrow.toISOString().split('T')[0];
      let genTime = '19:00';

      if (pLower.includes('badminton') || pLower.includes('sport') || pLower.includes('game') || pLower.includes('match') || pLower.includes('cricket')) {
        pickedCat = 'Sports';
        pickedImg = sampleImages.Sports;
        genTitle = '🏆 AFT Weekend Super Sports Challenge';
        genLoc = 'Clubhouse Sports Ground Floor';
        genDesc = `Get ready for high-octane sporting action! We are setting up exciting brackets for residents of Towers A, B, and C based on your prompt: "${aiPrompt}". Trophies for winners!`;
        genTime = '08:00';
      } else if (pLower.includes('meet') || pLower.includes('discuss') || pLower.includes('agm') || pLower.includes('solar') || pLower.includes('rule')) {
        pickedCat = 'Meeting';
        pickedImg = sampleImages.Meeting;
        genTitle = '📊 Community Forum & Action Briefing';
        genLoc = 'Clubhouse Mini-Theater';
        genDesc = `An important discussion session for verified flat owners. We will go over key points and establish working committees. Prompt reference: "${aiPrompt}".`;
        genTime = '10:30';
      } else if (pLower.includes('yoga') || pLower.includes('kids') || pLower.includes('camp') || pLower.includes('cook') || pLower.includes('learn')) {
        pickedCat = 'Workshop';
        pickedImg = sampleImages.Workshop;
        genTitle = '🧘 Interactive Community Skills Workshop';
        genLoc = 'Clubhouse Rooftop Pavilion';
        genDesc = `Enrich your mind and body with our expert-led community session. Designed to engage and inspire. Created from prompt: "${aiPrompt}".`;
        genTime = '06:30';
      }

      setTitle(genTitle);
      setCategory(pickedCat);
      setLocation(genLoc);
      setDescription(genDesc);
      setDate(genDate);
      setTime(genTime);
      setPreviewUrl(pickedImg); // Use AI image if no file selected
      
      setIsStitching(false);
      setMode('manual');
    }, 1800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !user || !date || !time) return;

    setIsSubmitting(true);

    try {
      let finalImageUrl = previewUrl || sampleImages[category] || sampleImages.Celebration;
      
      // Merge date and time into TIMESTAMPTZ
      const eventDateTime = new Date(`${date}T${time}`).toISOString();

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from('events')
        .insert({
          title,
          category,
          event_date: eventDateTime,
          location,
          description,
          organizer_id: user.id,
          image_url: finalImageUrl,
          is_ai_stitched: aiPrompt.trim().length > 0,
          ai_prompt: aiPrompt.trim() ? aiPrompt.trim() : null,
        });

      if (dbError) throw dbError;

      onEventCreated();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20"
        >
          ✕
        </button>

        {/* Modal Title Banner */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-900">Share Community Event Details</h3>
            <p className="text-xs text-slate-500">Broadcast your invitation to all verified resident flat owners</p>
          </div>
        </div>

        {/* Organizer Selector (Readonly based on Auth) */}
        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 text-sm text-slate-700">
          <User className="w-4 h-4 text-amber-600" />
          <span>Posting On Behalf Of: <strong>{profile?.name} ({profile?.tower} #{profile?.flat_number})</strong></span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex-1 py-3 rounded-xl font-outfit font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>⚡ Smart AI Compose Mode</span>
          </button>
          
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 rounded-xl font-outfit font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>✏️ Manual Setup Mode</span>
          </button>
        </div>

        {/* AI Mode Body */}
        {mode === 'ai' ? (
          <div className="space-y-6 animate-in fade-in duration-200 py-2">
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 rounded-3xl text-white shadow-xl border border-indigo-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <Wand2 className="w-4 h-4 animate-spin duration-3000" />
                <span>Smart AI Event Assistant</span>
              </div>
              <h4 className="font-outfit text-2xl font-black text-white">
                Describe your community event, and the assistant builds the complete card.
              </h4>
              <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                Our smart assistant structures the event description, picks a matching banner, and creates the RSVP slots automatically.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">What event do you want to organize? *</label>
              <div className="relative">
                <textarea
                  rows={4}
                  placeholder="e.g. Hosting a Diwali Festive Dinner & Kids Fancy Dress Parade next Sunday at 6 PM in the Main Clubhouse Banquet Hall. Please RSVP so we can arrange food plates!"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isStitching}
                  className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-indigo-200 focus:outline-none focus:bg-white focus:border-indigo-600 text-sm text-slate-900 placeholder-slate-400 font-medium leading-relaxed shadow-inner"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase self-center mr-1">Suggestions:</span>
                {[
                  'Weekend Musical BBQ Party',
                  'Sunday Inter-Tower Cricket',
                  'Monthly AFTOWA Society Meet',
                  'Clubhouse Yoga & Breathwork',
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(s)}
                    className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="button"
                disabled={isStitching || !aiPrompt.trim()}
                onClick={handleSimulateGoogleStitch}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-outfit font-extrabold text-base flex items-center justify-center gap-3 transition shadow-xl cursor-pointer ${
                  isStitching || !aiPrompt.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-indigo-600/30 hover:scale-102'
                }`}
              >
                {isStitching ? (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                    <span>⚡ AI Assistant is Designing your Event...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    <span>⚡ Generate Event with AI Assistant</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Manual Review / Form Setup */
          <form onSubmit={handlePostEvent} className="space-y-4 text-sm animate-in fade-in duration-200 py-2">
            
            {aiPrompt && (
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between text-xs text-indigo-950 font-semibold">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Generated successfully from your prompt! You can review or tweak details below.</span>
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Traditional Ganesh Chaturthi Celebrations"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => {
                    setCategory(e.target.value);
                    if (!selectedFile && !previewUrl) {
                      setPreviewUrl(sampleImages[e.target.value] || sampleImages.Celebration);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer"
                >
                  <option value="Celebration">Celebration 🎉</option>
                  <option value="Sports">Sports 🏆</option>
                  <option value="Workshop">Workshop 🧘</option>
                  <option value="Meeting">Meeting 📊</option>
                  <option value="Cultural">Cultural 🎭</option>
                  <option value="Kids">Kids Event 🎈</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Party Lawn & Banquet Hall"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Event Timing *</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Invitation Summary *</label>
              <textarea
                required
                rows={4}
                placeholder="Include what activities are planned, dinner or refreshments, dress code, and what owners should bring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-light leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Banner Image (Optional File Upload)</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-xs text-slate-500">
                    {selectedFile ? (
                      <span className="font-bold text-indigo-600">{selectedFile.name}</span>
                    ) : (
                      <><span className="font-bold">Click to upload custom banner</span> or use AI generated image</>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">JPG, PNG (MAX. 5MB)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              
              {previewUrl && (
                <div className="mt-2 rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200 relative">
                  <span className="absolute top-2 left-2 bg-slate-900/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">PREVIEW</span>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:scale-102 transition cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Broadcast Event to Live Feed 🚀</span>}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
