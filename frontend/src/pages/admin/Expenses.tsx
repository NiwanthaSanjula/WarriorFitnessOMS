/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { expenseService, type Expense, type ExpensePayload } from '../../services/expenseService';
import { membershipService } from '../../services/membershipService';
import Spinner from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
    MdAdd, MdClose, MdDelete, MdEdit, MdCheckCircle,
    MdSearch, MdTrendingDown, MdTrendingUp, MdAttachMoney,
} from 'react-icons/md';
import { GiReceiveMoney, GiPayMoney, GiTwoCoins } from 'react-icons/gi';
import {
    Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['Equipment', 'Utilities', 'Salary', 'Maintenance', 'Supplies', 'Marketing', 'Other'] as const;
type Category = typeof CATEGORIES[number];

const CAT_COLOR: Record<string, string> = {
    Equipment:   '#f97316',
    Utilities:   '#3b82f6',
    Salary:      '#a855f7',
    Maintenance: '#eab308',
    Supplies:    '#22c55e',
    Marketing:   '#ec4899',
    Other:       '#6b7280',
};

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtMoney = (n: number) => n.toLocaleString();

// ── Category Badge ────────────────────────────────────────────────────────────
const CatBadge = ({ cat }: { cat: string }) => (
    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border"
        style={{
            color:            CAT_COLOR[cat] || '#6b7280',
            backgroundColor: (CAT_COLOR[cat] || '#6b7280') + '18',
            borderColor:     (CAT_COLOR[cat] || '#6b7280') + '44',
        }}>
        {cat}
    </span>
);

// ── Expense Modal (Add / Edit) ────────────────────────────────────────────────
const EMPTY_FORM: ExpensePayload = {
    title: '', amount: 0, category: 'Equipment',
    date: now.toISOString().split('T')[0], notes: '',
};

const ExpenseModal = ({
    isOpen, onClose, onSave, initial,
}: {
    isOpen: boolean; onClose: () => void;
    onSave: (p: ExpensePayload) => Promise<void>; initial?: Expense | null;
}) => {
    const [form, setForm]       = useState<ExpensePayload>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setForm(initial
            ? { title: initial.title, amount: initial.amount, category: initial.category,
                date: initial.date.split('T')[0], notes: initial.notes || '' }
            : EMPTY_FORM
        );
    }, [initial, isOpen]);

    if (!isOpen) return null;

    const set = (k: keyof ExpensePayload, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try { await onSave(form); onClose(); }
        catch (err: any) { alert(err.response?.data?.message || 'Failed to save'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-warrior-grey border border-neutral-700 border-l-3 border-l-warrior-orange w-full max-w-md rounded-2xl shadow-2xl shadow-warrior-orange/20 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                            <GiPayMoney className="text-warrior-orange" size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase text-white">
                                {initial ? 'Edit' : 'Add'} <span className="text-warrior-orange">Expense</span>
                            </h3>
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                                {initial ? 'Update expense record' : 'Log a new expense'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                        <MdClose size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <Input label="Title" placeholder="e.g. New treadmill" required
                        value={form.title} onChange={e => set('title', e.target.value)} />

                    <div className="grid grid-cols-2 gap-3">
                        {/* Amount */}
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Amount (LKR)</p>
                            <div className="relative">
                                <MdAttachMoney size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warrior-orange/60" />
                                <input
                                    type="number" min={0} required
                                    value={form.amount}
                                    onChange={e => set('amount', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors text-sm"
                                />
                            </div>
                        </div>
                        {/* Date */}
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Date</p>
                            <input
                                type="date" required
                                value={form.date}
                                onChange={e => set('date', e.target.value)}
                                className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors text-sm"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Category</p>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button key={cat} type="button"
                                    onClick={() => set('category', cat)}
                                    className="text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all"
                                    style={form.category === cat ? {
                                        color: CAT_COLOR[cat], backgroundColor: CAT_COLOR[cat] + '22',
                                        borderColor: CAT_COLOR[cat] + '66',
                                    } : { color: '#6b7280', backgroundColor: 'transparent', borderColor: '#404040' }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1.5">Notes (optional)</p>
                        <textarea
                            rows={2}
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Additional details..."
                            className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <Button type="submit" loading={loading}>
                            <MdCheckCircle size={14} /> {initial ? 'Update' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ expense, onClose, onConfirm }: {
    expense: Expense | null; onClose: () => void; onConfirm: () => void;
}) => {
    if (!expense) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-warrior-grey border border-warrior-orange/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center mx-auto mb-4">
                    <MdDelete className="text-warrior-orange" size={22} />
                </div>
                <h3 className="text-center text-sm font-black italic uppercase text-white mb-1">Delete Expense?</h3>
                <p className="text-center text-xs text-gray-500 mb-1">
                    <span className="text-white font-bold">"{expense.title}"</span>
                </p>
                <p className="text-center text-xs text-gray-600 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase text-gray-500 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase text-white bg-warrior-orange hover:bg-warrior-orange/80 rounded-xl transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Expenses = () => {
    const [data, setData]               = useState<any>(null);
    const [revenue30, setRevenue30]     = useState(0);
    const [loading, setLoading]         = useState(true);
    const [page, setPage]               = useState(1);
    const [search, setSearch]           = useState('');
    const [catFilter, setCatFilter]     = useState('All');
    const [modalOpen, setModalOpen]     = useState(false);
    const [editing, setEditing]         = useState<Expense | null>(null);
    const [deleting, setDeleting]       = useState<Expense | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [expData, revData] = await Promise.all([
                expenseService.getExpenses({ page, search, category: catFilter }),
                membershipService.getRecentRevenue?.() ?? Promise.resolve({ recent: 0 }),
            ]);
            setData(expData);
            setRevenue30(revData?.recent || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, catFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);
    // Reset page on filter change
    useEffect(() => { setPage(1); }, [search, catFilter]);

    const handleSave = async (payload: ExpensePayload) => {
        if (editing) {
            await expenseService.updateExpense(editing._id, payload);
        } else {
            await expenseService.createExpense(payload);
        }
        await fetchData();
    };

    const handleDelete = async () => {
        if (!deleting) return;
        await expenseService.deleteExpense(deleting._id);
        setDeleting(null);
        await fetchData();
    };

    // ── Chart data: last 12 months ──
    const chartData = (() => {
        const result = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mn = d.getMonth() + 1, yr = d.getFullYear();
            const found = data?.monthlyBreakdown?.find(
                (m: any) => m._id.month === mn && m._id.year === yr
            );
            result.push({ name: MONTHS_SHORT[d.getMonth()], amount: found?.total || 0 });
        }
        return result;
    })();

    const totalExpenses = data?.totalAmount || 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center shrink-0">
                        <GiPayMoney className="text-warrior-orange" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                            Expense <span className="text-warrior-orange">Tracker</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                            Gym Operating Costs
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditing(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-warrior-orange hover:bg-warrior-orange/80 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-warrior-orange/30"
                >
                    <MdAdd size={16} /> Log Expense
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    {
                        label: 'Total Expenses (Filtered)',
                        value: `${fmtMoney(totalExpenses)} LKR`,
                        icon: <GiPayMoney size={20} />,
                        color: 'border-l-warrior-orange',
                        iconCls: 'text-warrior-orange bg-warrior-orange/20 border-warrior-orange/30',
                        textCls: 'text-warrior-orange',
                    },
                    {
                        label: '30-Day Revenue',
                        value: `${fmtMoney(revenue30)} LKR`,
                        icon: <GiReceiveMoney size={20} />,
                        color: 'border-l-green-500',
                        iconCls: 'text-green-400 bg-green-900/20 border-green-800/30',
                        textCls: 'text-green-400',
                    },
                ].map(card => (
                    <div key={card.label}
                        className={`bg-warrior-grey border border-neutral-700 border-l-4 ${card.color} rounded-2xl p-5 flex items-center gap-4`}>
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${card.iconCls}`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{card.label}</p>
                            <p className={`text-xl font-black italic truncate ${card.textCls}`}>{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Chart + Category Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly Bar Chart */}
                <div className="lg:col-span-2 bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <GiTwoCoins className="text-warrior-orange" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monthly Expenses — Last 12 Months</p>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="#555" fontSize={11} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${v / 1000}k`} />
                                <Tooltip cursor={{ fill: '#222' }}
                                    contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '10px', fontSize: '11px' }}
                                    formatter={(v: any) => [`${Number(v).toLocaleString()} LKR`, 'Expenses']} />
                                <Bar dataKey="amount" fill="#f97316" radius={[6, 6, 0, 0]} barSize={26} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <MdAttachMoney className="text-warrior-orange" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">By Category</p>
                    </div>
                    <div className="space-y-3">
                        {data?.categoryBreakdown?.map((c: any) => {
                            const pct = totalExpenses > 0 ? Math.round((c.total / totalExpenses) * 100) : 0;
                            return (
                                <div key={c._id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <CatBadge cat={c._id} />
                                        <span className="text-[10px] font-black text-gray-400">
                                            {fmtMoney(c.total)} LKR · {pct}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all"
                                            style={{ width: `${pct}%`, backgroundColor: CAT_COLOR[c._id] || '#6b7280' }} />
                                    </div>
                                </div>
                            );
                        })}
                        {!data?.categoryBreakdown?.length && (
                            <p className="text-center text-gray-600 text-xs italic py-4">No data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <MdSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-warrior-orange transition-colors placeholder:text-gray-600"
                    />
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    {['All', ...CATEGORIES].map(cat => (
                        <button key={cat} onClick={() => setCatFilter(cat)}
                            className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${
                                catFilter === cat
                                    ? 'bg-neutral-700 border-neutral-500 text-white'
                                    : 'border-neutral-700 text-gray-500 hover:border-neutral-600 hover:text-gray-400'
                            }`}
                            style={catFilter === cat && cat !== 'All' ? {
                                backgroundColor: CAT_COLOR[cat] + '22',
                                borderColor: CAT_COLOR[cat] + '66',
                                color: CAT_COLOR[cat],
                            } : {}}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Expense List ── */}
            {loading ? (
                <Spinner />
            ) : data?.expenses?.length > 0 ? (
                <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-neutral-800 bg-neutral-800/30">
                        {['#', 'Title', 'Category', 'Date', 'Amount', 'Notes', ''].map((h, i) => (
                            <p key={i} className={`text-[9px] font-black uppercase text-gray-600 tracking-widest ${
                                i === 0 ? 'col-span-1' :
                                i === 1 ? 'col-span-3' :
                                i === 2 ? 'col-span-2' :
                                i === 3 ? 'col-span-2' :
                                i === 4 ? 'col-span-2 text-right' :
                                i === 5 ? 'col-span-1' :
                                'col-span-1 text-right'
                            }`}>{h}</p>
                        ))}
                    </div>

                    {data.expenses.map((exp: Expense, idx: number) => (
                        <div key={exp._id}
                            className="grid grid-cols-1 md:grid-cols-12 px-5 py-4 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/20 transition-colors items-center gap-2 md:gap-0">
                            {/* # */}
                            <span className="hidden md:block col-span-1 text-[10px] font-black text-gray-700">
                                {(page - 1) * 15 + idx + 1}
                            </span>
                            {/* Title */}
                            <div className="md:col-span-3">
                                <p className="text-sm font-black italic uppercase text-gray-200">{exp.title}</p>
                                <p className="text-[10px] text-gray-600 md:hidden"><CatBadge cat={exp.category} /></p>
                            </div>
                            {/* Category */}
                            <div className="hidden md:block col-span-2">
                                <CatBadge cat={exp.category} />
                            </div>
                            {/* Date */}
                            <p className="hidden md:block col-span-2 text-[10px] font-bold text-gray-500">{fmtDate(exp.date)}</p>
                            {/* Amount */}
                            <p className="md:col-span-2 md:text-right text-sm font-black text-warrior-orange">
                                {fmtMoney(exp.amount)} <span className="text-[9px] font-bold text-gray-600">LKR</span>
                            </p>
                            {/* Notes */}
                            <p className="hidden md:block col-span-1 text-[10px] text-gray-600 truncate" title={exp.notes}>
                                {exp.notes || '—'}
                            </p>
                            {/* Actions */}
                            <div className="md:col-span-1 flex items-center justify-end gap-2">
                                <button onClick={() => { setEditing(exp); setModalOpen(true); }}
                                    className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-warrior-orange transition-colors">
                                    <MdEdit size={13} />
                                </button>
                                <button onClick={() => setDeleting(exp)}
                                    className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-warrior-orange/40 flex items-center justify-center text-gray-500 hover:text-warrior-orange transition-colors">
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
                        {search || catFilter !== 'All' ? 'Try adjusting your filters' : 'Start logging your gym expenses'}
                    </p>
                    {!search && catFilter === 'All' && (
                        <button onClick={() => { setEditing(null); setModalOpen(true); }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-warrior-orange hover:bg-warrior-orange/80 text-white text-[10px] font-black uppercase rounded-xl transition-colors">
                            <MdAdd size={14} /> Log First Expense
                        </button>
                    )}
                </div>
            )}

            {/* ── Pagination ── */}
            {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">
                        Page {page} of {data.pagination.pages} · {data.pagination.total} records
                    </p>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 text-[10px] font-black uppercase bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            Prev
                        </button>
                        <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 text-[10px] font-black uppercase bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
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

export default Expenses;