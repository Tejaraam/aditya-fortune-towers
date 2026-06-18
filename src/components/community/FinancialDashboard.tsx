import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { Building2, Wallet, TrendingUp, TrendingDown, IndianRupee, PieChart, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../common/AuthContext';

type MonthlyMaintenance = Database['public']['Tables']['monthly_maintenance']['Row'];

export const FinancialDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentCycle, setCurrentCycle] = useState<MonthlyMaintenance | null>(null);
  const [totalFlats, setTotalFlats] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [cycleRes, flatsRes] = await Promise.all([
        supabase
          .from('monthly_maintenance')
          .select('*')
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .maybeSingle(),
        supabase
          .from('flats')
          .select('id', { count: 'exact' })
          .eq('is_active', true)
      ]);

      if (cycleRes.error && cycleRes.error.code !== 'PGRST116') throw cycleRes.error;
      if (flatsRes.error) throw flatsRes.error;

      setCurrentCycle(cycleRes.data);
      setTotalFlats(flatsRes.count || 0);

    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!currentCycle) {
    return (
      <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 text-center animate-in fade-in duration-300">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-amber-900 font-outfit">No Active Cycle</h3>
        <p className="text-amber-700 mt-2 text-sm">
          The financial cycle for this month has not been initialized yet.
          Go to "Maintenance Collection" to start the cycle.
        </p>
      </div>
    );
  }

  const rawPercentage = currentCycle.expected_collection > 0 
    ? Math.round((currentCycle.collected_amount / currentCycle.expected_collection) * 100) 
    : 0;
  const collectionPercentage = Math.min(rawPercentage, 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-extrabold text-slate-800 font-outfit">
          Financial Dashboard (Current Month)
        </h3>
        <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 font-bold text-sm rounded-full">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Flats */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Flats</span>
            <Building2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="font-outfit text-3xl font-extrabold text-slate-800">{totalFlats}</div>
        </div>

        {/* Collection Percentage */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Collection Rate</span>
            <PieChart className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="font-outfit text-3xl font-extrabold text-emerald-600">{collectionPercentage}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${collectionPercentage}%` }}></div>
          </div>
        </div>

        {/* Opening Balance */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Opening Balance</span>
            <Wallet className="w-5 h-5 text-slate-400" />
          </div>
          <div className="font-outfit text-3xl font-extrabold text-slate-800">{formatINR(currentCycle.opening_balance)}</div>
          <p className="text-[10px] text-slate-400 mt-1">Carried forward from last month</p>
        </div>

        {/* Closing Balance */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-3xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Closing Balance</span>
            <IndianRupee className="w-5 h-5 opacity-90" />
          </div>
          <div className="font-outfit text-3xl font-extrabold">{formatINR(currentCycle.closing_balance)}</div>
          <p className="text-[10px] opacity-70 mt-1">Live calculation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expected Collection */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-700 text-sm">Expected Collection</h4>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-outfit text-slate-800">{formatINR(currentCycle.expected_collection)}</div>
        </div>

        {/* Collected Amount */}
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-emerald-800 text-sm">Collected So Far</h4>
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-outfit text-emerald-700">{formatINR(currentCycle.collected_amount)}</div>
        </div>

        {/* Pending Amount */}
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-rose-800 text-sm">Pending Dues</h4>
            <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-outfit text-rose-700">{formatINR(currentCycle.pending_amount)}</div>
        </div>
      </div>
      
      {/* Total Expenditure */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expenditure</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-outfit text-3xl font-extrabold text-rose-600">{formatINR(currentCycle.total_expenditure)}</div>
        </div>
        <div className="text-right">
           <p className="text-sm font-semibold text-slate-600">Monthly Expenses limit</p>
           <p className="text-xs text-slate-400 mt-1">View detailed breakdown in the Expenditures tab.</p>
        </div>
      </div>
    </div>
  );
};
