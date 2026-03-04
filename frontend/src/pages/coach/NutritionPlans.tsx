/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE: src/pages/coach/NutritionPlans.tsx
// This is the MAIN NUTRITION PLANS page for coaches
// Create this as a separate page

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../../services/planService';
import Spinner from '../../components/ui/Spinner';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

interface NutritionPlan {
    _id: string;
    title: string;
    description?: string;
    goal: string;
    dailyCalorieTarget?: number;
    dailyProteinTarget?: number;
    dailyCarbTarget?: number;
    dailyFatTarget?: number;
    durationWeeks: number;
    schedule: any[];
    restrictions?: string[];
    isTemplate: boolean;
}

const NutritionPlans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<NutritionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Fetch all nutrition plans on page load
    useEffect(() => {
        fetchNutritionPlans();
    }, []);

    const fetchNutritionPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await planService.getNutritionPlans();
            console.log('Fetched nutrition plans:', data);
            setPlans(data || []);
        } catch (err: any) {
            console.error('Error fetching plans:', err);
            setError(err.response?.data?.message || 'Failed to fetch plans');
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (planId: string) => {
        try {
            await planService.deleteNutritionPlan(planId);
            setPlans(plans.filter(p => p._id !== planId));
            setDeleteConfirm(null);
            alert('Plan deleted successfully!');
        } catch (err: any) {
            alert('Failed to delete plan');
            console.error(err);
        }
    };

    const getGoalLabel = (goal: string) => {
        const labels: { [key: string]: string } = {
            weight_loss: '📉 Weight Loss',
            muscle_gain: '💪 Muscle Gain',
            maintenance: '⚖️ Maintenance',
            general_health: '❤️ General Health'
        };
        return labels[goal] || goal;
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-2xl font-bold italic text-gray-400 uppercase">
                    Nutrition <span className="text-warrior-orange">Plans</span>
                </h2>
                <button
                    onClick={() => navigate('/coach/plans/nutrition/new')}
                    className="flex items-center gap-2 bg-warrior-orange text-white px-4 py-2 rounded-lg hover:bg-warrior-orange/90 transition"
                >
                    <MdAdd size={20} /> Create Plan
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={fetchNutritionPlans}
                        className="mt-2 text-red-400 underline hover:text-red-300"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Plans List */}
            {plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className="bg-warrior-grey border border-neutral-700 rounded-lg p-4 hover:border-warrior-orange transition space-y-3 border-l-3 border-l-warrior-orange"
                        >
                            {/* Plan Title */}
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-white">{plan.title}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/coach/plans/nutrition/${plan._id}/edit`)}
                                        className="p-2 hover:bg-neutral-700 rounded transition"
                                        title="Edit plan"
                                    >
                                        <MdEdit className="text-warrior-orange" size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(plan._id)}
                                        className="p-2 hover:bg-neutral-700 rounded transition"
                                        title="Delete plan"
                                    >
                                        <MdDelete className="text-red-400" size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            {plan.description && (
                                <p className="text-gray-400 text-sm line-clamp-2">
                                    {plan.description}
                                </p>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500 font-bold">Duration</p>
                                    <p className="text-white">{plan.durationWeeks} weeks</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-bold">Goal</p>
                                    <p className="text-white text-xs">{getGoalLabel(plan.goal)}</p>
                                </div>
                            </div>

                            {/* Macros / Calories */}
                            {plan.dailyCalorieTarget && (
                                <div className="bg-neutral-800 p-2 rounded text-sm space-y-1">
                                    <p className="text-gray-500 font-bold">Daily Targets</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {plan.dailyCalorieTarget && (
                                            <p className="text-white">
                                                🔥 {plan.dailyCalorieTarget} cal
                                            </p>
                                        )}
                                        {plan.dailyProteinTarget && (
                                            <p className="text-white">
                                                💪 {plan.dailyProteinTarget}g protein
                                            </p>
                                        )}
                                        {plan.dailyCarbTarget && (
                                            <p className="text-white">
                                                🍞 {plan.dailyCarbTarget}g carbs
                                            </p>
                                        )}
                                        {plan.dailyFatTarget && (
                                            <p className="text-white">
                                                🥑 {plan.dailyFatTarget}g fat
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Restrictions */}
                            {plan.restrictions && plan.restrictions.length > 0 && (
                                <div className="pt-2 border-t border-neutral-700">
                                    <p className="text-gray-500 font-bold text-sm mb-1">Restrictions</p>
                                    <div className="flex flex-wrap gap-1">
                                        {plan.restrictions.map((r) => (
                                            <span
                                                key={r}
                                                className="bg-neutral-800 text-gray-300 text-xs px-2 py-1 rounded"
                                            >
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Days */}
                            <div className="pt-2 border-t border-neutral-700">
                                <p className="text-gray-400 text-sm">
                                    📋 {plan.schedule.length} days
                                </p>
                            </div>

                            {/* View Button */}
                            <button
                                onClick={() => navigate(`/coach/plans/nutrition/${plan._id}/edit`)}
                                className="w-full py-2 bg-neutral-800 text-gray-300 rounded hover:bg-neutral-700 transition text-sm font-bold"
                            >
                                View Details
                            </button>

                            {/* Delete Confirmation */}
                            {deleteConfirm === plan._id && (
                                <div className="bg-red-900/20 border border-red-700 p-2 rounded space-y-2">
                                    <p className="text-red-400 text-sm">Delete this plan?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(plan._id)}
                                            className="flex-1 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="flex-1 py-1 bg-neutral-700 text-gray-300 text-sm rounded hover:bg-neutral-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-warrior-grey border border-neutral-700 rounded-lg">
                    <p className="text-gray-500 mb-4">No nutrition plans created yet</p>
                    <button
                        onClick={() => navigate('/coach/plans/nutrition/new')}
                        className="inline-flex items-center gap-2 bg-warrior-orange text-white px-4 py-2 rounded-lg hover:bg-warrior-orange/90"
                    >
                        <MdAdd size={20} /> Create Your First Plan
                    </button>
                </div>
            )}
        </div>
    );
};

export default NutritionPlans;