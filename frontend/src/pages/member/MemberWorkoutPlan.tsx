/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { planService } from "../../services/planService";
import Spinner from "../../components/ui/Spinner";
import { MdExpandMore, MdExpandLess, MdCalendarToday, MdTimer, MdTrendingUp, MdInfoOutline, MdFitnessCenter } from "react-icons/md";
import { GiWeightLiftingUp } from "react-icons/gi";

interface ExerciseEntry { exerciseName: string; sets?: number; reps?: string; restSeconds?: number; notes?: string; }
interface WorkoutDay { dayLabel: string; focus?: string; exercises: ExerciseEntry[]; }
interface WorkoutPlanData { title: string; description?: string; difficulty: string; goal: string; durationWeeks: number; daysPerWeek: number; schedule: WorkoutDay[]; }
interface Assignment { _id: string; plan: WorkoutPlanData; startDate: string; status: string; coachNotes?: string; planType: string; }

const difficultyStyle = (d: string) =>
    d === "beginner" ? "text-green-400 bg-green-900/20 border-green-800/40"
    : d === "intermediate" ? "text-yellow-400 bg-yellow-900/20 border-yellow-800/40"
    : "text-red-400 bg-red-900/20 border-red-800/40";

const goalLabel: Record<string, string> = {
    weight_loss: "Weight Loss", muscle_gain: "Muscle Gain",
    endurance: "Endurance", general_fitness: "General Fitness",
};

