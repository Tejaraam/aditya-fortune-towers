import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { Plus, CheckCircle2, Search, Loader2, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../common/AuthContext';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

type Payment = Database['public']['Tables']['maintenance_payments']['Row'];
type Flat = Database['public']['Tables']['flats']['Row'];
type MonthlyMaintenance = Database['public']['Tables']['monthly_maintenance']['Row'];

export const MaintenanceCollection: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<(Payment & { flat: Flat })[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [currentCycle, setCurrentCycle] = useState<MonthlyMaintenance | null>(null);
  
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedFlat, setSelectedFlat] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionReference, setTransactionReference] = useState('');
  const [remarks, setRemarks] = useState('');

  const [duesSummary, setDuesSummary] = useState<any[]>([]);

  const isAdminOrCommittee = profile?.role === 'Admin' || profile?.role === 'Committee Member';

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Fetch current cycle
      const { data: cycleData, error: cycleError } = await supabase
        .from('monthly_maintenance')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (cycleError) throw cycleError;

      // Fetch flats
      const { data: flatsData, error: flatsError } = await supabase
        .from('flats')
        .select('*')
        .eq('is_active', true)
        .order('tower')
        .order('flat_number');

      if (flatsError) throw flatsError;
      setFlats(flatsData);

      // Fetch Dues Summary
      const { data: duesData, error: duesError } = await supabase
        .from('vw_flat_dues_summary')
        .select('*');
      
      if (!duesError && duesData) {
        setDuesSummary(duesData);
      }

      if (cycleData) {
        setCurrentCycle(cycleData);
        // Fetch payments for this cycle
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('maintenance_payments')
          .select(`*, flat:flats(*)`)
          .eq('maintenance_id', cycleData.id)
          .order('payment_date', { ascending: false });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData as any[]);
      } else {
        setCurrentCycle(null);
        setPayments([]);
      }
    } catch (err) {
      console.error('Error fetching maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeCycle = async () => {
    if (!isAdminOrCommittee) return;
    try {
      setIsSubmitting(true);
      const now = new Date();
      const { error } = await supabase.from('monthly_maintenance').insert({
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert('Error initializing cycle: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle || !selectedFlat || !amount || !user) return;

    try {
      setIsSubmitting(true);
      const paymentAmount = parseFloat(amount);
      const flat = flats.find(f => f.id === selectedFlat);
      const summary = duesSummary.find(d => d.flat_id === selectedFlat);
      
      if (!flat) throw new Error('Flat not found');

      const receipt_number = `AFT-${currentCycle.year}-${String(currentCycle.month).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;
      
      const totalPayable = (summary?.pending_dues || 0) + flat.monthly_maintenance_fee;
      let status = 'Paid';
      if (paymentAmount < totalPayable) status = 'Partially Paid';
      else if (paymentAmount > totalPayable) status = 'Advance Paid';
      
      // If paymentAmount === flat.monthly_maintenance_fee but they had previous pending dues,
      // it might still be partially paid for the OVERALL balance, but let's keep it simple.

      const { data: insertedPayment, error } = await supabase.from('maintenance_payments').insert({
        maintenance_id: currentCycle.id,
        flat_id: selectedFlat,
        amount: paymentAmount,
        payment_date: paymentDate,
        payment_mode: paymentMode,
        transaction_reference: transactionReference,
        remarks: remarks,
        receipt_number: receipt_number,
        billing_month: currentCycle.month,
        billing_year: currentCycle.year,
        collected_by: user.id,
        status: status,
        created_by: user.id
      }).select().single();

      if (error) throw error;
      
      // Also insert into receipts table
      await supabase.from('receipts').insert({
        payment_id: insertedPayment.id,
        receipt_number: receipt_number
      });
      
      setShowAddModal(false);
      setSelectedFlat('');
      setAmount('');
      setTransactionReference('');
      setRemarks('');
      alert(`Payment recorded successfully! Receipt generated: ${receipt_number}`);
      await fetchData();
    } catch (err: any) {
      alert('Error recording payment: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine flats with their payment status
  const flatsWithStatus = flats.map(flat => {
    const payment = payments.find(p => p.flat_id === flat.id);
    return {
      ...flat,
      payment
    };
  });

  const filteredFlats = flatsWithStatus.filter(f => 
    f.flat_number.toLowerCase().includes(search.toLowerCase()) || 
    f.tower.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  if (!currentCycle && isAdminOrCommittee) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm animate-in fade-in duration-300">
        <AlertCircle className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
        <h4 className="font-outfit text-xl font-bold text-slate-800">New Month Cycle</h4>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto mb-6">
          The financial cycle for the current month has not been started. Initialize it now to load carry-forward balances and begin recording maintenance payments.
        </p>
        <button 
          onClick={initializeCycle}
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 mx-auto"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Initialize Current Month Cycle
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Maintenance Collection</h3>
          <p className="text-xs text-slate-500 mt-1">Track and record monthly maintenance payments for all flats.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search flats..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          {isAdminOrCommittee && currentCycle && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:scale-102 transition cursor-pointer w-full sm:w-auto text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFlats.map((flat) => {
          const summary = duesSummary.find(d => d.flat_id === flat.id);
          const hasPending = summary && summary.pending_dues > 0;
          
          return (
          <div key={flat.id} className={`p-4 rounded-2xl border ${flat.payment && !hasPending ? 'bg-emerald-50 border-emerald-100' : hasPending && flat.payment ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'} transition`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{flat.tower}</span>
                <h5 className="font-outfit font-extrabold text-xl text-slate-800">{flat.flat_number}</h5>
              </div>
              {flat.payment ? (
                <span className={`${hasPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1`}>
                  <CheckCircle2 className="w-3 h-3" /> {hasPending ? 'Partially Paid' : 'Paid'}
                </span>
              ) : (
                <span className={`${hasPending ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'} px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider`}>
                  {hasPending && summary.pending_dues > flat.monthly_maintenance_fee ? 'Overdue' : 'Pending'}
                </span>
              )}
              {flat.payment && (
                <button
                  onClick={() => {
                    const profile = null; // Profiles are not fetched in this component currently
                    generateReceiptPDF(
                      flat.payment!, 
                      flat, 
                      profile, 
                      summary?.pending_dues || 0,
                      (summary?.pending_dues || 0) + flat.monthly_maintenance_fee,
                      summary?.pending_dues || 0
                    );
                  }}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-1.5 rounded-full transition"
                  title="Download Receipt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className={`text-sm font-semibold mt-4 ${hasPending ? 'text-rose-600' : 'text-slate-700'}`}>
              ₹ {hasPending ? summary.pending_dues.toLocaleString('en-IN') : flat.payment ? flat.payment.amount.toLocaleString('en-IN') : flat.monthly_maintenance_fee.toLocaleString('en-IN')}
              {hasPending && <span className="text-xs font-normal text-rose-500 ml-1">Total Balance</span>}
            </div>
            {flat.payment && (
              <div className="text-xs text-slate-500 mt-1">
                Via {flat.payment.payment_mode} on {new Date(flat.payment.payment_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )})}
        {filteredFlats.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No flats found matching your search.
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer">✕</button>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-900 mb-6 border-b border-slate-100 pb-4">Record Payment</h3>
            
            <form onSubmit={handleRecordPayment} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Select Flat</label>
                <select 
                  required 
                  value={selectedFlat} 
                  onChange={(e) => {
                    setSelectedFlat(e.target.value);
                    const flat = flats.find(f => f.id === e.target.value);
                    if (flat) setAmount(flat.monthly_maintenance_fee.toString());
                  }} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer"
                >
                  <option value="" disabled>-- Select Flat --</option>
                  {flats.filter(f => !payments.find(p => p.flat_id === f.id)).map(f => (
                    <option key={f.id} value={f.id}>{f.tower} - {f.flat_number}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (INR)</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                  <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Transaction Ref (Optional)</label>
                  <input type="text" placeholder="UPI Ref / Cheque No" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Remarks (Optional)</label>
                  <input type="text" placeholder="Add a note..." value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
              </div>
              
              <div className="pt-4 flex items-center gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg transition flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
