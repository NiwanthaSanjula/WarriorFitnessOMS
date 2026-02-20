import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext"
import AdminProfile from "./admin/AdminProfile";
import CoachProfile from "./coach/CoachProfile";
import MemberProfile from "./member/MemberProfile";

const Profile = () => {
    const { user } = useAuth();

    switch(user?.role) {
        case 'admin' :
            return <AdminProfile/>
        case 'coach' :
            return <CoachProfile/>
        case 'member' :
            return <MemberProfile/>
        default :
        return <div className='flex flex-col items-center justify-center text-gray-300 p-10'><Spinner/>Loading Profile...</div>;
            
    }
}

export default Profile