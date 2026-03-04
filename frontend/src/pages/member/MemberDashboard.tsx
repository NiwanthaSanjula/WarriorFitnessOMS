/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { statsService } from "../../services/statsService";
import Spinner from "../../components/ui/Spinner";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
    MdCalendarMonth, MdLocalFireDepartment, MdTrendingUp,
    MdTrendingDown, MdRemove, MdPayment, MdCheckCircle,
    MdAccessTime, MdFitnessCenter, MdStar
} from "react-icons/md";
import {
    GiTrophy, GiMuscleUp, GiProgression, GiLaurelCrown
} from "react-icons/gi";

// ── Helpers ────────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysRemaining = (end: string) =>
    Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

const progressPct = (start: string, end: string) => {
    const total   = new Date(end).getTime() - new Date(start).getTime();
    const elapsed = Date.now()              - new Date(start).getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

// ── Tooltip ────────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-xl shadow-2xl">
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} className="text-sm font-black" style={{ color: p.color }}>
                    {p.value} <span className="text-xs font-normal text-gray-500">{p.name}</span>
                </p>
            ))}
        </div>
    );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, accent }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; accent: string;
}) => (
    <div className={`bg-warrior-grey border border-neutral-700 border-l-3 ${accent} rounded-2xl p-5`}>
        <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
            <span className="text-gray-600">{icon}</span>
        </div>
        <p className="text-3xl font-black text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-2 font-bold">{sub}</p>}
    </div>
);

