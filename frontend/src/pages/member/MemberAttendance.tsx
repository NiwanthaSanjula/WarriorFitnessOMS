/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { attendanceService } from "../../services/attendanceService";
import Spinner from "../../components/ui/Spinner";
import { AttendanceCalener } from "../../components/userDetails/AttendanceCalendar";
import {
    MdCalendarMonth, MdLocalFireDepartment, MdTrendingUp,
    MdEmojiEvents, MdStar, MdVerified, MdBolt, MdDateRange,
    MdAutoAwesome
} from "react-icons/md";
import { GiBoxingGlove, GiPunchingBag, GiMuscleUp, GiTrophy, GiLaurelCrown } from "react-icons/gi";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
    _id: string;
    date: string;
    status: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const computeStats = (history: AttendanceRecord[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    const thisMonthCount = history.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const monthlyCounts: Record<number, number> = {};
    history.forEach(r => {
        const m = new Date(r.date).getMonth();
        monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;
    });

    const bestMonthIdx = Object.entries(monthlyCounts).sort((a, b) => b[1] - a[1])[0];
    const bestMonth      = bestMonthIdx ? MONTHS[parseInt(bestMonthIdx[0])] : "—";
    const bestMonthCount = bestMonthIdx ? Number(bestMonthIdx[1]) : 0;

    const sorted = [...history].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    if (sorted.length > 0) {
        const today     = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        const lastDate  = new Date(sorted[0].date); lastDate.setHours(0,0,0,0);
        if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
            streak = 1;
            for (let i = 1; i < sorted.length; i++) {
                const prev = new Date(sorted[i - 1].date); prev.setHours(0,0,0,0);
                const curr = new Date(sorted[i].date);     curr.setHours(0,0,0,0);
                const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) streak++; else break;
            }
        }
    }

    const monthlyData = MONTHS.map((name, i) => ({
        month: name,
        days: monthlyCounts[i] || 0,
        isCurrent: i === thisMonth,
    }));

    const daysPassed  = now.getDate();
    const consistency = daysPassed > 0 ? Math.round((thisMonthCount / daysPassed) * 100) : 0;

    return { thisMonthCount, bestMonth, bestMonthCount, streak, monthlyData, consistency };
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-xl shadow-2xl">
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</p>
            <p className="text-sm font-black text-warrior-orange">
                {payload[0].value} <span className="text-xs font-normal text-gray-500">days</span>
            </p>
        </div>
    );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; color: string;
}) => (
    <div className={`bg-warrior-grey border border-neutral-700 border-l-4 ${color} rounded-2xl p-4`}>
        <div className="flex items-start justify-between mb-2">
            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
            <span className="text-gray-600">{icon}</span>
        </div>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-1 font-bold">{sub}</p>}
    </div>
);

