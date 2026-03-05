
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { membershipService } from '../../services/membershipService';
import { expenseService, type Expense, type ExpensePayload } from '../../services/expenseService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { MasterLedger } from '../../components/admin/MasterLedger';
import { PendingMembersTable } from '../../components/admin/PendingMembersTable';
import {
    MdReceiptLong, MdWarning, MdTrendingUp, MdTrendingDown,
    MdAttachMoney, MdAdd, MdEdit, MdDelete, MdClose,
    MdSearch, MdCheckCircle,
} from 'react-icons/md';
import { GiTwoCoins, GiReceiveMoney, GiPayMoney } from 'react-icons/gi';
import {
    BarChart, Bar, AreaChart, Area,
    CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now    = new Date();

const CATEGORIES = ['Equipment','Utilities','Salary','Maintenance','Supplies','Marketing','Other'] as const;
//type Category = typeof CATEGORIES[number];

const CAT_COLOR: Record<string, string> = {
    Equipment: '#f97316', Utilities: '#3b82f6', Salary: '#a855f7',
    Maintenance: '#eab308', Supplies: '#22c55e', Marketing: '#ec4899', Other: '#6b7280',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n: number) => Number(n || 0).toLocaleString();
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const last12 = () => Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { month: d.getMonth() + 1, year: d.getFullYear(), label: MONTHS[d.getMonth()] };
});

// ── Sub-components ────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, icon, borderCls, iconCls, textCls, sub }: any) => (
    <div className={`bg-warrior-grey border border-neutral-700 border-l-4 ${borderCls} rounded-2xl p-5 flex items-center gap-4`}>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconCls}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
            <p className={`text-xl font-black italic truncate ${textCls}`}>{value}</p>
            {sub && <p className="text-[10px] text-gray-600 font-bold mt-0.5">{sub}</p>}
        </div>
    </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs shadow-xl">
            <p className="font-black uppercase text-gray-400 mb-2 text-[10px]">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }} className="font-bold">
                    {p.name}: {Number(p.value).toLocaleString()} LKR
                </p>
            ))}
        </div>
    );
};

const CatBadge = ({ cat }: { cat: string }) => (
    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
        style={{
            color:           CAT_COLOR[cat] || '#6b7280',
            backgroundColor:(CAT_COLOR[cat] || '#6b7280') + '18',
            borderColor:    (CAT_COLOR[cat] || '#6b7280') + '44',
        }}>
        {cat}
    </span>
);

