/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import { planService } from '../../services/planService';
import {
    MdArrowBack, MdEdit, MdAssignment, MdTimeline, 
    MdExpandMore, MdExpandLess, MdVerified, MdCompare, MdClose,
    MdTrendingDown, MdTrendingUp, MdRemove, MdEmojiEvents,
    MdCheckCircle, MdShowChart, MdBarChart, MdCalendarToday
} from 'react-icons/md';
import {
     GiFireBowl, GiWeightScale, GiMuscleUp,
    GiTrophy, GiLaurelCrown, GiPodiumWinner, GiRun
} from 'react-icons/gi';
import { BsFillLightningFill } from 'react-icons/bs';
import Spinner from '../../components/ui/Spinner';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, BarChart, Bar,
    Legend
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import AssignPlanModal from '../../components/coach/AssignPlanModal';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined, unit = '') => v != null ? `${v}${unit}` : '—';

const diffColor = (change: number, inverse = false) => {
    if (change === 0) return 'text-gray-400';
    return (inverse ? change < 0 : change > 0) ? 'text-green-400' : 'text-red-400';
};

const TrendIcon = ({ change, inverse = false }: { change: number; inverse?: boolean }) => {
    if (change === 0) return <MdRemove className="inline" />;
    return (inverse ? change < 0 : change > 0)
        ? <MdTrendingDown className="inline text-green-400" />
        : <MdTrendingUp className="inline text-red-400" />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-xl text-sm shadow-2xl">
            <p className="text-gray-400 mb-2 text-[10px] font-black uppercase tracking-wider">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="text-xs font-bold">
                    {p.name}: {p.value ?? '—'}
                </p>
            ))}
        </div>
    );
};

// ── Milestone helpers (same as member's Progress page) ─────────────────────────
const MILESTONE_ICONS: Record<string, React.ElementType> = {
    'First Step':     GiRun,
    'Consistent':     MdCalendarToday,
    'Dedicated':      MdBarChart,
    'Warrior':        GiMuscleUp,
    'First Drop':     GiWeightScale,
    '5 kg Milestone': MdShowChart,
    '10 kg Champ':    GiTrophy,
    'On A Roll':      GiFireBowl,
    'Goal Reached!':  GiLaurelCrown,
};

