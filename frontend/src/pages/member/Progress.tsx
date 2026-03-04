/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { progressService } from "../../services/progressService";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, BarChart, Bar, ReferenceLine, Legend
} from "recharts";
import {
    MdTrendingDown, MdTrendingUp, MdRemove,
    MdExpandMore, MdExpandLess, MdEmojiEvents, MdFlag,
    MdCompare, MdClose, MdAdd, MdVerified, MdShowChart,
    MdBarChart, MdCalendarToday, MdCheckCircle
} from "react-icons/md";
import {
    GiProgression, GiFireBowl, GiWeightScale, GiMuscleUp,
    GiTrophy, GiLaurelCrown, GiPodiumWinner, GiRun,

} from "react-icons/gi";
import { BsFillLightningFill } from "react-icons/bs";

interface ProgressRecord {
    _id: string; weight: number; bodyFat?: number; chest?: number;
    waist?: number; hips?: number; biceps?: number; thighs?: number;
    energyLevel?: number; mood?: number; notes?: string; coachNotes?: string; createdAt: string;
}

// ── Milestone icon map ─────────────────────────────────────────────────────────
// Each milestone maps to a react-icons component instead of an emoji
const MILESTONE_ICONS: Record<string, React.ElementType> = {
    "First Step":     GiRun,
    "Consistent":     MdCalendarToday,
    "Dedicated":      MdBarChart,
    "Warrior":        GiMuscleUp,
    "First Drop":     GiWeightScale,
    "5 kg Milestone": MdShowChart,
    "10 kg Champ":    GiTrophy,
    "On A Roll":      GiFireBowl,
    "Goal Reached!":  GiLaurelCrown,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined, unit = "") => v != null ? `${v}${unit}` : "—";

const diffColor = (change: number, inverse = false) => {
    if (change === 0) return "text-gray-400";
    return (inverse ? change < 0 : change > 0) ? "text-green-400" : "text-red-400";
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
                    {p.name}: {p.value ?? "—"}
                </p>
            ))}
        </div>
    );
};

