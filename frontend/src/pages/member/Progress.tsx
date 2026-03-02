/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/member/Progress.tsx
import React, { useEffect, useState } from "react";
import { progressService } from "../../services/progressService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";
import { MdFitnessCenter, MdTrendingDown, MdTrendingUp, MdRemove } from "react-icons/md";

// ── Small stat card ───────────────────────────────────────────────
const StatCard = ({ label, value, sub, highlight = false }: any) => (
    <div className={`p-4 rounded-xl border ${highlight
        ? 'bg-warrior-dark border-warrior-orange'
        : 'bg-neutral-800 border-neutral-700'}`}
    >
        <p className="text-xs text-gray-500 font-bold uppercase mb-1">{label}</p>
        <p className={`text-2xl font-bold ${highlight ? 'text-warrior-orange' : 'text-white'}`}>
            {value ?? 'N/A'}
        </p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
);

// ── Trend icon ────────────────────────────────────────────────────
const Trend = ({ change, inverse = false }: { change: number; inverse?: boolean }) => {
    const good = inverse ? change < 0 : change > 0;
    const neutral = change === 0;
    if (neutral) return <MdRemove className="inline text-gray-400" />;
    return good
        ? <MdTrendingDown className="inline text-green-400" />
        : <MdTrendingUp className="inline text-red-400" />;
};

