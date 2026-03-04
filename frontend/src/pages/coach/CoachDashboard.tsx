/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { statsService } from "../../services/statsService";
import Spinner from "../../components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
    MdPeople, MdFitnessCenter, MdLocalFireDepartment,
    MdTrendingDown, MdTrendingUp, MdRemove, MdCheckCircle,
    MdStar, MdCalendarToday, MdArrowForward
} from "react-icons/md";
import {
    GiWeightLiftingUp, GiMuscleUp, GiProgression
} from "react-icons/gi";
import { assets } from "../../assets/assets";

// ── Helpers ────────────────────────────────────────────────────────────────────
const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
};

const ChartTip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-xl shadow-2xl">
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} className="text-sm font-black text-warrior-orange">
                    {p.value} <span className="text-xs font-normal text-gray-500">{p.name}</span>
                </p>
            ))}
        </div>
    );
};

const StatCard = ({ label, value, sub, icon, accent }: {
    label: string; value: string | number; sub?: string;
    icon: React.ReactNode; accent: string;
}) => (
    <div className={`bg-warrior-grey border border-neutral-700 border-l-4 ${accent} rounded-2xl p-5`}>
        <div className="flex items-start justify-between mb-3">
            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
            <span className="text-gray-600">{icon}</span>
        </div>
        <p className="text-3xl font-black text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-500 mt-2 font-bold">{sub}</p>}
    </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
