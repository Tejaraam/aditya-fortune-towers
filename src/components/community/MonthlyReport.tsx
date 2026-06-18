import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdf';
import { Database } from '../../types/database.types';

type MonthlyMaintenance = Database['public']['Tables']['monthly_maintenance']['Row'];

export const MonthlyReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<MonthlyMaintenance[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      fetchReportData(selectedCycleId);
    }
  }, [selectedCycleId]);

  const fetchCycles = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_maintenance')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setCycles(data as any[]);
      if (data && data.length > 0) {
        setSelectedCycleId(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching cycles', err);
      setLoading(false);
    }
  };

  const fetchReportData = async (cycleId: string) => {
    try {
      setLoading(true);
      const cycle = cycles.find(c => c.id === cycleId);
      if (!cycle) return;

      const [paymentsRes, expRes, flatsRes] = await Promise.all([
        supabase.from('maintenance_payments').select('*, flat:flats(*)').eq('maintenance_id', cycleId),
        supabase.from('expenditures').select('*').eq('maintenance_id', cycleId),
        supabase.from('flats').select('*').eq('is_active', true)
      ]);

      setReportData({
        cycle,
        payments: paymentsRes.data || [],
        expenditures: expRes.data || [],
        flats: flatsRes.data || []
      });
    } catch (err) {
      console.error('Error fetching report details', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (m: number) => new Date(2000, m - 1).toLocaleString('default', { month: 'long' });
  const formatINR = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  const downloadPDF = () => {
    if (!reportData) return;
    const { cycle, expenditures, flats, payments } = reportData;
    const monthName = getMonthName(cycle.month);

    const expLines = expenditures.map((e: any) => `${new Date(e.expense_date).toLocaleDateString()} | ${e.category} | ${e.vendor_name || '-'} | - ${formatINR(e.amount)}`);
    const flatLines = flats.map((f: any) => {
      const p = payments.find((p: any) => p.flat_id === f.id);
      return `${f.tower}-${f.flat_number} | ${p ? 'Paid (' + p.payment_mode + ')' : 'Pending'} | ${p ? formatINR(p.amount) : formatINR(f.monthly_maintenance_fee)}`;
    });

    generateAndDownloadPdf({
      fileName: `FortuneTowers_${monthName}_${cycle.year}_Report.pdf`,
      title: 'AFTOWA Monthly Financial Report',
      subtitle: `${monthName} ${cycle.year} Statement`,
      bodyLines: [
        '--- EXECUTIVE SUMMARY ---',
        `Opening Balance      : ${formatINR(cycle.opening_balance)}`,
        `Expected Collection  : ${formatINR(cycle.expected_collection)}`,
        `Amount Collected     : ${formatINR(cycle.collected_amount)}`,
        `Total Expenditure    : ${formatINR(cycle.total_expenditure)}`,
        `Closing Balance      : ${formatINR(cycle.closing_balance)}`,
        `Pending Dues         : ${formatINR(cycle.pending_amount)}`,
        '',
        '--- EXPENDITURES ---',
        ...expLines,
        expLines.length === 0 ? 'No expenditures recorded.' : '',
        '',
        '--- FLAT WISE STATUS ---',
        ...flatLines,
        '',
        'System Generated Report.'
      ],
      footer: 'Aditya Fortune Towers Residential Flat Owners Welfare Association'
    });
  };

  const downloadCSV = () => {
    if (!reportData) return;
    const { cycle, flats, payments } = reportData;
    
    let csv = `Tower,Flat Number,Maintenance Fee,Status,Amount Paid,Payment Mode,Payment Date\n`;
    
    flats.forEach((f: any) => {
      const p = payments.find((p: any) => p.flat_id === f.id);
      csv += `"${f.tower}","${f.flat_number}",${f.monthly_maintenance_fee},"${p ? 'Paid' : 'Pending'}",${p ? p.amount : 0},"${p ? p.payment_mode : ''}","${p ? p.payment_date : ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FortuneTowers_${getMonthName(cycle.month)}_${cycle.year}_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !reportData) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Monthly Financial Report</h3>
          <p className="text-xs text-slate-500 mt-1">Generate and download cycle-specific financial statements.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <select 
            value={selectedCycleId} 
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer text-sm"
          >
            {cycles.map(c => (
              <option key={c.id} value={c.id}>{getMonthName(c.month)} {c.year}</option>
            ))}
          </select>
        </div>
      </div>

      {!reportData ? (
        <div className="text-center py-12 text-slate-500">No data available for the selected cycle.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Opening</div>
              <div className="font-outfit font-extrabold text-slate-800">{formatINR(reportData.cycle.opening_balance)}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Collected</div>
              <div className="font-outfit font-extrabold text-emerald-800">{formatINR(reportData.cycle.collected_amount)}</div>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
              <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Expenditure</div>
              <div className="font-outfit font-extrabold text-rose-800">{formatINR(reportData.cycle.total_expenditure)}</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Closing</div>
              <div className="font-outfit font-extrabold text-indigo-800">{formatINR(reportData.cycle.closing_balance)}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-end pt-4">
            <button onClick={downloadCSV} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition">
              <FileText className="w-4 h-4" /> Download CSV
            </button>
            <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