// ── Greeting ───────────────────────────────────────────────────────────────────
const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const MemberDashboard = () => {
    const { user } = useAuth();
    const [data, setData]       = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        statsService.getMemberDashboard()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Derived chart data ───────────────────────────────────────────────────
    const attendanceMonthlyData = useMemo(() => {
        if (!data?.attendanceHistory) return [];
        const counts: Record<number, number> = {};
        (data.attendanceHistory as any[]).forEach(r => {
            const m = new Date(r.date).getMonth();
            counts[m] = (counts[m] || 0) + 1;
        });
        const now = new Date().getMonth();
        return MONTHS.map((name, i) => ({
            month: name,
            days: counts[i] || 0,
            isCurrent: i === now,
        }));
    }, [data]);

    const weightChartData = useMemo(() => {
        if (!data?.progressRecords?.length) return [];
        return [...data.progressRecords]
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .slice(-10)
            .map((r: any) => ({
                date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                Weight: r.weight,
            }));
    }, [data]);

    if (loading) return <Spinner />;

    // ── Computed values ──────────────────────────────────────────────────────
    const now            = new Date();
    const thisMonth      = now.getMonth();
    const thisYear       = now.getFullYear();

    const attendThisMonth = (data?.attendanceHistory || []).filter((r: any) => {
        const d = new Date(r.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Streak
    let streak = 0;
    if (data?.attendanceHistory?.length) {
        const sorted = [...data.attendanceHistory].sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const today     = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        const last      = new Date(sorted[0].date); last.setHours(0,0,0,0);
        if (last.getTime() === today.getTime() || last.getTime() === yesterday.getTime()) {
            streak = 1;
            for (let i = 1; i < sorted.length; i++) {
                const p = new Date(sorted[i-1].date); p.setHours(0,0,0,0);
                const c = new Date(sorted[i].date);   c.setHours(0,0,0,0);
                if ((p.getTime() - c.getTime()) / 86400000 === 1) streak++; else break;
            }
        }
    }

    const latestWeight   = data?.progressRecords?.[0]?.weight;
    const prevWeight     = data?.progressRecords?.[1]?.weight;
    const weightDelta    = latestWeight && prevWeight
        ? parseFloat((latestWeight - prevWeight).toFixed(1)) : null;

    const sub            = data?.subscription;
    const daysLeft       = sub ? daysRemaining(sub.endDate) : null;
    const pct            = sub ? progressPct(sub.startDate, sub.endDate) : null;
    const urgencyColor   = daysLeft == null ? "" : daysLeft <= 7 ? "text-red-400" : daysLeft <= 14 ? "text-yellow-400" : "text-green-400";
    const barColor       = daysLeft == null ? "" : daysLeft <= 7 ? "from-red-500 to-red-400" : daysLeft <= 14 ? "from-yellow-500 to-yellow-400" : "from-green-500 to-emerald-400";

    const recentPayments: any[] = data?.recentPayments || [];
    const totalPaid: number     = recentPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0);

    // Progress milestones earned
    const records: any[]  = data?.progressRecords || [];
    const totalLost       = records.length >= 2
        ? parseFloat((records[records.length - 1].weight - records[0].weight).toFixed(1)) : 0;
    const milestonesEarned = [
        records.length >= 1,
        records.length >= 5,
        records.length >= 10,
        data?.attendanceHistory?.length >= 10,
        data?.attendanceHistory?.length >= 25,
        streak >= 3,
        totalLost <= -1,
        totalLost <= -5,
    ].filter(Boolean).length;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── WELCOME HEADER ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
                <div className="h-1 bg-linear-to-r from-warrior-orange via-orange-400 to-transparent" />
                <div className="p-6 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-warrior-orange text-white text-2xl font-black flex items-center justify-center uppercase shadow-lg">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{greeting()},</p>
                            <h1 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">
                                {user?.name?.split(" ")[0]} <span className="text-warrior-orange">!</span>
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                    {/* Motivational tag */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-warrior-orange/10 border border-warrior-orange/30 rounded-xl">
                        <GiMuscleUp className="text-warrior-orange" size={18} />
                        <p className="text-xs font-black text-warrior-orange uppercase tracking-wide">
                            {streak >= 7 ? "On fire! 🔥 Keep it up!" :
                             streak >= 3 ? `${streak}-day streak going strong` :
                             attendThisMonth > 0 ? `${attendThisMonth} visits this month` :
                             "Time to hit the gym!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="Visits This Month"
                    value={attendThisMonth}
                    sub={`${data?.attendanceHistory?.length || 0} total this year`}
                    icon={<MdCalendarMonth size={16} />}
                    accent="border-l-green-500"
                />
                <StatCard
                    label="Current Streak"
                    value={streak}
                    sub={streak === 1 ? "consecutive day" : "consecutive days"}
                    icon={<MdLocalFireDepartment size={16} />}
                    accent="border-l-orange-500"
                />
                <StatCard
                    label="Current Weight"
                    value={latestWeight ? `${latestWeight} kg` : "—"}
                    sub={weightDelta !== null
                        ? `${weightDelta > 0 ? "+" : ""}${weightDelta} kg from last entry`
                        : "No entries yet"}
                    icon={weightDelta != null && weightDelta < 0
                        ? <MdTrendingDown size={16} className="text-green-400" />
                        : weightDelta != null && weightDelta > 0
                        ? <MdTrendingUp size={16} className="text-red-400" />
                        : <MdRemove size={16} />}
                    accent="border-l-blue-500"
                />
                <StatCard
                    label="Milestones Earned"
                    value={`${milestonesEarned}/8`}
                    sub="across all activities"
                    icon={<GiTrophy size={16} />}
                    accent="border-l-yellow-500"
                />
            </div>

            {/* ── MEMBERSHIP + ATTENDANCE ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Membership card */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
                    <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <GiTrophy className="text-warrior-orange" size={16} />
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Membership</p>
                        </div>
                        {sub ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-black italic uppercase text-white">{sub.plan?.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{sub.plan?.price?.toLocaleString()} LKR</p>
                                    </div>
                                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-black uppercase ${
                                        sub.status === "active"
                                            ? "text-green-400 bg-green-900/20 border-green-800/40"
                                            : "text-red-400 bg-red-900/20 border-red-800/40"
                                    }`}>
                                        <MdCheckCircle size={10} /> {sub.status}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div>
                                    <div className="flex justify-between mb-1.5">
                                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Plan Progress</p>
                                        <p className={`text-sm font-black ${urgencyColor}`}>
                                            {daysLeft} <span className="text-[10px] font-normal text-gray-500">days left</span>
                                        </p>
                                    </div>
                                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={`h-full bg-linear-to-r ${barColor} rounded-full transition-all duration-700`}
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <p className="text-[9px] text-gray-600">{fmtDate(sub.startDate)}</p>
                                        <p className="text-[9px] text-gray-600">{fmtDate(sub.endDate)}</p>
                                    </div>
                                </div>

                                {daysLeft !== null && daysLeft <= 7 && (
                                    <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-3 flex items-center gap-2">
                                        <MdAccessTime className="text-red-400 shrink-0" size={14} />
                                        <p className="text-[10px] text-red-300 font-bold">
                                            Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}. Contact the gym to renew.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-6 text-center">
                                <GiTrophy className="text-gray-700 mx-auto mb-2" size={28} />
                                <p className="text-gray-500 text-xs">No active membership. Contact the gym.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick attendance summary */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 space-y-4 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center gap-2">
                        <MdCalendarMonth className="text-green-400" size={16} />
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Attendance — This Year</p>
                    </div>

                    {attendanceMonthlyData.some(m => m.days > 0) ? (
                        <div className="h-35">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceMonthlyData} barSize={16}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                    <XAxis dataKey="month" stroke="#333" tick={{ fontSize: 9 }} />
                                    <YAxis stroke="#333" tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="days" radius={[4, 4, 0, 0]} name="days">
                                        {attendanceMonthlyData.map((e, i) => (
                                            <Cell key={i} fill={e.isCurrent ? "#22c55e" : e.days > 0 ? "#f97316" : "#1f1f1f"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-35 flex items-center justify-center">
                            <p className="text-gray-600 text-xs italic">No attendance data yet</p>
                        </div>
                    )}

                    {/* Mini legend chips */}
                    <div className="flex gap-2 flex-wrap ">
                        {attendanceMonthlyData.filter(m => m.days > 0).slice(-4).map(m => (
                            <span key={m.month} className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                m.isCurrent ? "text-green-400 bg-green-900/20 border-green-800/40" : "text-gray-400 bg-neutral-800 border-neutral-700"
                            }`}>{m.month} {m.days}d</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── WEIGHT PROGRESS CHART ── */}
            {weightChartData.length > 1 && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-6 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <GiProgression className="text-warrior-orange" size={16} />
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Weight Trend — Last 10 Entries</p>
                        </div>
                        {weightDelta !== null && (
                            <span className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-xl border ${
                                weightDelta < 0
                                    ? "text-green-400 bg-green-900/20 border-green-800/40"
                                    : weightDelta > 0
                                    ? "text-red-400 bg-red-900/20 border-red-800/40"
                                    : "text-gray-400 bg-neutral-800 border-neutral-700"
                            }`}>
                                {weightDelta > 0 ? <MdTrendingUp size={12} /> : weightDelta < 0 ? <MdTrendingDown size={12} /> : <MdRemove size={12} />}
                                {weightDelta > 0 ? "+" : ""}{weightDelta} kg last change
                            </span>
                        )}
                    </div>
                    <div className="h-50">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weightChartData}>
                                <defs>
                                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}    />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                <XAxis dataKey="date" stroke="#333" tick={{ fontSize: 9 }} />
                                <YAxis stroke="#333" tick={{ fontSize: 9 }} domain={["auto", "auto"]} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="Weight" stroke="#f97316" fill="url(#wg)"
                                    strokeWidth={2.5} dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }} connectNulls
                                    name="kg" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── BOTTOM ROW: Recent Payments + Quick Links ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

                {/* Recent Payments */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center gap-2 mb-4">
                        <MdPayment className="text-warrior-orange" size={16} />
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Recent Payments</p>
                    </div>

                    {recentPayments.length > 0 ? (
                        <div className="space-y-2">
                            {recentPayments.slice(0, 4).map((p: any) => (
                                <div key={p._id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
                                    <div>
                                        <p className="text-xs font-bold text-white">{p.plan?.name || "Plan"}</p>
                                        <p className="text-[9px] text-gray-600 mt-0.5 font-mono">{p.invoinceNo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-warrior-orange">{p.amount?.toLocaleString()} LKR</p>
                                        <p className="text-[9px] text-gray-600 mt-0.5">
                                            {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2 flex justify-between items-center">
                                <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Total paid</p>
                                <p className="text-sm font-black text-warrior-orange">{totalPaid.toLocaleString()} LKR</p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-gray-600 text-xs italic">No payment records found</p>
                        </div>
                    )}
                </div>

                {/* Quick links + achievements */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 space-y-4 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center gap-2">
                        <MdStar className="text-yellow-400" size={16} />
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Achievements Overview</p>
                    </div>

                    {/* Progress towards next milestone */}
                    {[
                        { label: "Gym visits",     current: data?.attendanceHistory?.length || 0, next: 10,  icon: <MdCalendarMonth size={14}/>,      color: "text-green-400",  bar: "bg-green-500"   },
                        { label: "Progress logs",  current: records.length,                       next: 5,   icon: <GiProgression size={14}/>,        color: "text-orange-400", bar: "bg-warrior-orange" },
                        { label: "Streak days",    current: streak,                               next: 7,   icon: <MdLocalFireDepartment size={14}/>, color: "text-red-400",    bar: "bg-red-500"     },
                        { label: "Milestones",     current: milestonesEarned,                     next: 8,   icon: <GiLaurelCrown size={14}/>,        color: "text-yellow-400", bar: "bg-yellow-500"  },
                    ].map(({ label, current, next, icon, color, bar }) => {
                        const pctVal = Math.min(100, Math.round((current / next) * 100));
                        return (
                            <div key={label}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className={color}>{icon}</span>
                                        <p className="text-[10px] font-bold text-gray-400">{label}</p>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300">
                                        {current}<span className="text-gray-600">/{next}</span>
                                    </p>
                                </div>
                                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${bar} rounded-full transition-all duration-700`}
                                        style={{ width: `${pctVal}%` }} />
                                </div>
                            </div>
                        );
                    })}

                    {/* Quick links */}
                    <div className="pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2">
                        {[
                            { label: "My Progress",  path: "/my-progress",         icon: <GiProgression size={14}/>          },
                            { label: "Attendance",   path: "/member/attendance",    icon: <MdCalendarMonth size={14}/>        },
                            { label: "Membership",   path: "/member/membership",    icon: <GiTrophy size={14}/>               },
                            { label: "Workout Plan", path: "/member/workout-plan",  icon: <MdFitnessCenter size={14}/>        },
                        ].map(({ label, path, icon }) => (
                            <a key={label} href={path}
                                className="flex items-center gap-2 px-3 py-2 bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-700 hover:border-warrior-orange/40 rounded-xl text-[10px] font-black text-gray-400 hover:text-warrior-orange transition-all uppercase">
                                <span className="text-warrior-orange">{icon}</span>{label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;