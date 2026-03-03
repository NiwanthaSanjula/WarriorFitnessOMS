/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import { planService } from '../../services/planService'; // [cite: 118]
import { MdArrowBack, MdEdit, MdAssignment, MdTimeline, MdRadar } from 'react-icons/md';
import Spinner from '../../components/ui/Spinner';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { useEffect, useState } from 'react';
import AssignPlanModal from '../../components/coach/AssignPlanModal';

const StatCard = ({ label, value, sub, color = 'orange' }: any) => {
    const colors: any = {
        orange: 'text-warrior-orange border-warrior-orange',
        yellow: 'text-yellow-400 border-yellow-500',
        blue: 'text-blue-400 border-blue-500',
        green: 'text-green-400 border-green-500',
        purple: 'text-purple-400 border-purple-500', // NEW
    };
    return (
        <div className={`bg-neutral-800 p-4 rounded-xl border border-neutral-700 border-l-4 ${colors[color]}`}>
            <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-widest">{label}</p>
            <p className={`text-2xl font-bold ${colors[color].split(' ')[0]}`}>{value ?? 'N/A'}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
};

const CoachMemberProfile = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<any>(null);
    const [activePlans, setActivePlans] = useState<any>(null); // NEW
    const [chartData, setChartData] = useState<any[]>([]);
    const [activeChart, setActiveChart] = useState<'weight' | 'balance'>('weight'); // NEW Chart Type
    const [editingId, setEditingId] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showAssignModal, setShowAssignModal] = useState<{ show: boolean, type: 'workout' | 'nutrition' | null }>({
        show: false,
        type: null
    });

    useEffect(() => { if (memberId) fetchAll(); }, [memberId]);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [detail, chart, plans] = await Promise.all([
                progressService.getCoachMemberDetail(memberId!),
                progressService.getCoachMemberChartData(memberId!),
                planService.getCoachMemberPlans(memberId!) // 
            ]);
            setMemberData(detail);
            setActivePlans({
                workout: plans.workoutPlan,
                nutrition: plans.nutritionPlan
            });
            

            if (chart?.labels) {
                setChartData(chart.labels.map((label: string, i: number) => ({
                    date: label,
                    Weight: chart.weight[i],
                    "Body Fat": chart.bodyFat[i],
                    Chest: chart.chest?.[i] || 0,
                    Waist: chart.waist?.[i] || 0,
                    Hips: chart.hips?.[i] || 0,
                    Biceps: chart.biceps?.[i] || 0,
                    Thighs: chart.thighs?.[i] || 0,
                })));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load member');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFeedback = async (progressId: string) => {
        if (!feedbackText.trim()) return;
        setFeedbackLoading(true);
        try {
            await progressService.addCoachFeedback(memberId!, progressId, feedbackText);
            setEditingId(null);
            setFeedbackText('');
            await fetchAll();
        } catch { alert('Failed to save feedback'); }
        finally { setFeedbackLoading(false); }
    };

    if (loading) return <Spinner />;
    if (!memberData) return null;

    const { user, memberProfile, latestProgress, progressComparison, progressHistory } = memberData;
    const wChange = progressComparison?.comparison?.weight;

    // Data for Radar Chart (Latest measurements)
    const balanceData = [
        { subject: 'Chest', A: latestProgress?.chest || 0 },
        { subject: 'Waist', A: latestProgress?.waist || 0 },
        { subject: 'Hips', A: latestProgress?.hips || 0 },
        { subject: 'Biceps', A: latestProgress?.biceps || 0 },
        { subject: 'Thighs', A: latestProgress?.thighs || 0 },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* HEADER */}
            <div>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-sm">
                    <MdArrowBack /> Back to Members
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                            {user.name} <span className="text-warrior-orange">Profile</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{user.email} · {user.phone}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAssignModal({ show: true, type: 'workout' })}
                            className="px-4 py-2 bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/30 rounded-xl text-[10px] font-black uppercase hover:bg-warrior-orange/20 transition-all"
                        >
                            Assign Workout
                        </button>
                        <button
                            onClick={() => setShowAssignModal({ show: true, type: 'nutrition' })}
                            className="px-4 py-2 bg-green-900/20 text-green-500 border border-green-800/30 rounded-xl text-[10px] font-black uppercase hover:bg-green-900/30 transition-all"
                        >
                            Assign Nutrition
                        </button>
                    </div>


                </div>
            </div>

            {/* TOP STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Current Weight" value={latestProgress?.weight ? `${latestProgress.weight} kg` : 'N/A'} color="orange"
                    sub={wChange ? `${wChange.change > 0 ? '+' : ''}${wChange.change.toFixed(1)} kg (30d)` : undefined} />
                <StatCard label="Body Fat" value={latestProgress?.bodyFat ? `${latestProgress.bodyFat}%` : 'N/A'} color="yellow" />
                <StatCard label="Consistency" value={`${progressHistory.length}`} sub="Total Logs" color="green" />
                <StatCard label="Energy Avg" value={latestProgress?.energyLevel ? `${latestProgress.energyLevel}/10` : 'N/A'} color="purple" />
                <StatCard label="Height" value={memberProfile?.height ? `${memberProfile.height} cm` : 'N/A'} color="blue" />
            </div>

            {/* ACTIVE PLANS SECTION [cite: 106] */}
            {/* ACTIVE PLANS SECTION */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

{/* Workout Card */}
<div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
    {/* Card Header */}
    <div className="flex items-center justify-between p-4 bg-orange-900/10 border-b border-orange-800/20">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-900/30 flex items-center justify-center text-warrior-orange border border-orange-800/30">
                <MdAssignment size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Workout</p>
                <p className="text-sm font-black text-white italic">
                    {activePlans?.workout?.plan?.title || 'No Plan Assigned'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {activePlans?.workout ? (
                <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/40 text-[9px] font-black uppercase tracking-wider">
                    Active
                </span>
            ) : (
                <button
                    onClick={() => setShowAssignModal({ show: true, type: 'workout' })}
                    className="text-gray-500 hover:text-warrior-orange transition-colors"
                >
                    <MdEdit size={18} />
                </button>
            )}
        </div>
    </div>

    {/* Card Body */}
    {activePlans?.workout?.plan ? (
        <div className="p-4 space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Duration</p>
                    <p className="text-sm font-black text-white mt-0.5">
                        {activePlans.workout.plan.durationWeeks} <span className="text-xs font-normal text-gray-500">weeks</span>
                    </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Frequency</p>
                    <p className="text-sm font-black text-white mt-0.5">
                        {activePlans.workout.plan.daysPerWeek}<span className="text-xs font-normal text-gray-500">x / week</span>
                    </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Difficulty</p>
                    <p className={`text-sm font-black mt-0.5 capitalize ${
                        activePlans.workout.plan.difficulty === 'beginner' ? 'text-green-400' :
                        activePlans.workout.plan.difficulty === 'intermediate' ? 'text-yellow-400' :
                        'text-red-400'
                    }`}>
                        {activePlans.workout.plan.difficulty}
                    </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Schedule</p>
                    <p className="text-sm font-black text-white mt-0.5">
                        {activePlans.workout.plan.schedule?.length ?? 0} <span className="text-xs font-normal text-gray-500">days</span>
                    </p>
                </div>
            </div>

            {/* Goal Badge */}
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Goal</span>
                <span className="px-2 py-0.5 rounded-full bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/20 text-[10px] font-black uppercase tracking-wide">
                    {activePlans.workout.plan.goal?.replace('_', ' ')}
                </span>
            </div>

            {/* Start Date */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
                <p className="text-[10px] text-gray-600">
                    Started <span className="text-gray-400 font-bold">
                        {new Date(activePlans.workout.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </p>
            </div>

            {/* Coach Notes */}
            {activePlans.workout.coachNotes && (
                <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider mb-1">Coach Notes</p>
                    <p className="text-xs text-gray-400 italic">"{activePlans.workout.coachNotes}"</p>
                </div>
            )}
        </div>
    ) : (
        <div className="p-6 text-center">
            <p className="text-gray-600 text-xs">No workout plan assigned yet</p>
            <button
                onClick={() => setShowAssignModal({ show: true, type: 'workout' })}
                className="mt-2 text-warrior-orange text-xs font-black uppercase hover:underline"
            >
                + Assign Now
            </button>
        </div>
    )}
</div>

{/* Nutrition Card */}
<div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
    {/* Card Header */}
    <div className="flex items-center justify-between p-4 bg-green-900/10 border-b border-green-800/20">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-900/30 flex items-center justify-center text-green-500 border border-green-800/30">
                <MdTimeline size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Nutrition</p>
                <p className="text-sm font-black text-white italic">
                    {activePlans?.nutrition?.plan?.title || 'No Plan Assigned'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {activePlans?.nutrition ? (
                <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/40 text-[9px] font-black uppercase tracking-wider">
                    Active
                </span>
            ) : (
                <button
                    onClick={() => setShowAssignModal({ show: true, type: 'nutrition' })}
                    className="text-gray-500 hover:text-green-400 transition-colors"
                >
                    <MdEdit size={18} />
                </button>
            )}
        </div>
    </div>

    {/* Card Body */}
    {activePlans?.nutrition?.plan ? (
        <div className="p-4 space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Duration</p>
                    <p className="text-sm font-black text-white mt-0.5">
                        {activePlans.nutrition.plan.durationWeeks} <span className="text-xs font-normal text-gray-500">weeks</span>
                    </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Calories</p>
                    <p className="text-sm font-black text-white mt-0.5">
                        {activePlans.nutrition.plan.dailyCalorieTarget
                            ? <>{activePlans.nutrition.plan.dailyCalorieTarget}<span className="text-xs font-normal text-gray-500"> kcal</span></>
                            : <span className="text-xs font-normal text-gray-600">Not set</span>
                        }
                    </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Schedule</p>
                    <p className="text-sm font-black text-white mt-0.5">
                        {activePlans.nutrition.plan.schedule?.length ?? 0} <span className="text-xs font-normal text-gray-500">days</span>
                    </p>
                </div>
                <div className="bg-neutral-800/60 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Goal</p>
                    <p className="text-xs font-black text-green-400 mt-0.5 capitalize">
                        {activePlans.nutrition.plan.goal?.replace('_', ' ')}
                    </p>
                </div>
            </div>

            {/* Restrictions */}
            {activePlans.nutrition.plan.restrictions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {activePlans.nutrition.plan.restrictions.map((r: string) => (
                        <span key={r} className="px-2 py-0.5 rounded-full bg-neutral-800 text-gray-400 border border-neutral-700 text-[9px] font-bold uppercase">
                            {r.replace('_', ' ')}
                        </span>
                    ))}
                </div>
            )}

            {/* Start Date */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
                <p className="text-[10px] text-gray-600">
                    Started <span className="text-gray-400 font-bold">
                        {new Date(activePlans.nutrition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </p>
            </div>

            {/* Coach Notes */}
            {activePlans.nutrition.coachNotes && (
                <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-2.5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider mb-1">Coach Notes</p>
                    <p className="text-xs text-gray-400 italic">"{activePlans.nutrition.coachNotes}"</p>
                </div>
            )}
        </div>
    ) : (
        <div className="p-6 text-center">
            <p className="text-gray-600 text-xs">No nutrition plan assigned yet</p>
            <button
                onClick={() => setShowAssignModal({ show: true, type: 'nutrition' })}
                className="mt-2 text-green-400 text-xs font-black uppercase hover:underline"
            >
                + Assign Now
            </button>
        </div>
    )}
</div>

</div>


            {/* CHARTS OVERHAUL */}
            <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                        {activeChart === 'weight' ? <MdTimeline size={18} /> : <MdRadar size={18} />}
                        {activeChart === 'weight' ? 'Evolution Trend' : 'Body Symmetry Balance'}
                    </h2>
                    <div className="flex gap-1 bg-neutral-800 p-1 rounded-lg">
                        {(['weight', 'balance'] as const).map(t => (
                            <button key={t} onClick={() => setActiveChart(t)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all
                                    ${activeChart === t ? 'bg-warrior-orange text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {activeChart === 'weight' ? (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '10px' }} />
                                <Area type="monotone" dataKey="Weight" stroke="#f97316" fill="url(#wg)" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                            </AreaChart>
                        ) : (
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={balanceData}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                                <Radar name="Member" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                            </RadarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PROGRESS HISTORY REDESIGN - Timeline Table */}
            <div className="bg-warrior-grey border border-neutral-600 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-700 bg-neutral-800/50">
                    <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Chronological Log History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-800/30 text-[10px] font-black uppercase text-gray-500 tracking-tighter">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Weight</th>
                                <th className="px-6 py-4">Metrics</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {progressHistory.map((r: any) => (
                                <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-400">
                                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-lg font-black text-white">{r.weight} <span className="text-[10px] font-normal text-gray-500 uppercase">kg</span></p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            {r.bodyFat && <div className="text-center"><p className="text-[8px] text-gray-600 font-bold uppercase">Fat</p><p className="text-xs text-yellow-500 font-bold">{r.bodyFat}%</p></div>}
                                            {r.waist && <div className="text-center"><p className="text-[8px] text-gray-600 font-bold uppercase">Waist</p><p className="text-xs text-blue-500 font-bold">{r.waist}cm</p></div>}
                                            {r.energyLevel && <div className="text-center"><p className="text-[8px] text-gray-600 font-bold uppercase">Energy</p><p className="text-xs text-purple-500 font-bold">{r.energyLevel}/10</p></div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {r.notes ? <span className="px-2 py-1 rounded bg-neutral-900 text-gray-500 text-[10px] italic">Logged</span> : <span className="text-gray-700">--</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => { setEditingId(r._id); setFeedbackText(r.coachNotes || ''); }}
                                            className="text-[10px] font-black uppercase text-warrior-orange hover:underline flex items-center gap-1 ml-auto">
                                            <MdEdit size={12} /> {r.coachNotes ? 'Update Feedback' : 'Add Feedback'}
                                        </button>
                                        {editingId === r._id && (
                                            <div className="mt-3 text-left bg-neutral-900 p-3 rounded-lg border border-neutral-700 space-y-2">
                                                <textarea className="w-full bg-neutral-800 text-white text-xs p-2 rounded border border-neutral-600 outline-none" rows={2}
                                                    value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSaveFeedback(r._id)} className="flex-1 py-1 bg-warrior-orange text-white text-[10px] font-bold rounded hover:bg-orange-600">Save</button>
                                                    <button onClick={() => setEditingId(null)} className="flex-1 py-1 bg-neutral-700 text-gray-300 text-[10px] font-bold rounded">Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                        {r.coachNotes && editingId !== r._id && (
                                            <p className="mt-1 text-[10px] text-gray-500 truncate max-w-[150px] italic ml-auto">"{r.coachNotes}"</p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAssignModal.show && (
                <AssignPlanModal
                    planId=""
                    // Ensure these match your Backend Model Names exactly if using refPath
                    planType={showAssignModal.type === 'workout' ? 'WorkoutPlan' : 'NutritionPlan'}
                    planTitle={`New ${showAssignModal.type?.toUpperCase()} Assignment`}
                    memberId={memberId}
                    memberName={user.name}
                    onClose={() => setShowAssignModal({ show: false, type: null })}
                    onSuccess={() => {
                        setShowAssignModal({ show: false, type: null });
                        fetchAll();
                    }}
                />
            )}
        </div>




    );
};

export default CoachMemberProfile;