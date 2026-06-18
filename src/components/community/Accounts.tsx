import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, FileText, Plus, TrendingUp, TrendingDown, PieChart, Download, CheckCircle2, AlertCircle, Calculator, Loader2, UploadCloud, Edit2, FileImage, ExternalLink } from 'lucide-react';
import { generateAndDownloadPdf } from '../../utils/pdf';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../common/AuthContext';
import { Database } from '../../types/database.types';

type TransactionRow = Database['public']['Tables']['financial_transactions']['Row'];

export const Accounts: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<'Income' | 'Expense'>('Expense');
  const [newCategory, setNewCategory] = useState('Maintenance & Repairs');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdminOrCommittee = profile?.role === 'Admin' || profile?.role === 'Committee Member';

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          created_by:profiles!financial_transactions_created_by_fkey(name, committee_role)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(data as any[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.filter((t) => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenditure = transactions.filter((t) => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenditure;

  const filteredTransactions = transactions.filter((t) => (filter === 'All' ? true : t.type === filter));

  const openAddModal = () => {
    setEditingId(null);
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewType('Expense');
    setNewCategory('Maintenance & Repairs');
    setNewDesc('');
    setNewAmount('');
    setReceiptFile(null);
    setReceiptUrl(null);
    setShowAddModal(true);
  };

  const openEditModal = (tx: any) => {
    setEditingId(tx.id);
    setNewDate(tx.transaction_date);
    setNewType(tx.type);
    setNewCategory(tx.category);
    setNewDesc(tx.description);
    setNewAmount(tx.amount.toString());
    setReceiptFile(null);
    setReceiptUrl(tx.receipt_url || null);
    setShowAddModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !user) return;

    setIsSubmitting(true);
    try {
      let finalReceiptUrl = receiptUrl;

      // If a new file was selected, upload it to Supabase Storage
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        finalReceiptUrl = publicUrl;
      }

      const txData = {
        transaction_date: newDate,
        type: newType,
        category: newCategory,
        description: newDesc,
        amount: parseFloat(newAmount) || 0,
        receipt_url: finalReceiptUrl
      };

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('financial_transactions')
          .update(txData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('financial_transactions')
          .insert({
            ...txData,
            created_by: user.id
          });
        if (error) throw error;
      }
      
      await fetchTransactions();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatINR = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>AFTOWA Financial Management</span>
          </div>
          <h3 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900">Annual Accounts & Transactions</h3>
          <p className="text-xs text-slate-500 mt-1">Income & Expenditure Tables for FY 2026-27. Committee updates transactions; summary is auto-generated.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isAdminOrCommittee && (
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-outfit font-bold px-5 py-3 rounded-xl shadow text-xs hover:scale-102 transition cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Enter New Transaction</span>
            </button>
          )}
        </div>
      </div>

      {!user ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="font-outfit text-xl font-bold text-slate-800">Authentication Required</h4>
          <p className="text-slate-500 mt-2 text-sm">Please login to view society financial accounts.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Income</span>
                <TrendingUp className="w-5 h-5 opacity-90" />
              </div>
              <div className="font-outfit text-3xl font-extrabold">{formatINR(totalIncome)}</div>
              <div className="text-xs opacity-80 mt-2">FY 2026-27 (YTD)</div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Expenditure</span>
                <TrendingDown className="w-5 h-5 opacity-90" />
              </div>
              <div className="font-outfit text-3xl font-extrabold">{formatINR(totalExpenditure)}</div>
              <div className="text-xs opacity-80 mt-2">Security, Staff, Power, Repairs</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Net Surplus</span>
                <PieChart className="w-5 h-5 opacity-90" />
              </div>
              <div className="font-outfit text-3xl font-extrabold">{formatINR(netBalance)}</div>
              <div className="text-xs opacity-80 mt-2">After all operating expenses</div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Maintenance Per Flat</span>
                <Calculator className="w-5 h-5 opacity-90" />
              </div>
              <div className="font-outfit text-3xl font-extrabold">₹ 3,500</div>
              <div className="text-xs opacity-80 mt-2">Standard monthly charge</div>
            </div>
          </div>

          {/* Income vs Expenditure Category Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
              <h4 className="font-outfit font-bold text-lg text-emerald-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Income Breakdown
              </h4>
              <div className="space-y-3">
                {['Maintenance Charges', 'Clubhouse Rental', 'Parking Fee', 'Other'].map((cat) => {
                  const total = transactions.filter((t) => t.type === 'Income' && t.category === cat).reduce((s, t) => s + Number(t.amount), 0);
                  const pct = totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>{cat}</span>
                        <span>{formatINR(total)} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
              <h4 className="font-outfit font-bold text-lg text-rose-700 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> Expenditure Breakdown
              </h4>
              <div className="space-y-3">
                {['Security Services', 'Housekeeping', 'Electricity', 'Maintenance & Repairs', 'Landscaping'].map((cat) => {
                  const total = transactions.filter((t) => t.type === 'Expense' && t.category === cat).reduce((s, t) => s + Number(t.amount), 0);
                  const pct = totalExpenditure > 0 ? Math.round((total / totalExpenditure) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>{cat}</span>
                        <span>{formatINR(total)} ({pct}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h4 className="font-outfit font-extrabold text-2xl text-slate-900">Income & Expenditure Register</h4>
                <p className="text-xs text-slate-500 mt-1">Complete list of all transactions with date, category, and authorized entry.</p>
              </div>

              <div className="flex items-center gap-2">
                {(['All', 'Income', 'Expense'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filter === f ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <button
                  onClick={() =>
                    generateAndDownloadPdf({
                      fileName: 'AFTOWA_Financial_Report_FY_2026-27.pdf',
                      title: 'AFTOWA Financial Report',
                      subtitle: 'Income & Expenditure Statement  •  FY 2026-27',
                      bodyLines: [
                        'ADITYA FORTUNE TOWERS RESIDENTIAL FLAT OWNERS WELFARE ASSOCIATION',
                        'Madhurawada, Visakhapatnam - 530041',
                        '',
                        'SUMMARY',
                        'Total Income        : ' + formatINR(totalIncome),
                        'Total Expenditure   : ' + formatINR(totalExpenditure),
                        'Net Surplus         : ' + formatINR(netBalance),
                        '',
                        'TRANSACTION REGISTER',
                        '--------------------------------------------------------------',
                        ...filteredTransactions.map(
                          (t: any) =>
                            `${new Date(t.transaction_date).toLocaleDateString()} | ${t.type} | ${t.category} | ${(t.type === 'Income' ? '+' : '-') + formatINR(t.amount)} | ${t.description}`
                        ),
                        '--------------------------------------------------------------',
                        '',
                        'Prepared and audited by the AFTOWA Treasury Committee.',
                        'This is a system-generated statement from the AFTOWA digital portal.',
                      ],
                      footer: 'AFTOWA Digital Portal  •  Confidential Financial Document',
                    })
                  }
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> PDF Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Type</th>
                    <th className="text-left py-3 px-2">Category</th>
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-right py-3 px-2">Amount</th>
                    <th className="text-center py-3 px-2">Receipt</th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">Entered By</th>
                    {isAdminOrCommittee && <th className="text-right py-3 px-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 px-2 text-xs font-semibold text-slate-700">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${tx.type === 'Income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs font-semibold text-slate-800">{tx.category}</td>
                      <td className="py-3 px-2 text-xs text-slate-600 max-w-[200px] truncate" title={tx.description}>{tx.description}</td>
                      <td className={`py-3 px-2 text-right font-outfit font-extrabold text-sm ${tx.type === 'Income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {tx.type === 'Income' ? '+' : '-'} {formatINR(tx.amount)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {tx.receipt_url ? (
                          <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition" title="View Receipt">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-500 hidden md:table-cell">{tx.created_by?.name || 'System'}</td>
                      {isAdminOrCommittee && (
                        <td className="py-3 px-2 text-right">
                          <button onClick={() => openEditModal(tx)} className="p-1.5 text-slate-400 hover:text-amber-600 transition" title="Edit Transaction">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={isAdminOrCommittee ? 8 : 7} className="py-8 text-center text-slate-500 text-sm">No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!isAdminOrCommittee && (
              <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong className="font-bold">Note:</strong> Only AFTOWA Executive Committee members can enter new transactions. Contact your Treasurer for access.</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20">✕</button>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600"><FileText className="w-6 h-6" /></div>
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">{editingId ? 'Edit Transaction' : 'Enter New Transaction'}</h3>
                <p className="text-xs text-slate-500">Admin Mode — AFTOWA Accounts Register</p>
              </div>
            </div>
            
            <form onSubmit={handleSaveTransaction} className="space-y-5 text-sm">
              {/* File Upload Section */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-100 hover:border-amber-300 transition-colors relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <FileImage className="w-8 h-8 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">{receiptFile.name} attached</span>
                    <span className="text-xs text-slate-500">Click or drag to replace</span>
                  </div>
                ) : receiptUrl ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <FileImage className="w-8 h-8 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Receipt already uploaded</span>
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline relative z-20">View Current Receipt</a>
                    <span className="text-xs text-slate-500 mt-2">Click or drag to replace with a new one</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Upload Bill / Receipt Image</span>
                    <span className="text-xs text-slate-500">Click or drag to attach receipt</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                  <input type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Type</label>
                  <select value={newType} onChange={(e: any) => setNewType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                  {['Maintenance Charges', 'Clubhouse Rental', 'Parking Fee', 'Security Services', 'Housekeeping', 'Electricity', 'Maintenance & Repairs', 'Landscaping', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <input type="text" required placeholder="e.g. Solar panel cleaning service" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (INR)</label>
                <input type="number" step="0.01" required placeholder="e.g. 25000" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 focus:outline-none focus:bg-white focus:border-amber-400 font-bold text-amber-900" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 transition cursor-pointer" disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-outfit font-extrabold text-sm shadow-lg transition cursor-pointer flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Transaction' : 'Record Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
