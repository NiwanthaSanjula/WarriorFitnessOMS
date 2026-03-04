/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { planService } from "../../services/planService";
import Spinner from "../../components/ui/Spinner";
import { MdExpandMore, MdExpandLess, MdCalendarToday, MdTrendingUp, MdInfoOutline, MdLocalFireDepartment } from "react-icons/md";
import { GiMeal } from "react-icons/gi";

interface MealItem { name: string; quantity?: string; calories?: number; protein?: number; carbs?: number; fats?: number; notes?: string; }
interface Meal { mealName: string; time?: string; items: MealItem[]; }
interface NutritionDay { dayLabel: string; meals: Meal[]; }
interface NutritionPlanData { title: string; description?: string; goal: string; durationWeeks: number; dailyCalorieTarget?: number; dailyProteinTarget?: number; dailyCarbTarget?: number; dailyFatTarget?: number; schedule: NutritionDay[]; restrictions?: string[]; }
interface Assignment { _id: string; plan: NutritionPlanData; startDate: string; status: string; coachNotes?: string; planType: string; }

const goalLabel: Record<string, string> = {
    weight_loss: "Weight Loss", muscle_gain: "Muscle Gain",
    maintenance: "Maintenance", general_health: "General Health",
};

const MacroBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div>
        <div className="flex justify-between mb-1">
            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
            <p className={`text-[9px] font-black ${color}`}>{value}g</p>
        </div>
        <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${color.replace("text-", "bg-")}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
        </div>
    </div>
);

