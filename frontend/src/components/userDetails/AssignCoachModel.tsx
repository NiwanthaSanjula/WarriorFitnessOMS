interface CoachesDropDownItem{
    _id: string;
    name: string
}

interface AssignCoachModelProps {
    isOpen: boolean;
    onClose: () => void;
    coaches: CoachesDropDownItem[];
    selectedCoach: string;
    setSelectedCoach: (id: string) => void;
    onConfirm: () => void
}

export const AssignCoachModel = ({
    isOpen,
    onClose,
    coaches,
    selectedCoach,
    setSelectedCoach,
    onConfirm
}: AssignCoachModelProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-warrior-grey border border-neutral-600 w-full max-w-md p-8 rounded-2xl shadow-lg shadow-warrior-orange/50">
                <h3 className="text-2xl font-bold italic text-gray-300 uppercase mb-6">
                    Assign <span className="text-warrior-orange">Coach</span>
                </h3>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Select Coach</label>
                    <select
                        value={selectedCoach}
                        onChange={(e) => setSelectedCoach(e.target.value)}
                        className="w-full bg-neutral-700 border border-neutral-600 text-gray-300 p-2 rounded-lg outline-none focus:border-warrior-orange transition-colors"
                    >
                        <option value="">Choose a Coach...</option>
                        {coaches?.map((coach) => (
                            <option key={coach._id} value={coach._id}>{coach.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-gray-400 font-bold uppercase text-xs hover:text-white transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 bg-warrior-orange text-white font-bold uppercase text-xs rounded-lg hover:scale-105 cursor-pointer hover:bg-warrior-orange/90 transition-all duration-200"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
} 