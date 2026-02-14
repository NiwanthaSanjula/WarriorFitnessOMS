
import { useAuth } from '../context/AuthContext'
import AdminDashboard from './admin/AdminDashboard';
import CoachDashboard from './coach/CoachDashboard';
import MemberDashboard from './member/MemberDashboard';

const Dashboard = () => {

    const { user } = useAuth();

    //  Switch based on the role stored in AuthContext
    switch (user?.role) {
        case 'admin':
            return <AdminDashboard/>;
        case 'coach' :
            return <CoachDashboard/>;
        case 'member':
            return <MemberDashboard/>
        default:
            return <div className='text-gray-300'>Loading..</div>
    }
}

export default Dashboard
