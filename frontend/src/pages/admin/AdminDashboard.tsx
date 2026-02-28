/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { statsService } from '../../services/statsService';
import Spinner from '../../components/ui/Spinner';
import { StatCard } from '../../components/ui/StatCard';
import { MdArrowForward, MdFitnessCenter, MdPayment, MdPeople, MdPerson, MdReceipt, MdWarning } from 'react-icons/md';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';



const COLORS = ['#f97316', '#22c55e', '#ef4444', '#a855f7']

// Helper to get month names
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AdminDashboard = () => {

  const [stats, setStats] = useState<any>(null);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getAdminDashboardStats();
        setStats(data);
        console.log(data);

      } catch (error) {
        console.log("Failed to fetch Dashboard : ", error);
      } finally {
        setloading(false)
      }
    };
    fetchStats()
  }, [])

  if (loading) return <Spinner />



  //  Genarate an array for the last 12 months----------------------------------------------------------------------------
  const currentMonth = new Date().getMonth(); // 0-11
  const last12Months = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(currentMonth - i);

    last12Months.push({
      monthNum: d.getMonth() + 1,
      year: d.getFullYear(),
      name: MONTHS[d.getMonth()]
    });
  }

  //  Map backend stats into this full 12 months array
  const chartData = last12Months.map(m => {
    const found = stats.revenueHistory.find((item: any) => item._id.month === m.monthNum && item._id.year === m.year);

    return {
      name: m.name,
      revenue: found ? found.total : 0 // Default to 0 if no data
    }
  })


  //  Attendance chart fromatting-----------------------------------------------------------------------------------------------
  const last7days = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dateStr = day.toISOString().split('T')[0];  //Format: YYYY-MM-DD
    last7days.push({
      fullDate: dateStr,
      label: day.toLocaleDateString('default', { weekday: 'short' })  // e.g."MON"
    });
  };

  const attendanceChartData = last7days.map(d => {
    const found = stats.attendanceTrends.find((item: any) => item._id === d.fullDate);
    return { name: d.label, count: found ? found.count : 0 }

  })



  return (
    <div className='space-y-6 max-w-6xl mx-auto pb-10'>
      <h2 className="text-lg md:text-2xl font-bold italic text-gray-300 uppercase" >
        Dashboard
      </h2>

      {/* KPI CARDS */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          title='Total Members'
          value={stats.totalMembers}
          icon={MdPeople}
          variant='orange'
        />
        <StatCard
          title='Active Coaches'
          value={stats.coachWorklooad.length}
          icon={MdFitnessCenter}
          variant='green'
        />
        <StatCard
          title='30-Day Revenue'
          value={`${stats.recentRevenue.toLocaleString()} LKR`}
          icon={MdPayment}
          variant='blue'
        />
        <StatCard
          title='Pending-Payments'
          value={stats.memberStatusDistribution.find((s: any) => s._id === 'pending-payment')?.count || 0}
          icon={MdWarning}
          variant='yellow'
        />
      </div>

      {/* CHARTS */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

        {/* Revenue Trends */}
        <div className='lg:col-span-2 bg-warrior-grey p-6 rounded-2xl border border-neutral-700'>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 text-center lg:text-left">
            Revenue Trend (Last 12 Months)
          </h3>

          <div className='h-80'>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id='colorRev' x1="0" y1="0" y2="1">
                    <stop offset="5%" stopColor='#f97316' stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke='#444' vertical={false} />
                <XAxis dataKey="name" stroke='#666' fontSize={12} tickLine={false} />
                <YAxis stroke='#666' fontSize={12} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-700">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 text-center lg:text-left">
            Member Pulse
          </h3>

          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%" >
              <PieChart>
                <Pie
                  data={stats.memberStatusDistribution}
                  cx="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {
                    stats.memberStatusDistribution.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke='none' />
                    ))
                  }
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
              </PieChart>

            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ATTENDANCE & RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Bar Graph */}
        <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-700">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Attendance (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />

                <XAxis dataKey="name" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke='#666' fontSize={12} allowDecimals={false}/>
                <Tooltip cursor={{ fill: '#222' }} contentStyle={{ backgroundColor: '#171717', borderColor: '#333' }} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coach Load (Doughnut) */}
        <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-700">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Coach Student Distribution</h3>
          <div className="space-y-4">
            {stats.coachWorklooad.map((coach: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-sm text-gray-300 font-bold">{coach._id}</span>
                <span className="text-xs bg-warrior-orange/20 text-warrior-orange px-3 py-1 rounded-full font-black">
                  {coach.studentCount} Warriors
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Members */}
        <div className="bg-warrior-grey rounded-2xl border border-neutral-700 overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <MdPerson className="text-warrior-orange" size={18} /> New Warriors
            </h3>
            <Link to="/admin/members" className="text-[10px] font-bold text-warrior-orange hover:underline flex items-center gap-1">
              VIEW ALL <MdArrowForward />
            </Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {stats.recentUsers.map((u: any) => (
              <div key={u._id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition-all">
                <div>
                  <p className="text-sm font-bold text-gray-200">{u.name}</p>
                  <p className="text-[10px] text-gray-500">{u.email}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-warrior-grey rounded-2xl border border-neutral-700 overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <MdReceipt className="text-warrior-orange" size={18} /> Recent Income
            </h3>
            <Link to="/admin/payments" className="text-[10px] font-bold text-warrior-orange hover:underline flex items-center gap-1">
              REPORTS <MdArrowForward />
            </Link>
          </div>
          <div className="divide-y divide-neutral-800">
            {stats.recentPayments.map((p: any) => (
              <div key={p._id} className="p-4 flex items-center justify-between hover:bg-neutral-800/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-warrior-orange font-bold text-xs">
                    {p.member?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{p.member?.name || "Member"}</p>
                    <p className="text-[10px] text-gray-500">{p.invoinceNo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{p.amount.toLocaleString()} LKR</p>
                  <p className="text-[9px] text-gray-500 uppercase">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



    </div>
  )
}

export default AdminDashboard
