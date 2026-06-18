import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Database } from '../../types/database.types';

type MonthlyMaintenance = Database['public']['Tables']['monthly_maintenance']['Row'];
type Expenditure = Database['public']['Tables']['expenditures']['Row'];

export const FinancialCharts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [yearlyData, setYearlyData] = useState<MonthlyMaintenance[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);

  useEffect(() => {
    fetchChartsData();
  }, []);

  const fetchChartsData = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();

      const [monthlyRes, expRes] = await Promise.all([
        supabase.from('monthly_maintenance').select('*').eq('year', currentYear).order('month', { ascending: true }),
        supabase.from('expenditures').select('amount, category').gte('expense_date', `${currentYear}-01-01`).lte('expense_date', `${currentYear}-12-31`)
      ]);

      if (monthlyRes.error) throw monthlyRes.error;
      if (expRes.error) throw expRes.error;

      setYearlyData(monthlyRes.data);
      setExpenditures(expRes.data as any[]);
    } catch (err) {
      console.error('Error fetching charts data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n: number) => '₹ ' + (n / 1000).toFixed(1) + 'k';
  const getMonthName = (m: number) => new Date(2000, m - 1).toLocaleString('default', { month: 'short' });

  // Calculate max value for the chart scale
  const maxAmount = Math.max(
    ...yearlyData.map(d => Math.max(d.collected_amount, d.total_expenditure)),
    1000 // avoid division by zero
  );

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenditures.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  const totalExp = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Trend Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-outfit text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" /> Collection vs Expenditure Trend ({new Date().getFullYear()})
        </h3>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 justify-end text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Collected</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Expenditure</div>
          </div>

          <div className="h-64 flex items-end gap-2 sm:gap-4 border-b border-slate-200 pb-2 relative pt-8 mt-4">
             {/* Y-Axis lines (approximate) */}
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2 opacity-10">
                <div className="border-t border-slate-900 w-full"></div>
                <div className="border-t border-slate-900 w-full"></div>
                <div className="border-t border-slate-900 w-full"></div>
                <div className="border-t border-slate-900 w-full"></div>
             </div>

            {yearlyData.map((data) => {
              const colHeight = (data.collected_amount / maxAmount) * 100;
              const expHeight = (data.total_expenditure / maxAmount) * 100;

              return (
                <div key={data.month} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group z-10">
                  <div className="w-full h-[80%] flex items-end justify-center gap-1">
                    <div 
                      className="w-1/2 max-w-[24px] bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-400 relative" 
                      style={{ height: `${colHeight}%`, minHeight: data.collected_amount > 0 ? '4px' : '0' }}
                      title={`Collected: ₹${data.collected_amount.toLocaleString()}`}
                    ></div>
                    <div 
                      className="w-1/2 max-w-[24px] bg-rose-500 rounded-t-md transition-all hover:bg-rose-400 relative" 
                      style={{ height: `${expHeight}%`, minHeight: data.total_expenditure > 0 ? '4px' : '0' }}
                      title={`Expenditure: ₹${data.total_expenditure.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{getMonthName(data.month)}</span>
                </div>
              );
            })}
            {yearlyData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                No monthly cycle data found for {new Date().getFullYear()}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="font-outfit text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-rose-500" /> Yearly Expenditure Breakdown
        </h3>
        
        <div className="space-y-4">
          {Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => {
            const pct = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-1.5">
                  <span>{cat}</span>
                  <span>₹ {amount.toLocaleString('en-IN')} <span className="text-slate-400 text-xs ml-1">({pct}%)</span></span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {Object.keys(categoryTotals).length === 0 && (
            <div className="text-center text-slate-400 py-8 text-sm">No expenditures recorded this year.</div>
          )}
        </div>
      </div>

    </div>
  );
};