// ── Badge Icon ─────────────────────────────────────────────────────────────────
const BadgeIcon = ({ icon: Icon, earned }: { icon: React.ElementType; earned: boolean }) => (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
        earned
            ? "bg-green-900/20 border-green-700/40"
            : "bg-neutral-800/60 border-neutral-700/40"
    }`}>
        <Icon size={20} className={earned ? "text-green-400" : "text-gray-600"} />
    </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const MemberAttendance = () => {
    const [history, setHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await attendanceService.getMyAttendance();
                setHistory(data || []);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load attendance");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => computeStats(history), [history]);

    const badges = [
        { icon: GiPunchingBag,       label: "First Visit",    desc: "First check-in recorded",    earned: history.length >= 1           },
        { icon: GiMuscleUp,          label: "10 Visits",      desc: "10 gym visits this year",     earned: history.length >= 10          },
        { icon: GiTrophy,            label: "25 Visits",      desc: "25 gym visits this year",     earned: history.length >= 25          },
        { icon: GiLaurelCrown,       label: "50 Visits",      desc: "50 gym visits this year",     earned: history.length >= 50          },
        { icon: MdLocalFireDepartment, label: "3-Day Streak", desc: "3 consecutive gym days",      earned: stats.streak >= 3             },
        { icon: MdBolt,              label: "7-Day Streak",   desc: "7 consecutive gym days",      earned: stats.streak >= 7             },
        { icon: MdDateRange,         label: "10 This Month",  desc: "10 days in a single month",   earned: stats.thisMonthCount >= 10    },
        { icon: MdAutoAwesome,       label: "Perfect Month",  desc: "20+ days in a single month",  earned: stats.bestMonthCount >= 20    },
    ];
    const earnedCount = badges.filter(b => b.earned).length;

    if (loading) return <Spinner />;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                    <MdCalendarMonth className="text-warrior-orange" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        My <span className="text-warrior-orange">Attendance</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        {new Date().getFullYear()} · {history.length} total visits
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="This Month"
                    value={stats.thisMonthCount}
                    sub="days attended"
                    icon={<MdCalendarMonth size={16} />}
                    color="border-l-green-500"
                />
                <StatCard
                    label="Current Streak"
                    value={stats.streak}
                    sub={stats.streak === 1 ? "consecutive day" : "consecutive days"}
                    icon={<MdLocalFireDepartment size={16} />}
                    color="border-l-orange-500"
                />
                <StatCard
                    label="Consistency"
                    value={`${stats.consistency}%`}
                    sub="of days this month"
                    icon={<MdTrendingUp size={16} />}
                    color="border-l-blue-500"
                />
                <StatCard
                    label="Best Month"
                    value={stats.bestMonth}
                    sub={stats.bestMonthCount ? `${stats.bestMonthCount} days` : "no data yet"}
                    icon={<MdStar size={16} />}
                    color="border-l-yellow-500"
                />
            </div>

            {/* ── YEARLY OVERVIEW BAR CHART ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-6 border-l-3 border-l-warrior-orange">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Monthly Overview</p>
                        <p className="text-xs text-gray-600 mt-0.5">{new Date().getFullYear()} attendance per month</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Current month</p>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="h-50 flex items-center justify-center">
                        <div className="text-center">
                            <GiBoxingGlove className="text-gray-700 mx-auto mb-3" size={36} />
                            <p className="text-gray-500 text-sm">No attendance data yet.</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-55">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyData} barSize={24}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="month" stroke="#444" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#444" tick={{ fontSize: 10 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                <Bar dataKey="days" radius={[5, 5, 0, 0]} name="Days">
                                    {stats.monthlyData.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={entry.isCurrent ? "#22c55e" : entry.days > 0 ? "#f97316" : "#262626"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Month summary chips */}
                <div className="mt-4 pt-4 border-t border-neutral-700/50 flex flex-wrap gap-2">
                    {stats.monthlyData.filter(m => m.days > 0).map(m => (
                        <div key={m.month} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black ${
                            m.isCurrent
                                ? "bg-green-900/20 border-green-800/40 text-green-400"
                                : "bg-neutral-800 border-neutral-700 text-gray-400"
                        }`}>
                            {m.month} <span className="font-normal">{m.days}d</span>
                        </div>
                    ))}
                    {stats.monthlyData.every(m => m.days === 0) && (
                        <p className="text-xs text-gray-600 italic">No visits recorded this year</p>
                    )}
                </div>
            </div>

            {/* ── ATTENDANCE BADGES ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MdEmojiEvents className="text-green-400" size={18} />
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Attendance Badges</p>
                    </div>
                    <span className="text-[10px] font-black text-green-400 bg-green-900/20 border border-green-800/40 px-2 py-1 rounded-full">
                        {earnedCount}/{badges.length} earned
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {badges.map((b, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            b.earned
                                ? "bg-green-900/10 border-green-800/30"
                                : "bg-neutral-800/30 border-neutral-700/50 opacity-40"
                        }`}>
                            <BadgeIcon icon={b.icon} earned={b.earned} />
                            <div className="min-w-0">
                                <p className={`text-xs font-black truncate ${b.earned ? "text-white" : "text-gray-500"}`}>
                                    {b.label}
                                </p>
                                <p className="text-[9px] text-gray-600 truncate">{b.desc}</p>
                                {b.earned && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <MdVerified size={10} className="text-green-400" />
                                        <p className="text-[9px] text-green-400 font-bold">Earned</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CALENDAR ── */}
            <AttendanceCalener history={history} />

        </div>
    );
};

export default MemberAttendance;