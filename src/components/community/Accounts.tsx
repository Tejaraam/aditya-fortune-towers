import React, { useState } from 'react';
import { DollarSign, AlertCircle, LayoutDashboard, Wallet, Receipt, PieChart, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../common/AuthContext';
import { FinancialDashboard } from './FinancialDashboard';
import { MaintenanceCollection } from './MaintenanceCollection';
import { ExpenditureManager } from './ExpenditureManager';
import { FinancialCharts } from './FinancialCharts';
import { MonthlyReport } from './MonthlyReport';
import { YearlyReport } from './YearlyReport';

export const Accounts: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collection', label: 'Collection', icon: Wallet },
    { id: 'expenditure', label: 'Expenditure', icon: Receipt },
    { id: 'charts', label: 'Analytics', icon: PieChart },
    { id: 'monthly', label: 'Monthly Report', icon: FileText },
    { id: 'yearly', label: 'Yearly Report', icon: Calendar },
  ];

  if (!user) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 animate-in fade-in duration-300">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h4 className="font-outfit text-xl font-bold text-slate-800">Authentication Required</h4>
        <p className="text-slate-500 mt-2 text-sm">Please login to view society financial accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <DollarSign className="w-4 h-4" />
          <span>Financial Management System</span>
        </div>
        <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">Apartment Accounts</h3>
        <p className="text-xs text-slate-500 mt-1">Manage maintenance, vendor payouts, and generate detailed reports.</p>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-6">
        {activeTab === 'dashboard' && <FinancialDashboard />}
        {activeTab === 'collection' && <MaintenanceCollection />}
        {activeTab === 'expenditure' && <ExpenditureManager />}
        {activeTab === 'charts' && <FinancialCharts />}
        {activeTab === 'monthly' && <MonthlyReport />}
        {activeTab === 'yearly' && <YearlyReport />}
      </div>
    </div>
  );
};
