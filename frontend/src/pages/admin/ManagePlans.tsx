/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { membershipService, type MembershipPlan } from '../../services/membershipService'
import Spinner from '../../components/ui/Spinner';
import {
    MdAdd, MdAttachMoney, MdTimer, MdCheck, MdClose,
    MdEdit, MdDelete, MdStar, MdExpandMore, MdExpandLess
} from 'react-icons/md';
import { GiTrophy, GiMuscleUp, GiLaurelCrown } from 'react-icons/gi';

// ── Tier config ────────────────────────────────────────────────────────────────
const getTier = (price: number) => {
    if (price >= 5000) return { label: 'Elite',   icon: GiLaurelCrown, accent: 'border-l-yellow-400',  badge: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40',  glow: 'shadow-yellow-900/20'  };
    if (price >= 2500) return { label: 'Pro',     icon: GiMuscleUp,    accent: 'border-l-warrior-orange', badge: 'text-warrior-orange bg-warrior-orange/10 border-warrior-orange/30', glow: 'shadow-orange-900/20' };
    return               { label: 'Starter', icon: GiTrophy,      accent: 'border-l-blue-500',     badge: 'text-blue-400 bg-blue-900/20 border-blue-800/40',          glow: 'shadow-blue-900/20'    };
};

const durationLabel = (days: number) => {
    if (days % 365 === 0) return `${days / 365} Year${days / 365 > 1 ? 's' : ''}`;
    if (days % 30  === 0) return `${days / 30}  Month${days / 30  > 1 ? 's' : ''}`;
    if (days % 7   === 0) return `${days / 7}   Week${days  / 7   > 1 ? 's' : ''}`;
    return `${days} Days`;
};

// ── Feature tag editor ─────────────────────────────────────────────────────────
const FeatureEditor = ({ features, onChange }: { features: string[]; onChange: (f: string[]) => void }) => {
    const [input, setInput] = useState('');
    const add = () => {
        const v = input.trim();
        if (v && !features.includes(v)) { onChange([...features, v]); setInput(''); }
    };
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Add a feature (e.g. Unlimited Access)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-warrior-orange"
                />
                <button type="button" onClick={add}
                    className="px-3 py-2 bg-warrior-orange/10 border border-warrior-orange/30 text-warrior-orange rounded-xl hover:bg-warrior-orange/20 transition-colors">
                    <MdAdd size={18} />
                </button>
            </div>
            {features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {features.map(f => (
                        <span key={f} className="flex items-center gap-1 text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-gray-300 px-2 py-1 rounded-lg">
                            <MdCheck size={10} className="text-green-400" /> {f}
                            <button type="button" onClick={() => onChange(features.filter(x => x !== f))} className="text-gray-600 hover:text-red-400 ml-1">
                                <MdClose size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Plan Card ──────────────────────────────────────────────────────────────────
const PlanCard = ({ plan, onEdit, onDelete }: { plan: MembershipPlan; onEdit: (p: MembershipPlan) => void; onDelete: (id: string) => void }) => {
    const [expanded, setExpanded] = useState(false);
    const tier  = getTier(plan.price);
    const TierIcon = tier.icon;
    const features: string[] = (plan as any).features ?? [];
    const pricePerDay = (plan.price / plan.durationDays).toFixed(1);

    return (
        <div className={`bg-warrior-grey border border-neutral-700 border-l-4 ${tier.accent} rounded-2xl overflow-hidden shadow-xl ${tier.glow} transition-all duration-200 hover:scale-[1.01]`}>
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                            <TierIcon size={18} className={tier.badge.split(' ')[0]} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase text-white tracking-tight">{plan.name}</h3>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${tier.badge}`}>
                                {tier.label}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(plan)} className="p-1.5 text-gray-600 hover:text-warrior-orange transition-colors rounded-lg hover:bg-neutral-800">
                            <MdEdit size={15} />
                        </button>
                        <button onClick={() => onDelete(plan._id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-800">
                            <MdDelete size={15} />
                        </button>
                    </div>
                </div>

                {/* Price + Duration */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-neutral-800/60 rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-0.5">Price</p>
                        <p className="text-xl font-black text-warrior-orange">Rs. {plan.price.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-600 font-bold">Rs. {pricePerDay}/day</p>
                    </div>
                    <div className="bg-neutral-800/60 rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-0.5">Duration</p>
                        <p className="text-xl font-black text-white">{durationLabel(plan.durationDays)}</p>
                        <p className="text-[9px] text-gray-600 font-bold">{plan.durationDays} days total</p>
                    </div>
                </div>

                {/* Description */}
                {plan.description && (
                    <p className="text-xs text-gray-500 italic mb-3 leading-relaxed">{plan.description}</p>
                )}

                {/* Active status */}
                <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${
                        plan.isActive
                            ? 'text-green-400 bg-green-900/20 border-green-800/40'
                            : 'text-gray-500 bg-neutral-800 border-neutral-700'
                    }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                    </span>

                    {features.length > 0 && (
                        <button onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">
                            {features.length} features {expanded ? <MdExpandLess size={14}/> : <MdExpandMore size={14}/>}
                        </button>
                    )}
                </div>
            </div>

            {/* Features list (expandable) */}
            {expanded && features.length > 0 && (
                <div className="border-t border-neutral-700/50 px-5 py-4 space-y-1.5">
                    {features.map(f => (
                        <div key={f} className="flex items-center gap-2">
                            <MdCheck size={12} className="text-green-400 shrink-0" />
                            <p className="text-xs text-gray-400">{f}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Plan Form Modal ────────────────────────────────────────────────────────────
const PlanModal = ({
    initial, onClose, onSave, saving
}: {
    initial?: MembershipPlan | null;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    saving: boolean;
}) => {
    const empty = { name: '', price: '', durationDays: '', description: '', features: [] as string[] };
    const [form, setForm] = useState<any>(
        initial
            ? { ...initial, price: String(initial.price), durationDays: String(initial.durationDays), features: (initial as any).features ?? [] }
            : empty
    );
    const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

    const QUICK_DURATIONS = [
        { label: '1 Month',  days: 30  },
        { label: '3 Months', days: 90  },
        { label: '6 Months', days: 180 },
        { label: '1 Year',   days: 365 },
    ];

    const SUGGESTED_FEATURES = [
        'Unlimited Gym Access', 'Locker Room Access', 'Free Towel Service',
        'Group Classes', 'Personal Trainer Session', 'Nutrition Consultation',
        'Body Composition Analysis', 'Guest Pass (1/month)', 'Pool Access', 'Sauna Access',
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal header */}
                <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
                    <h3 className="text-base font-black italic uppercase text-white">
                        {initial ? 'Edit Plan' : 'Create New Plan'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <MdClose size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Plan name */}
                    <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">Plan Name *</label>
                        <input
                            type="text" required
                            placeholder="e.g. Warrior Monthly"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors"
                        />
                    </div>

                    {/* Price + Duration */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">Price (Rs.) *</label>
                            <div className="relative">
                                <MdAttachMoney size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="number" required min="0"
                                    placeholder="2500"
                                    value={form.price}
                                    onChange={e => set('price', e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">Duration (Days) *</label>
                            <div className="relative">
                                <MdTimer size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="number" required min="1"
                                    placeholder="30"
                                    value={form.durationDays}
                                    onChange={e => set('durationDays', e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick duration presets */}
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-2">Quick Duration</p>
                        <div className="flex gap-2 flex-wrap">
                            {QUICK_DURATIONS.map(({ label, days }) => (
                                <button key={days} type="button"
                                    onClick={() => set('durationDays', String(days))}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                        form.durationDays === String(days)
                                            ? 'bg-warrior-orange text-white border-warrior-orange'
                                            : 'bg-neutral-800 text-gray-500 border-neutral-700 hover:border-warrior-orange hover:text-warrior-orange'
                                    }`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price preview */}
                    {form.price && form.durationDays && (
                        <div className="bg-warrior-orange/5 border border-warrior-orange/20 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Price per day</span>
                            <span className="text-sm font-black text-warrior-orange">
                                Rs. {(Number(form.price) / Number(form.durationDays)).toFixed(2)} / day
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">Description</label>
                        <textarea
                            placeholder="Describe what makes this plan special..."
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            rows={2}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors resize-none"
                        />
                    </div>

                    {/* Features */}
                    <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-2">What's Included</label>
                        <FeatureEditor features={form.features} onChange={f => set('features', f)} />

                        {/* Suggested features */}
                        <div className="mt-3">
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-2">Quick Add</p>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_FEATURES.filter(f => !form.features.includes(f)).map(f => (
                                    <button key={f} type="button"
                                        onClick={() => set('features', [...form.features, f])}
                                        className="text-[9px] font-bold px-2 py-1 bg-neutral-800 border border-neutral-700 text-gray-500 rounded-lg hover:border-green-700 hover:text-green-400 transition-colors">
                                        + {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-800 px-6 py-4 flex gap-3">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 bg-neutral-800 text-gray-400 rounded-xl text-xs font-black uppercase hover:bg-neutral-700 transition-colors">
                        Cancel
                    </button>
                    <button
                        disabled={saving || !form.name || !form.price || !form.durationDays}
                        onClick={() => onSave({ ...form, price: Number(form.price), durationDays: Number(form.durationDays) })}
                        className="flex-1 py-2.5 bg-warrior-orange text-white rounded-xl text-xs font-black uppercase hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {saving ? 'Saving...' : initial ? 'Update Plan' : 'Create Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const ManagePlans = () => {
    const [plans, setPlans]         = useState<MembershipPlan[]>([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editPlan, setEditPlan]   = useState<MembershipPlan | null>(null);

    const fetchPlans = async () => {
        try {
            const data = await membershipService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleSave = async (data: any) => {
        setSaving(true);
        try {
            if (editPlan) {
                await membershipService.updatePlan(editPlan._id, data);
            } else {
                await membershipService.createPlan(data);
            }
            setModalOpen(false);
            setEditPlan(null);
            await fetchPlans();
        } catch (error) {
            alert("Failed to save plan");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this plan? This cannot be undone.")) return;
        try {
            await membershipService.deletePlan(id);
            await fetchPlans();
        } catch {
            alert("Failed to delete plan");
        }
    };

    const openCreate = () => { setEditPlan(null); setModalOpen(true); };
    const openEdit   = (p: MembershipPlan) => { setEditPlan(p); setModalOpen(true); };

    if (loading) return <Spinner />;

    // Group by tier for display
    const elite   = plans.filter(p => p.price >= 5000);
    const pro     = plans.filter(p => p.price >= 2500 && p.price < 5000);
    const starter = plans.filter(p => p.price < 2500);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center">
                        <MdStar className="text-warrior-orange" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                            Membership <span className="text-warrior-orange">Plans</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            {plans.length} plan{plans.length !== 1 ? 's' : ''} · {plans.filter(p => p.isActive).length} active
                        </p>
                    </div>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 bg-warrior-orange hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all hover:scale-105 shadow-lg shadow-orange-900/30">
                    <MdAdd size={18} /> Create Plan
                </button>
            </div>

            {/* ── PLANS GRID ── */}
            {plans.length === 0 ? (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-16 text-center">
                    <MdStar size={40} className="text-neutral-700 mx-auto mb-4" />
                    <p className="text-white font-black italic uppercase text-xl mb-1">No Plans Yet</p>
                    <p className="text-gray-500 text-sm mb-4">Create your first membership plan to get started.</p>
                    <button onClick={openCreate} className="px-4 py-2 bg-warrior-orange text-white rounded-xl text-xs font-black uppercase hover:bg-orange-600 transition-colors">
                        + Create First Plan
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {[
                        { label: 'Elite', color: 'text-yellow-400', items: elite   },
                        { label: 'Pro',   color: 'text-warrior-orange', items: pro },
                        { label: 'Starter', color: 'text-blue-400',  items: starter },
                    ].filter(g => g.items.length > 0).map(group => (
                        <div key={group.label}>
                            <div className="flex items-center gap-3 mb-4">
                                <p className={`text-[9px] font-black uppercase tracking-widest ${group.color}`}>{group.label}</p>
                                <div className="flex-1 h-px bg-neutral-800" />
                                <span className="text-[9px] text-gray-600 font-bold">{group.items.length} plan{group.items.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.items.map(plan => (
                                    <PlanCard key={plan._id} plan={plan} onEdit={openEdit} onDelete={handleDelete} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── MODAL ── */}
            {modalOpen && (
                <PlanModal
                    initial={editPlan}
                    onClose={() => { setModalOpen(false); setEditPlan(null); }}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
        </div>
    );
};

export default ManagePlans;