const TabBtn = ({ active, onClick, children }: any) => (
    <button onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            active ? 'bg-warrior-orange text-white shadow-lg shadow-warrior-orange/20'
                   : 'text-gray-500 hover:text-gray-300'
        }`}>
        {children}
    </button>
);

// ── Expense Modal ─────────────────────────────────────────────────────────────
const EMPTY: ExpensePayload = {
    title: '', amount: 0, category: 'Equipment',
    date: now.toISOString().split('T')[0], notes: '',
};

const ExpenseModal = ({ isOpen, onClose, onSave, initial }: {
    isOpen: boolean; onClose: () => void;
    onSave: (p: ExpensePayload) => Promise<void>; initial?: Expense | null;
}) => {
    const [form, setForm]       = useState<ExpensePayload>(EMPTY);
    const [saving, setSaving]   = useState(false);

    useEffect(() => {
        setForm(initial
            ? { title: initial.title, amount: initial.amount, category: initial.category,
                date: initial.date.split('T')[0], notes: initial.notes || '' }
            : EMPTY);
    }, [initial, isOpen]);

    if (!isOpen) return null;
    const set = (k: keyof ExpensePayload, v: any) => setForm(f => ({ ...f, [k]: v }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); onClose(); }
        catch (err: any) { alert(err.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-red-500 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-900/20 border border-red-800/30 flex items-center justify-center">
                            <GiPayMoney className="text-red-400" size={16} />
                        </div>
                        <div>
                            <p className="text-sm font-black italic uppercase text-white">
                                {initial ? 'Edit' : 'Log'} <span className="text-red-400">Expense</span>
                            </p>
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                                {initial ? 'Update record' : 'Add new expense'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                        <MdClose size={15} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="px-6 py-5 space-y-4">
                    <Input label="Title" placeholder="e.g. New treadmill" required
                        value={form.title} onChange={(e: any) => set('title', e.target.value)} />

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Amount (LKR)</p>
                            <div className="relative">
                                <MdAttachMoney size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                                <input type="number" min={0} required value={form.amount}
                                    onChange={e => set('amount', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-red-500 transition-colors text-sm" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Date</p>
                            <input type="date" required value={form.date}
                                onChange={e => set('date', e.target.value)}
                                className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-red-500 transition-colors text-sm" />
                        </div>
                    </div>

                    {/* Category chips */}
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Category</p>
                        <div className="flex flex-wrap gap-1.5">
                            {CATEGORIES.map(cat => (
                                <button key={cat} type="button" onClick={() => set('category', cat)}
                                    className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all"
                                    style={form.category === cat
                                        ? { color: CAT_COLOR[cat], backgroundColor: CAT_COLOR[cat] + '22', borderColor: CAT_COLOR[cat] + '66' }
                                        : { color: '#6b7280', backgroundColor: 'transparent', borderColor: '#404040' }}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Notes (optional)</p>
                        <textarea rows={2} value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Additional details..."
                            className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-red-500 transition-colors text-sm resize-none" />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <Button type="submit" loading={saving}>
                            <MdCheckCircle size={14} /> {initial ? 'Update' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ expense, onClose, onConfirm }: {
    expense: Expense | null; onClose: () => void; onConfirm: () => void;
}) => {
    if (!expense) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-warrior-grey border border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <div className="w-11 h-11 rounded-2xl bg-red-900/20 border border-red-800/30 flex items-center justify-center mx-auto mb-4">
                    <MdDelete className="text-red-400" size={20} />
                </div>
                <p className="text-center text-sm font-black italic uppercase text-white mb-1">Delete Expense?</p>
                <p className="text-center text-xs text-white font-bold mb-1">"{expense.title}"</p>
                <p className="text-center text-xs text-gray-600 mb-6">This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase text-gray-500 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
type ActiveTab = 'report' | 'ledger' | 'pending' | 'expenses';

const FinancePage = () => {
    const [activeTab, setActiveTab]         = useState<ActiveTab>('report');

    // Ledger state
    const [paymentsData, setPaymentsData]   = useState<any>({ payments: [], paginations: {} });
    const [pendingData, setPendingData]     = useState<any>({ users: [], paginations: {} });
    const [ledgerSearch, setLedgerSearch]   = useState('');
    const [ledgerPage, setLedgerPage]       = useState(1);

    // Report state
    const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
    const [recent30Rev, setRecent30Rev]     = useState(0);
    const [expSummary, setExpSummary]       = useState<any>(null);

    // Expenses tab state
    const [expData, setExpData]             = useState<any>(null);
    const [expSearch, setExpSearch]         = useState('');
    const [expCat, setExpCat]               = useState('All');
    const [expPage, setExpPage]             = useState(1);
    const [modalOpen, setModalOpen]         = useState(false);
    const [editing, setEditing]             = useState<Expense | null>(null);
    const [deleting, setDeleting]           = useState<Expense | null>(null);

    const [loading, setLoading]             = useState(true);

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const [revHistory, revRecent, expAll] = await Promise.all([
                membershipService.getRevenueHistory(),
                membershipService.getRecentRevenue(),
                expenseService.getExpenses({ limit: 999 }),
            ]);
            setRevenueHistory(revHistory.monthlyRevenue || []);
            setRecent30Rev(revRecent.recent || 0);
            setExpSummary(expAll);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const data = await membershipService.getAllpayments(ledgerPage, ledgerSearch);
            setPaymentsData(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [ledgerPage, ledgerSearch]);

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const data = await membershipService.getPendingPayments(1);
            setPendingData(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await expenseService.getExpenses({
                page: expPage, search: expSearch, category: expCat,
            });
            setExpData(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [expPage, expSearch, expCat]);

    // Always load pending count for badge
    useEffect(() => {
        membershipService.getPendingPayments(1).then(d => setPendingData(d)).catch(() => {});
    }, []);

    useEffect(() => {
        if (activeTab === 'report')   fetchReport();
        if (activeTab === 'ledger')   fetchLedger();
        if (activeTab === 'pending')  fetchPending();
        if (activeTab === 'expenses') fetchExpenses();
    }, [activeTab, ledgerPage, ledgerSearch, expPage, expSearch, expCat]);

    useEffect(() => { setExpPage(1); }, [expSearch, expCat]);
    useEffect(() => { setLedgerPage(1); }, [ledgerSearch]);

    // ── Expense CRUD ──────────────────────────────────────────────────────────
    const handleSave = async (payload: ExpensePayload) => {
        if (editing) await expenseService.updateExpense(editing._id, payload);
        else         await expenseService.createExpense(payload);
        await fetchExpenses();
        if (activeTab === 'report') await fetchReport();
    };

    const handleDelete = async () => {
        if (!deleting) return;
        await expenseService.deleteExpense(deleting._id);
        setDeleting(null);
        await fetchExpenses();
        if (activeTab === 'report') await fetchReport();
    };

    // ── Derived chart data ────────────────────────────────────────────────────
    const combinedChart = last12().map(({ month, year, label }) => {
        const rev = revenueHistory.find((r: any) => r._id.month === month && r._id.year === year);
        const exp = expSummary?.monthlyBreakdown?.find((e: any) => e._id.month === month && e._id.year === year);
        const revenue  = rev?.total || 0;
        const expenses = exp?.total || 0;
        return { name: label, Revenue: revenue, Expenses: expenses, Profit: revenue - expenses };
    });

    const allTimeRevenue  = revenueHistory.reduce((s: number, r: any) => s + r.total, 0);
    const allTimeExpenses = expSummary?.categoryBreakdown?.reduce((s: number, c: any) => s + c.total, 0) || 0;
    const thisMonthExp    = expSummary?.monthlyBreakdown?.find(
        (e: any) => e._id.month === now.getMonth() + 1 && e._id.year === now.getFullYear()
    )?.total || 0;
    const netProfit30   = recent30Rev - thisMonthExp;
    const allTimeProfit = allTimeRevenue - allTimeExpenses;
    const pendingCount  = pendingData.paginations?.total || 0;
    const totalFiltered = expData?.totalAmount || 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center shrink-0">
                        <GiTwoCoins className="text-warrior-orange" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                            Finance <span className="text-warrior-orange">Center</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                            Revenue · Expenses · Net Profit
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-neutral-800 border border-neutral-700 rounded-xl p-1 gap-1 flex-wrap">
                    <TabBtn active={activeTab === 'report'}   onClick={() => setActiveTab('report')}>
                        <MdTrendingUp size={13} /> Report
                    </TabBtn>
                    <TabBtn active={activeTab === 'ledger'}   onClick={() => setActiveTab('ledger')}>
                        <MdReceiptLong size={13} /> Ledger
                    </TabBtn>
                    <TabBtn active={activeTab === 'pending'}  onClick={() => setActiveTab('pending')}>
                        <MdWarning size={13} /> Pending
                        {pendingCount > 0 && (
                            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                                activeTab === 'pending' ? 'bg-white/20' : 'bg-yellow-900/40 text-yellow-400'
                            }`}>{pendingCount}</span>
                        )}
                    </TabBtn>
                    <TabBtn active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')}>
                        <GiPayMoney size={13} /> Expenses
                    </TabBtn>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TAB 1 — REPORT
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'report' && (
                loading ? <Spinner /> : (
                    <div className="space-y-5">

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard label="30-Day Revenue"      value={`${fmt(recent30Rev)} LKR`}
                                icon={<GiReceiveMoney size={20}/>} borderCls="border-l-green-500"
                                iconCls="text-green-400 bg-green-900/20 border-green-800/30" textCls="text-green-400" />
                            <KpiCard label="This Month Expenses" value={`${fmt(thisMonthExp)} LKR`}
                                icon={<GiPayMoney size={20}/>} borderCls="border-l-red-500"
                                iconCls="text-red-400 bg-red-900/20 border-red-800/30" textCls="text-red-400" />
                            <KpiCard label="30-Day Net Profit"   value={`${fmt(netProfit30)} LKR`}
                                icon={netProfit30 >= 0 ? <MdTrendingUp size={20}/> : <MdTrendingDown size={20}/>}
                                borderCls={netProfit30 >= 0 ? 'border-l-warrior-orange' : 'border-l-red-500'}
                                iconCls={netProfit30 >= 0 ? 'text-warrior-orange bg-warrior-orange/10 border-warrior-orange/20' : 'text-red-400 bg-red-900/20 border-red-800/30'}
                                textCls={netProfit30 >= 0 ? 'text-warrior-orange' : 'text-red-400'}
                                sub={netProfit30 >= 0 ? 'Profitable month ↑' : 'Expenses exceed revenue'} />
                            <KpiCard label="All-Time Net"        value={`${fmt(allTimeProfit)} LKR`}
                                icon={<MdAttachMoney size={20}/>} borderCls="border-l-blue-500"
                                iconCls="text-blue-400 bg-blue-900/20 border-blue-800/30" textCls="text-blue-400"
                                sub={`Rev ${fmt(allTimeRevenue)} · Exp ${fmt(allTimeExpenses)}`} />
                        </div>

                        {/* Revenue vs Expenses Bar Chart */}
                        <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <MdTrendingUp className="text-warrior-orange" size={15} />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    Revenue vs Expenses — Last 12 Months
                                </p>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={combinedChart} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#555" fontSize={11} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px' }} iconType="circle" />
                                        <Bar dataKey="Revenue"  fill="#22c55e" radius={[4,4,0,0]} barSize={16} />
                                        <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Net Profit Area + Category Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Net Profit Area */}
                            <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-blue-500 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-5">
                                    <MdAttachMoney className="text-blue-400" size={15} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Net Profit Trend</p>
                                </div>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={combinedChart}>
                                            <defs>
                                                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis dataKey="name" stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#555" fontSize={11} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Area type="monotone" dataKey="Profit" stroke="#f97316" strokeWidth={2.5} fill="url(#profitGrad)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Expense by Category */}
                            <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-red-500 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <GiPayMoney className="text-red-400" size={15} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expenses by Category</p>
                                    </div>
                                    <button onClick={() => setActiveTab('expenses')}
                                        className="text-[9px] font-black uppercase text-warrior-orange hover:underline tracking-widest">
                                        Manage →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {expSummary?.categoryBreakdown?.map((c: any) => {
                                        const pct = allTimeExpenses > 0 ? Math.round((c.total / allTimeExpenses) * 100) : 0;
                                        return (
                                            <div key={c._id}>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[10px] font-black uppercase text-gray-400">{c._id}</span>
                                                    <span className="text-[10px] font-black text-gray-500">{fmt(c.total)} LKR · {pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CAT_COLOR[c._id] || '#6b7280' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {!expSummary?.categoryBreakdown?.length && (
                                        <p className="text-center text-gray-600 text-xs italic py-6">No expense data yet</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB 2 — MASTER LEDGER
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'ledger' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            {paymentsData.paginations?.total || 0} records ·{' '}
                            <span className="text-green-400">{fmt(paymentsData.paginations?.totalIncome || 0)} LKR total</span>
                        </p>
                        <div className="w-full sm:w-72">
                            <Input placeholder="Search Invoice #..." value={ledgerSearch}
                                onChange={(e: any) => setLedgerSearch(e.target.value)} />
                        </div>
                    </div>
                    {loading ? <Spinner /> : (
                        <MasterLedger
                            payments={paymentsData.payments}
                            pagination={paymentsData.paginations}
                            onPageChange={setLedgerPage}
                            totalIncome={paymentsData.paginations?.totalIncome}
                            totalRecords={paymentsData.paginations?.total || 0}
                        />
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB 3 — PENDING PAYMENTS
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'pending' && (
                loading ? <Spinner /> : (
                    <PendingMembersTable
                        members={pendingData.users}
                        pagination={pendingData.paginations}
                        onPageChange={(p) => { membershipService.getPendingPayments(p).then(d => setPendingData(d)); }}
                    />
                )
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB 4 — EXPENSES
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'expenses' && (
                <div className="space-y-5">

                    {/* Expenses header row */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                {expData?.pagination?.total || 0} records ·{' '}
                                <span className="text-red-400">{fmt(totalFiltered)} LKR</span>
                            </p>
                        </div>
                        <button
                            onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-red-900/30"
                        >
                            <MdAdd size={15} /> Log Expense
                        </button>
                    </div>

                    {/* Search + Category filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <MdSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" placeholder="Search expenses..."
                                value={expSearch} onChange={e => setExpSearch(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-red-500 transition-colors placeholder:text-gray-600" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {['All', ...CATEGORIES].map(cat => (
                                <button key={cat} onClick={() => setExpCat(cat)}
                                    className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all"
                                    style={expCat === cat && cat !== 'All'
                                        ? { color: CAT_COLOR[cat], backgroundColor: CAT_COLOR[cat] + '22', borderColor: CAT_COLOR[cat] + '66' }
                                        : expCat === cat
                                            ? { color: '#fff', backgroundColor: '#404040', borderColor: '#555' }
                                            : { color: '#6b7280', backgroundColor: 'transparent', borderColor: '#404040' }
                                    }>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expense list */}
                    {loading ? <Spinner /> : expData?.expenses?.length > 0 ? (
                        <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-red-500 rounded-2xl overflow-hidden">
                            {/* Table head */}
                            <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-neutral-800 bg-neutral-800/30">
                                {['#','Title','Category','Date','Amount','Notes',''].map((h, i) => (
                                    <p key={i} className={`text-[9px] font-black uppercase text-gray-600 tracking-widest ${
                                        i===0?'col-span-1':i===1?'col-span-3':i===2?'col-span-2':i===3?'col-span-2':i===4?'col-span-2 text-right':i===5?'col-span-1':'col-span-1 text-right'
                                    }`}>{h}</p>
                                ))}
                            </div>

                            {expData.expenses.map((exp: Expense, idx: number) => (
                                <div key={exp._id}
                                    className="grid grid-cols-1 md:grid-cols-12 px-5 py-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/20 transition-colors items-center gap-2 md:gap-0">
                                    <span className="hidden md:block col-span-1 text-[10px] font-black text-gray-700">
                                        {(expPage - 1) * 15 + idx + 1}
                                    </span>
                                    <div className="md:col-span-3">
                                        <p className="text-sm font-black italic uppercase text-gray-200">{exp.title}</p>
                                        <span className="md:hidden"><CatBadge cat={exp.category} /></span>
                                    </div>
                                    <div className="hidden md:block col-span-2"><CatBadge cat={exp.category} /></div>
                                    <p className="hidden md:block col-span-2 text-[10px] font-bold text-gray-500">{fmtDate(exp.date)}</p>
                                    <p className="md:col-span-2 md:text-right text-sm font-black text-red-400">
                                        {fmt(exp.amount)} <span className="text-[9px] font-bold text-gray-600">LKR</span>
                                    </p>
                                    <p className="hidden md:block col-span-1 text-[10px] text-gray-600 truncate" title={exp.notes}>{exp.notes || '—'}</p>
                                    <div className="md:col-span-1 flex items-center justify-end gap-1.5">
                                        <button onClick={() => { setEditing(exp); setModalOpen(true); }}
                                            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-warrior-orange transition-colors">
                                            <MdEdit size={13} />
                                        </button>
                                        <button onClick={() => setDeleting(exp)}
                                            className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-red-900/40 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors">
                                            <MdDelete size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-16 text-center">
                            <GiPayMoney size={36} className="text-neutral-700 mx-auto mb-3" />
                            <p className="text-white font-black italic uppercase text-lg mb-1">No Expenses Found</p>
                            <p className="text-gray-500 text-sm mb-4">
                                {expSearch || expCat !== 'All' ? 'Try adjusting your filters' : 'Start logging gym expenses'}
                            </p>
                            {!expSearch && expCat === 'All' && (
                                <button onClick={() => { setEditing(null); setModalOpen(true); }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded-xl transition-colors">
                                    <MdAdd size={13} /> Log First Expense
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {expData?.pagination?.pages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">
                                Page {expPage} of {expData.pagination.pages}
                            </p>
                            <div className="flex gap-2">
                                <button disabled={expPage <= 1} onClick={() => setExpPage(p => p - 1)}
                                    className="px-4 py-2 text-[10px] font-black uppercase bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    Prev
                                </button>
                                <button disabled={expPage >= expData.pagination.pages} onClick={() => setExpPage(p => p + 1)}
                                    className="px-4 py-2 text-[10px] font-black uppercase bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            <ExpenseModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditing(null); }}
                onSave={handleSave}
                initial={editing}
            />
            <DeleteModal
                expense={deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default FinancePage;