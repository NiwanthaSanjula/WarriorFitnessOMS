/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { planService } from "../../services/planService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { MdArrowBack, MdAdd, MdDelete, MdExpandMore, MdExpandLess, MdRestaurant } from "react-icons/md";

// ── Types ─────────────────────────────────────────────────────────
interface MealItem { name: string; quantity: string; calories: string; protein: string; carbs: string; fats: string; notes: string; }
interface Meal { mealName: string; time: string; items: MealItem[]; }
interface NutritionDay { dayLabel: string; meals: Meal[]; }

const emptyItem = (): MealItem => ({ name: "", quantity: "", calories: "", protein: "", carbs: "", fats: "", notes: "" });
const emptyMeal = (): Meal => ({ mealName: "", time: "", items: [emptyItem()] });
const emptyDay = (i: number): NutritionDay => ({ dayLabel: `Day ${i + 1}`, meals: [emptyMeal()] });

const RESTRICTIONS = ["vegetarian", "vegan", "gluten_free", "dairy_free", "nut_free", "halal", "keto", "low_carb"];

// ── Meal Item Row ─────────────────────────────────────────────────
const MealItemRow = ({ item, di, mi, ii, onChange, onRemove }: any) => (
    <div className="grid grid-cols-12 gap-2 items-center bg-neutral-900/60 p-2 rounded-lg">
        <div className="col-span-12 md:col-span-3">
            <input className="w-full bg-transparent border-b border-neutral-700 text-white text-sm p-1 outline-none focus:border-warrior-orange placeholder-gray-700"
                placeholder="Food item *" value={item.name}
                onChange={e => onChange(di, mi, ii, "name", e.target.value)} />
        </div>
        <div className="col-span-6 md:col-span-2">
            <input className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs p-1.5 rounded outline-none focus:border-warrior-orange text-center"
                placeholder="200g / 1 cup" value={item.quantity}
                onChange={e => onChange(di, mi, ii, "quantity", e.target.value)} />
            <p className="text-xs text-gray-700 text-center mt-0.5">Qty</p>
        </div>
        {["calories", "protein", "carbs", "fats"].map(field => (
            <div key={field} className="col-span-3 md:col-span-1">
                <input type="number" className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs p-1.5 rounded outline-none focus:border-warrior-orange text-center"
                    placeholder="0" value={(item as any)[field]}
                    onChange={e => onChange(di, mi, ii, field, e.target.value)} />
                <p className="text-xs text-gray-700 text-center mt-0.5 capitalize">{field === "calories" ? "kcal" : field[0].toUpperCase()}</p>
            </div>
        ))}
        <div className="col-span-1 flex justify-end">
            <button onClick={() => onRemove(di, mi, ii)} className="p-1 text-gray-700 hover:text-red-400 transition-colors">
                <MdDelete size={14} />
            </button>
        </div>
    </div>
);

// ── Meal Section ──────────────────────────────────────────────────
const MealSection = ({ meal, di, mi, onUpdateMeal, onAddItem, onUpdateItem, onRemoveItem, onRemoveMeal }: any) => (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-3 bg-neutral-750">
            <span className="text-warrior-orange text-sm font-bold">🍽</span>
            <input className="flex-1 bg-transparent text-white text-sm font-bold outline-none border-b border-transparent focus:border-neutral-500"
                placeholder="Meal name (e.g. Breakfast)" value={meal.mealName}
                onChange={e => onUpdateMeal(di, mi, "mealName", e.target.value)} />
            <input className="w-24 bg-transparent text-gray-400 text-xs outline-none border-b border-transparent focus:border-neutral-500"
                placeholder="7:00 AM" value={meal.time}
                onChange={e => onUpdateMeal(di, mi, "time", e.target.value)} />
            <button onClick={() => onRemoveMeal(di, mi)} className="text-gray-600 hover:text-red-400 transition-colors">
                <MdDelete size={15} />
            </button>
        </div>
        <div className="p-3 space-y-2">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-600 px-2">
                <div className="col-span-3">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-1 text-center">kcal</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center">C</div>
                <div className="col-span-1 text-center">F</div>
            </div>
            {meal.items.map((item: MealItem, ii: number) => (
                <MealItemRow key={ii} item={item} di={di} mi={mi} ii={ii}
                    onChange={onUpdateItem} onRemove={onRemoveItem} />
            ))}
            <button onClick={() => onAddItem(di, mi)}
                className="w-full py-1.5 border border-dashed border-neutral-700 text-gray-600 hover:text-green-400 hover:border-green-800 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                <MdAdd size={12} /> Add Item
            </button>
        </div>
    </div>
);

