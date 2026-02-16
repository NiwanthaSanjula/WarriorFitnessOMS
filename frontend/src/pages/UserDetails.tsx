/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { userService } from "../services/userService";
import { MdArrowBack } from "react-icons/md";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext"
;
import { ProfileHeader } from "../components/userDetails/ProfileHeader";
import { UserInfoCard } from "../components/userDetails/UserInfoCard";
import { AttendanceCalener } from "../components/userDetails/AttendanceCalendar";
import { AssignCoachModel } from "../components/userDetails/AssignCoachModel";



const UserDetails = () => {

    const { user: loggedInUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{id: string }>();

    const [data, setData] = useState<any | null>(null) // Contain user, attendanceHistory, coaches...
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState("");

    const fetchUser = async () => {
        if (!id) return

        try {
            const userData = await userService.getUserById(id);
            setData(userData);
            console.log(userData);
        } catch (error) {
            console.log("Failed to fetch user!",error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
      fetchUser();
    }, [id])

    const handleAssignCoach = async () => {
        if (!selectedCoach || !id) return;

        try {
            await userService.assignCoach(id, selectedCoach);
            await fetchUser();
            setIsModalOpen(false);
            alert("Coach assigned successfully!")

        } catch (error) {
            alert("Failed to assign coach.Please try again")
            console.log(error);            
        }
    }

    if (loading) return <Spinner/>
    if (!data) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Member not found..</div>

    const { user, attendanceHistory, coaches } = data.data

    const isViewinMember = user.role === 'member';
    const isAdmin = loggedInUser?.role === 'admin';
    //console.log(data);

    return (
        <div className='max-w-5xl space-y-6 pb-10'>
            {/* Header: Back button */}
            <button
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-4"
                onClick={() => navigate(-1)}
            >
                <MdArrowBack/> Back to Member List
            </button>

            {/* Profile Header */}
            <ProfileHeader
                user={user}
                isMember={isViewinMember}
                onAssignClick={isAdmin ? () => setIsModalOpen(true) : null}
            />

            {/* Account Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserInfoCard user={user} />

                {/* Conditional Visibility: Attendance vs Coach Stats */}
                {isViewinMember ? (
                    <AttendanceCalener history={attendanceHistory || []} />
                ) : (
                    <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 flex items-center justify-center text-gray-400 italic">
                        Coach performance statistics coming soon...
                    </div>
                )}

            </div>
            
            <AssignCoachModel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                coaches={coaches}
                selectedCoach={selectedCoach}
                setSelectedCoach={setSelectedCoach}
                onConfirm={handleAssignCoach}
            />

            

            
        </div>
    )
}

export default UserDetails
