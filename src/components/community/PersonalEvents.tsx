import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Loader2, CalendarDays, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';
import { Database } from '../../types/database.types';

type PersonalEventRow = Database['public']['Tables']['personal_events']['Row'];

export const PersonalEvents: React.FC = () => {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<PersonalEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('Reminder');
  const [eventDate, setEventDate] = useState('');
  const [reminderDays, setReminderDays] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personal_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });
        
      if (error) throw error;
      
      const combinedEvents = [...(data || [])];
      
      // Check local preferences
      const remindBirthday = localStorage.getItem(`remind_birthday_${user.id}`) !== 'false';
      const remindAnniversary = localStorage.getItem(`remind_anniversary_${user.id}`) !== 'false';
      
      // Inject Birthday and Anniversary from Profile
      if (profile) {
        if (profile.date_of_birth && remindBirthday) {
          combinedEvents.push({
            id: 'auto-birthday',
            user_id: profile.id,
            title: 'My Birthday',
            description: 'Automatically added from your profile',
            event_type: 'Family',
            event_date: profile.date_of_birth,
            reminder_days_before: 1,
            is_recurring: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        if (profile.marriage_anniversary && remindAnniversary) {
          combinedEvents.push({
            id: 'auto-anniversary',
            user_id: profile.id,
            title: 'Marriage Anniversary',
            description: 'Automatically added from your profile',
            event_type: 'Family',
            event_date: profile.marriage_anniversary,
            reminder_days_before: 1,
            is_recurring: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      
      // Sort combined events by date (month/day only since they recur)
      // Actually, standard sort by event_date is fine, but for recurring we might want to just sort by date string
      combinedEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      
      setEvents(combinedEvents);
    } catch (error) {
      console.error('Error fetching personal events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !eventDate) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('personal_events').insert({
        user_id: user.id,
        title,
        description: description || null,
        event_type: eventType,
        event_date: eventDate,
        reminder_days_before: reminderDays,
        is_recurring: isRecurring
      });

      if (error) throw error;
      
      setTitle('');
      setDescription('');
      setEventDate('');
      setShowForm(false);
      await fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to save reminder. Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      const { error } = await supabase.from('personal_events').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete reminder.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-outfit text-2xl font-bold text-slate-900">My Personal Reminders</h3>
          <p className="text-sm text-slate-500">Manage private reminders for bills, doctors, and family events. Only visible to you.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Reminder'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in slide-in-from-top-4 duration-200">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" /> Create New Reminder
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Title *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500" placeholder="e.g. Pay Electricity Bill" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500">
                <option value="Reminder">General Reminder</option>
                <option value="Bill">Bill Payment</option>
                <option value="Appointment">Appointment</option>
                <option value="Family">Family Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Date *</label>
              <input type="date" required value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Remind me</label>
              <select value={reminderDays} onChange={e => setReminderDays(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500">
                <option value={0}>On the day</option>
                <option value={1}>1 day before</option>
                <option value={3}>3 days before</option>
                <option value={7}>1 week before</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Notes</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500" placeholder="Optional details..." />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded text-indigo-600" />
            <label htmlFor="recurring" className="text-sm text-slate-700">Repeats annually (e.g. Birthday, Anniversary)</label>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition flex items-center gap-2 disabled:opacity-70">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : events.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-200">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-slate-700">No Reminders Yet</h4>
          <p className="text-slate-500 text-sm mt-1">Keep track of your bills and appointments privately.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <div key={event.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    event.event_type === 'Bill' ? 'bg-rose-100 text-rose-700' :
                    event.event_type === 'Appointment' ? 'bg-amber-100 text-amber-700' :
                    event.event_type === 'Family' ? 'bg-pink-100 text-pink-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {event.event_type}
                  </span>
                  {!event.id.startsWith('auto-') && (
                    <button onClick={() => handleDelete(event.id)} className="text-slate-400 hover:text-rose-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{event.title}</h4>
                {event.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{event.description}</p>}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span>{new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {event.is_recurring && <Clock className="w-3.5 h-3.5 text-indigo-400 ml-auto" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Also define X component locally since it wasn't imported
function X(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
