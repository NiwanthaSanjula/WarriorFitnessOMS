import { MdEventAvailable, MdTimer, MdTrendingUp } from "react-icons/md"
import { StatCard } from "../../components/ui/StatCard"

const MemberDashboard = () => {
  return (
    <div className='space-y-8 h-[200vh]'>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Gym Days This Month"
            value="18"
            icon={MdEventAvailable}
            trend="+2 from last month"
            variant="orange"
          />

          <StatCard
            title="Session Completed"
            value="14"
            icon={MdTimer}
            variant="red"
          />

          <StatCard
            title="Current Goal"
            value="80%"
            icon={MdTrendingUp}
            variant="gray"
          />
      </div>
      
    </div>
  )
}

export default MemberDashboard
