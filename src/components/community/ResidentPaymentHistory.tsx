import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { useAuth } from '../common/AuthContext';
import { Download, FileText, Loader2, AlertCircle, History, CheckCircle2 } from 'lucide-react';
import { generateReceiptPDF } from '../../utils/pdfGenerator';

type Flat = Database['public']['Tables']['flats']['Row'];
type Payment = Database['public']['Tables']['maintenance_payments']['Row'];
type DuesSummary = Database['public']['Views']['vw_flat_dues_summary']['Row'];

export function ResidentPaymentHistory() {
  const { user } = useAuth();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [payments, setPayments] = useState<Record<string, Payment[]>>({});
  const [summaries, setSummaries] = useState<Record<string, DuesSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResidentData();
  }, [user]);

  async function fetchResidentData() {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch user's flats
      const { data: myFlats, error: flatsError } = await supabase
        .from('flats')
        .select('*')
        .eq('owner_profile_id', user.id);
        
      if (flatsError) throw flatsError;
      setFlats(myFlats || []);

      if (myFlats && myFlats.length > 0) {
        const flatIds = myFlats.map(f => f.id);

        // 2. Fetch payments for these flats
        const { data: myPayments, error: paymentsError } = await supabase
          .from('maintenance_payments')
          .select('*')
          .in('flat_id', flatIds)
          .order('payment_date', { ascending: false });

        if (paymentsError) throw paymentsError;

        const paymentsByFlat: Record<string, Payment[]> = {};
        myPayments?.forEach(p => {
          if (!paymentsByFlat[p.flat_id]) paymentsByFlat[p.flat_id] = [];
          paymentsByFlat[p.flat_id].push(p);
        });
        setPayments(paymentsByFlat);

        // 3. Fetch dues summary
        const { data: mySummaries, error: summariesError } = await supabase
          .from('vw_flat_dues_summary')
          .select('*')
          .in('flat_id', flatIds);

        if (summariesError) throw summariesError;

        const summaryByFlat: Record<string, DuesSummary> = {};
        mySummaries?.forEach(s => {
          summaryByFlat[s.flat_id] = s;
        });
        setSummaries(summaryByFlat);
      }
    } catch (err: any) {
      console.error('Error fetching resident payment history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (flats.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Flats Found</h3>
        <p className="text-slate-500">You don't have any flats associated with your account.</p>
      </div>
    );
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {flats.map(flat => {
        const flatPayments = payments[flat.id] || [];
        const flatSummary = summaries[flat.id];
        
        return (
          <div key={flat.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Tower {flat.tower}</span>
                <h3 className="font-outfit font-black text-2xl text-slate-800">Flat {flat.flat_number}</h3>
              </div>
              
              {flatSummary && (
                <div className="flex gap-4">
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pending</p>
                    <p className={`font-outfit font-black text-xl ${flatSummary.pending_dues > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatINR(flatSummary.pending_dues)}
                    </p>
                  </div>
                  <div className="bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Advance Paid</p>
                    <p className="font-outfit font-black text-xl text-emerald-700">
                      {formatINR(flatSummary.advance_paid)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Current Month Status Banner */}
            {flatSummary && (
              <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between border ${
                flatSummary.pending_dues > 0 
                  ? 'bg-red-50 border-red-100 text-red-800' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}>
                <div className="flex items-center gap-3">
                  {flatSummary.pending_dues > 0 ? (
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg">
                      {flatSummary.pending_dues > 0 ? 'Payment Required' : 'Payment Up to Date'}
                    </h4>
                    <p className="text-sm opacity-90">
                      {flatSummary.pending_dues > 0 
                        ? `You have pending dues of ${formatINR(flatSummary.pending_dues)}.` 
                        : 'You have cleared all maintenance dues for the current billing cycle.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <h4 className="font-outfit font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Payment History
            </h4>

            {flatPayments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-semibold">No payment records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Month/Year</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ref No.</th>
                      <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatPayments.map(payment => (
                      <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 text-sm font-semibold text-slate-700">
                          {new Date(payment.payment_date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm font-black text-slate-800">
                          {formatINR(payment.amount)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">
                          {payment.billing_month && payment.billing_year ? 
                            `${new Date(2000, payment.billing_month - 1).toLocaleString('default', { month: 'short' })} ${payment.billing_year}` 
                            : 'N/A'
                          }
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-500 font-mono">
                          {payment.receipt_number || payment.transaction_reference || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              generateReceiptPDF(
                                payment,
                                flat,
                                user as any, // Simple cast, profile name is used inside PDF generator
                                flatSummary?.pending_dues || 0, // This is approx for history
                                flatSummary?.current_month_charge || flat.monthly_maintenance_fee,
                                flatSummary?.advance_paid || 0
                              );
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition"
                          >
                            <Download className="w-3.5 h-3.5" /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