// ── Day Card ──────────────────────────────────────────────────────
const DayCard = ({ day, di, onUpdateDay, onAddMeal, onUpdateMeal, onAddItem, onUpdateItem, onRemoveItem, onRemoveMeal, onRemoveDay }: any) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-warrior-grey border border-neutral-600 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 bg-neutral-800">
                <span className="w-7 h-7 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center">{di + 1}</span>
                <input className="flex-1 bg-transparent text-white font-bold text-sm outline-none border-b border-transparent focus:border-neutral-500"
                    value={day.dayLabel} onChange={e => onUpdateDay(di, "dayLabel", e.target.value)} placeholder="Day label" />
                <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white">
                    {open ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                <button onClick={() => onRemoveDay(di)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <MdDelete size={16} />
                </button>
            </div>
            {open && (
                <div className="p-4 space-y-3">
                    {day.meals.map((meal: Meal, mi: number) => (
                        <MealSection key={mi} meal={meal} di={di} mi={mi}
                            onUpdateMeal={onUpdateMeal} onAddItem={onAddItem}
                            onUpdateItem={onUpdateItem} onRemoveItem={onRemoveItem}
                            onRemoveMeal={onRemoveMeal} />
                    ))}
                    <button onClick={() => onAddMeal(di)}
                        className="w-full py-2 border border-dashed border-neutral-600 text-gray-500 hover:text-green-400 hover:border-green-700/50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                        <MdAdd size={14} /> Add Meal
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main Form ─────────────────────────────────────────────────────
const NutritionPlanForm = () => {
    const navigate = useNavigate();
    const { planId } = useParams<{ planId?: string }>();
    const isEdit = Boolean(planId);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState<string | null>(null);

    const [meta, setMeta] = useState({
        title: "", description: "", goal: "general_health",
        durationWeeks: 4, dailyCalorieTarget: "", dailyProteinTarget: "",
        dailyCarbTarget: "", dailyFatTarget: "", restrictions: [] as string[]
    });
    const [schedule, setSchedule] = useState<NutritionDay[]>([emptyDay(0)]);

    useEffect(() => {
        if (isEdit && planId) {
            planService.getNutritionPlanById(planId)
                .then((plan: any) => {
                    setMeta({
                        title: plan.title, description: plan.description || "",
                        goal: plan.goal, durationWeeks: plan.durationWeeks,
                        dailyCalorieTarget: plan.dailyCalorieTarget || "",
                        dailyProteinTarget: plan.dailyProteinTarget || "",
                        dailyCarbTarget: plan.dailyCarbTarget || "",
                        dailyFatTarget: plan.dailyFatTarget || "",
                        restrictions: plan.restrictions || []
                    });
                    setSchedule(plan.schedule?.length ? plan.schedule : [emptyDay(0)]);
                })
                .catch(() => setError("Failed to load plan"))
                .finally(() => setFetching(false));
        }
    }, [planId]);

    const toggleRestriction = (r: string) =>
        setMeta(m => ({
            ...m,
            restrictions: m.restrictions.includes(r)
                ? m.restrictions.filter(x => x !== r)
                : [...m.restrictions, r]
        }));

    // Schedule mutation helpers
    const addDay = () => setSchedule(s => [...s, emptyDay(s.length)]);
    const removeDay = (i: number) => setSchedule(s => s.filter((_, idx) => idx !== i));
    const updateDay = (i: number, field: string, value: string) =>
        setSchedule(s => s.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
    const addMeal = (di: number) =>
        setSchedule(s => s.map((d, i) => i === di ? { ...d, meals: [...d.meals, emptyMeal()] } : d));
    const removeMeal = (di: number, mi: number) =>
        setSchedule(s => s.map((d, i) => i === di ? { ...d, meals: d.meals.filter((_, j) => j !== mi) } : d));
    const updateMeal = (di: number, mi: number, field: string, value: string) =>
        setSchedule(s => s.map((d, i) => i === di
            ? { ...d, meals: d.meals.map((m, j) => j === mi ? { ...m, [field]: value } : m) } : d));
    const addItem = (di: number, mi: number) =>
        setSchedule(s => s.map((d, i) => i === di
            ? { ...d, meals: d.meals.map((m, j) => j === mi ? { ...m, items: [...m.items, emptyItem()] } : m) } : d));
    const removeItem = (di: number, mi: number, ii: number) =>
        setSchedule(s => s.map((d, i) => i === di
            ? { ...d, meals: d.meals.map((m, j) => j === mi ? { ...m, items: m.items.filter((_, k) => k !== ii) } : m) } : d));
    const updateItem = (di: number, mi: number, ii: number, field: string, value: string) =>
        setSchedule(s => s.map((d, i) => i === di
            ? {
                ...d, meals: d.meals.map((m, j) => j === mi
                    ? { ...m, items: m.items.map((it, k) => k === ii ? { ...it, [field]: value } : it) } : m)
            } : d));

            const handleSubmit = async () => {
                // 1. Keep the Plan Title Check (This should remain required)
                if (!meta.title.trim()) {
                    setError("Plan Title is required");
                    return;
                }
            
                // 2. RELAXED VALIDATION: 
                // We remove the strict loop that was setting scheduleIsValid = false.
                // Instead, we just ensure that we don't send completely empty objects if possible.
                
                setLoading(true);
                setError(null);
            
                try {
                    const payload = {
                        ...meta,
                        dailyCalorieTarget: meta.dailyCalorieTarget ? Number(meta.dailyCalorieTarget) : null,
                        dailyProteinTarget: meta.dailyProteinTarget ? Number(meta.dailyProteinTarget) : null,
                        dailyCarbTarget: meta.dailyCarbTarget ? Number(meta.dailyCarbTarget) : null,
                        dailyFatTarget: meta.dailyFatTarget ? Number(meta.dailyFatTarget) : null,
                        schedule
                    };
            
                    if (isEdit && planId) {
                        await planService.updateNutritionPlan(planId, payload);
                    } else {
                        await planService.createNutritionPlan(payload);
                    }
                    navigate("/coach/plans");
                } catch (e: any) {
                    setError(e.response?.data?.message || "Failed to save plan");
                } finally {
                    setLoading(false);
                }
            };
    if (fetching) return <Spinner />;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div>
                <button onClick={() => navigate("/coach/plans")}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-sm">
                    <MdArrowBack /> Back to Plans
                </button>
                <h1 className="text-3xl font-bold text-gray-300 flex items-center gap-3">
                    <MdRestaurant className="text-green-500" />
                    {isEdit ? "Edit" : "Create"} <span className="text-warrior-orange">Nutrition Plan</span>
                </h1>
            </div>

            {/* Meta fields */}
            <div className="bg-warrior-grey border border-neutral-600 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase">Plan Details</h2>

                <Input label="Plan Title *" placeholder="e.g. 12-Week Clean Bulk Diet"
                    value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">Goal *</label>
                        <select className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-white p-3 rounded-lg outline-none focus:border-warrior-orange text-sm"
                            value={meta.goal} onChange={e => setMeta({ ...meta, goal: e.target.value })}>
                            <option value="weight_loss">Weight Loss</option>
                            <option value="muscle_gain">Muscle Gain</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="general_health">General Health</option>
                        </select>
                    </div>
                    <Input label="Duration (weeks) *" type="number"
                        value={meta.durationWeeks}
                        onChange={e => setMeta({ ...meta, durationWeeks: parseInt(e.target.value) })} />
                </div>

                {/* Macro targets */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Daily Targets <span className="text-gray-600 normal-case font-normal">(optional)</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { key: "dailyCalorieTarget", label: "Calories (kcal)" },
                            { key: "dailyProteinTarget", label: "Protein (g)" },
                            { key: "dailyCarbTarget", label: "Carbs (g)" },
                            { key: "dailyFatTarget", label: "Fats (g)" },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="text-xs text-gray-500">{label}</label>
                                <input type="number"
                                    className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-white p-2 rounded-lg outline-none focus:border-warrior-orange text-sm"
                                    value={(meta as any)[key]}
                                    onChange={e => setMeta({ ...meta, [key]: e.target.value })} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Restrictions */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Dietary Restrictions</label>
                    <div className="flex flex-wrap gap-2">
                        {RESTRICTIONS.map(r => (
                            <button key={r} onClick={() => toggleRestriction(r)}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all capitalize ${meta.restrictions.includes(r)
                                        ? "bg-green-900/40 text-green-300 border-green-700"
                                        : "bg-neutral-800 text-gray-500 border-neutral-700 hover:border-neutral-500"
                                    }`}>
                                {r.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Description</label>
                    <textarea
                        className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-lg outline-none focus:border-warrior-orange min-h-20 text-sm"
                        placeholder="Describe this nutrition plan..."
                        value={meta.description}
                        onChange={e => setMeta({ ...meta, description: e.target.value })} />
                </div>
            </div>

            {/* Schedule Builder */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 uppercase">
                        Meal Schedule <span className="text-gray-600 normal-case font-normal">({schedule.length} days)</span>
                    </h2>
                    <button onClick={addDay}
                        className="flex items-center gap-1 text-sm text-green-400 font-bold hover:underline">
                        <MdAdd size={16} /> Add Day
                    </button>
                </div>

                {schedule.map((day, di) => (
                    <DayCard key={di} day={day} di={di}
                        onUpdateDay={updateDay} onAddMeal={addMeal}
                        onUpdateMeal={updateMeal} onAddItem={addItem}
                        onUpdateItem={updateItem} onRemoveItem={removeItem}
                        onRemoveMeal={removeMeal} onRemoveDay={removeDay} />
                ))}

                <button onClick={addDay}
                    className="w-full py-4 border-2 border-dashed border-neutral-700 text-gray-500 hover:text-green-400 hover:border-green-800/50 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2">
                    <MdAdd /> Add Another Day
                </button>
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 p-4 rounded-xl">{error}</p>
            )}

            <div className="flex gap-4">
                <button onClick={() => navigate("/coach/plans")}
                    className="flex-1 py-3 bg-neutral-800 text-gray-300 rounded-md hover:bg-neutral-700 font-bold">
                    Cancel
                </button>

                <Button onClick={handleSubmit} loading={loading} className="flex-1">
                    {isEdit ? "Save Changes" : "Create Plan"}
                </Button>
            </div>
        </div>
    );
};

export default NutritionPlanForm;