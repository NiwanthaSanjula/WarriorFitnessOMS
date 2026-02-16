import { useState } from "react";
import type { MembershipPlan } from "../../services/membershipService";

interface AssignPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    plans: MembershipPlan[];
    onConfirm: (planId: string) => void;
}

export const AssignPlanModal = ({ isOpen, onClose, plans, onConfirm }: AssignPlanModalProps ) => {
    const [selectedPlanId, setSelectedPlanId] = useState("");

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-warrior-dark/80 backdrop-blur-xs p-4">
            <div className="p-6 bg-warrior-grey border border-neutral-600 rounded-2xl w-full max-w-md shadow-md shadow-warrior-orange/50">
                <h3 className="text-2xl font-bold text-gray-300 uppercase italic mb-6">
                    Assign Membership
                </h3>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assignable Plans</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {plans.map((plan) => (
                            <div
                                key={plan._id}
                                onClick={() => setSelectedPlanId(plan._id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                    selectedPlanId === plan._id
                                    ? 'border-warrior-orange bg-warrior-orange/10'
                                    : 'border-neutral-700 bg-neutral-800 hover:border-neutral-500'
                                } `}
                            >
                                <div className="flex justify-between items-center"> 
                                    <span className="text-gray-300 font-bold uppercase italic text-sm">{plan.name}</span>
                                    <span className="text-warrior-orange font-bold bg-warrior-orange/20 px-2 py-0.5 rounded">{plan.price} LKR</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1" >{plan.durationDays} Days Duration</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-gray-400 font-bold uppercase text-sm hover:text-white transition-all duration-200"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!selectedPlanId}
                        onClick={() => onConfirm(selectedPlanId)}
                        className={"flex-1 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed bg-warrior-orange rounded-lg font-bold text-sm uppercase text-white cursor-pointer hover:scale-105 hover:bg-warrior-orange/80 transition-all duration-200"}
                    >
                        Activate Plan
                    </button>

                </div>
            </div>

        </div>

    )

}