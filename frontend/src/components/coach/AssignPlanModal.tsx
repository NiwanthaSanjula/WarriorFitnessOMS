/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { planService } from "../../services/planService";
import { progressService } from "../../services/progressService"; 
import { Button } from "../ui/Button";
import { MdClose, MdPersonAdd, MdAssignment } from "react-icons/md";

interface Props {
    planId?: string;          // Made optional: can select inside modal
    planType: "workout" | "nutrition";
    planTitle?: string;       // Made optional
    memberId?: string;        // If pre-selected from member profile
    memberName?: string;      // To display pre-selected member name
    onClose: () => void;
    onSuccess: () => void;
}

const AssignPlanModal = ({
    planId, planType, planTitle, memberId, memberName, onClose, onSuccess
}: Props) => {
    const [members, setMembers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]); // NEW: To hold list of templates
    const [selectedMemberId, setSelectedMemberId] = useState(memberId || "");
    const [selectedPlanId, setSelectedPlanId] = useState(planId || ""); // NEW: To hold selected template
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
    const [coachNotes, setCoachNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setFetchingData(true);
            try {
                // 1. Fetch Members if not provided [cite: 125, 126]
                if (!memberId) {
                    const memberList = await progressService.getCoachMembersList();
                    setMembers(memberList);
                }
                // 2. Fetch Templates if not provided
                if (!planId) {
                    const planList = planType === 'workout' 
                        ? await planService.getWorkoutPlans() 
                        : await planService.getNutritionPlans();
                    setTemplates(planList);
                }
            } catch (err) {
                console.error("Failed to load assignment data", err);
            } finally {
                setFetchingData(false);
            }
        };
        loadInitialData();
    }, [memberId, planId, planType]);

    const handleSubmit = async () => {
        if (!selectedMemberId) return setError("Please select a member");
        if (!selectedPlanId) return setError("Please select a plan template");

        setLoading(true);
        setError(null);
        try {
            await planService.assignPlan({
                memberId: selectedMemberId,
                planType,
                planId: selectedPlanId,
                startDate,
                coachNotes,
            });
            onSuccess();
        } catch (e: any) {
            setError(e.response?.data?.message || "Failed to assign plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md space-y-5 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-warrior-orange/20 flex items-center justify-center">
                            <MdPersonAdd className="text-warrior-orange" size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white uppercase italic">Assign {planType}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Targeting Member Evolution</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Plan Selection (If not provided) */}
                {!planId && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Select Template</label>
                        <select
                            className="w-full bg-neutral-800 border border-neutral-700 text-white p-3 rounded-xl text-sm outline-none focus:border-warrior-orange"
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                        >
                            <option value="">{fetchingData ? "Loading plans..." : "Choose a template"}</option>
                            {templates.map((t: any) => (
                                <option key={t._id} value={t._id}>{t.title} ({t.durationWeeks} Weeks)</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Member Selection (If not provided) */}
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Target Member</label>
                    {memberId ? (
                        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white font-bold italic">
                            {memberName}
                        </div>
                    ) : (
                        <select
                            className="w-full bg-neutral-800 border border-neutral-700 text-white p-3 rounded-xl text-sm outline-none focus:border-warrior-orange"
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                        >
                            <option value="">{fetchingData ? "Loading members..." : "Select a student"}</option>
                            {members.map((m: any) => (
                                <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Start Date</label>
                        <input
                            type="date"
                            className="w-full bg-neutral-800 border border-neutral-700 text-white p-3 rounded-xl text-sm outline-none focus:border-warrior-orange"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                         <div className={`w-full text-center py-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter ${
                            planType === "workout"
                                ? "bg-orange-900/20 text-orange-400 border-orange-800/50"
                                : "bg-green-900/20 text-green-400 border-green-800/50"
                        }`}>
                            {planType} Mode
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1 tracking-widest">Coach Instructions</label>
                    <textarea
                        className="w-full bg-neutral-800 border border-neutral-700 text-gray-300 p-3 rounded-xl text-sm outline-none focus:border-warrior-orange min-h-20"
                        placeholder="e.g. Focus on progressive overload this week..."
                        value={coachNotes}
                        onChange={(e) => setCoachNotes(e.target.value)}
                    />
                </div>

                {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 p-3 rounded-xl">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-3 bg-neutral-800 text-gray-300 rounded-xl text-xs font-black uppercase hover:bg-neutral-700 transition-colors">
                        Cancel
                    </button>
                    <Button onClick={handleSubmit} loading={loading} className="flex-1">
                        Initialize Plan
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AssignPlanModal;