const CoachDashboard = () => {
    const { user }      = useAuth();
    const navigate      = useNavigate();
    const [data, setData]       = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        statsService.getCoachDashboard()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Attendance chart: last 7 days check-in counts across all clients ──────
    const attendanceChart = useMemo(() => {
        if (!data?.recentCheckIns) return [];
        const counts: Record<string, number> = {};
        (data.recentCheckIns as any[]).forEach(r => {
            const key = new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([day, count]) => ({ day, count }));
    }, [data]);

    // ── Weight delta per client ────────────────────────────────────────────────
    const clientWeightData = useMemo(() => {
        if (!data?.clientProgress) return [];
        return (data.clientProgress as any[])
            .filter((c: any) => c.latestWeight != null)
            .map((c: any) => ({
                name:   c.name.split(" ")[0],
                weight: c.latestWeight,
                delta:  c.weightDelta,
            }))
            .slice(0, 8);
    }, [data]);

    if (loading) return <Spinner />;

    const totalClients  = data?.totalClients  || 0;
    const activeClients = data?.activeClients || 0;
    const noPlanClients = data?.noPlanClients || 0;
    const workoutPlans  = data?.workoutPlanCount || 0;
    const nutritionPlans= data?.nutritionPlanCount || 0;
    const recentClients: any[] = data?.recentClients || [];
    const clientProgress: any[] = data?.clientProgress || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
                <div className="p-6 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-warrior-orange text-white text-2xl font-black flex items-center justify-center uppercase shadow-lg">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{greeting()},</p>
                            <h1 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">
                                Coach <span className="text-warrior-orange">{user?.name?.split(" ")[0]}</span>
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-warrior-orange/20 border border-warrior-orange/30 rounded-xl">
                        <GiMuscleUp className="text-warrior-orange" size={18} />
                        <p className="text-xs font-black text-warrior-orange uppercase tracking-wide">
                            {totalClients} warrior{totalClients !== 1 ? "s" : ""} under your wing
                        </p>
                    </div>
                </div>
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                    label="Total Clients"
                    value={totalClients}
                    sub={`${activeClients} active`}
                    icon={<MdPeople size={16} />}
                    accent="border-l-blue-500"
                />
                <StatCard
                    label="Need a Plan"
                    value={noPlanClients}
                    sub="no active subscription"
                    icon={<MdLocalFireDepartment size={16} />}
                    accent={noPlanClients > 0 ? "border-l-red-500" : "border-l-green-500"}
                />
                <StatCard
                    label="Workout Plans"
                    value={workoutPlans}
                    sub="created by you"
                    icon={<GiWeightLiftingUp size={16} />}
                    accent="border-l-warrior-orange"
                />
                <StatCard
                    label="Nutrition Plans"
                    value={nutritionPlans}
                    sub="created by you"
                    icon={<MdFitnessCenter size={16} />}
                    accent="border-l-amber-500"
                />
            </div>

            {/* ── ATTENDANCE CHART + RECENT CLIENTS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 7-day attendance bar chart */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center gap-2 mb-5">
                        <MdCalendarToday className="text-blue-400" size={15} />
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Client Check-ins — Last 7 Days</p>
                    </div>
                    {attendanceChart.length > 0 ? (
                        <div className="h-45">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceChart} barSize={20}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                    <XAxis dataKey="day" stroke="#333" tick={{ fontSize: 9 }} />
                                    <YAxis stroke="#333" tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                                    <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="check-ins">
                                        {attendanceChart.map((_: any, i: number) => (
                                            <Cell key={i} fill="#ff6600" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-45 flex items-center justify-center">
                            <p className="text-gray-600 text-xs italic">No check-ins recorded yet</p>
                        </div>
                    )}
                </div>

                {/* Recently active clients */}
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MdPeople className="text-blue-400" size={15} />
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Recent Clients</p>
                        </div>
                        <button onClick={() => navigate("/coach/my-clients")}
                            className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-500 hover:text-blue-400 transition-colors">
                            View All <MdArrowForward size={11} />
                        </button>
                    </div>
                    {recentClients.length > 0 ? (
                        <div className="space-y-2">
                            {recentClients.slice(0, 5).map((c: any) => (
                                <div key={c._id}
                                    onClick={() => navigate(`/coach/members/${c._id}`)}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-800/60 transition-colors cursor-pointer group">
                                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0">
                                        <img src={assets.dpPlaceholder} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black italic uppercase text-white truncate">{c.name}</p>
                                        <p className="text-[9px] text-gray-600 truncate">{c.email}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border ${
                                        c.status === "active"
                                            ? "text-green-400 bg-green-900/20 border-green-800/40"
                                            : "text-yellow-400 bg-yellow-900/20 border-yellow-800/40"
                                    }`}>{c.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-600 text-xs italic">No clients assigned yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CLIENT WEIGHT SNAPSHOT ── */}
            {clientWeightData.length > 0 && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-6 border-l-3 border-l-warrior-orange">
                    <div className="flex items-center gap-2 mb-5">
                        <GiProgression className="text-warrior-orange" size={15} />
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Client Weight Snapshot</p>
                        <span className="text-[9px] text-gray-600 font-normal ml-1">(latest logged entry)</span>
                    </div>
                    <div className="h-50">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clientWeightData} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                <XAxis dataKey="name" stroke="#333" tick={{ fontSize: 10 }} />
                                <YAxis stroke="#333" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                                <Bar dataKey="weight" radius={[5, 5, 0, 0]} name="kg">
                                    {clientWeightData.map((e: any, i: number) => (
                                        <Cell key={i}
                                            fill={e.delta < 0 ? "#22c55e" : e.delta > 0 ? "#ef4444" : "#f97316"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                        {[{ color: "bg-green-500", label: "Weight dropped" },
                          { color: "bg-red-500",   label: "Weight gained"  },
                          { color: "bg-warrior-orange", label: "No change / first entry" }].map(l => (
                            <div key={l.label} className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                                <p className="text-[9px] text-gray-500 font-bold">{l.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── CLIENT PROGRESS TABLE ── */}
            {clientProgress.length > 0 && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
                    <div className="p-5 border-b border-neutral-800 flex items-center gap-2">
                        <MdStar className="text-yellow-400" size={15} />
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">All Clients — Progress Summary</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-800/30 text-[9px] font-black uppercase text-gray-500 tracking-widest">
                                <tr>
                                    <th className="px-5 py-3">Client</th>
                                    <th className="px-5 py-3">Latest Weight</th>
                                    <th className="px-5 py-3">Change</th>
                                    <th className="px-5 py-3">Progress Logs</th>
                                    <th className="px-5 py-3">Attendance</th>
                                    <th className="px-5 py-3">Plan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {clientProgress.map((c: any) => (
                                    <tr key={c._id}
                                        onClick={() => navigate(`/coach/members/${c._id}`)}
                                        className="hover:bg-white/2 transition-colors cursor-pointer">
                                        <td className="px-5 py-3">
                                            <p className="text-xs font-black italic uppercase text-white">{c.name}</p>
                                            <p className="text-[9px] text-gray-600">{c.email}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            {c.latestWeight
                                                ? <p className="text-sm font-black text-warrior-orange">{c.latestWeight} <span className="text-[9px] font-normal text-gray-500">kg</span></p>
                                                : <p className="text-xs text-gray-600 italic">No data</p>}
                                        </td>
                                        <td className="px-5 py-3">
                                            {c.weightDelta != null ? (
                                                <span className={`flex items-center gap-1 text-xs font-black ${
                                                    c.weightDelta < 0 ? "text-green-400" :
                                                    c.weightDelta > 0 ? "text-red-400" : "text-gray-400"
                                                }`}>
                                                    {c.weightDelta < 0 ? <MdTrendingDown size={12}/> :
                                                     c.weightDelta > 0 ? <MdTrendingUp size={12}/> : <MdRemove size={12}/>}
                                                    {c.weightDelta > 0 ? "+" : ""}{c.weightDelta} kg
                                                </span>
                                            ) : <span className="text-[9px] text-gray-600">—</span>}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs font-bold text-gray-300">{c.progressCount ?? 0}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs font-bold text-gray-300">{c.attendanceCount ?? 0} <span className="text-[9px] font-normal text-gray-600">this month</span></span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {c.planName
                                                ? <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border text-warrior-orange bg-warrior-orange/10 border-warrior-orange/20">{c.planName}</span>
                                                : <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border text-red-400 bg-red-900/10 border-red-800/30">No Plan</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "My Clients",      path: "/coach/my-clients",         icon: <MdPeople size={16}/>          },
                    { label: "Workout Plans",   path: "/coach/plans/workout",       icon: <GiWeightLiftingUp size={16}/> },
                    { label: "Nutrition Plans", path: "/coach/plans/nutrition",     icon: <MdFitnessCenter size={16}/>   },
                    { label: "My Profile",      path: "/profile",                   icon: <MdStar size={16}/>            },
                ].map(({ label, path, icon }) => (
                    <button key={label} onClick={() => navigate(path)}
                        className="flex items-center gap-3 px-4 py-3 bg-warrior-grey border border-neutral-700 hover:border-border-l-3 border-l-warrior-orange/40 hover:bg-warrior-orange/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-warrior-orange transition-all uppercase">
                        <span className="text-warrior-orange">{icon}</span>{label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CoachDashboard;