const DayCard = ({ day, index }: { day: WorkoutDay; index: number }) => {
    const [open, setOpen] = useState(index === 0);
    const totalSets = day.exercises.reduce((acc, e) => acc + (e.sets || 0), 0);
    return (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-neutral-700/30 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-warrior-orange text-white text-xs font-black flex items-center justify-center shrink-0">{index + 1}</span>
                    <div className="text-left">
                        <p className="text-sm font-black text-white">{day.dayLabel}</p>
                        {day.focus && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{day.focus}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-bold">{day.exercises.length} exercises · {totalSets} sets</span>
                    {open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
                </div>
            </button>
            {open && (
                <div className="border-t border-neutral-700">
                    <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-neutral-900/40 text-[9px] font-black uppercase text-gray-600 tracking-widest">
                        <div className="col-span-5">Exercise</div>
                        <div className="col-span-2 text-center">Sets</div>
                        <div className="col-span-2 text-center">Reps</div>
                        <div className="col-span-3 text-center">Rest</div>
                    </div>
                    <div className="divide-y divide-neutral-700/50">
                        {day.exercises.map((ex, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-neutral-700/20 transition-colors">
                                <div className="col-span-12 md:col-span-5 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded bg-neutral-700 text-gray-400 text-[9px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">{ex.exerciseName}</p>
                                        {ex.notes && <p className="text-[10px] text-gray-500 italic">{ex.notes}</p>}
                                    </div>
                                </div>
                                <div className="col-span-4 md:col-span-2 text-center">
                                    <p className="text-sm font-black text-warrior-orange">{ex.sets ?? "—"}</p>
                                    <p className="text-[9px] text-gray-600 md:hidden">sets</p>
                                </div>
                                <div className="col-span-4 md:col-span-2 text-center">
                                    <p className="text-sm font-black text-white">{ex.reps ?? "—"}</p>
                                    <p className="text-[9px] text-gray-600 md:hidden">reps</p>
                                </div>
                                <div className="col-span-4 md:col-span-3 text-center">
                                    {ex.restSeconds ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <MdTimer size={12} className="text-gray-500" />
                                            <p className="text-sm font-bold text-gray-400">{ex.restSeconds}s</p>
                                        </div>
                                    ) : <p className="text-gray-700">—</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PlanHeader = ({ assignment }: { assignment: Assignment }) => {
    const { plan } = assignment;
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationWeeks * 7);
    const today = new Date();
    const totalDays = plan.durationWeeks * 7;
    const elapsed = Math.min(Math.max(Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), 0), totalDays);
    const progress = Math.round((elapsed / totalDays) * 100);
    const currentWeek = Math.min(Math.ceil(elapsed / 7) + 1, plan.durationWeeks);

    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">

            <div className="p-6 space-y-5">
                {/* Title */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-orange-900/20 border border-orange-800/30 flex items-center justify-center text-warrior-orange shrink-0">
                            <GiWeightLiftingUp size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Current Plan</p>
                            <h2 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">{plan.title}</h2>
                            {plan.description && <p className="text-xs text-gray-500 mt-1 max-w-md">{plan.description}</p>}
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shrink-0 ${difficultyStyle(plan.difficulty)}`}>
                        {plan.difficulty}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Duration", value: `${plan.durationWeeks}`, unit: "weeks", icon: <MdCalendarToday size={14} /> },
                        { label: "Frequency", value: `${plan.daysPerWeek}x`, unit: "per week", icon: <MdFitnessCenter size={14} /> },
                        { label: "Current Week", value: `${currentWeek}`, unit: `of ${plan.durationWeeks}`, icon: <MdTrendingUp size={14} /> },
                        { label: "Goal", value: goalLabel[plan.goal] || plan.goal, unit: "", icon: <MdInfoOutline size={14} /> },
                    ].map(({ label, value, unit, icon }) => (
                        <div key={label} className="bg-neutral-800/60 rounded-xl p-3 flex flex-col justify-between border border-neutral-600/50 border-l-2 border-l-warrior-orange ">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-gray-500">{icon}</span>
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
                            </div>
                            <p className="text-lg font-black text-white leading-none">{value} <span className="text-xs font-normal text-gray-500">{unit}</span></p>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan Progress</p>
                        <p className="text-[10px] font-black text-warrior-orange">{progress}%</p>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-warrior-orange to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                        <p className="text-[9px] text-gray-600">Started {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        <p className="text-[9px] text-gray-600">Ends {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                </div>

                {/* Coach notes */}
                {assignment.coachNotes && (
                    <div className="bg-warrior-orange/5 border border-warrior-orange/20 rounded-xl p-3 flex gap-3">
                        <MdInfoOutline className="text-warrior-orange shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="text-[9px] font-black uppercase text-warrior-orange tracking-widest mb-1">Coach Notes</p>
                            <p className="text-xs text-gray-300 italic">"{assignment.coachNotes}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HistoryCard = ({ assignment }: { assignment: Assignment }) => {
    const [open, setOpen] = useState(false);
    const statusStyle: Record<string, string> = {
        completed: "text-green-400 bg-green-900/20 border-green-800/40",
        cancelled: "text-red-400 bg-red-900/20 border-red-800/40",
        active: "text-blue-400 bg-blue-900/20 border-blue-800/40",
    };
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (assignment.plan?.durationWeeks ?? 0) * 7);

    return (
        <div className="bg-neutral-800/40 border border-neutral-700 border-l-3 border-l-warrior-orange rounded-xl overflow-hidden ">
            {/* Header row — always visible */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-700/20 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-700 flex items-center justify-center text-gray-400 shrink-0">
                        <GiWeightLiftingUp size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white">{assignment.plan?.title ?? "Unknown Plan"}</p>
                        <p className="text-[10px] text-gray-500">
                            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {" · "}{assignment.plan?.durationWeeks ?? "?"} weeks
                            {" · "}{assignment.plan?.daysPerWeek ?? "?"}x/week
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusStyle[assignment.status] ?? "text-gray-400 bg-neutral-800 border-neutral-700"}`}>
                        {assignment.status}
                    </span>
                    {open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
                </div>
            </button>

            {/* Expanded details */}
            {open && (
                <div className="border-t border-neutral-700 p-4 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { label: "Duration", value: `${assignment.plan?.durationWeeks ?? "?"}`, unit: "weeks" },
                            { label: "Frequency", value: `${assignment.plan?.daysPerWeek ?? "?"}x`, unit: "per week" },
                            { label: "Difficulty", value: assignment.plan?.difficulty ?? "—", unit: "" },
                            { label: "Goal", value: goalLabel[assignment.plan?.goal] || assignment.plan?.goal || "—", unit: "" },
                        ].map(({ label, value, unit }) => (
                            <div key={label} className="bg-neutral-900/60 rounded-lg p-2.5">
                                <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">{label}</p>
                                <p className="text-sm font-black text-white mt-0.5 capitalize">{value} <span className="text-xs font-normal text-gray-500">{unit}</span></p>
                            </div>
                        ))}
                    </div>

                    {/* Date range */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 bg-neutral-900/40 rounded-lg px-3 py-2">
                        <span>Started <span className="text-gray-300 font-bold">{startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                        <span className="text-neutral-600">→</span>
                        <span>Ended <span className="text-gray-300 font-bold">{endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                    </div>

                    {/* Coach notes */}
                    {assignment.coachNotes && (
                        <div className="bg-warrior-orange/5 border border-warrior-orange/20 rounded-xl p-3 flex gap-3">
                            <MdInfoOutline className="text-warrior-orange shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-[9px] font-black uppercase text-warrior-orange tracking-widest mb-1">Coach Notes</p>
                                <p className="text-xs text-gray-300 italic">"{assignment.coachNotes}"</p>
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    {assignment.plan?.schedule?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                                Schedule ({assignment.plan.schedule.length} days)
                            </p>
                            {assignment.plan.schedule.map((day, i) => (
                                <DayCard key={i} day={day} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MemberWorkoutPlan = () => {
    const [loading, setLoading] = useState(true);
    const [activePlan, setActivePlan] = useState<Assignment | null>(null);
    const [history, setHistory] = useState<Assignment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const activeData = await planService.getMyActivePlans();
                setActivePlan(activeData.workoutPlans?.[0] ?? null);
                const historyData = await planService.getMyPlanHistory();
                setHistory(historyData.filter((a: Assignment) => a.planType === "WorkoutPlan" && a.status !== "active"));
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load workout plan");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-900/20 border border-orange-800/30 flex items-center justify-center text-warrior-orange">
                    <GiWeightLiftingUp size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        My <span className="text-warrior-orange">Workout Plan</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Assigned by your coach</p>
                </div>
            </div>

            {error && <div className="bg-red-900/20 border border-red-800 rounded-xl p-4"><p className="text-red-400 text-sm">{error}</p></div>}

            {activePlan ? (
                <>
                    <PlanHeader assignment={activePlan} />
                    <div className="space-y-3">
                        <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">
                            Workout Schedule <span className="text-gray-600 normal-case font-normal ml-2">({activePlan.plan.schedule.length} days)</span>
                        </h2>
                        {activePlan.plan.schedule.map((day, i) => <DayCard key={i} day={day} index={i} />)}
                    </div>
                </>
            ) : (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-gray-600 mx-auto mb-4">
                        <GiWeightLiftingUp size={32} />
                    </div>
                    <p className="text-white font-black italic uppercase text-xl mb-1">No Plan Yet</p>
                    <p className="text-gray-500 text-sm">Your coach hasn't assigned a workout plan yet.</p>
                </div>
            )}

            {history.length > 0 && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
                    <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between p-5 hover:bg-neutral-700/20 transition-colors">
                        <div>
                            <p className="text-xs font-black uppercase text-gray-400 tracking-widest text-left">Plan History</p>
                            <p className="text-[10px] text-gray-600 mt-0.5">{history.length} previous plans</p>
                        </div>
                        {showHistory ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
                    </button>
                    {showHistory && (
                        <div className="px-5 pb-5 border-t border-neutral-700">
                            <div className="pt-4 space-y-3">
                                {history.map((a) => <HistoryCard key={a._id} assignment={a} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MemberWorkoutPlan;