const MilestoneIcon = ({ label, earned }: { label: string; earned: boolean }) => {
    const Icon = MILESTONE_ICONS[label] ?? GiPodiumWinner;
    return (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
            earned ? 'bg-warrior-orange/15 border-warrior-orange/40' : 'bg-neutral-800/60 border-neutral-700/40'
        }`}>
            <Icon size={20} className={earned ? 'text-warrior-orange' : 'text-gray-600'} />
        </div>
    );
};

const computeMilestones = (records: any[]) => {
    if (!records.length) return [];
    const sorted = [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const totalLost = sorted[0].weight - sorted[sorted.length - 1].weight;
    let maxStreak = 1, streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i].createdAt).getTime() - new Date(sorted[i - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 10) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 1;
    }
    return [
        { label: 'First Step',     desc: 'Logged first check-in',        earned: records.length >= 1  },
        { label: 'Consistent',     desc: '5 progress entries logged',     earned: records.length >= 5  },
        { label: 'Dedicated',      desc: '10 progress entries logged',    earned: records.length >= 10 },
        { label: 'Warrior',        desc: '25 progress entries logged',    earned: records.length >= 25 },
        { label: 'First Drop',     desc: 'Lost first 1 kg from baseline', earned: totalLost >= 1       },
        { label: '5 kg Milestone', desc: 'Lost 5 kg from baseline',       earned: totalLost >= 5       },
        { label: '10 kg Champ',    desc: 'Lost 10 kg from baseline',      earned: totalLost >= 10      },
        { label: 'On A Roll',      desc: '3 consecutive close check-ins', earned: maxStreak >= 3       },
    ];
};

const computeWeeklySummary = (records: any[]) => {
    const weeks: Record<string, number[]> = {};
    [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).forEach(r => {
        const d = new Date(r.createdAt), ws = new Date(d);
        ws.setDate(d.getDate() - d.getDay());
        const key = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        (weeks[key] = weeks[key] || []).push(r.weight);
    });
    return Object.entries(weeks).map(([week, ws]) => ({
        week, avg: parseFloat((ws.reduce((a, b) => a + b, 0) / ws.length).toFixed(1)), entries: ws.length,
    })).slice(-8);
};

// ── StatCard ───────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }: any) => (
    <div className={`bg-neutral-800 p-4 rounded-xl border border-neutral-700 border-l-4 ${accent}`}>
        <p className="text-[10px] text-gray-500 font-black uppercase mb-1 tracking-widest">{label}</p>
        <p className={`text-2xl font-bold text-white`}>{value ?? 'N/A'}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
);

// ── Compare Modal ──────────────────────────────────────────────────────────────
const CompareModal = ({ records, onClose }: { records: any[]; onClose: () => void }) => {
    const sorted = [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const [fromIdx, setFromIdx] = useState(0);
    const [toIdx, setToIdx]     = useState(sorted.length - 1);
    const from = sorted[fromIdx], to = sorted[toIdx];
    const metrics = [
        { label: 'Weight',   key: 'weight',      unit: ' kg',  inverse: true  },
        { label: 'Body Fat', key: 'bodyFat',      unit: '%',    inverse: true  },
        { label: 'Chest',    key: 'chest',        unit: ' cm',  inverse: false },
        { label: 'Waist',    key: 'waist',        unit: ' cm',  inverse: true  },
        { label: 'Hips',     key: 'hips',         unit: ' cm',  inverse: true  },
        { label: 'Biceps',   key: 'biceps',       unit: ' cm',  inverse: false },
        { label: 'Thighs',   key: 'thighs',       unit: ' cm',  inverse: true  },
        { label: 'Energy',   key: 'energyLevel',  unit: '/10',  inverse: false },
        { label: 'Mood',     key: 'mood',         unit: '/10',  inverse: false },
    ];
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <MdCompare className="text-warrior-orange" size={20} />
                        <h3 className="font-black italic uppercase text-white">Before vs After</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
                </div>
                <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        {[{ label: 'From', idx: fromIdx, setIdx: setFromIdx }, { label: 'To', idx: toIdx, setIdx: setToIdx }].map(({ label, idx, setIdx }) => (
                            <div key={label}>
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</p>
                                <select className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs p-2.5 rounded-xl outline-none focus:border-warrior-orange"
                                    value={idx} onChange={e => setIdx(Number(e.target.value))}>
                                    {sorted.map((r, i) => (
                                        <option key={r._id} value={i}>
                                            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {r.weight} kg
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        {metrics.map(({ label, key, unit, inverse }) => {
                            const a = (from as any)[key], b = (to as any)[key];
                            if (a == null && b == null) return null;
                            const change = (a != null && b != null) ? parseFloat((b - a).toFixed(1)) : null;
                            return (
                                <div key={key} className="grid grid-cols-3 items-center gap-3 bg-neutral-800/50 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
                                        <p className="text-lg font-black text-gray-300">{fmt(a, unit)}</p>
                                    </div>
                                    <div className="text-center">
                                        {change != null && (
                                            <span className={`text-sm font-black ${diffColor(change, inverse)}`}>
                                                {change > 0 ? '+' : ''}{change}{unit} <TrendIcon change={change} inverse={inverse} />
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">After</p>
                                        <p className="text-lg font-black text-white">{fmt(b, unit)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── History Entry (same rich design as member's page) ─────────────────────────
const HistoryEntry = ({
    record, prev, editingId, feedbackText, feedbackLoading,
    onEditStart, onFeedbackChange, onSave, onCancel
}: any) => {
    const [open, setOpen] = useState(false);
    const weightChange = prev ? parseFloat((record.weight - prev.weight).toFixed(1)) : null;
    const measurements = [
        { label: 'Chest',    value: record.chest,   unit: 'cm' },
        { label: 'Waist',    value: record.waist,   unit: 'cm' },
        { label: 'Hips',     value: record.hips,    unit: 'cm' },
        { label: 'Biceps',   value: record.biceps,  unit: 'cm' },
        { label: 'Thighs',   value: record.thighs,  unit: 'cm' },
        { label: 'Body Fat', value: record.bodyFat, unit: '%'  },
    ].filter(m => m.value != null);

    return (
        <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-4 hover:bg-neutral-700/20 transition-colors">
                {/* Date badge */}
                <div className="shrink-0 w-12 text-center bg-neutral-700/50 rounded-lg p-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase">{new Date(record.createdAt).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-xl font-black text-white leading-none">{new Date(record.createdAt).toLocaleDateString('en-US', { day: 'numeric' })}</p>
                    <p className="text-[8px] text-gray-600">{new Date(record.createdAt).getFullYear()}</p>
                </div>
                {/* Main info */}
                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xl font-black text-warrior-orange">{record.weight}<span className="text-xs font-normal text-gray-500 ml-1">kg</span></p>
                        {weightChange !== null && (
                            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${weightChange < 0 ? 'text-green-400 bg-green-900/20' : weightChange > 0 ? 'text-red-400 bg-red-900/20' : 'text-gray-400 bg-neutral-700'}`}>
                                {weightChange > 0 ? '+' : ''}{weightChange} kg
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                        {record.bodyFat     && <span className="text-[10px] text-yellow-400 font-bold">{record.bodyFat}% fat</span>}
                        {record.waist       && <span className="text-[10px] text-blue-400 font-bold">{record.waist}cm waist</span>}
                        {record.energyLevel && <span className="text-[10px] text-purple-400 font-bold"><BsFillLightningFill className="inline mb-0.5" size={9}/>{record.energyLevel}/10</span>}
                        {record.mood        && <span className="text-[10px] text-pink-400 font-bold"><MdCheckCircle className="inline mb-0.5" size={10}/>{record.mood}/10 mood</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {record.coachNotes && <span className="w-2 h-2 rounded-full bg-warrior-orange" title="Has coach feedback" />}
                    {open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-neutral-700 p-4 space-y-3">
                    {/* Measurements grid */}
                    {measurements.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {measurements.map(({ label, value, unit }) => (
                                <div key={label} className="bg-neutral-900/60 rounded-lg p-2 text-center">
                                    <p className="text-[8px] font-black uppercase text-gray-600 tracking-wider">{label}</p>
                                    <p className="text-sm font-black text-white">{value}{unit}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Member notes */}
                    {record.notes && (
                        <p className="text-xs text-gray-400 italic bg-neutral-900/40 rounded-lg p-3">"{record.notes}"</p>
                    )}
                    {/* Existing coach feedback display */}
                    {record.coachNotes && editingId !== record._id && (
                        <div className="bg-warrior-orange/5 border border-warrior-orange/20 rounded-lg p-3">
                            <p className="text-[9px] font-black uppercase text-warrior-orange tracking-widest mb-1">Your Feedback</p>
                            <p className="text-xs text-gray-300">{record.coachNotes}</p>
                        </div>
                    )}
                    {/* Feedback editor */}
                    {editingId === record._id ? (
                        <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700 space-y-2">
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Coach Feedback</p>
                            <textarea
                                className="w-full bg-neutral-800 text-white text-xs p-2 rounded border border-neutral-600 outline-none focus:border-warrior-orange"
                                rows={3}
                                placeholder="Write feedback for this entry..."
                                value={feedbackText}
                                onChange={e => onFeedbackChange(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => onSave(record._id)}
                                    disabled={feedbackLoading}
                                    className="flex-1 py-1.5 bg-warrior-orange text-white text-[10px] font-black rounded hover:bg-orange-600 disabled:opacity-50">
                                    {feedbackLoading ? 'Saving...' : 'Save Feedback'}
                                </button>
                                <button onClick={onCancel} className="flex-1 py-1.5 bg-neutral-700 text-gray-300 text-[10px] font-black rounded hover:bg-neutral-600">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => onEditStart(record._id, record.coachNotes || '')}
                            className="flex items-center gap-1 text-[10px] font-black uppercase text-warrior-orange hover:underline"
                        >
                            <MdEdit size={12} /> {record.coachNotes ? 'Update Feedback' : 'Add Feedback'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CoachMemberProfile = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading]           = useState(true);
    const [memberData, setMemberData]     = useState<any>(null);
    const [activePlans, setActivePlans]   = useState<any>(null);
    const [chartData, setChartData]       = useState<any[]>([]);
    const [activeChart, setActiveChart]   = useState<'weight' | 'measurements' | 'weekly' | 'radar'>('weight');
    const [showCompare, setShowCompare]   = useState(false);
    const [editingId, setEditingId]       = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [error, setError]               = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState<{ show: boolean; type: 'workout' | 'nutrition' | null }>({ show: false, type: null });

    useEffect(() => { if (memberId) fetchAll(); }, [memberId]);

    const fetchAll = async () => {
        setLoading(true); setError(null);
        try {
            const [detail, chart, plans] = await Promise.all([
                progressService.getCoachMemberDetail(memberId!),
                progressService.getCoachMemberChartData(memberId!),
                planService.getCoachMemberPlans(memberId!)
            ]);
            setMemberData(detail);
            setActivePlans({ workout: plans.workoutPlan, nutrition: plans.nutritionPlan });
            if (chart?.labels) {
                setChartData(chart.labels.map((label: string, i: number) => ({
                    date: label,
                    Weight:     chart.weight[i],
                    'Body Fat': chart.bodyFat?.[i]  ?? null,
                    Waist:      chart.waist?.[i]    ?? null,
                    Biceps:     chart.biceps?.[i]   ?? null,
                })));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load member');
        } finally { setLoading(false); }
    };

    const handleSaveFeedback = async (progressId: string) => {
        if (!feedbackText.trim()) return;
        setFeedbackLoading(true);
        try {
            await progressService.addCoachFeedback(memberId!, progressId, feedbackText);
            setEditingId(null); setFeedbackText('');
            await fetchAll();
        } catch { alert('Failed to save feedback'); }
        finally { setFeedbackLoading(false); }
    };

    const progressHistory = memberData?.progressHistory ?? [];
    const weeklySummary   = useMemo(() => computeWeeklySummary(progressHistory), [progressHistory]);
    const milestones      = useMemo(() => computeMilestones(progressHistory),    [progressHistory]);
    const radarData       = useMemo(() => [
        { subject: 'Chest',  A: memberData?.latestProgress?.chest  || 0 },
        { subject: 'Waist',  A: memberData?.latestProgress?.waist  || 0 },
        { subject: 'Hips',   A: memberData?.latestProgress?.hips   || 0 },
        { subject: 'Biceps', A: memberData?.latestProgress?.biceps || 0 },
        { subject: 'Thighs', A: memberData?.latestProgress?.thighs || 0 },
    ], [memberData]);

    if (loading) return <Spinner />;
    if (!memberData) return null;

    const { user, memberProfile, latestProgress, progressComparison } = memberData;
    const wChange     = progressComparison?.comparison?.weight;
    const earnedCount = milestones.filter((m: any) => m.earned).length;


    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-sm">
                    <MdArrowBack /> Back to Members
                </button>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                            {user.name} <span className="text-warrior-orange">Profile</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{user.email} · {user.phone}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {progressHistory.length >= 2 && (
                            <button onClick={() => setShowCompare(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-gray-300 border border-neutral-700 rounded-xl text-[10px] font-black uppercase hover:border-warrior-orange hover:text-warrior-orange transition-all">
                                <MdCompare size={14} /> Before vs After
                            </button>
                        )}
                        <button onClick={() => setShowAssignModal({ show: true, type: 'workout' })}
                            className="px-4 py-2 bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/30 rounded-xl text-[10px] font-black uppercase hover:bg-warrior-orange/20 transition-all">
                            Assign Workout
                        </button>
                        <button onClick={() => setShowAssignModal({ show: true, type: 'nutrition' })}
                            className="px-4 py-2 bg-green-900/20 text-green-500 border border-green-800/30 rounded-xl text-[10px] font-black uppercase hover:bg-green-900/30 transition-all">
                            Assign Nutrition
                        </button>
                    </div>
                </div>
            </div>

            {/* ── TOP STATS ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Current Weight" accent="border-l-warrior-orange"
                    value={latestProgress?.weight ? `${latestProgress.weight} kg` : 'N/A'}
                    sub={wChange ? `${wChange.change > 0 ? '+' : ''}${wChange.change.toFixed(1)} kg (30d)` : undefined} />
                <StatCard label="Body Fat"   accent="border-l-yellow-500" value={latestProgress?.bodyFat   ? `${latestProgress.bodyFat}%`      : 'N/A'} />
                <StatCard label="Total Logs" accent="border-l-green-500"  value={progressHistory.length}   sub="progress entries" />
                <StatCard label="Energy Avg" accent="border-l-purple-500" value={latestProgress?.energyLevel ? `${latestProgress.energyLevel}/10` : 'N/A'} />
                <StatCard label="Height"     accent="border-l-blue-500"   value={memberProfile?.height      ? `${memberProfile.height} cm`       : 'N/A'} />
            </div>

            {/* ── 30-DAY COMPARISON ── */}
            {wChange && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5">
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-4">Last 30 Days</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-neutral-800/50 rounded-xl p-4 border-l-4 border-warrior-orange">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Weight Change</p>
                            <p className={`text-2xl font-black ${diffColor(wChange.change, true)}`}>{wChange.change > 0 ? '+' : ''}{wChange.change.toFixed(1)} kg</p>
                            <p className="text-[10px] text-gray-500 mt-1">{wChange.start} kg → {wChange.end} kg <TrendIcon change={wChange.change} inverse /></p>
                        </div>
                        {progressComparison?.comparison?.bodyFat && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border-l-4 border-yellow-500">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Body Fat</p>
                                <p className={`text-2xl font-black ${diffColor(progressComparison.comparison.bodyFat.change, true)}`}>
                                    {progressComparison.comparison.bodyFat.change > 0 ? '+' : ''}{progressComparison.comparison.bodyFat.change.toFixed(1)}%
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">{progressComparison.comparison.bodyFat.start}% → {progressComparison.comparison.bodyFat.end}%</p>
                            </div>
                        )}
                        {progressComparison?.comparison?.waist && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border-l-4 border-blue-500">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Waist</p>
                                <p className={`text-2xl font-black ${diffColor(progressComparison.comparison.waist.change, true)}`}>
                                    {progressComparison.comparison.waist.change > 0 ? '+' : ''}{progressComparison.comparison.waist.change.toFixed(1)} cm
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">{progressComparison.comparison.waist.start} cm → {progressComparison.comparison.waist.end} cm</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── ACTIVE PLANS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Workout Plan Card */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-orange-900/10 border-b border-orange-800/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-900/30 flex items-center justify-center text-warrior-orange border border-orange-800/30">
                                <MdAssignment size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Workout</p>
                                <p className="text-sm font-black text-white italic">{activePlans?.workout?.plan?.title || 'No Plan Assigned'}</p>
                            </div>
                        </div>
                        {activePlans?.workout
                            ? <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/40 text-[9px] font-black uppercase">Active</span>
                            : <button onClick={() => setShowAssignModal({ show: true, type: 'workout' })} className="text-gray-500 hover:text-warrior-orange transition-colors"><MdEdit size={18} /></button>
                        }
                    </div>
                    {activePlans?.workout?.plan ? (
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Duration',   value: `${activePlans.workout.plan.durationWeeks} weeks` },
                                    { label: 'Frequency',  value: `${activePlans.workout.plan.daysPerWeek}x / week` },
                                    { label: 'Difficulty', value: activePlans.workout.plan.difficulty, className: activePlans.workout.plan.difficulty === 'beginner' ? 'text-green-400' : activePlans.workout.plan.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400' },
                                    { label: 'Schedule',   value: `${activePlans.workout.plan.schedule?.length ?? 0} days` },
                                ].map(({ label, value, className }) => (
                                    <div key={label} className="bg-neutral-800/60 rounded-lg p-2.5">
                                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">{label}</p>
                                        <p className={`text-sm font-black mt-0.5 capitalize ${className || 'text-white'}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase text-gray-600 tracking-wider">Goal</span>
                                <span className="px-2 py-0.5 rounded-full bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/20 text-[10px] font-black uppercase">
                                    {activePlans.workout.plan.goal?.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-600 pt-2 border-t border-neutral-700/50">
                                Started <span className="text-gray-400 font-bold">{new Date(activePlans.workout.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </p>
                            {activePlans.workout.coachNotes && (
                                <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-2.5">
                                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider mb-1">Notes</p>
                                    <p className="text-xs text-gray-400 italic">"{activePlans.workout.coachNotes}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600 text-xs">No workout plan assigned yet</p>
                            <button onClick={() => setShowAssignModal({ show: true, type: 'workout' })} className="mt-2 text-warrior-orange text-xs font-black uppercase hover:underline">+ Assign Now</button>
                        </div>
                    )}
                </div>

                {/* Nutrition Plan Card */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-green-900/10 border-b border-green-800/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-green-900/30 flex items-center justify-center text-green-500 border border-green-800/30">
                                <MdTimeline size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Active Nutrition</p>
                                <p className="text-sm font-black text-white italic">{activePlans?.nutrition?.plan?.title || 'No Plan Assigned'}</p>
                            </div>
                        </div>
                        {activePlans?.nutrition
                            ? <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 border border-green-800/40 text-[9px] font-black uppercase">Active</span>
                            : <button onClick={() => setShowAssignModal({ show: true, type: 'nutrition' })} className="text-gray-500 hover:text-green-400 transition-colors"><MdEdit size={18} /></button>
                        }
                    </div>
                    {activePlans?.nutrition?.plan ? (
                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Duration', value: `${activePlans.nutrition.plan.durationWeeks} weeks` },
                                    { label: 'Calories', value: activePlans.nutrition.plan.dailyCalorieTarget ? `${activePlans.nutrition.plan.dailyCalorieTarget} kcal` : 'Not set' },
                                    { label: 'Schedule', value: `${activePlans.nutrition.plan.schedule?.length ?? 0} days` },
                                    { label: 'Goal',     value: activePlans.nutrition.plan.goal?.replace('_', ' '), className: 'text-green-400' },
                                ].map(({ label, value, className }) => (
                                    <div key={label} className="bg-neutral-800/60 rounded-lg p-2.5">
                                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider">{label}</p>
                                        <p className={`text-sm font-black mt-0.5 capitalize ${className || 'text-white'}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                            {activePlans.nutrition.plan.restrictions?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {activePlans.nutrition.plan.restrictions.map((r: string) => (
                                        <span key={r} className="px-2 py-0.5 rounded-full bg-neutral-800 text-gray-400 border border-neutral-700 text-[9px] font-bold uppercase">{r.replace('_', ' ')}</span>
                                    ))}
                                </div>
                            )}
                            <p className="text-[10px] text-gray-600 pt-2 border-t border-neutral-700/50">
                                Started <span className="text-gray-400 font-bold">{new Date(activePlans.nutrition.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </p>
                            {activePlans.nutrition.coachNotes && (
                                <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-2.5">
                                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-wider mb-1">Notes</p>
                                    <p className="text-xs text-gray-400 italic">"{activePlans.nutrition.coachNotes}"</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-600 text-xs">No nutrition plan assigned yet</p>
                            <button onClick={() => setShowAssignModal({ show: true, type: 'nutrition' })} className="mt-2 text-green-400 text-xs font-black uppercase hover:underline">+ Assign Now</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 4-TAB CHARTS ── */}
            {chartData.length > 1 && (
                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 shadow-xl">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Progress Charts</p>
                        <div className="flex gap-1 bg-neutral-800 p-1 rounded-xl flex-wrap">
                            {([
                                { key: 'weight',       label: 'Weight'       },
                                { key: 'measurements', label: 'Measurements' },
                                { key: 'weekly',       label: 'Weekly Avg'   },
                                { key: 'radar',        label: 'Body Shape'   },
                            ] as const).map(t => (
                                <button key={t.key} onClick={() => setActiveChart(t.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                        activeChart === t.key ? 'bg-warrior-orange text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                                    }`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeChart === 'weight' ? (
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Weight" stroke="#f97316" fill="url(#wg)" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} connectNulls />
                                </AreaChart>
                            ) : activeChart === 'measurements' ? (
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
                                    <Area type="monotone" dataKey="Waist"    stroke="#60a5fa" fill="none" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Area type="monotone" dataKey="Biceps"   stroke="#34d399" fill="none" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Area type="monotone" dataKey="Body Fat" stroke="#eab308" fill="none" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                </AreaChart>
                            ) : activeChart === 'weekly' ? (
                                <BarChart data={weeklySummary}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="week" stroke="#444" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="avg" fill="#f97316" radius={[6, 6, 0, 0]} name="Avg Weight (kg)" />
                                </BarChart>
                            ) : (
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                                    <Radar name="Member" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
                                </RadarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── MILESTONES ── */}
            {progressHistory.length > 0 && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MdEmojiEvents className="text-yellow-400" size={18} />
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Member Milestones</p>
                        </div>
                        <span className="text-[10px] font-black text-yellow-400 bg-yellow-900/20 border border-yellow-800/40 px-2 py-1 rounded-full">
                            {earnedCount}/{milestones.length} earned
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {milestones.map((m: any, i: number) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                m.earned ? 'bg-warrior-orange/5 border-warrior-orange/25' : 'bg-neutral-800/30 border-neutral-700/50 opacity-40'
                            }`}>
                                <MilestoneIcon label={m.label} earned={m.earned} />
                                <div className="min-w-0">
                                    <p className={`text-xs font-black truncate ${m.earned ? 'text-white' : 'text-gray-500'}`}>{m.label}</p>
                                    <p className="text-[9px] text-gray-600 truncate">{m.desc}</p>
                                    {m.earned && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <MdVerified size={10} className="text-warrior-orange" />
                                            <p className="text-[9px] text-warrior-orange font-bold">Earned</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── PROGRESS HISTORY ── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">
                        Progress History <span className="text-gray-600 normal-case font-normal ml-1">({progressHistory.length} entries)</span>
                    </p>
                    {progressHistory.length >= 2 && (
                        <button onClick={() => setShowCompare(true)}
                            className="flex items-center gap-1 text-[10px] font-black text-gray-500 hover:text-warrior-orange transition-colors uppercase">
                            <MdCompare size={12} /> Compare Any Two
                        </button>
                    )}
                </div>

                {progressHistory.length > 0 ? (
                    <div className="space-y-2">
                        {progressHistory.map((r: any, i: number) => (
                            <HistoryEntry
                                key={r._id}
                                record={r}
                                prev={progressHistory[i + 1]}
                                editingId={editingId}
                                feedbackText={feedbackText}
                                feedbackLoading={feedbackLoading}
                                onEditStart={(id: string, text: string) => { setEditingId(id); setFeedbackText(text); }}
                                onFeedbackChange={setFeedbackText}
                                onSave={handleSaveFeedback}
                                onCancel={() => setEditingId(null)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-12 text-center">
                        <GiMuscleUp className="text-gray-600 mx-auto mb-4" size={40} />
                        <p className="text-white font-black italic uppercase text-xl mb-1">No Progress Logs Yet</p>
                        <p className="text-gray-500 text-sm">Member hasn't logged any progress entries.</p>
                    </div>
                )}
            </div>

            {/* ── MODALS ── */}
            {showCompare && progressHistory.length >= 2 && (
                <CompareModal records={progressHistory} onClose={() => setShowCompare(false)} />
            )}

            {showAssignModal.show && (
                <AssignPlanModal
                    planId=""
                    planType={showAssignModal.type === 'workout' ? 'WorkoutPlan' : 'NutritionPlan'}
                    planTitle={`New ${showAssignModal.type?.toUpperCase()} Assignment`}
                    memberId={memberId}
                    memberName={user.name}
                    onClose={() => setShowAssignModal({ show: false, type: null })}
                    onSuccess={() => { setShowAssignModal({ show: false, type: null }); fetchAll(); }}
                />
            )}
        </div>
    );
};

export default CoachMemberProfile;