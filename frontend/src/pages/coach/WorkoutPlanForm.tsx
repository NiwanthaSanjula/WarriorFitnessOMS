/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { planService } from "../../services/planService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import {
    MdArrowBack, MdAdd, MdDelete, MdExpandMore, MdExpandLess, MdFitnessCenter
} from "react-icons/md";

// ── Types ─────────────────────────────────────────────────────────
interface ExerciseEntry {
    exerciseName: string;
    sets: number | string;
    reps: string;
    restSeconds: number | string;
    notes: string;
}

interface WorkoutDay {
    dayLabel: string;
    focus: string;
    exercises: ExerciseEntry[];
}

const emptyExercise = (): ExerciseEntry => ({
    exerciseName: "", sets: 3, reps: "10", restSeconds: 60, notes: ""
});

const emptyDay = (index: number): WorkoutDay => ({
    dayLabel: `Day ${index + 1}`, focus: "", exercises: [emptyExercise()]
});

// ── Exercise Row ──────────────────────────────────────────────────
const ExerciseRow = ({ ex, dayIdx, exIdx, onChange, onRemove }: any) => (
    <div className="grid grid-cols-12 gap-2 items-center bg-neutral-900 p-3 rounded-lg border border-neutral-700">
        <div className="col-span-12 md:col-span-4">
            <input
                className="w-full bg-transparent border-b border-neutral-600 text-white text-sm p-1 outline-none focus:border-warrior-orange placeholder-gray-600"
                placeholder="Exercise name *"
                value={ex.exerciseName}
                onChange={(e) => onChange(dayIdx, exIdx, "exerciseName", e.target.value)}
            />
        </div>
        <div className="col-span-4 md:col-span-2">
            <input
                type="number"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-1.5 rounded outline-none focus:border-warrior-orange text-center"
                placeholder="Sets"
                value={ex.sets}
                onChange={(e) => onChange(dayIdx, exIdx, "sets", e.target.value)}
            />
            <p className="text-xs text-gray-600 text-center mt-0.5">Sets</p>
        </div>
        <div className="col-span-4 md:col-span-2">
            <input
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-1.5 rounded outline-none focus:border-warrior-orange text-center"
                placeholder="8-12"
                value={ex.reps}
                onChange={(e) => onChange(dayIdx, exIdx, "reps", e.target.value)}
            />
            <p className="text-xs text-gray-600 text-center mt-0.5">Reps</p>
        </div>
        <div className="col-span-3 md:col-span-2">
            <input
                type="number"
                className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm p-1.5 rounded outline-none focus:border-warrior-orange text-center"
                placeholder="60"
                value={ex.restSeconds}
                onChange={(e) => onChange(dayIdx, exIdx, "restSeconds", e.target.value)}
            />
            <p className="text-xs text-gray-600 text-center mt-0.5">Rest(s)</p>
        </div>
        <div className="col-span-1 flex justify-end">
            <button onClick={() => onRemove(dayIdx, exIdx)}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors">
                <MdDelete size={16} />
            </button>
        </div>
        <div className="col-span-12">
            <input
                className="w-full bg-transparent border-b border-neutral-700 text-gray-400 text-xs p-1 outline-none focus:border-neutral-500 placeholder-gray-700"
                placeholder="Notes (optional)"
                value={ex.notes}
                onChange={(e) => onChange(dayIdx, exIdx, "notes", e.target.value)}
            />
        </div>
    </div>
);

