import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdf';
import { Database } from '../../types/database.types';

type MonthlyMaintenance = Database['public']['Tables']['monthly_maintenance']['Row'];

export const YearlyReport: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearlyData, setYearlyData] = useState<MonthlyMaintenance[]>([]);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchYearData(selectedYear);
    }
  }, [selectedYear]);

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_maintenance')
        .select('year')
        .order('year', { ascending: false });

      if (error) throw error;
      
      const years = Array.from(new Set(data.map(d => d.year)));
      if (years.length === 0) {
        years.push(new Date().getFullYear());
      }
      setAvailableYears(years);
      setSelectedYear(years[0]);
    } catch (err) {
      console.error('Error fetching years', err);
      setLoading(false);
    }
  };

  const fetchYearData = async (year: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('monthly_maintenance')
        .select('*')
        .eq('year', year)
        .order('month', { ascending: true });

      if (error) throw error;
      setYearlyData(data as any[]);
    } catch (err) {
      console.error('Error fetching yearly data', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (m: number) => new Date(2000, m - 1).toLocaleString('default', { month: 'long' });
  const formatINR = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  const totalCollected = yearlyData.reduce((sum, d) => sum + d.collected_amount, 0);
  const totalExpenditure = yearlyData.reduce((sum, d) => sum + d.total_expenditure, 0);
  const totalPending = yearlyData.reduce((sum, d) => sum + d.pending_amount, 0);

  const downloadPDF = () => {
    const lines = yearlyData.map(d => 
      `${getMonthName(d.month)} | Col: ${formatINR(d.collected_amount)} | Exp: ${formatINR(d.total_expenditure)} | Bal: ${formatINR(d.closing_balance)}`
    );

    generateAndDownloadPdf({
      fileName: `FortuneTowers_${selectedYear}_Annual_Report.pdf`,
      title: 'AFTOWA Annual Financial Report',
      subtitle: `Financial Year ${selectedYear}`,
      bodyLines: [
        '--- ANNUAL SUMMARY ---',
        `Total Collected      : ${formatINR(totalCollected)}`,
        `Total Expenditure    : ${formatINR(totalExpenditure)}`,
        `Total Pending Dues   : ${formatINR(totalPending)}`,
        '',
        '--- MONTH WISE BREAKDOWN ---',
        ...lines,
        '',
        'System Generated Report.'
      ],
      footer: 'Aditya Fortune Towers Residential Flat Owners Welfare Association'
    });
  };

  const downloadCSV = () => {
    let csv = `Month,Opening Balance,Expected Collection,Amount Collected,Pending Dues,Total Expenditure,Closing Balance\n`;
    
    yearlyData.forEach(d => {
      csv += `"${getMonthName(d.month)}",${d.opening_balance},${d.expected_collection},${d.collected_amount},${d.pending_amount},${d.total_expenditure},${d.closing_balance}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FortuneTowers_${selectedYear}_Annual_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && yearlyData.length === 0) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Yearly Financial Report</h3>
          <p className="text-xs text-slate-500 mt-1">Consolidated annual statements and breakdowns.</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer text-sm"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {yearlyData.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No data available for {selectedYear}.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Collected ({selectedYear})</div>
              <div className="font-outfit text-3xl font-extrabold text-emerald-600">{formatINR(totalCollected)}</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Expenditure ({selectedYear})</div>
              <div className="font-outfit text-3xl font-extrabold text-rose-600">{formatINR(totalExpenditure)}</div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cumulative Pending</div>
              <div className="font-outfit text-3xl font-extrabold text-amber-600">{formatINR(totalPending)}</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Collected</th>
                  <th className="py-3 px-4 text-right">Expenditure</th>
                  <th className="py-3 px-4 text-right">Closing Bal.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {yearlyData.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-700">{getMonthName(d.month)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">{formatINR(d.collected_amount)}</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-semibold">{formatINR(d.total_expenditure)}</td>
                    <td className="py-3 px-4 text-right text-indigo-600 font-extrabold">{formatINR(d.closing_balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
