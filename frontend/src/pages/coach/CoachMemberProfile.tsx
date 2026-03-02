/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/coach/CoachMemberProfile.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import { MdArrowBack, MdEdit, MdClose, MdSave } from 'react-icons/md';
import Spinner from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const StatCard = ({ label, value, sub, color = 'orange' }: any) => {
    const colors: any = {
        orange: 'text-warrior-orange border-warrior-orange',
        yellow: 'text-yellow-400 border-yellow-500',
        blue: 'text-blue-400 border-blue-500',
        green: 'text-green-400 border-green-500',
    };
    return (
        <div className={`bg-neutral-800 p-4 rounded-xl border border-neutral-700 border-l-4 ${colors[color]}`}>
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">{label}</p>
            <p className={`text-2xl font-bold ${colors[color].split(' ')[0]}`}>{value ?? 'N/A'}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-lg text-sm">
            <p className="text-gray-400 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
            ))}
        </div>
    );
};

const CoachMemberProfile = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [activeChart, setActiveChart] = useState<'weight' | 'measurements'>('weight');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { if (memberId) fetchAll(); }, [memberId]);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [detail, chart] = await Promise.all([
                progressService.getCoachMemberDetail(memberId!),
                progressService.getCoachMemberChartData(memberId!),  // new endpoint
            ]);
            setMemberData(detail);

            if (chart?.labels) {
                setChartData(chart.labels.map((label: string, i: number) => ({
                    date: label,
                    Weight: chart.weight[i],
                    "Body Fat": chart.bodyFat[i],
                    Waist: chart.waist[i],
                    Biceps: chart.biceps[i],
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
    if (error) return (
        <div className="max-w-6xl mx-auto p-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-warrior-orange mb-4">
                <MdArrowBack /> Back
            </button>
            <div className="bg-red-900/20 border border-red-700 p-6 rounded-2xl">
                <p className="text-red-400">{error}</p>
            </div>
        </div>
    );
    if (!memberData) return null;

    const { user, memberProfile, latestProgress, progressComparison, progressHistory } = memberData;
    const wChange = progressComparison?.comparison?.weight;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* HEADER */}
            <div>
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-4 text-sm">
                    <MdArrowBack /> Back to Members
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                        <p className="text-gray-500">{user.email} · {user.phone}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                        ${user.status === 'active' ? 'bg-green-900/40 text-green-400 border border-green-700'
                        : 'bg-red-900/40 text-red-400 border border-red-700'}`}>
                        {user.status}
                    </span>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Baseline Weight" value={memberProfile?.weight ? `${memberProfile.weight} kg` : 'N/A'} color="orange" />
                <StatCard label="Current Weight" value={latestProgress?.weight ? `${latestProgress.weight} kg` : 'N/A'} color="orange"
                    sub={wChange ? `${wChange.change > 0 ? '+' : ''}${wChange.change.toFixed(1)} kg (30d)` : undefined} />
                <StatCard label="Body Fat" value={latestProgress?.bodyFat ? `${latestProgress.bodyFat}%` : 'N/A'} color="yellow" />
                <StatCard label="Height" value={memberProfile?.height ? `${memberProfile.height} cm` : 'N/A'} color="blue" />
            </div>

            {/* CHARTS */}
            {chartData.length > 1 && (
                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-300">Progress Charts</h2>
                        <div className="flex gap-2">
                            {(['weight', 'measurements'] as const).map(t => (
                                <button key={t} onClick={() => setActiveChart(t)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                                        ${activeChart === t
                                            ? 'bg-warrior-orange text-white'
                                            : 'bg-neutral-700 text-gray-400'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        {activeChart === 'weight' ? (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="Weight" stroke="#f97316"
                                    fill="url(#wg)" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
                            </AreaChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                                <Line type="monotone" dataKey="Body Fat" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                <Line type="monotone" dataKey="Waist" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                <Line type="monotone" dataKey="Biceps" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}

            {/* 30-DAY COMPARISON */}
            {progressComparison?.comparison && (
                <div className="bg-warrior-grey p-5 rounded-2xl border border-neutral-600">
                    <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">30-Day Comparison</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-warrior-dark p-4 rounded-xl border-l-4 border-warrior-orange">
                            <p className="text-xs text-gray-400">Weight</p>
                            <p className="text-xl font-bold text-warrior-orange">
                                {wChange?.change > 0 ? '+' : ''}{wChange?.change.toFixed(1)} kg
                            </p>
                            <p className="text-xs text-gray-500">{wChange?.start} → {wChange?.end} kg</p>
                        </div>
                        {progressComparison.comparison.bodyFat && (
                            <div className="bg-warrior-dark p-4 rounded-xl border-l-4 border-yellow-500">
                                <p className="text-xs text-gray-400">Body Fat</p>
                                <p className="text-xl font-bold text-yellow-400">
                                    {progressComparison.comparison.bodyFat.change.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500">
                                    {progressComparison.comparison.bodyFat.start}% → {progressComparison.comparison.bodyFat.end}%
                                </p>
                            </div>
                        )}
                        {progressComparison.comparison.waist && (
                            <div className="bg-warrior-dark p-4 rounded-xl border-l-4 border-blue-500">
                                <p className="text-xs text-gray-400">Waist</p>
                                <p className="text-xl font-bold text-blue-400">
                                    {progressComparison.comparison.waist.change > 0 ? '+' : ''}
                                    {progressComparison.comparison.waist.change.toFixed(1)} cm
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PROGRESS HISTORY WITH FEEDBACK */}
            <div className="bg-warrior-grey border border-neutral-600 p-6 rounded-2xl">
                <h2 className="text-lg font-bold text-gray-300 mb-4">Progress Entries</h2>

                {!progressHistory?.length ? (
                    <p className="text-gray-500">No entries yet.</p>
                ) : (
                    <div className="space-y-4">
                        {progressHistory.map((r: any) => (
                            <div key={r._id} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                                {/* Entry header */}
                                <div className="flex justify-between mb-2">
                                    <p className="text-sm text-gray-400">
                                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xl font-bold text-warrior-orange">{r.weight} kg</p>
                                </div>

                                {/* Metrics row */}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                    {r.bodyFat && <span className="text-xs text-yellow-400">Body Fat: {r.bodyFat}%</span>}
                                    {r.waist && <span className="text-xs text-blue-400">Waist: {r.waist}cm</span>}
                                    {r.biceps && <span className="text-xs text-green-400">Biceps: {r.biceps}cm</span>}
                                    {r.energyLevel && <span className="text-xs text-purple-400">⚡ Energy: {r.energyLevel}/10</span>}
                                </div>

                                {r.notes && (
                                    <p className="text-xs text-gray-400 italic mb-3">Member: "{r.notes}"</p>
                                )}

                                {/* Existing coach notes */}
                                {r.coachNotes && editingId !== r._id && (
                                    <div className="bg-neutral-900 border border-warrior-orange/30 rounded-lg p-3 mb-3">
                                        <p className="text-xs font-bold text-warrior-orange mb-1">Your Feedback</p>
                                        <p className="text-xs text-gray-300">{r.coachNotes}</p>
                                    </div>
                                )}

                                {/* Feedback form */}
                                {editingId === r._id ? (
                                    <div className="space-y-2 mt-2">
                                        <textarea
                                            className="w-full bg-neutral-900 text-white text-sm p-3 rounded-lg border border-neutral-600 outline-none focus:border-warrior-orange"
                                            placeholder="Write your feedback for this entry..."
                                            rows={3}
                                            value={feedbackText}
                                            onChange={e => setFeedbackText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleSaveFeedback(r._id)}
                                                loading={feedbackLoading} className="flex-1">
                                                <MdSave className="inline mr-1" /> Save Feedback
                                            </Button>
                                            <button onClick={() => { setEditingId(null); setFeedbackText(''); }}
                                                className="flex-1 py-2 bg-neutral-700 text-gray-300 rounded-lg text-sm hover:bg-neutral-600">
                                                <MdClose className="inline mr-1" /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingId(r._id);
                                            setFeedbackText(r.coachNotes || '');
                                        }}
                                        className="text-xs text-warrior-orange font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <MdEdit size={13} />
                                        {r.coachNotes ? 'Edit Feedback' : 'Add Feedback'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachMemberProfile;