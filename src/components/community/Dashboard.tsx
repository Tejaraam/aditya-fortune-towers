import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertTriangle, Gift, Cake, Loader2, ArrowRight, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { useAuth } from '../common/AuthContext';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type ComplaintRow = Database['public']['Tables']['complaints']['Row'];

export const Dashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalResidents: 0,
    upcomingEvents: 0,
    openComplaints: 0,
    myPendingDues: 0
  });

  const [upcomingEvents, setUpcomingEvents] = useState<EventRow[]>([]);
  const [myReminders, setMyReminders] = useState<Database['public']['Tables']['personal_events']['Row'][]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Stats
      const { count: residentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', new Date().toISOString());
      const { count: complaintsCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).in('status', ['Open', 'In Progress']);

      let myPendingDues = 0;
      if (user) {
        const { data: myFlats } = await supabase.from('flats').select('id').eq('owner_profile_id', user.id);
        if (myFlats && myFlats.length > 0) {
          const flatIds = myFlats.map(f => f.id);
          const { data: summaries } = await supabase.from('vw_flat_dues_summary').select('pending_dues').in('flat_id', flatIds);
          if (summaries) {
            myPendingDues = summaries.reduce((sum, s) => sum + s.pending_dues, 0);
          }
        }
      }

      setStats({
        totalResidents: residentsCount || 0,
        upcomingEvents: eventsCount || 0,
        openComplaints: complaintsCount || 0,
        myPendingDues
      });

      // 2. Upcoming events (next 3)
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3);
      
      if (eventsData) setUpcomingEvents(eventsData);

      // 3. My Reminders (Personal Events)
      if (user) {
        const { data: myEvents } = await supabase
          .from('personal_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(3);
        
        if (myEvents) {
          setMyReminders(myEvents);
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper removed as we no longer show community celebrations

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-outfit text-3xl font-extrabold tracking-tight mb-2">Welcome to AFTOWA Hub</h2>
          <p className="text-indigo-200">Your central dashboard for community updates, events, and resident connectivity.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Residents</p>
            <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{stats.totalResidents}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Events</p>
            <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{stats.upcomingEvents}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Complaints</p>
            <h3 className="text-2xl font-outfit font-extrabold text-slate-900">{stats.openComplaints}</h3>
          </div>
        </div>
        {user && (
          <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stats.myPendingDues > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Pending Dues</p>
              <h3 className={`text-2xl font-outfit font-extrabold ${stats.myPendingDues > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                ₹ {stats.myPendingDues.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming Community Events Widget */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-outfit text-xl font-bold text-slate-900">Upcoming Events</h3>
            <button onClick={() => onNavigate('events')} className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No upcoming events scheduled.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer" onClick={() => onNavigate('events')}>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex flex-col items-center justify-center border border-indigo-100 shrink-0">
                    <span className="text-xs font-bold text-indigo-500 uppercase">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-outfit font-extrabold text-indigo-700 leading-none">{new Date(event.event_date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{event.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} • {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Reminders Widget */}
        {user && (
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-outfit text-xl font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-500" /> My Reminders
              </h3>
              <button onClick={() => onNavigate('profile')} className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 flex items-center gap-1">
                Manage <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {myReminders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl">
                <Cake className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No upcoming reminders.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer" onClick={() => onNavigate('profile')}>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex flex-col items-center justify-center border border-rose-100 shrink-0 text-rose-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{reminder.title}</h4>
                      <p className="text-xs text-slate-500">{new Date(reminder.event_date).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                        {reminder.event_type || 'Event'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