const MealCard = ({ meal }: { meal: Meal }) => {
    const totalCals = meal.items.reduce((s, i) => s + (i.calories || 0), 0);
    const totalProtein = meal.items.reduce((s, i) => s + (i.protein || 0), 0);
    return (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/30">
                <div className="flex items-center gap-2">
                    <span className="text-sm">🍽</span>
                    <p className="text-sm font-black text-white">{meal.mealName || "Meal"}</p>
                    {meal.time && <span className="text-[10px] text-gray-500 font-bold">· {meal.time}</span>}
                </div>
                <div className="flex gap-3">
                    {totalCals > 0 && <span className="text-[10px] text-orange-400 font-black">{totalCals} kcal</span>}
                    {totalProtein > 0 && <span className="text-[10px] text-blue-400 font-black">{totalProtein}g P</span>}
                </div>
            </div>
            <div className="divide-y divide-neutral-700/50">
                {meal.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center px-4 py-2.5">
                        <div className="col-span-12 md:col-span-4">
                            <p className="text-sm font-bold text-white">{item.name || "—"}</p>
                            {item.notes && <p className="text-[10px] text-gray-500 italic">{item.notes}</p>}
                        </div>
                        <div className="col-span-6 md:col-span-2 text-center">
                            {item.quantity && <span className="text-xs text-gray-400 bg-neutral-700 px-2 py-0.5 rounded font-bold">{item.quantity}</span>}
                        </div>
                        <div className="col-span-6 md:col-span-6">
                            <div className="flex gap-3 justify-end md:justify-start">
                                {(item.calories ?? 0) > 0 && <div className="text-center"><p className="text-xs font-black text-orange-400">{item.calories}</p><p className="text-[8px] text-gray-600">kcal</p></div>}
                                {(item.protein ?? 0) > 0 && <div className="text-center"><p className="text-xs font-black text-blue-400">{item.protein}g</p><p className="text-[8px] text-gray-600">protein</p></div>}
                                {(item.carbs ?? 0) > 0 && <div className="text-center"><p className="text-xs font-black text-yellow-400">{item.carbs}g</p><p className="text-[8px] text-gray-600">carbs</p></div>}
                                {(item.fats ?? 0) > 0 && <div className="text-center"><p className="text-xs font-black text-green-400">{item.fats}g</p><p className="text-[8px] text-gray-600">fats</p></div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DayCard = ({ day, index }: { day: NutritionDay; index: number }) => {
    const [open, setOpen] = useState(index === 0);
    const totalCals = day.meals.reduce((s, m) => s + m.items.reduce((ss, i) => ss + (i.calories || 0), 0), 0);
    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 hover:bg-neutral-700/20 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-700 text-white text-xs font-black flex items-center justify-center shrink-0">{index + 1}</span>
                    <div className="text-left">
                        <p className="text-sm font-black text-white">{day.dayLabel}</p>
                        <p className="text-[10px] text-gray-500 font-bold">{day.meals.length} meals{totalCals > 0 ? ` · ${totalCals} kcal total` : ""}</p>
                    </div>
                </div>
                {open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
            </button>
            {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-neutral-700">
                    <div className="pt-3 space-y-3">
                        {day.meals.map((meal, mi) => <MealCard key={mi} meal={meal} />)}
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
    const maxMacro = Math.max(plan.dailyProteinTarget || 0, plan.dailyCarbTarget || 0, plan.dailyFatTarget || 0, 1);

    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
            <div className="h-1 bg-linear-to-r from-green-500 via-emerald-400 to-transparent" />
            <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-900/20 border border-green-800/30 flex items-center justify-center text-green-500 shrink-0">
                            <GiMeal size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Current Plan</p>
                            <h2 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">{plan.title}</h2>
                            {plan.description && <p className="text-xs text-gray-500 mt-1 max-w-md">{plan.description}</p>}
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider shrink-0 text-green-400 bg-green-900/20 border-green-800/40">
                        {goalLabel[plan.goal] || plan.goal}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Duration", value: `${plan.durationWeeks}`, unit: "weeks", icon: <MdCalendarToday size={14} /> },
                        { label: "Current Week", value: `${currentWeek}`, unit: `of ${plan.durationWeeks}`, icon: <MdTrendingUp size={14} /> },
                        { label: "Daily Calories", value: plan.dailyCalorieTarget ? `${plan.dailyCalorieTarget}` : "—", unit: plan.dailyCalorieTarget ? "kcal" : "", icon: <MdLocalFireDepartment size={14} /> },
                        { label: "Days in Plan", value: `${plan.schedule.length}`, unit: "days", icon: <GiMeal size={14} /> },
                    ].map(({ label, value, unit, icon }) => (
                        <div key={label} className="bg-neutral-800/60 rounded-xl p-3 flex flex-col justify-between border border-neutral-600/50 border-l-2 border-l-green-400 ">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-gray-500">{icon}</span>
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
                            </div>
                            <p className="text-lg font-black text-white leading-none">{value} <span className="text-xs font-normal text-gray-500">{unit}</span></p>
                        </div>
                    ))}
                </div>

                {(plan.dailyProteinTarget || plan.dailyCarbTarget || plan.dailyFatTarget) && (
                    <div className="bg-neutral-800/40 rounded-xl p-4 space-y-3">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Daily Macro Targets</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {plan.dailyProteinTarget && <MacroBar label="Protein" value={plan.dailyProteinTarget} max={maxMacro} color="text-blue-400" />}
                            {plan.dailyCarbTarget && <MacroBar label="Carbs" value={plan.dailyCarbTarget} max={maxMacro} color="text-yellow-400" />}
                            {plan.dailyFatTarget && <MacroBar label="Fats" value={plan.dailyFatTarget} max={maxMacro} color="text-green-400" />}
                        </div>
                    </div>
                )}

                {plan.restrictions && plan.restrictions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {plan.restrictions.map((r) => (
                            <span key={r} className="px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 text-[9px] font-black uppercase tracking-wider">{r.replace("_", " ")}</span>
                        ))}
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan Progress</p>
                        <p className="text-[10px] font-black text-green-400">{progress}%</p>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                        <p className="text-[9px] text-gray-600">Started {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        <p className="text-[9px] text-gray-600">Ends {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                </div>

                {assignment.coachNotes && (
                    <div className="bg-green-900/10 border border-green-800/20 rounded-xl p-3 flex gap-3">
                        <MdInfoOutline className="text-green-400 shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="text-[9px] font-black uppercase text-green-400 tracking-widest mb-1">Coach Notes</p>
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
        <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl overflow-hidden border-l-3 border-l-green-400">
            {/* Header row — always visible */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-700/20 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-700 flex items-center justify-center text-gray-400 shrink-0">
                        <GiMeal size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white">{assignment.plan?.title ?? "Unknown Plan"}</p>
                        <p className="text-[10px] text-gray-500">
                            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {" · "}{assignment.plan?.durationWeeks ?? "?"} weeks
                            {" · "}{goalLabel[assignment.plan?.goal] || assignment.plan?.goal}
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
                            { label: "Daily Calories", value: assignment.plan?.dailyCalorieTarget ? `${assignment.plan.dailyCalorieTarget}` : "—", unit: assignment.plan?.dailyCalorieTarget ? "kcal" : "" },
                            { label: "Goal", value: goalLabel[assignment.plan?.goal] || assignment.plan?.goal || "—", unit: "" },
                            { label: "Days", value: `${assignment.plan?.schedule?.length ?? "?"}`, unit: "in plan" },
                        ].map(({ label, value, unit }) => (
                            <div key={label} className="bg-neutral-900/60 rounded-lg p-2.5 flex flex-col justify-between ">
                                <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">{label}</p>
                                <p className="text-sm font-black text-white mt-0.5">{value} <span className="text-xs font-normal text-gray-500">{unit}</span></p>
                            </div>
                        ))}
                    </div>

                    {/* Macros */}
                    {(assignment.plan?.dailyProteinTarget || assignment.plan?.dailyCarbTarget || assignment.plan?.dailyFatTarget) && (
                        <div className="bg-neutral-900/40 rounded-xl p-3 space-y-3">
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Daily Macro Targets</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(() => {
                                    const max = Math.max(assignment.plan?.dailyProteinTarget || 0, assignment.plan?.dailyCarbTarget || 0, assignment.plan?.dailyFatTarget || 0, 1);
                                    return <>
                                        {assignment.plan?.dailyProteinTarget && <MacroBar label="Protein" value={assignment.plan.dailyProteinTarget} max={max} color="text-blue-400" />}
                                        {assignment.plan?.dailyCarbTarget && <MacroBar label="Carbs" value={assignment.plan.dailyCarbTarget} max={max} color="text-yellow-400" />}
                                        {assignment.plan?.dailyFatTarget && <MacroBar label="Fats" value={assignment.plan.dailyFatTarget} max={max} color="text-green-400" />}
                                    </>;
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Restrictions */}
                    {assignment.plan?.restrictions && assignment.plan.restrictions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {assignment.plan.restrictions.map((r: string) => (
                                <span key={r} className="px-2 py-1 rounded-full bg-neutral-800 text-gray-400 border border-neutral-700 text-[9px] font-black uppercase tracking-wider">{r.replace("_", " ")}</span>
                            ))}
                        </div>
                    )}

                    {/* Date range */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 bg-neutral-900/40 rounded-lg px-3 py-2">
                        <span>Started <span className="text-gray-300 font-bold">{startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                        <span className="text-neutral-600">→</span>
                        <span>Ended <span className="text-gray-300 font-bold">{endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                    </div>

                    {/* Coach notes */}
                    {assignment.coachNotes && (
                        <div className="bg-green-900/10 border border-green-800/20 rounded-xl p-3 flex gap-3">
                            <MdInfoOutline className="text-green-400 shrink-0 mt-0.5" size={16} />
                            <div>
                                <p className="text-[9px] font-black uppercase text-green-400 tracking-widest mb-1">Coach Notes</p>
                                <p className="text-xs text-gray-300 italic">"{assignment.coachNotes}"</p>
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    {assignment.plan?.schedule?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">
                                Meal Schedule ({assignment.plan.schedule.length} days)
                            </p>
                            {assignment.plan.schedule.map((day: NutritionDay, i: number) => (
                                <DayCard key={i} day={day} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MemberNutritionPlan = () => {
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
                setActivePlan(activeData.nutritionPlans?.[0] ?? null);
                const historyData = await planService.getMyPlanHistory();
                setHistory(historyData.filter((a: Assignment) => a.planType === "NutritionPlan" && a.status !== "active"));
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load nutrition plan");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <Spinner />;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-900/20 border border-green-800/30 flex items-center justify-center text-green-500">
                    <GiMeal size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        My <span className="text-green-400">Nutrition Plan</span>
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
                            Meal Schedule <span className="text-gray-600 normal-case font-normal ml-2">({activePlan.plan.schedule.length} days)</span>
                        </h2>
                        {activePlan.plan.schedule.map((day, i) => <DayCard key={i} day={day} index={i} />)}
                    </div>
                </>
            ) : (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-gray-600 mx-auto mb-4">
                        <GiMeal size={32} />
                    </div>
                    <p className="text-white font-black italic uppercase text-xl mb-1">No Plan Yet</p>
                    <p className="text-gray-500 text-sm">Your coach hasn't assigned a nutrition plan yet.</p>
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

export default MemberNutritionPlan;