// ── Day Card ──────────────────────────────────────────────────────
const DayCard = ({ day, dayIdx, onUpdateDay, onAddExercise, onUpdateExercise, onRemoveExercise, onRemoveDay }: any) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="bg-warrior-grey border border-neutral-600 rounded-2xl overflow-hidden">
            {/* Day header */}
            <div className="flex items-center gap-3 p-4 bg-neutral-800">
                <span className="w-7 h-7 rounded-full bg-warrior-orange text-white text-xs font-bold flex items-center justify-center">
                    {dayIdx + 1}
                </span>
                <input
                    className="flex-1 bg-transparent text-white font-bold text-sm outline-none border-b border-transparent focus:border-neutral-500"
                    value={day.dayLabel}
                    onChange={(e) => onUpdateDay(dayIdx, "dayLabel", e.target.value)}
                    placeholder="Day label"
                />
                <input
                    className="w-40 bg-transparent text-gray-400 text-xs outline-none border-b border-transparent focus:border-neutral-500"
                    value={day.focus}
                    onChange={(e) => onUpdateDay(dayIdx, "focus", e.target.value)}
                    placeholder="Focus (e.g. Chest & Tri)"
                />
                <button onClick={() => setOpen(!open)} className="text-gray-500 hover:text-white">
                    {open ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                <button onClick={() => onRemoveDay(dayIdx)}
                    className="text-gray-600 hover:text-red-400 transition-colors">
                    <MdDelete size={16} />
                </button>
            </div>

            {open && (
                <div className="p-4 space-y-2">
                    {day.exercises.map((ex: ExerciseEntry, exIdx: number) => (
                        <ExerciseRow
                            key={exIdx}
                            ex={ex} dayIdx={dayIdx} exIdx={exIdx}
                            onChange={onUpdateExercise}
                            onRemove={onRemoveExercise}
                        />
                    ))}
                    <button
                        onClick={() => onAddExercise(dayIdx)}
                        className="w-full py-2 border border-dashed border-neutral-600 text-gray-500 hover:text-warrior-orange hover:border-warrior-orange/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                        <MdAdd size={14} /> Add Exercise
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Main Form ─────────────────────────────────────────────────────
const WorkoutPlanForm = () => {
    const navigate = useNavigate();
    const { planId } = useParams<{ planId?: string }>();
    const isEdit = Boolean(planId);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState<string | null>(null);

    const [meta, setMeta] = useState({
        title: "", description: "", goal: "general_fitness",
        difficulty: "beginner", durationWeeks: 4, daysPerWeek: 3
    });
    const [schedule, setSchedule] = useState<WorkoutDay[]>([emptyDay(0)]);

    useEffect(() => {
        if (isEdit && planId) {
            planService.getWorkoutPlanById(planId)
                .then((plan: any) => {
                    setMeta({
                        title: plan.title, description: plan.description || "",
                        goal: plan.goal, difficulty: plan.difficulty,
                        durationWeeks: plan.durationWeeks, daysPerWeek: plan.daysPerWeek
                    });
                    setSchedule(plan.schedule?.length ? plan.schedule : [emptyDay(0)]);
                })
                .catch(() => setError("Failed to load plan"))
                .finally(() => setFetching(false));
        }
    }, [planId]);

    // Schedule mutation helpers
    const addDay = () => setSchedule(s => [...s, emptyDay(s.length)]);
    const removeDay = (i: number) => setSchedule(s => s.filter((_, idx) => idx !== i));
    const updateDay = (i: number, field: string, value: string) =>
        setSchedule(s => s.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
    const addExercise = (i: number) =>
        setSchedule(s => s.map((d, idx) => idx === i ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d));
    const removeExercise = (di: number, ei: number) =>
        setSchedule(s => s.map((d, idx) => idx === di ? { ...d, exercises: d.exercises.filter((_, i) => i !== ei) } : d));
    const updateExercise = (di: number, ei: number, field: string, value: any) =>
        setSchedule(s => s.map((d, idx) => idx === di
            ? { ...d, exercises: d.exercises.map((e, i) => i === ei ? { ...e, [field]: value } : e) }
            : d
        ));

    const handleSubmit = async () => {
        if (!meta.title.trim()) { setError("Title is required"); return; }
        setLoading(true);
        setError(null);
        try {
            const payload = { ...meta, schedule };
            if (isEdit && planId) {
                await planService.updateWorkoutPlan(planId, payload);
            } else {
                await planService.createWorkoutPlan(payload);
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
            {/* Header */}
            <div>
                <button onClick={() => navigate("/coach/plans")}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-sm">
                    <MdArrowBack /> Back to Plans
                </button>
                <h1 className="text-3xl font-bold text-gray-300 flex items-center gap-3">
                    <MdFitnessCenter className="text-warrior-orange" />
                    {isEdit ? "Edit" : "Create"} <span className="text-warrior-orange">Workout Plan</span>
                </h1>
            </div>

            {/* Meta fields */}
            <div className="bg-warrior-grey border border-neutral-600 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase">Plan Details</h2>

                <Input
                    label="Plan Title *"
                    placeholder="e.g. 8-Week Muscle Builder"
                    value={meta.title}
                    onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">Goal *</label>
                        <select className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-white p-3 rounded-lg outline-none focus:border-warrior-orange text-sm"
                            value={meta.goal}
                            onChange={(e) => setMeta({ ...meta, goal: e.target.value })}>
                            <option value="weight_loss">Weight Loss</option>
                            <option value="muscle_gain">Muscle Gain</option>
                            <option value="endurance">Endurance</option>
                            <option value="general_fitness">General Fitness</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">Difficulty *</label>
                        <select className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-white p-3 rounded-lg outline-none focus:border-warrior-orange text-sm"
                            value={meta.difficulty}
                            onChange={(e) => setMeta({ ...meta, difficulty: e.target.value })}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <Input label="Duration (weeks) *" type="number"
                        value={meta.durationWeeks}
                        onChange={(e) => setMeta({ ...meta, durationWeeks: parseInt(e.target.value) })} />
                </div>

                <Input label="Days Per Week *" type="number"
                    value={meta.daysPerWeek}
                    onChange={(e) => setMeta({ ...meta, daysPerWeek: parseInt(e.target.value) })} />

                <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Description</label>
                    <textarea
                        className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-lg outline-none focus:border-warrior-orange min-h-20 text-sm"
                        placeholder="Briefly describe this plan..."
                        value={meta.description}
                        onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                    />
                </div>
            </div>

            {/* Schedule Builder */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-400 uppercase">
                        Workout Schedule <span className="text-gray-600 normal-case font-normal">({schedule.length} days)</span>
                    </h2>
                    <button onClick={addDay}
                        className="flex items-center gap-1 text-sm text-warrior-orange font-bold hover:underline">
                        <MdAdd size={16} /> Add Day
                    </button>
                </div>

                {schedule.map((day, dayIdx) => (
                    <DayCard
                        key={dayIdx}
                        day={day} dayIdx={dayIdx}
                        onUpdateDay={updateDay}
                        onAddExercise={addExercise}
                        onUpdateExercise={updateExercise}
                        onRemoveExercise={removeExercise}
                        onRemoveDay={removeDay}
                    />
                ))}

                <button onClick={addDay}
                    className="w-full py-4 border-2 border-dashed border-neutral-700 text-gray-500 hover:text-warrior-orange hover:border-warrior-orange/40 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2">
                    <MdAdd /> Add Another Day
                </button>
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 p-4 rounded-xl">{error}</p>
            )}

            <div className="flex gap-4">
                <button onClick={() => navigate("/coach/plans")}
                    className="flex-1 py-3 bg-neutral-800 text-gray-300 rounded-xl hover:bg-neutral-700 font-bold">
                    Cancel
                </button>
                <Button onClick={handleSubmit} loading={loading} className="flex-1">
                    {isEdit ? "Save Changes" : "Create Plan"}
                </Button>
            </div>
        </div>
    );
};

export default WorkoutPlanForm;