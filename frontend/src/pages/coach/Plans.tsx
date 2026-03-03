/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { planService } from "../../services/planService";
import Spinner from "../../components/ui/Spinner";
import { Button } from "../../components/ui/Button";
import {
    MdFitnessCenter, MdRestaurant, MdAdd, MdEdit,
    MdDelete, MdPersonAdd, MdClose, MdWarning
} from "react-icons/md";
import AssignPlanModal from "../../components/coach/AssignPlanModal";

// ── Helpers ───────────────────────────────────────────────────────
const GOAL_COLORS: Record<string, string> = {
    weight_loss: "bg-blue-900/40 text-blue-300 border-blue-700",
    muscle_gain: "bg-orange-900/40 text-orange-300 border-orange-700",
    endurance: "bg-green-900/40 text-green-300 border-green-700",
    general_fitness: "bg-purple-900/40 text-purple-300 border-purple-700",
    maintenance: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
    general_health: "bg-teal-900/40 text-teal-300 border-teal-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: "text-green-400",
    intermediate: "text-yellow-400",
    advanced: "text-red-400",
};

const GoalBadge = ({ goal }: { goal: string }) => (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${GOAL_COLORS[goal] || "bg-neutral-700 text-gray-300 border-neutral-600"}`}>
        {goal.replace("_", " ")}
    </span>
);

// ── Workout Plan Card ─────────────────────────────────────────────
const WorkoutCard = ({ plan, onEdit, onDelete, onAssign, deleting }: any) => (
    <div className="bg-warrior-dark border border-neutral-700 rounded-2xl p-5 flex flex-col gap-3 hover:border-neutral-500 transition-colors">
        <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-lg leading-tight">{plan.title}</h3>
            <GoalBadge goal={plan.goal} />
        </div>

        {plan.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{plan.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className={`font-bold capitalize ${DIFFICULTY_COLORS[plan.difficulty]}`}>
                ● {plan.difficulty}
            </span>
            <span>📅 {plan.durationWeeks}w</span>
            <span>🏋️ {plan.daysPerWeek}d/week</span>
            <span>📋 {plan.schedule?.length || 0} days planned</span>
        </div>

        <div className="flex gap-2 pt-1 border-t border-neutral-700">
            <button onClick={() => onAssign(plan)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/30 rounded-lg text-xs font-bold hover:bg-warrior-orange/20 transition-colors">
                <MdPersonAdd size={14} /> Assign
            </button>
            <button onClick={() => onEdit(plan._id)}
                className="p-2 bg-neutral-800 text-gray-400 rounded-lg hover:text-white hover:bg-neutral-700 transition-colors">
                <MdEdit size={16} />
            </button>
            <button onClick={() => onDelete(plan._id)}
                disabled={deleting === plan._id}
                className="p-2 bg-neutral-800 text-gray-400 rounded-lg hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50">
                {deleting === plan._id ? <span className="text-xs">...</span> : <MdDelete size={16} />}
            </button>
        </div>
    </div>
);

// ── Nutrition Plan Card ───────────────────────────────────────────
const NutritionCard = ({ plan, onEdit, onDelete, onAssign, deleting }: any) => (
    <div className="bg-warrior-dark border border-neutral-700 rounded-2xl p-5 flex flex-col gap-3 hover:border-neutral-500 transition-colors">
        <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-lg leading-tight">{plan.title}</h3>
            <GoalBadge goal={plan.goal} />
        </div>

        {plan.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{plan.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span>📅 {plan.durationWeeks}w</span>
            {plan.dailyCalorieTarget && <span>🔥 {plan.dailyCalorieTarget} kcal/day</span>}
            {plan.dailyProteinTarget && <span>🥩 {plan.dailyProteinTarget}g protein</span>}
            <span>📋 {plan.schedule?.length || 0} days planned</span>
        </div>

        {plan.restrictions?.length > 0 && (
            <div className="flex flex-wrap gap-1">
                {plan.restrictions.map((r: string) => (
                    <span key={r} className="text-xs bg-neutral-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">
                        {r.replace("_", " ")}
                    </span>
                ))}
            </div>
        )}

        <div className="flex gap-2 pt-1 border-t border-neutral-700">
            <button onClick={() => onAssign(plan)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/30 rounded-lg text-xs font-bold hover:bg-warrior-orange/20 transition-colors">
                <MdPersonAdd size={14} /> Assign
            </button>
            <button onClick={() => onEdit(plan._id)}
                className="p-2 bg-neutral-800 text-gray-400 rounded-lg hover:text-white hover:bg-neutral-700 transition-colors">
                <MdEdit size={16} />
            </button>
            <button onClick={() => onDelete(plan._id)}
                disabled={deleting === plan._id}
                className="p-2 bg-neutral-800 text-gray-400 rounded-lg hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50">
                {deleting === plan._id ? <span className="text-xs">...</span> : <MdDelete size={16} />}
            </button>
        </div>
    </div>
);

// ── Delete Confirm Dialog ─────────────────────────────────────────
const DeleteDialog = ({ onConfirm, onCancel, error }: any) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
                    <MdWarning className="text-red-400" size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">Delete Plan?</h3>
                    <p className="text-xs text-gray-400">This cannot be undone.</p>
                </div>
            </div>
            {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-3">
                <button onClick={onCancel}
                    className="flex-1 py-2 bg-neutral-800 text-gray-300 rounded-lg text-sm hover:bg-neutral-700">
                    Cancel
                </button>
                <button onClick={onConfirm}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
                    Delete
                </button>
            </div>
        </div>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────
const Plans = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<"workout" | "nutrition">("workout");
    const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
    const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "workout" | "nutrition" } | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [assignTarget, setAssignTarget] = useState<{ plan: any; type: "workout" | "nutrition" } | null>(null);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [w, n] = await Promise.all([
                planService.getWorkoutPlans(),
                planService.getNutritionPlans(),
            ]);
            setWorkoutPlans(w);
            setNutritionPlans(n);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        setDeleteError(null);
        try {
            if (deleteTarget.type === "workout") {
                await planService.deleteWorkoutPlan(deleteTarget.id);
            } else {
                await planService.deleteNutritionPlan(deleteTarget.id);
            }
            setDeleteTarget(null);
            fetchAll();
        } catch (e: any) {
            setDeleteError(e.response?.data?.message || "Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <Spinner />;

    const currentPlans = tab === "workout" ? workoutPlans : nutritionPlans;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-300">
                        My <span className="text-warrior-orange">Plans</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage your workout and nutrition templates</p>
                </div>
                <button onClick={() => navigate(tab === "workout" ? "/coach/plans/workout/new" : "/coach/plans/nutrition/new")} className="bg-warrior-orange px-4 py-2 text-white font-bold uppercase rounded-lg text-sm">
                    <MdAdd className="inline mr-1" size={18} />
                    New {tab === "workout" ? "Workout" : "Nutrition"} Plan
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-neutral-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTab("workout")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        tab === "workout"
                            ? "bg-warrior-orange text-white shadow"
                            : "text-gray-400 hover:text-gray-300"
                    }`}>
                    <MdFitnessCenter size={16} /> Workout Plans
                    <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-xs">
                        {workoutPlans.length}
                    </span>
                </button>
                <button
                    onClick={() => setTab("nutrition")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        tab === "nutrition"
                            ? "bg-warrior-orange text-white shadow"
                            : "text-gray-400 hover:text-gray-300"
                    }`}>
                    <MdRestaurant size={16} /> Nutrition Plans
                    <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-xs">
                        {nutritionPlans.length}
                    </span>
                </button>
            </div>

            {/* Plan Grid */}
            {currentPlans.length === 0 ? (
                <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-16 text-center">
                    <div className="text-5xl mb-4">{tab === "workout" ? "🏋️" : "🥗"}</div>
                    <h3 className="text-lg font-bold text-gray-400 mb-2">No {tab} plans yet</h3>
                    <p className="text-gray-600 text-sm mb-6">Create your first plan to get started</p>
                    <Button onClick={() => navigate(tab === "workout" ? "/coach/plans/workout/new" : "/coach/plans/nutrition/new")}>
                        <MdAdd className="inline mr-1" /> Create Plan
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {currentPlans.map((plan: any) =>
                        tab === "workout" ? (
                            <WorkoutCard
                                key={plan._id}
                                plan={plan}
                                deleting={deleting}
                                onEdit={(id: string) => navigate(`/coach/plans/workout/${id}/edit`)}
                                onDelete={(id: string) => {
                                    setDeleteError(null);
                                    setDeleteTarget({ id, type: "workout" });
                                }}
                                onAssign={(p: any) => setAssignTarget({ plan: p, type: "workout" })}
                            />
                        ) : (
                            <NutritionCard
                                key={plan._id}
                                plan={plan}
                                deleting={deleting}
                                onEdit={(id: string) => navigate(`/coach/plans/nutrition/${id}/edit`)}
                                onDelete={(id: string) => {
                                    setDeleteError(null);
                                    setDeleteTarget({ id, type: "nutrition" });
                                }}
                                onAssign={(p: any) => setAssignTarget({ plan: p, type: "nutrition" })}
                            />
                        )
                    )}
                </div>
            )}

            {/* Delete Dialog */}
            {deleteTarget && (
                <DeleteDialog
                    error={deleteError}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
                />
            )}

            {/* Assign Modal */}
            {assignTarget && (
                <AssignPlanModal
                    planId={assignTarget.plan._id}
                    planType={assignTarget.type}
                    planTitle={assignTarget.plan.title}
                    onClose={() => setAssignTarget(null)}
                    onSuccess={() => { setAssignTarget(null); fetchAll(); }}
                />
            )}
        </div>
    );
};

export default Plans;