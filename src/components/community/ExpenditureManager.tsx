import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { Plus, CheckCircle2, Loader2, UploadCloud, FileImage, ExternalLink, Receipt, Pencil } from 'lucide-react';
import { useAuth } from '../common/AuthContext';

type Expenditure = Database['public']['Tables']['expenditures']['Row'];
type MonthlyMaintenance = Database['public']['Tables']['monthly_maintenance']['Row'];

const EXPENSE_CATEGORIES = [
  'Security Salary',
  'Housekeeping Salary',
  'Electricity Bill',
  'Water Bill',
  'Lift Maintenance',
  'Generator / Diesel',
  'Common Area Cleaning',
  'Repairs & Maintenance',
  'Gardening',
  'Garbage Collection',
  'Internet / Office Expenses',
  'Festival / Event Expenses',
  'Miscellaneous'
];

export const ExpenditureManager: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [currentCycle, setCurrentCycle] = useState<MonthlyMaintenance | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExp, setEditingExp] = useState<Expenditure | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      const { data: cycleData } = await supabase
        .from('monthly_maintenance')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .maybeSingle();

      if (cycleData) {
        setCurrentCycle(cycleData);
        
        const { data: expData, error: expError } = await supabase
          .from('expenditures')
          .select('*')
          .eq('maintenance_id', cycleData.id)
          .order('expense_date', { ascending: false });

        if (expError) throw expError;
        setExpenditures(expData as any[]);
      } else {
        setCurrentCycle(null);
        setExpenditures([]);
      }
    } catch (err) {
      console.error('Error fetching expenditures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
  };

  const handleSaveExpenditure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle || !amount || !user) return;

    try {
      setIsSubmitting(true);
      let receiptUrl = editingExp ? editingExp.receipt_url : null;

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        receiptUrl = publicUrl;
      }

      if (editingExp) {
        const { error } = await supabase.from('expenditures').update({
          expense_date: expenseDate,
          category,
          description,
          amount: parseFloat(amount),
          vendor_name: vendorName,
          payment_mode: paymentMode,
          receipt_url: receiptUrl
        }).eq('id', editingExp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expenditures').insert({
          maintenance_id: currentCycle.id,
          expense_date: expenseDate,
          category,
          description,
          amount: parseFloat(amount),
          vendor_name: vendorName,
          payment_mode: paymentMode,
          receipt_url: receiptUrl,
          created_by: user.id
        });
        if (error) throw error;
      }
      
      setShowAddModal(false);
      setEditingExp(null);
      setAmount('');
      setDescription('');
      setVendorName('');
      setReceiptFile(null);
      await fetchData();
    } catch (err: any) {
      alert('Error recording expenditure: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  if (!currentCycle) {
    return (
      <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 shadow-sm">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h4 className="font-outfit text-xl font-bold text-slate-800">No Active Cycle</h4>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto mb-6">
          The financial cycle for the current month has not been started. Please initialize it in the Maintenance Collection tab.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-900">Expenditure Manager</h3>
          <p className="text-xs text-slate-500 mt-1">Track payouts to vendors, utility bills, and staff salaries.</p>
        </div>
        
        {isAdminOrCommittee && (
          <button
            onClick={() => {
              setEditingExp(null);
              setAmount('');
              setDescription('');
              setVendorName('');
              setReceiptFile(null);
              setExpenseDate(new Date().toISOString().split('T')[0]);
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:scale-102 transition cursor-pointer w-full sm:w-auto text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
              <th className="text-left py-4 px-4 rounded-tl-xl">Date</th>
              <th className="text-left py-4 px-4">Category</th>
              <th className="text-left py-4 px-4">Vendor & Desc</th>
              <th className="text-right py-4 px-4">Amount</th>
              <th className="text-center py-4 px-4 rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenditures.map((exp) => (
              <tr key={exp.id} className="border-b border-slate-100 hover:bg-rose-50/30 transition">
                <td className="py-4 px-4 font-semibold text-slate-700 whitespace-nowrap">
                  {new Date(exp.expense_date).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                    {exp.category}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="font-bold text-slate-800">{exp.vendor_name || 'N/A'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{exp.description || 'No description'}</div>
                </td>
                <td className="py-4 px-4 text-right font-outfit font-extrabold text-rose-600">
                  ₹ {exp.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {exp.receipt_url ? (
                      <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition" title="View Receipt">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="p-2 text-slate-300 w-8 inline-block">-</span>
                    )}
                    {isAdminOrCommittee && (
                      <button 
                        onClick={() => {
                          setEditingExp(exp);
                          setAmount(exp.amount.toString());
                          setExpenseDate(exp.expense_date);
                          setCategory(exp.category);
                          setDescription(exp.description || '');
                          setVendorName(exp.vendor_name || '');
                          setPaymentMode(exp.payment_mode || 'UPI');
                          setReceiptFile(null);
                          setShowAddModal(true);
                        }}
                        className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition" 
                        title="Edit Expense"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {expenditures.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">No expenditures recorded for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expenditure Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 p-2 rounded-full cursor-pointer z-20">✕</button>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-900 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
               <Receipt className="text-rose-500 w-6 h-6" /> {editingExp ? 'Edit Expenditure' : 'Record Expenditure'}
            </h3>
            
            <form onSubmit={handleSaveExpenditure} className="space-y-4 text-sm">
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-100 transition-colors relative">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <FileImage className="w-8 h-8 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">{receiptFile.name} attached</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Upload Bill / Invoice</span>
                    <span className="text-xs text-slate-500">Optional</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                  <input type="date" required value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Amount (INR)</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 focus:outline-none focus:bg-white font-semibold text-rose-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Mode</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold cursor-pointer">
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vendor Name</label>
                  <input type="text" placeholder="e.g. Apex Elevators" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                  <input type="text" placeholder="e.g. Q3 Maintenance" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white font-semibold" />
                </div>
              </div>
              
              <div className="pt-4 flex items-center gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editingExp ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