// ── Milestone Badge Icon component ────────────────────────────────────────────
const MilestoneIcon = ({ label, earned }: { label: string; earned: boolean }) => {
    const Icon = MILESTONE_ICONS[label] ?? GiPodiumWinner;
    return (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
            earned
                ? "bg-warrior-orange/15 border-warrior-orange/40"
                : "bg-neutral-800/60 border-neutral-700/40"
        }`}>
            <Icon size={20} className={earned ? "text-warrior-orange" : "text-gray-600"} />
        </div>
    );
};

const computeMilestones = (records: ProgressRecord[], targetWeight?: number) => {
    if (!records.length) return [];
    const sorted = [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const totalLost = sorted[0].weight - sorted[sorted.length - 1].weight;
    let maxStreak = 1, streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i].createdAt).getTime() - new Date(sorted[i - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 10) { streak++; maxStreak = Math.max(maxStreak, streak); } else streak = 1;
    }
    const list = [
        { label: "First Step",     desc: "Logged your first check-in",   earned: records.length >= 1  },
        { label: "Consistent",     desc: "5 progress entries logged",     earned: records.length >= 5  },
        { label: "Dedicated",      desc: "10 progress entries logged",    earned: records.length >= 10 },
        { label: "Warrior",        desc: "25 progress entries logged",    earned: records.length >= 25 },
        { label: "First Drop",     desc: "Lost first 1 kg from baseline", earned: totalLost >= 1       },
        { label: "5 kg Milestone", desc: "Lost 5 kg from baseline",       earned: totalLost >= 5       },
        { label: "10 kg Champ",    desc: "Lost 10 kg from baseline",      earned: totalLost >= 10      },
        { label: "On A Roll",      desc: "3 consecutive close check-ins", earned: maxStreak >= 3       },
    ];
    if (targetWeight) list.push({ label: "Goal Reached!", desc: `Hit target of ${targetWeight} kg`, earned: sorted[sorted.length - 1].weight <= targetWeight });
    return list;
};

const computeWeeklySummary = (records: ProgressRecord[]) => {
    const weeks: Record<string, number[]> = {};
    [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).forEach(r => {
        const d = new Date(r.createdAt), ws = new Date(d);
        ws.setDate(d.getDate() - d.getDay());
        const key = ws.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        (weeks[key] = weeks[key] || []).push(r.weight);
    });
    return Object.entries(weeks).map(([week, ws]) => ({
        week, avg: parseFloat((ws.reduce((a, b) => a + b, 0) / ws.length).toFixed(1)), entries: ws.length,
    })).slice(-8);
};

const computeStreak = (records: ProgressRecord[]) => {
    if (!records.length) return 0;
    const sorted = [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i - 1].createdAt).getTime() - new Date(sorted[i].createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 10) streak++; else break;
    }
    return streak;
};

// ── Compare Modal ──────────────────────────────────────────────────────────────
const CompareModal = ({ records, onClose }: { records: ProgressRecord[]; onClose: () => void }) => {
    const sorted = [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const [fromIdx, setFromIdx] = useState(0);
    const [toIdx, setToIdx] = useState(sorted.length - 1);
    const from = sorted[fromIdx], to = sorted[toIdx];
    const metrics = [
        { label: "Weight",   key: "weight",      unit: " kg",  inverse: true  },
        { label: "Body Fat", key: "bodyFat",     unit: "%",    inverse: true  },
        { label: "Chest",    key: "chest",       unit: " cm",  inverse: false },
        { label: "Waist",    key: "waist",       unit: " cm",  inverse: true  },
        { label: "Hips",     key: "hips",        unit: " cm",  inverse: true  },
        { label: "Biceps",   key: "biceps",      unit: " cm",  inverse: false },
        { label: "Thighs",   key: "thighs",      unit: " cm",  inverse: true  },
        { label: "Energy",   key: "energyLevel", unit: "/10",  inverse: false },
        { label: "Mood",     key: "mood",        unit: "/10",  inverse: false },
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
                        {[{ label: "From", idx: fromIdx, setIdx: setFromIdx }, { label: "To", idx: toIdx, setIdx: setToIdx }].map(({ label, idx, setIdx }) => (
                            <div key={label}>
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</p>
                                <select className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs p-2.5 rounded-xl outline-none focus:border-warrior-orange"
                                    value={idx} onChange={e => setIdx(Number(e.target.value))}>
                                    {sorted.map((r, i) => (
                                        <option key={r._id} value={i}>
                                            {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — {r.weight} kg
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
                                                {change > 0 ? "+" : ""}{change}{unit} <TrendIcon change={change} inverse={inverse} />
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

// ── Log Form ───────────────────────────────────────────────────────────────────
const LogForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const empty = { weight: "", bodyFat: "", chest: "", waist: "", hips: "", biceps: "", thighs: "", notes: "", energyLevel: "5", mood: "5" };
    const [form, setForm] = useState(empty);
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try { await progressService.addProgress(form); setForm(empty); setOpen(false); onSuccess(); }
        catch (err) { console.error(err); } finally { setLoading(false); }
    };
    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-neutral-700/20 transition-colors ">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                        <MdAdd className="text-warrior-orange" size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-black text-white italic uppercase">Log Progress Update</p>
                        <p className="text-[10px] text-gray-500 font-bold">Record today's measurements</p>
                    </div>
                </div>
                {open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
            </button>
            {open && (
                <form onSubmit={handleSubmit} className="border-t border-neutral-700 p-5 space-y-5">
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-3">Primary Metrics</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Weight (KG) *" type="number" required placeholder="70" value={form.weight} onChange={e => set("weight", e.target.value)} />
                            <Input label="Body Fat (%)" type="number" placeholder="15" value={form.bodyFat} onChange={e => set("bodyFat", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-3">Body Measurements (cm)</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(["chest", "waist", "hips", "biceps", "thighs"] as const).map(k => (
                                <Input key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} type="number"
                                    value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
                            ))}
                        </div>
                    </div>
                    <div className="bg-neutral-800/40 rounded-xl p-4 space-y-4">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Wellbeing</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {[{ label: "Energy Level", key: "energyLevel", lo: "Exhausted", hi: "Peak" }, { label: "Mood", key: "mood", lo: "Low", hi: "Great" }].map(({ label, key, lo, hi }) => (
                                <div key={key}>
                                    <label className="text-xs font-bold uppercase text-gray-400 flex justify-between">
                                        <span>{label}</span>
                                        <span className="text-warrior-orange font-black">{(form as any)[key]}/10</span>
                                    </label>
                                    <input type="range" min="1" max="10" className="w-full accent-orange-500 mt-2 cursor-pointer"
                                        value={(form as any)[key]} onChange={e => set(key, e.target.value)} />
                                    <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>{lo}</span><span>{hi}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-400">Notes</label>
                        <textarea className="w-full mt-1 bg-neutral-800 border border-neutral-700 text-gray-300 p-3 rounded-xl outline-none focus:border-warrior-orange min-h-16 text-sm"
                            placeholder="How are you feeling?" value={form.notes} onChange={e => set("notes", e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setOpen(false)}
                            className="flex-1 py-3 bg-neutral-800 text-gray-400 rounded-xl text-xs font-black uppercase hover:bg-neutral-700 transition-colors">Cancel</button>
                        <div className="flex-1"><Button type="submit" loading={loading}>Log Progress</Button></div>
                    </div>
                </form>
            )}
        </div>
    );
};

// ── History Entry ──────────────────────────────────────────────────────────────
const HistoryEntry = ({ record, prev }: { record: ProgressRecord; prev?: ProgressRecord }) => {
    const [open, setOpen] = useState(false);
    const weightChange = prev ? parseFloat((record.weight - prev.weight).toFixed(1)) : null;
    const measurements = [
        { label: "Chest",    value: record.chest,   unit: "cm" },
        { label: "Waist",    value: record.waist,   unit: "cm" },
        { label: "Hips",     value: record.hips,    unit: "cm" },
        { label: "Biceps",   value: record.biceps,  unit: "cm" },
        { label: "Thighs",   value: record.thighs,  unit: "cm" },
        { label: "Body Fat", value: record.bodyFat, unit: "%"  },
    ].filter(m => m.value != null);
    return (
        <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-4 hover:bg-neutral-700/20 transition-colors">
                <div className="shrink-0 w-12 text-center bg-neutral-700/50 rounded-lg p-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase">{new Date(record.createdAt).toLocaleDateString("en-US", { month: "short" })}</p>
                    <p className="text-xl font-black text-white leading-none">{new Date(record.createdAt).toLocaleDateString("en-US", { day: "numeric" })}</p>
                    <p className="text-[8px] text-gray-600">{new Date(record.createdAt).getFullYear()}</p>
                </div>
                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xl font-black text-warrior-orange">{record.weight}<span className="text-xs font-normal text-gray-500 ml-1">kg</span></p>
                        {weightChange !== null && (
                            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${weightChange < 0 ? "text-green-400 bg-green-900/20" : weightChange > 0 ? "text-red-400 bg-red-900/20" : "text-gray-400 bg-neutral-700"}`}>
                                {weightChange > 0 ? "+" : ""}{weightChange} kg
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                        {record.bodyFat    && <span className="text-[10px] text-yellow-400 font-bold">{record.bodyFat}% fat</span>}
                        {record.waist      && <span className="text-[10px] text-blue-400 font-bold">{record.waist}cm waist</span>}
                        {record.energyLevel && <span className="text-[10px] text-purple-400 font-bold"><BsFillLightningFill className="inline mb-0.5" size={9}/>{record.energyLevel}/10</span>}
                        {record.mood       && <span className="text-[10px] text-pink-400 font-bold"><MdCheckCircle className="inline mb-0.5" size={10}/>{record.mood}/10</span>}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {record.coachNotes && <span className="w-2 h-2 rounded-full bg-warrior-orange" />}
                    {open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
                </div>
            </button>
            {open && (
                <div className="border-t border-neutral-700 p-4 space-y-3">
                    {measurements.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {measurements.map(({ label, value, unit }) => (
                                <div key={label} className="bg-neutral-900/60 rounded-lg p-2 text-center border border-neutral-700/50">
                                    <p className="text-[8px] font-black uppercase text-gray-600 tracking-wider">{label}</p>
                                    <p className="text-sm font-black text-white">{value}{unit}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {record.notes && <p className="text-xs text-gray-400 italic bg-neutral-900/40 rounded-lg p-3">"{record.notes}"</p>}
                    {record.coachNotes && (
                        <div className="bg-warrior-orange/5 border border-warrior-orange/20 rounded-lg p-3">
                            <p className="text-[9px] font-black uppercase text-warrior-orange tracking-widest mb-1">Coach Feedback</p>
                            <p className="text-xs text-gray-300">{record.coachNotes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const Progress = () => {
    const [records, setRecords]         = useState<ProgressRecord[]>([]);
    const [chartData, setChartData]     = useState<any[]>([]);
    const [summary, setSummary]         = useState<any>(null);
    const [comparison, setComparison]   = useState<any>(null);
    const [loading, setLoading]         = useState(true);
    const [showCompare, setShowCompare] = useState(false);
    const [activeChart, setActiveChart] = useState<"weight" | "measurements" | "weekly" | "radar">("weight");
    const [targetWeight, setTargetWeight] = useState<string>(() => localStorage.getItem("wf_target") || "");
    const [editTarget, setEditTarget]     = useState(false);
    const [tempTarget, setTempTarget]     = useState("");

    const fetchAll = async () => {
        try {
            const [prog, comp, chart, sum] = await Promise.all([
                progressService.getMyProgress(), progressService.getProgressComparison(),
                progressService.getProgressChartData(), progressService.getFitnessSummary(),
            ]);
            setRecords(prog.records || []); setComparison(comp); setSummary(sum);
            if (chart?.labels) {
                setChartData(chart.labels.map((label: string, i: number) => ({
                    date: label, Weight: chart.weight[i], "Body Fat": chart.bodyFat?.[i] ?? null,
                    Waist: chart.waist?.[i] ?? null, Biceps: chart.biceps?.[i] ?? null,
                })));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const streak        = useMemo(() => computeStreak(records), [records]);
    const milestones    = useMemo(() => computeMilestones(records, targetWeight ? parseFloat(targetWeight) : undefined), [records, targetWeight]);
    const weeklySummary = useMemo(() => computeWeeklySummary(records), [records]);
    const earnedCount   = milestones.filter(m => m.earned).length;
    const wChange       = comparison?.comparison?.weight;

    const radarData = useMemo(() => {
        if (!records.length) return [];
        const r = records[0];
        return [
            { subject: "Chest",  value: r.chest  || 0 },
            { subject: "Waist",  value: r.waist  || 0 },
            { subject: "Hips",   value: r.hips   || 0 },
            { subject: "Biceps", value: r.biceps || 0 },
            { subject: "Thighs", value: r.thighs || 0 },
        ];
    }, [records]);

    const saveTarget = () => { setTargetWeight(tempTarget); localStorage.setItem("wf_target", tempTarget); setEditTarget(false); };

    if (loading) return <Spinner />;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10 ">

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 flex-wrap " >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                        <GiProgression className="text-warrior-orange" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                            My <span className="text-warrior-orange">Progress</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{records.length} entries logged</p>
                    </div>
                </div>
                {records.length >= 2 && (
                    <button onClick={() => setShowCompare(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-gray-300 border border-neutral-700 rounded-xl text-[10px] font-black uppercase hover:border-warrior-orange hover:text-warrior-orange transition-all">
                        <MdCompare size={14} /> Before vs After
                    </button>
                )}
            </div>

            {/* SUMMARY STATS */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-warrior-grey border border-neutral-700 border-l-2 border-l-warrior-orange rounded-2xl p-4">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Current Weight</p>
                        <p className="text-2xl font-black text-warrior-orange">{summary.currentWeight}<span className="text-xs font-normal text-gray-500 ml-1">kg</span></p>
                        {wChange && <p className={`text-[10px] font-bold mt-1 ${diffColor(wChange.change, true)}`}>{wChange.change > 0 ? "+" : ""}{wChange.change.toFixed(1)} kg (30d)</p>}
                    </div>
                    <div className="bg-warrior-grey border border-neutral-700 border-l-2 border-l-blue-500 rounded-2xl p-4">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">BMI</p>
                        <p className="text-2xl font-black text-blue-400">{summary.bmi ?? "—"}</p>
                        {summary.bmiCategory && <p className="text-[10px] font-bold text-gray-500 mt-1">{summary.bmiCategory.label}</p>}
                    </div>
                    <div className="bg-warrior-grey border border-neutral-700 border-l-2 border-l-yellow-500 rounded-2xl p-4">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Check-in Streak</p>
                        <div className="flex items-center gap-2">
                            <GiFireBowl className="text-yellow-400" size={20} />
                            <p className="text-2xl font-black text-yellow-400">{streak}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 mt-1">consecutive logs</p>
                    </div>
                    <div className="bg-warrior-grey border border-neutral-700 border-l-2 border-l-green-500 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Target Weight</p>
                            <button onClick={() => { setTempTarget(targetWeight); setEditTarget(true); }} className="text-gray-600 hover:text-warrior-orange transition-colors"><MdFlag size={12} /></button>
                        </div>
                        {editTarget ? (
                            <div className="flex gap-1 mt-1">
                                <input type="number" className="flex-1 bg-neutral-800 border border-neutral-600 text-white text-xs p-1.5 rounded-lg outline-none focus:border-warrior-orange"
                                    value={tempTarget} onChange={e => setTempTarget(e.target.value)} placeholder="e.g. 70" autoFocus />
                                <button onClick={saveTarget} className="px-2 bg-warrior-orange text-white text-[9px] font-black rounded-lg">✓</button>
                                <button onClick={() => setEditTarget(false)} className="px-2 bg-neutral-700 text-gray-400 text-[9px] font-black rounded-lg">✗</button>
                            </div>
                        ) : targetWeight ? (
                            <>
                                <p className="text-2xl font-black text-green-400">{targetWeight}<span className="text-xs font-normal text-gray-500 ml-1">kg</span></p>
                                <p className="text-[10px] font-bold text-gray-500 mt-1">{Math.max(0, parseFloat((summary.currentWeight - parseFloat(targetWeight)).toFixed(1)))} kg to go</p>
                            </>
                        ) : (
                            <button onClick={() => { setTempTarget(""); setEditTarget(true); }} className="text-xs text-gray-600 hover:text-warrior-orange transition-colors mt-2 font-bold block">+ Set a target</button>
                        )}
                    </div>
                </div>
            )}

            {/* 30-DAY COMPARISON */}
            {wChange && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-4">Last 30 Days</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-600/50 ">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Weight Change</p>
                            <p className={`text-2xl font-black ${diffColor(wChange.change, true)}`}>{wChange.change > 0 ? "+" : ""}{wChange.change.toFixed(1)} kg</p>
                            <p className="text-[10px] text-gray-500 mt-1">{wChange.start} kg → {wChange.end} kg <TrendIcon change={wChange.change} inverse /></p>
                        </div>
                        {comparison?.comparison?.bodyFat && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-600/50 ">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Body Fat</p>
                                <p className={`text-2xl font-black ${diffColor(comparison.comparison.bodyFat.change, true)}`}>{comparison.comparison.bodyFat.change > 0 ? "+" : ""}{comparison.comparison.bodyFat.change.toFixed(1)}%</p>
                                <p className="text-[10px] text-gray-500 mt-1">{comparison.comparison.bodyFat.start}% → {comparison.comparison.bodyFat.end}%</p>
                            </div>
                        )}
                        {comparison?.comparison?.waist && (
                            <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-600/50">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Waist</p>
                                <p className={`text-2xl font-black ${diffColor(comparison.comparison.waist.change, true)}`}>{comparison.comparison.waist.change > 0 ? "+" : ""}{comparison.comparison.waist.change.toFixed(1)} cm</p>
                                <p className="text-[10px] text-gray-500 mt-1">{comparison.comparison.waist.start} cm → {comparison.comparison.waist.end} cm</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CHARTS */}
            {chartData.length > 1 && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-6 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Progress Charts</p>
                        <div className="flex gap-1 bg-neutral-800 p-1 rounded-xl flex-wrap">
                            {([{ key: "weight", label: "Weight" }, { key: "measurements", label: "Measurements" }, { key: "weekly", label: "Weekly Avg" }, { key: "radar", label: "Body Shape" }] as const).map(t => (
                                <button key={t.key} onClick={() => setActiveChart(t.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeChart === t.key ? "bg-warrior-orange text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-70">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeChart === "weight" ? (
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {targetWeight && <ReferenceLine y={parseFloat(targetWeight)} stroke="#22c55e" strokeDasharray="4 4" label={{ value: `Goal ${targetWeight} kg`, position: "insideTopRight", fontSize: 10, fill: "#22c55e" }} />}
                                    <Area type="monotone" dataKey="Weight" stroke="#f97316" fill="url(#wg)" strokeWidth={3} dot={{ r: 4, fill: "#f97316" }} connectNulls />
                                </AreaChart>
                            ) : activeChart === "measurements" ? (
                                <AreaChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 11 }} />
                                    <Area type="monotone" dataKey="Waist"    stroke="#60a5fa" fill="none" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Area type="monotone" dataKey="Biceps"   stroke="#34d399" fill="none" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                    <Area type="monotone" dataKey="Body Fat" stroke="#eab308" fill="none" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                                </AreaChart>
                            ) : activeChart === "weekly" ? (
                                <BarChart data={weeklySummary}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="week" stroke="#444" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    {targetWeight && <ReferenceLine y={parseFloat(targetWeight)} stroke="#22c55e" strokeDasharray="4 4" />}
                                    <Bar dataKey="avg" fill="#f97316" radius={[6, 6, 0, 0]} name="Avg Weight (kg)" />
                                </BarChart>
                            ) : (
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#666", fontSize: 10 }} />
                                    <Radar name="Latest (cm)" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.5} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                    {activeChart === "weight" && targetWeight && (
                        <p className="text-[9px] text-gray-600 text-center mt-3">Green dashed line = your target weight of {targetWeight} kg</p>
                    )}
                </div>
            )}

            {/* MILESTONES */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MdEmojiEvents className="text-yellow-400" size={18} />
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Milestones</p>
                    </div>
                    <span className="text-[10px] font-black text-yellow-400 bg-yellow-900/20 border border-yellow-800/40 px-2 py-1 rounded-full">
                        {earnedCount}/{milestones.length} earned
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {milestones.map((m, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            m.earned
                                ? "bg-warrior-orange/5 border-warrior-orange/25"
                                : "bg-neutral-800/30 border-neutral-700/50 opacity-40"
                        }`}>
                            <MilestoneIcon label={m.label} earned={m.earned} />
                            <div className="min-w-0">
                                <p className={`text-xs font-black truncate ${m.earned ? "text-white" : "text-gray-500"}`}>{m.label}</p>
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

            {/* LOG FORM */}
            <LogForm onSuccess={fetchAll} />

            {/* HISTORY */}
            {records.length > 0 ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">
                            History <span className="text-gray-600 normal-case font-normal ml-1">({records.length} entries)</span>
                        </p>
                        {records.length >= 2 && (
                            <button onClick={() => setShowCompare(true)} className="flex items-center gap-1 text-[10px] font-black text-gray-500 hover:text-warrior-orange transition-colors uppercase">
                                <MdCompare size={12} /> Compare Any Two
                            </button>
                        )}
                    </div>
                    {records.map((r, i) => <HistoryEntry key={r._id} record={r} prev={records[i + 1]} />)}
                </div>
            ) : (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-12 text-center">
                    <BsFillLightningFill className="text-gray-600 mx-auto mb-4" size={40} />
                    <p className="text-white font-black italic uppercase text-xl mb-1">No Entries Yet</p>
                    <p className="text-gray-500 text-sm">Open the form above to log your first check-in.</p>
                </div>
            )}

            {/* COMPARE MODAL */}
            {showCompare && records.length >= 2 && <CompareModal records={records} onClose={() => setShowCompare(false)} />}
        </div>
    );
};

export default Progress;