import { GiWhistle } from "react-icons/gi";
import { MdClose, MdCheckCircle } from "react-icons/md";

interface CoachesDropDownItem {
    _id: string;
    name: string;
}

interface AssignCoachModelProps {
    isOpen: boolean;
    onClose: () => void;
    coaches: CoachesDropDownItem[];
    selectedCoach: string;
    setSelectedCoach: (id: string) => void;
    onConfirm: () => void;
}

export const AssignCoachModel = ({
    isOpen, onClose, coaches, selectedCoach, setSelectedCoach, onConfirm
}: AssignCoachModelProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-blue-500 w-full max-w-md rounded-2xl shadow-2xl shadow-blue-900/30 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-900/20 border border-blue-800/30 flex items-center justify-center">
                            <GiWhistle className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black italic uppercase text-white tracking-tight">
                                Assign <span className="text-blue-400">Coach</span>
                            </h3>
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Select a coach to assign</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                    >
                        <MdClose size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-3">
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Available Coaches</p>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                        {coaches?.map(coach => (
                            <div
                                key={coach._id}
                                onClick={() => setSelectedCoach(coach._id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    selectedCoach === coach._id
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-neutral-700 border border-neutral-600 flex items-center justify-center text-blue-400 font-black text-xs uppercase shrink-0">
                                    {coach.name.charAt(0)}
                                </div>
                                <span className="text-sm font-bold text-gray-200 flex-1">{coach.name}</span>
                                {selectedCoach === coach._id && (
                                    <MdCheckCircle className="text-blue-400 shrink-0" size={16} />
                                )}
                            </div>
                        ))}
                        {(!coaches || coaches.length === 0) && (
                            <p className="text-center text-gray-600 text-sm py-6 italic">No coaches available</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-5 border-t border-neutral-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!selectedCoach}
                        className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <MdCheckCircle size={14} /> Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};