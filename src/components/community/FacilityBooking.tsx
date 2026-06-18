import React, { useState } from 'react';
import { facilities } from '../../data/mockData';
import { Facility } from '../../types';
import { Clock, Sparkles, CheckCircle2, AlertCircle, BookmarkCheck } from 'lucide-react';

export const FacilityBooking: React.FC = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slot, setSlot] = useState('10:00 AM - 02:00 PM');
  const [residentFlat, setResidentFlat] = useState('Tower A - 101');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !residentFlat) return;

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedFacility(null);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>Aditya Fortune Towers Amenities</span>
          </div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">
            Book Clubhouse Facilities Online
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Exclusive service for flat owners to reserve party lawns, private movie screenings, and sports arenas.
          </p>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="bg-white rounded-3xl shadow-md overflow-hidden border border-slate-200 flex flex-col justify-between hover:shadow-xl transition group"
          >
            <div>
              <div className="relative aspect-16/9 overflow-hidden bg-slate-100">
                <img
                  src={fac.image}
                  alt={fac.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow ${
                    fac.status === 'Available'
                      ? 'bg-emerald-500 text-white'
                      : fac.status === 'Fully Booked'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {fac.status}
                </span>
              </div>

              <div className="p-6">
                <h4 className="font-outfit font-extrabold text-lg text-slate-900 leading-snug mb-3">
                  {fac.name}
                </h4>

                <div className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Capacity: <strong className="text-slate-900">{fac.capacity}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Timings: <strong className="text-slate-900">{fac.timings}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-emerald-700">{fac.charges}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                disabled={fac.status !== 'Available'}
                onClick={() => setSelectedFacility(fac)}
                className={`w-full py-3 rounded-2xl font-outfit font-bold text-xs shadow transition cursor-pointer ${
                  fac.status === 'Available'
                    ? 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {fac.status === 'Available' ? 'Reserve Facility ⚡' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
            
            <button
              onClick={() => {
                setSelectedFacility(null);
                setBookingSuccess(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div className="py-12 text-center flex flex-col items-center justify-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-outfit font-extrabold text-3xl text-slate-900">Facility Reserved Successfully!</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                  A confirmation token has been logged for <strong className="text-slate-900">{selectedFacility.name}</strong>. Our Facility Manager will coordinate your setup.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <BookmarkCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-extrabold text-2xl text-slate-900 leading-tight">
                      {selectedFacility.name}
                    </h3>
                    <p className="text-xs text-amber-600 font-semibold">{selectedFacility.charges}</p>
                  </div>
                </div>

                <form onSubmit={handleBook} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Resident Flat *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tower B - Flat 405"
                      value={residentFlat}
                      onChange={(e) => setResidentFlat(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Booking Date *</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time Slot</label>
                      <select
                        value={slot}
                        onChange={(e) => setSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold"
                      >
                        <option value="10:00 AM - 02:00 PM">10:00 AM - 02:00 PM</option>
                        <option value="02:30 PM - 06:30 PM">02:30 PM - 06:30 PM</option>
                        <option value="07:00 PM - 11:00 PM">07:00 PM - 11:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Society guidelines request clean-up of the venue within 30 mins after your booked slot concludes. Loud speakers prohibited after 10 PM.</span>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFacility(null)}
                      className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-md transition"
                    >
                      Confirm Reservation ✓
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
