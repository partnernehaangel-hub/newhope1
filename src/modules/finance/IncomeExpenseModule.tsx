import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Share2, 
  Calendar, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Coins,
  Receipt,
  FileOutput,
  MessageCircle,
  UserPlus,
  Eye,
  FileEdit,
  ClipboardList,
  Trophy,
  Star,
  Bell,
  Laptop,
  Bed,
  DoorOpen,
  UserCircle,
  Home,
  HeartPulse,
  Building2,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const IncomeExpenseModule = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'contra' | 'adjustment' | 'summary' | 'ledger'>('income');
  const [ledgerAccount, setLedgerAccount] = useState<'Cash' | 'Bank'>('Cash');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'contra' | 'adjustment'>('income');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    title: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    account: 'Cash',
    fromAccount: 'Cash',
    toAccount: 'Bank',
    status: 'Completed',
    adjustmentType: 'Add'
  });

  const [transactions, setTransactions] = useState<any[]>([
    { id: '1', title: 'Tuition Fees', category: 'Fees', amount: 45000, type: 'income', date: '2024-03-25', status: 'Received', account: 'Bank', adjustmentType: 'Add' },
    { id: '2', title: 'Electricity Bill', category: 'Utility', amount: 12500, type: 'expense', date: '2024-03-24', status: 'Paid', account: 'Cash', adjustmentType: 'Add' },
    { id: '3', title: 'Staff Salary', category: 'Payroll', amount: 250000, type: 'expense', date: '2024-03-01', status: 'Paid', account: 'Bank', adjustmentType: 'Add' },
    { id: '4', title: 'Donation', category: 'Other', amount: 10000, type: 'income', date: '2024-03-20', status: 'Received', account: 'Cash', adjustmentType: 'Add' },
    { id: '5', title: 'Cash Deposit', category: 'Contra', amount: 5000, type: 'contra', date: '2024-03-26', status: 'Completed', fromAccount: 'Cash', toAccount: 'Bank', adjustmentType: 'Add' },
  ]);

  const [initialBalances] = useState({
    cash: 10000,
    bank: 1000000
  });

  // Calculate current balances dynamically
  const calculateBalances = () => {
    let cash = initialBalances.cash;
    let bank = initialBalances.bank;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        if (t.account === 'Cash') cash += amt;
        else bank += amt;
      } else if (t.type === 'expense') {
        if (t.account === 'Cash') cash -= amt;
        else bank -= amt;
      } else if (t.type === 'contra') {
        if (t.fromAccount === 'Cash' && t.toAccount === 'Bank') {
          cash -= amt;
          bank += amt;
        } else if (t.fromAccount === 'Bank' && t.toAccount === 'Cash') {
          bank -= amt;
          cash += amt;
        }
      } else if (t.type === 'adjustment') {
        const factor = t.adjustmentType === 'Add' ? 1 : -1;
        if (t.account === 'Cash') cash += (amt * factor);
        else bank += (amt * factor);
      }
    });

    return { cash, bank };
  };

  const currentBalances = calculateBalances();
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const getLedgerData = () => {
    let runningBalance = ledgerAccount === 'Cash' ? initialBalances.cash : initialBalances.bank;
    
    // Sort transactions by date ascending for running balance
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const ledgerEntries = sortedTransactions.map(t => {
      let withdrawal = 0;
      let deposit = 0;
      const amt = Number(t.amount);

      if (t.type === 'income') {
        if (t.account === ledgerAccount) deposit = amt;
      } else if (t.type === 'expense') {
        if (t.account === ledgerAccount) withdrawal = amt;
      } else if (t.type === 'contra') {
        if (t.fromAccount === ledgerAccount) withdrawal = amt;
        if (t.toAccount === ledgerAccount) deposit = amt;
      } else if (t.type === 'adjustment') {
        if (t.account === ledgerAccount) {
          if (t.adjustmentType === 'Add') deposit = amt;
          else withdrawal = amt;
        }
      }

      runningBalance += (deposit - withdrawal);

      return {
        ...t,
        withdrawal,
        deposit,
        balance: runningBalance
      };
    });

    // Filter out entries that don't affect the selected account
    return ledgerEntries.filter(e => e.withdrawal > 0 || e.deposit > 0).reverse();
  };

  const handleSaveTransaction = () => {
    if (editingTransaction) {
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? { ...formData, id: t.id, type: transactionType } : t));
    } else {
      const newTransaction = {
        ...formData,
        id: Date.now().toString(),
        type: transactionType,
        status: transactionType === 'income' ? 'Received' : transactionType === 'expense' ? 'Paid' : 'Completed'
      };
      setTransactions([newTransaction, ...transactions]);
    }
    setShowAddModal(false);
    setEditingTransaction(null);
    setFormData({ 
      title: '', 
      category: '', 
      amount: 0, 
      date: new Date().toISOString().split('T')[0], 
      account: 'Cash',
      fromAccount: 'Cash', 
      toAccount: 'Bank',
      adjustmentType: 'Add'
    });
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setFormData(transaction);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions
    .filter(t => t.type === activeTab || activeTab === 'summary')
    .filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Income & Expense Management</h1>
          <p className="text-text-sub font-medium">Track school finances, manage expenses, and generate reports.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setTransactionType('contra'); setShowAddModal(true); setEditingTransaction(null); setFormData({...formData, category: 'Contra', title: 'Contra Entry', fromAccount: 'Cash', toAccount: 'Bank'}); }} className="btn-secondary flex items-center gap-2 bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"><ArrowRightLeft size={20} /> Contra Entry</button>
          <button onClick={() => { setTransactionType('income'); setShowAddModal(true); setEditingTransaction(null); setFormData({...formData, account: 'Cash', category: 'Fees'}); }} className="btn-primary flex items-center gap-2"><Plus size={20} /> Add Income</button>
          <button onClick={() => { setTransactionType('expense'); setShowAddModal(true); setEditingTransaction(null); setFormData({...formData, account: 'Cash', category: 'Utility'}); }} className="btn-secondary flex items-center gap-2"><Plus size={20} /> Add Expense</button>
          <button onClick={() => { setTransactionType('adjustment'); setShowAddModal(true); setEditingTransaction(null); setFormData({...formData, category: 'Adjustment', title: 'Balance Adjustment', account: 'Bank', adjustmentType: 'Add'}); }} className="btn-secondary flex items-center gap-2 bg-slate-700 hover:bg-slate-800 border-slate-700 text-white"><Edit2 size={20} /> Adjust Balance</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Total Income</p>
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp size={20} /></div>
          </div>
          <p className="text-2xl font-black text-text-heading">₹{totalIncome.toLocaleString()}</p>
        </Card>
        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Total Expense</p>
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><TrendingDown size={20} /></div>
          </div>
          <p className="text-2xl font-black text-text-heading">₹{totalExpense.toLocaleString()}</p>
        </Card>
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Cash Balance</p>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Coins size={20} /></div>
          </div>
          <p className="text-2xl font-black text-text-heading">₹{currentBalances.cash.toLocaleString()}</p>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Bank Balance</p>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Building2 size={20} /></div>
          </div>
          <p className="text-2xl font-black text-text-heading">₹{currentBalances.bank.toLocaleString()}</p>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('income')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'income' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Income Logs</button>
        <button onClick={() => setActiveTab('expense')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'expense' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Expense Logs</button>
        <button onClick={() => setActiveTab('contra')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'contra' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Contra Entries</button>
        <button onClick={() => setActiveTab('adjustment')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'adjustment' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Adjustment Logs</button>
        <button onClick={() => setActiveTab('ledger')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'ledger' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Bank/Cash Ledger</button>
        <button onClick={() => setActiveTab('summary')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'summary' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>All Transactions</button>
      </div>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub" size={20} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="input-field pl-12" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'ledger' && (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setLedgerAccount('Cash')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${ledgerAccount === 'Cash' ? 'bg-white text-primary shadow-sm' : 'text-text-sub hover:text-text-heading'}`}
                >
                  CASH
                </button>
                <button 
                  onClick={() => setLedgerAccount('Bank')}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${ledgerAccount === 'Bank' ? 'bg-white text-primary shadow-sm' : 'text-text-sub hover:text-text-heading'}`}
                >
                  BANK
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button className="p-3 bg-slate-100 text-text-sub rounded-xl hover:bg-slate-200 transition-all"><FileSpreadsheet size={20} /></button>
            <button className="p-3 bg-slate-100 text-text-sub rounded-xl hover:bg-slate-200 transition-all"><Printer size={20} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {activeTab === 'ledger' ? (
                  <>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Note</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Withdrawal</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Deposit</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Balance</th>
                  </>
                ) : (
                  <>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Transaction</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Category</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Amount</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                  </>
                )}
                <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(activeTab === 'ledger' ? getLedgerData() : filteredTransactions).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  {activeTab === 'ledger' ? (
                    <>
                      <td className="py-4 text-sm text-text-sub">{t.date}</td>
                      <td className="py-4">
                        <p className="font-bold text-sm text-text-heading">{t.title}</p>
                        <p className="text-[10px] text-text-sub font-bold uppercase">{t.id}</p>
                        {t.type === 'contra' && (
                          <p className="text-[10px] text-orange-600 font-bold uppercase">Contra: {t.fromAccount} → {t.toAccount}</p>
                        )}
                      </td>
                      <td className="py-4 text-sm font-black text-red-600">
                        {t.withdrawal > 0 ? `₹${t.withdrawal.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-4 text-sm font-black text-green-600">
                        {t.deposit > 0 ? `₹${t.deposit.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-4 text-sm font-black text-primary">
                        ₹{t.balance.toLocaleString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4">
                        <p className="font-bold text-sm text-text-heading">{t.title}</p>
                        <p className="text-[10px] text-text-sub font-bold uppercase">{t.id}</p>
                        {t.type === 'contra' ? (
                          <p className="text-[10px] text-orange-600 font-bold uppercase">{t.fromAccount} → {t.toAccount}</p>
                        ) : (
                          <p className="text-[10px] text-blue-600 font-bold uppercase">{t.account}</p>
                        )}
                      </td>
                      <td className="py-4 text-sm text-text-sub">{t.category}</td>
                      <td className={`py-4 text-sm font-black ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : t.type === 'contra' ? 'text-orange-600' : 'text-slate-600'}`}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : t.type === 'contra' ? '⇄' : (t.adjustmentType === 'Add' ? '↑' : '↓')} ₹{t.amount.toLocaleString()}
                      </td>
                      <td className="py-4 text-sm text-text-sub">{t.date}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          t.status === 'Received' || t.status === 'Paid' || t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(t)} className="p-2 hover:bg-slate-100 rounded-lg text-text-sub"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">
                  {editingTransaction ? 'Edit' : 'Add'} {
                    transactionType === 'income' ? 'Income' : 
                    transactionType === 'expense' ? 'Expense' : 
                    transactionType === 'contra' ? 'Contra Entry' : 'Adjustment'
                  }
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                {transactionType === 'income' || transactionType === 'expense' ? (
                  <>
                    <Input label="Title" placeholder="e.g., Monthly Electricity Bill" value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Category" options={transactionType === 'income' ? ['Fees', 'Donation', 'Grant', 'Other'] : ['Utility', 'Payroll', 'Maintenance', 'Supplies', 'Other']} value={formData.category} onChange={(e: any) => setFormData({...formData, category: e.target.value})} />
                      <Select label="Account" options={['Cash', 'Bank']} value={formData.account} onChange={(e: any) => setFormData({...formData, account: e.target.value})} />
                    </div>
                  </>
                ) : transactionType === 'contra' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="From Account" options={['Cash', 'Bank']} value={formData.fromAccount} onChange={(e: any) => setFormData({...formData, fromAccount: e.target.value})} />
                      <Select label="To Account" options={['Cash', 'Bank']} value={formData.toAccount} onChange={(e: any) => setFormData({...formData, toAccount: e.target.value})} />
                    </div>
                    <Input label="Remarks" placeholder="e.g., Cash withdrawal for petty cash" value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} />
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Select label="Account" options={['Cash', 'Bank']} value={formData.account} onChange={(e: any) => setFormData({...formData, account: e.target.value})} />
                      <Select label="Adjustment Type" options={['Add', 'Subtract']} value={formData.adjustmentType} onChange={(e: any) => setFormData({...formData, adjustmentType: e.target.value})} />
                    </div>
                    <Input label="Reason" placeholder="e.g., Bank interest correction" value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} />
                  </>
                )}
                <Input label="Amount" type="number" value={formData.amount} onChange={(e: any) => setFormData({...formData, amount: Number(e.target.value)})} />
                <Input label="Date" type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                <button onClick={handleSaveTransaction} className="btn-primary w-full py-4 mt-6">
                  {editingTransaction ? 'Update' : 'Save'} Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