// ── Custom recharts tooltip ───────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────────
const Progress = () => {
    const [progressHistory, setProgressHistory] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeChart, setActiveChart] = useState<'weight' | 'bodyFat' | 'measurements'>('weight');

    const [formData, setFormData] = useState({
        weight: "", bodyFat: "", chest: "", waist: "",
        hips: "", biceps: "", thighs: "", notes: "",
        energyLevel: "", mood: ""
    });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [prog, comp, chart, sum] = await Promise.all([
                progressService.getMyProgress(),
                progressService.getProgressComparison(),
                progressService.getProgressChartData(),   // new endpoint
                progressService.getFitnessSummary(),       // new endpoint
            ]);
            setProgressHistory(prog.records);
            setComparison(comp);
            setSummary(sum);

            // Merge chart arrays into recharts-friendly format
            if (chart?.labels) {
                const merged = chart.labels.map((label: string, i: number) => ({
                    date: label,
                    Weight: chart.weight[i],
                    "Body Fat": chart.bodyFat[i],
                    Waist: chart.waist[i],
                    Biceps: chart.biceps[i],
                    Energy: chart.energyLevel[i],
                }));
                setChartData(merged);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await progressService.addProgress(formData);
            setFormData({
                weight: "", bodyFat: "", chest: "", waist: "",
                hips: "", biceps: "", thighs: "", notes: "",
                energyLevel: "", mood: ""
            });
            await fetchAll();
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading && !progressHistory.length) return <Spinner />;

    const wChange = comparison?.comparison?.weight;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <h1 className="text-3xl font-bold text-gray-300">
                My Fitness <span className="text-warrior-orange">Progress</span>
            </h1>

            {/* ── SUMMARY STATS ── */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Current Weight" value={`${summary.currentWeight} kg`} highlight />
                    <StatCard
                        label="BMI"
                        value={summary.bmi}
                        sub={summary.bmiCategory?.label}
                    />
                    <StatCard
                        label="Total Change"
                        value={`${summary.totalWeightChange > 0 ? '+' : ''}${summary.totalWeightChange} kg`}
                        sub="since first entry"
                    />
                    <StatCard label="Entries Logged" value={summary.totalEntries} sub="total check-ins" />
                </div>
            )}

            {/* ── 30-DAY COMPARISON ── */}
            {wChange && (
                <div className="bg-warrior-grey p-5 rounded-2xl border border-neutral-600">
                    <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Last 30 Days</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-warrior-dark p-4 rounded-xl border-l-4 border-warrior-orange">
                            <p className="text-xs text-gray-400">Weight</p>
                            <p className="text-2xl font-bold text-warrior-orange">
                                {wChange.change > 0 ? '+' : ''}{wChange.change.toFixed(1)} kg
                            </p>
                            <p className="text-xs text-gray-500">{wChange.changePercent.toFixed(1)}%
                                <Trend change={wChange.change} inverse />
                            </p>
                        </div>
                        {comparison.comparison.bodyFat && (
                            <div className="bg-warrior-dark p-4 rounded-xl border-l-4 border-yellow-500">
                                <p className="text-xs text-gray-400">Body Fat</p>
                                <p className="text-2xl font-bold text-yellow-400">
                                    {comparison.comparison.bodyFat.change.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-500">
                                    {comparison.comparison.bodyFat.start}% → {comparison.comparison.bodyFat.end}%
                                    <Trend change={comparison.comparison.bodyFat.change} inverse />
                                </p>
                            </div>
                        )}
                        {comparison.comparison.waist && (
                            <div className="bg-warrior-dark p-4 rounded-xl border-l-4 border-blue-500">
                                <p className="text-xs text-gray-400">Waist</p>
                                <p className="text-2xl font-bold text-blue-400">
                                    {comparison.comparison.waist.change > 0 ? '+' : ''}
                                    {comparison.comparison.waist.change.toFixed(1)} cm
                                    <Trend change={comparison.comparison.waist.change} inverse />
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── CHARTS ── */}
            {chartData && chartData.length > 1 && (
                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-300">Progress Charts</h2>
                        <div className="flex gap-2">
                            {(['weight', 'bodyFat', 'measurements'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveChart(tab)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-colors ${
                                        activeChart === tab
                                            ? 'bg-warrior-orange text-white'
                                            : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600'
                                    }`}
                                >
                                    {tab === 'bodyFat' ? 'Body Fat' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={260}>
                        {activeChart === 'weight' ? (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone" dataKey="Weight" stroke="#f97316"
                                    fill="url(#weightGrad)" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }}
                                />
                            </AreaChart>
                        ) : activeChart === 'bodyFat' ? (
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone" dataKey="Body Fat" stroke="#eab308"
                                    fill="url(#fatGrad)" strokeWidth={2} dot={{ r: 3, fill: '#eab308' }}
                                />
                            </AreaChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                                <Line type="monotone" dataKey="Waist" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                <Line type="monotone" dataKey="Biceps" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── LOG PROGRESS FORM ── */}
            <form onSubmit={handleSubmit}
                className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 space-y-4">
                <h2 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                    <MdFitnessCenter className="text-warrior-orange" /> Log Progress Update
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input label="Weight (KG) *" type="number" required placeholder="70"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                    <Input label="Body Fat (%)" type="number" placeholder="15"
                        value={formData.bodyFat}
                        onChange={e => setFormData({ ...formData, bodyFat: e.target.value })} />
                    <Input label="Chest (CM)" type="number" placeholder="95"
                        value={formData.chest}
                        onChange={e => setFormData({ ...formData, chest: e.target.value })} />
                    <Input label="Waist (CM)" type="number" placeholder="85"
                        value={formData.waist}
                        onChange={e => setFormData({ ...formData, waist: e.target.value })} />
                    <Input label="Hips (CM)" type="number" placeholder="95"
                        value={formData.hips}
                        onChange={e => setFormData({ ...formData, hips: e.target.value })} />
                    <Input label="Biceps (CM)" type="number" placeholder="32"
                        value={formData.biceps}
                        onChange={e => setFormData({ ...formData, biceps: e.target.value })} />
                </div>

                {/* Wellbeing sliders */}
                <div className="grid grid-cols-2 gap-6 bg-warrior-dark p-4 rounded-xl border border-neutral-700">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">
                            Energy Level: <span className="text-warrior-orange">{formData.energyLevel || '—'}/10</span>
                        </label>
                        <input type="range" min="1" max="10" className="w-full accent-orange-500 mt-2"
                            value={formData.energyLevel}
                            onChange={e => setFormData({ ...formData, energyLevel: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">
                            Mood: <span className="text-warrior-orange">{formData.mood || '—'}/10</span>
                        </label>
                        <input type="range" min="1" max="10" className="w-full accent-orange-500 mt-2"
                            value={formData.mood}
                            onChange={e => setFormData({ ...formData, mood: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold uppercase text-gray-400">Notes</label>
                    <textarea
                        className="w-full mt-1 bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-lg outline-none focus:border-warrior-orange min-h-20 text-sm"
                        placeholder="How do you feel? Any observations?"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <Button type="submit" loading={loading}>Log Progress</Button>
            </form>

            {/* ── HISTORY ── */}
            <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                <h2 className="text-lg font-bold text-gray-300 mb-4">History</h2>
                {progressHistory.length === 0 ? (
                    <p className="text-gray-500">No entries yet. Log your first check-in above!</p>
                ) : (
                    <div className="space-y-3">
                        {progressHistory.map((r: any) => (
                            <div key={r._id}
                                className="bg-warrior-dark p-4 rounded-xl border border-neutral-700 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="text-sm text-gray-500">
                                            {new Date(r.createdAt).toLocaleDateString('en-US', {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-xl font-bold text-warrior-orange">{r.weight} kg</p>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        {r.bodyFat && <span className="text-xs text-yellow-400">Body Fat: {r.bodyFat}%</span>}
                                        {r.waist && <span className="text-xs text-blue-400">Waist: {r.waist}cm</span>}
                                        {r.biceps && <span className="text-xs text-green-400">Biceps: {r.biceps}cm</span>}
                                        {r.energyLevel && <span className="text-xs text-purple-400">⚡ {r.energyLevel}/10</span>}
                                    </div>
                                    {r.notes && (
                                        <p className="text-xs text-gray-400 italic mt-2">"{r.notes}"</p>
                                    )}
                                </div>
                                {/* Coach feedback badge */}
                                {r.coachNotes && (
                                    <div className="bg-neutral-800 border border-warrior-orange/40 rounded-lg p-3 md:w-56">
                                        <p className="text-xs font-bold text-warrior-orange mb-1">Coach Feedback</p>
                                        <p className="text-xs text-gray-300">{r.coachNotes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;