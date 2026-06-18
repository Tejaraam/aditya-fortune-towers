import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Sparkles, MessageSquare, Plus, CheckCircle2, User, Send, Share2, Loader2, Pencil, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';
import { CreateEventModal } from '../modals/CreateEventModal';
import { PersonalEvents } from './PersonalEvents';

export const EventSharing: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'community' | 'personal'>('community');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState<any[]>([]);

  const categories = ['All', 'Celebration', 'Sports', 'Meeting', 'Workshop'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey(id, name, tower, flat_number, avatar_url),
          event_attendees(
            profiles(id, name, tower, flat_number, avatar_url)
          ),
          event_comments(
            id,
            text,
            created_at,
            profiles(id, name, tower, flat_number, avatar_url)
          )
        `)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    return selectedCategory === 'All' || ev.category === selectedCategory;
  });

  const handleToggleRsvp = async (eventId: string) => {
    if (!user) {
      alert("Please login to RSVP");
      return;
    }
    
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const isAttending = event.event_attendees?.some((a: any) => a.profiles?.id === user.id);

    try {
      if (isAttending) {
        await supabase
          .from('event_attendees')
          .delete()
          .match({ event_id: eventId, user_id: user.id });
      } else {
        await supabase
          .from('event_attendees')
          .insert({ event_id: eventId, user_id: user.id });
      }
      fetchEvents();
    } catch (err) {
      console.error('Error toggling RSVP:', err);
    }
  };

  const handleAddComment = async (eventId: string) => {
    if (!user) {
      alert("Please login to comment");
      return;
    }
    const text = commentInputs[eventId]?.trim();
    if (!text) return;

    try {
      await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          owner_id: user.id,
          text,
        });
      
      setCommentInputs({ ...commentInputs, [eventId]: '' });
      fetchEvents();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner & Stitched Event Button */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-indigo-500/20 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Live Feed</span>
          </div>
          <h3 className="font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight">
            Share Event Details & Celebrations
          </h3>
          <p className="text-slate-300 text-sm mt-2 font-light max-w-xl">
            AFTOWA interactive platform for flat owners. Coordinate grand festivals, sports matches, and general body discussions flawlessly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
          {user && (profile?.role === 'Admin' || profile?.role === 'Committee Member') && (
            <button
              onClick={() => {
                setEventToEdit(null);
                setIsCreateEventModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-outfit font-extrabold px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition cursor-pointer text-sm shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Share New Event Details</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Community vs Personal Events */}
      <div className="flex justify-center mb-6">
        <div className="bg-slate-200/50 p-1.5 rounded-2xl inline-flex gap-2">
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'community' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            Community Events
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'personal' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            My Personal Reminders
          </button>
        </div>
      </div>

      {activeTab === 'personal' ? (
        <PersonalEvents />
      ) : (
        <>
          {/* Filters bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-outfit font-bold text-sm text-slate-700 pl-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>Filter by Event Type:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-pulse" />
          <h4 className="font-outfit font-bold text-xl text-slate-800">No Events in this Category</h4>
          <p className="text-xs text-slate-500 mt-2">
            No active announcements found for "{selectedCategory}". You can create a new event by clicking "Share New Event Details".
          </p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow cursor-pointer hover:bg-slate-800 transition"
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {filteredEvents.map((event) => {
            const isAttending = user ? event.event_attendees?.some((a: any) => a.profiles?.id === user.id) : false;

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden transition-all hover:shadow-2xl flex flex-col xl:flex-row group"
              >
                {/* Event Image Banner */}
                <div className="xl:w-5/12 relative aspect-16/9 xl:aspect-auto min-h-[280px] shrink-0 bg-slate-100 overflow-hidden">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Top Tags */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white/90 text-slate-900 font-outfit font-extrabold text-xs shadow-md backdrop-blur-xs">
                      {event.category}
                    </span>

                    {event.is_ai_stitched && (
                      <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-outfit font-bold text-xs shadow-md flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>AI Assisted</span>
                      </span>
                    )}
                  </div>

                  {/* Organizer Ribbon inside image bottom */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white">
                    <img
                      src={event.organizer?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                      alt={event.organizer?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-slate-800"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Shared by Flat Owner</span>
                      <span className="font-outfit font-bold text-sm text-slate-100 leading-tight">
                        {event.organizer?.name} <span className="text-amber-400 font-normal">({event.organizer?.tower} #{event.organizer?.flat_number})</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Body & Discussion */}
                <div className="xl:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  
                  {/* Title & Metadata */}
                  <div>
                    <h4 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                      {event.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 font-medium mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>{new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4 font-light">
                      {event.description}
                    </p>
                  </div>

                  {/* Attendees RSVP Status Box */}
                  <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2 overflow-hidden p-1">
                        {event.event_attendees?.slice(0, 5).map((att: any, idx: number) => {
                          const ownerObj = att.profiles;
                          if (!ownerObj) return null;
                          return (
                            <img
                              key={idx}
                              src={ownerObj.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                              alt={ownerObj.name}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm bg-slate-200"
                              title={`${ownerObj.name} (${ownerObj.tower} #${ownerObj.flat_number})`}
                            />
                          );
                        })}
                        {event.event_attendees?.length > 5 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white ring-2 ring-white">
                            +{(event.event_attendees?.length || 0) - 5}
                          </div>
                        )}
                      </div>

                      <div className="text-xs">
                        <span className="font-outfit font-extrabold text-slate-900 text-sm">
                          {event.event_attendees?.length || 0} Flat Owners Confirmed
                        </span>
                        <p className="text-slate-500 mb-2">RSVP to add your flat to the VIP dinner / seating arrangement.</p>
                        {user && (profile?.role === 'Admin' || profile?.role === 'Committee Member' || user.id === event.organizer_id) && (
                          <button 
                            onClick={() => {
                              setSelectedEventAttendees(event.event_attendees || []);
                              setAttendeesModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                          >
                            <Users className="w-3.5 h-3.5" /> View Full Guest List
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleToggleRsvp(event.id)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-outfit font-bold text-xs transition cursor-pointer w-full sm:w-auto ${
                          isAttending
                            ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                            : 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white shadow-md'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAttending ? '✓ You Are Going' : '+ RSVP Going'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: event.title, text: event.description, url: window.location.href });
                          } else {
                            alert('Event link copied to clipboard!');
                          }
                        }}
                        className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Share Event Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {user && (profile?.role === 'Admin' || profile?.role === 'Committee Member' || user.id === event.organizer_id) && (
                        <button
                          onClick={() => {
                            setEventToEdit(event);
                            setIsCreateEventModalOpen(true);
                          }}
                          className="p-3 bg-white rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Event"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Real-time Interactive Comment Section */}
                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 font-outfit font-bold text-sm text-slate-900 mb-4">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <span>Community Event Discussion ({(event.event_comments || []).length})</span>
                    </div>

                    {/* Existing Comments */}
                    <div className="space-y-3 mb-5 h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                      {(!event.event_comments || event.event_comments.length === 0) ? (
                        <p className="text-xs text-slate-400 italic">No comments yet. Be the first flat owner to start the conversation!</p>
                      ) : (
                        event.event_comments.map((comment: any) => (
                          <div key={comment.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                            <img
                              src={comment.profiles?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                              alt={comment.profiles?.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-white bg-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-outfit font-bold text-xs text-slate-900">
                                  {comment.profiles?.name} <span className="text-amber-600 font-semibold">({comment.profiles?.tower} #{comment.profiles?.flat_number})</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-light">{new Date(comment.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1 leading-relaxed break-words">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Bar */}
                    {user && (
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
                        <img
                          src={profile?.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'}
                          alt={profile?.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-white shadow-xs bg-slate-200"
                        />
                        <input
                          type="text"
                          placeholder={`Post note as ${profile?.name}...`}
                          value={commentInputs[event.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [event.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(event.id);
                          }}
                          className="flex-1 bg-transparent text-xs focus:outline-none text-slate-800 placeholder-slate-400"
                        />
                        <button
                          onClick={() => handleAddComment(event.id)}
                          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer"
                          title="Send Comment"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {isCreateEventModalOpen && (
        <CreateEventModal
          isOpen={isCreateEventModalOpen}
          onClose={() => {
            setIsCreateEventModalOpen(false);
            setEventToEdit(null);
          }}
          onEventCreated={fetchEvents}
          eventToEdit={eventToEdit}
        />
      )}

      {/* Attendees Modal */}
      {attendeesModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[80vh] flex flex-col">
            <button onClick={() => setAttendeesModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer">✕</button>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-900 mb-2 flex items-center gap-2">
               <Users className="text-indigo-500 w-6 h-6" /> Guest List
            </h3>
            <p className="text-sm text-slate-500 mb-6">{selectedEventAttendees.length} Flat Owners Confirmed</p>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {selectedEventAttendees.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No attendees yet.</p>
              ) : (
                selectedEventAttendees.map((att: any, idx: number) => {
                  const owner = att.profiles;
                  if (!owner) return null;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <img src={owner.avatar_url || 'https://www.gravatar.com/avatar/?d=mp'} alt={owner.name} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{owner.name}</div>
                        <div className="text-xs text-indigo-600 font-semibold">Tower {owner.tower} • Flat {owner.flat_number}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button onClick={() => setAttendeesModalOpen(false)} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">Close</button>
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
};
