/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { statsService } from '../../services/statsService';
import Spinner from '../../components/ui/Spinner';
import { MdArrowForward, MdFitnessCenter, MdPayment, MdPeople, MdPerson, MdReceipt, MdWarning, MdTrendingUp } from 'react-icons/md';
import { GiMuscleUp, GiTrophy, GiWeightLiftingUp } from 'react-icons/gi';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#f97316', '#22c55e', '#ef4444', '#a855f7'];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({
    title, value, icon: Icon, accent, sub
}: {
    title: string; value: string | number; icon: any;
    accent: 'orange' | 'green' | 'blue' | 'yellow'; sub?: string;
}) => {
    const accentMap = {
        orange: { border: 'border-l-warrior-orange', icon: 'text-warrior-orange bg-warrior-orange/10 border-warrior-orange/20', text: 'text-warrior-orange' },
        green:  { border: 'border-l-green-500',       icon: 'text-green-400 bg-green-900/20 border-green-800/30',               text: 'text-green-400'      },
        blue:   { border: 'border-l-blue-500',         icon: 'text-blue-400 bg-blue-900/20 border-blue-800/30',                  text: 'text-blue-400'       },
        yellow: { border: 'border-l-yellow-500',       icon: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',            text: 'text-yellow-400'     },
    };
    const a = accentMap[accent];
    return (
        <div className={`bg-warrior-grey border border-neutral-700 border-l-4 ${a.border} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${a.icon}`}>
                <Icon size={22} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{title}</p>
                <p className={`text-2xl font-black italic truncate ${a.text}`}>{value}</p>
                {sub && <p className="text-[10px] text-gray-600 font-bold mt-0.5">{sub}</p>}
            </div>
        </div>
    );
};

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, children, action }: {
    title: string; icon: React.ReactNode;
    children: React.ReactNode; action?: React.ReactNode;
}) => (
    <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <span className="text-warrior-orange">{icon}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statsService.getAdminDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch Dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Spinner />;

    // ── Revenue chart data ──
    const currentMonth = new Date().getMonth();
    const last12Months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(currentMonth - (11 - i));
        return { monthNum: d.getMonth() + 1, year: d.getFullYear(), name: MONTHS[d.getMonth()] };
    });
    const chartData = last12Months.map(m => {
        const found = stats.revenueHistory.find((item: any) => item._id.month === m.monthNum && item._id.year === m.year);
        return { name: m.name, revenue: found ? found.total : 0 };
    });

    // ── Attendance chart data ──
    const last7days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date();
        day.setDate(day.getDate() - (6 - i));
        return {
            fullDate: day.toISOString().split('T')[0],
            label: day.toLocaleDateString('default', { weekday: 'short' }),
        };
    });
    const attendanceChartData = last7days.map(d => {
        const found = stats.attendanceTrends.find((item: any) => item._id === d.fullDate);
        return { name: d.label, count: found ? found.count : 0 };
    });

    const pendingCount = stats.memberStatusDistribution.find((s: any) => s._id === 'pending-payment')?.count || 0;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">

            {/* ── PAGE HEADER ── */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center shrink-0">
                    <GiWeightLiftingUp className="text-warrior-orange" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                        Admin <span className="text-warrior-orange">Dashboard</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                        Warrior Gym — Control Center
                    </p>
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Members"    value={stats.totalMembers}                  icon={MdPeople}       accent="orange" />
                <KpiCard title="Active Coaches"   value={stats.coachWorklooad.length}         icon={MdFitnessCenter} accent="green" />
                <KpiCard title="30-Day Revenue"   value={`${stats.recentRevenue.toLocaleString()} LKR`} icon={MdPayment} accent="blue" />
                <KpiCard title="Pending Payments" value={pendingCount}                        icon={MdWarning}      accent="yellow" />
            </div>

            {/* ── CHARTS ROW 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Area Chart */}
                <div className="lg:col-span-2 bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <MdTrendingUp className="text-warrior-orange" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Revenue Trend — Last 12 Months</p>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v / 1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Member Status Donut */}
                <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <GiMuscleUp className="text-warrior-orange" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member Pulse</p>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.memberStatusDistribution} cx="50%" cy="50%"
                                    innerRadius={48} outerRadius={75} paddingAngle={4}
                                    dataKey="count" nameKey="_id">
                                    {stats.memberStatusDistribution.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '10px', fontSize: '11px' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── CHARTS ROW 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Attendance Bar Chart */}
                <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <GiTrophy className="text-warrior-orange" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Attendance — Last 7 Days</p>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="#555" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#222' }} contentStyle={{ backgroundColor: '#171717', borderColor: '#333', borderRadius: '10px', fontSize: '11px' }} />
                                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Coach Load */}
                <div className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <MdFitnessCenter className="text-warrior-orange" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Coach Student Load</p>
                    </div>
                    <div className="space-y-3">
                        {stats.coachWorklooad.map((coach: any, i: number) => {
                            const maxCount = Math.max(...stats.coachWorklooad.map((c: any) => c.studentCount), 1);
                            const pct = Math.round((coach.studentCount / maxCount) * 100);
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-black italic uppercase text-gray-300 truncate max-w-[60%]">{coach._id}</span>
                                        <span className="text-[10px] font-black text-warrior-orange">{coach.studentCount} warriors</span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-warrior-orange rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── RECENT ACTIVITY ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* New Warriors */}
                <SectionCard
                    title="New Warriors"
                    icon={<MdPerson size={15} />}
                    action={
                        <Link to="/admin/members" className="flex items-center gap-1 text-[10px] font-black uppercase text-warrior-orange hover:underline">
                            View All <MdArrowForward size={12} />
                        </Link>
                    }
                >
                    <div className="space-y-1">
                        {stats.recentUsers.map((u: any) => (
                            <div key={u._id} className="flex items-center justify-between py-2.5 border-b border-neutral-800 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center text-warrior-orange font-black text-xs shrink-0 uppercase">
                                        {u.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black italic uppercase text-gray-200 truncate">{u.name}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ml-2 ${
                                    u.status === 'active'
                                        ? 'text-green-400 bg-green-900/20 border-green-800/40'
                                        : 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40'
                                }`}>
                                    {u.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Recent Income */}
                <SectionCard
                    title="Recent Income"
                    icon={<MdReceipt size={15} />}
                    action={
                        <Link to="/admin/payments-history" className="flex items-center gap-1 text-[10px] font-black uppercase text-warrior-orange hover:underline">
                            Reports <MdArrowForward size={12} />
                        </Link>
                    }
                >
                    <div className="space-y-1">
                        {stats.recentPayments.map((p: any) => (
                            <div key={p._id} className="flex items-center justify-between py-2.5 border-b border-neutral-800 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-warrior-orange font-black text-xs shrink-0 uppercase">
                                        {p.member?.name?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-black italic uppercase text-gray-200 truncate">{p.member?.name || 'Member'}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">{p.invoinceNo}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <p className="text-sm font-black text-white">{p.amount.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase">LKR · {new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default AdminDashboard;