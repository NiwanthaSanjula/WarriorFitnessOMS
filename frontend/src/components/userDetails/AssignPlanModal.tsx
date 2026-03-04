import { useState } from "react";
import type { MembershipPlan } from "../../services/membershipService";
import { GiLaurelCrown, GiMuscleUp, GiTrophy } from "react-icons/gi";
import { MdClose, MdCheckCircle, MdFitnessCenter } from "react-icons/md";

interface AssignPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    plans: MembershipPlan[];
    onConfirm: (planId: string) => void;
}

const getTier = (price: number) => {
    if (price >= 5000) return { label: 'Elite',   color: 'text-yellow-400',       bg: 'bg-yellow-900/20 border-yellow-800/40' };
    if (price >= 2500) return { label: 'Pro',     color: 'text-warrior-orange',   bg: 'bg-warrior-orange/10 border-warrior-orange/30' };
    return               { label: 'Starter', color: 'text-blue-400',         bg: 'bg-blue-900/20 border-blue-800/40' };
};

const TierIcon = ({ price }: { price: number }) => {
    if (price >= 5000) return <GiLaurelCrown className="text-yellow-400"     size={14} />;
    if (price >= 2500) return <GiMuscleUp    className="text-warrior-orange" size={14} />;
    return                    <GiTrophy      className="text-blue-400"       size={14} />;
};

export const AssignPlanModal = ({ isOpen, onClose, plans, onConfirm }: AssignPlanModalProps) => {
    const [selectedPlanId, setSelectedPlanId] = useState('');
    if (!isOpen) return null;

    const selectedPlan = plans.find(p => p._id === selectedPlanId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange w-full max-w-md rounded-2xl shadow-2xl shadow-warrior-orange/20 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center">
                            <MdFitnessCenter className="text-warrior-orange" size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase text-white tracking-tight">
                                Assign <span className="text-warrior-orange">Membership</span>
                            </h3>
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Choose a plan to activate</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                    >
                        <MdClose size={16} />
                    </button>
                </div>

                {/* Plan List */}
                <div className="px-6 py-5 space-y-3">
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Available Plans</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {plans.map(plan => {
                            const tier     = getTier(plan.price);
                            const selected = selectedPlanId === plan._id;
                            return (
                                <div
                                    key={plan._id}
                                    onClick={() => setSelectedPlanId(plan._id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selected
                                            ? 'border-warrior-orange bg-warrior-orange/10'
                                            : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TierIcon price={plan.price} />
                                            <span className="text-sm font-black italic uppercase text-gray-200">{plan.name}</span>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color}`}>
                                                {tier.label}
                                            </span>
                                        </div>
                                        {selected && <MdCheckCircle className="text-warrior-orange shrink-0" size={16} />}
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-warrior-orange font-black text-sm">
                                            {plan.price.toLocaleString()} LKR
                                        </span>
                                        <span className="text-[10px] text-gray-600 font-bold">·</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">
                                            {plan.durationDays} days
                                        </span>
                                        {plan.durationDays > 0 && (
                                            <>
                                                <span className="text-[10px] text-gray-600 font-bold">·</span>
                                                <span className="text-[10px] text-gray-600 font-bold">
                                                    {Math.round(plan.price / plan.durationDays)} LKR/day
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {plans.length === 0 && (
                            <p className="text-center text-gray-600 text-sm py-6 italic">No plans available</p>
                        )}
                    </div>
                </div>

                {/* Selected summary */}
                {selectedPlan && (
                    <div className="mx-6 mb-4 p-3 bg-warrior-orange/5 border border-warrior-orange/20 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Selected</span>
                        <span className="text-xs font-black italic uppercase text-warrior-orange">{selectedPlan.name}</span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex gap-3 px-6 py-5 border-t border-neutral-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedPlanId}
                        onClick={() => { onConfirm(selectedPlanId); setSelectedPlanId(''); }}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-warrior-orange hover:bg-warrior-orange/80 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <MdCheckCircle size={14} /> Activate Plan
                    </button>
                </div>
            </div>
        </div>
    );
};