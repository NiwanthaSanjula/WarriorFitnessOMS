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
import { SubscriptionCard } from "../components/userDetails/SubscriptionCard";
import { membershipService, type MembershipPlan } from "../services/membershipService";
import { AssignPlanModal } from "../components/userDetails/AssignPlanModal";
import { PaymentHistory } from "../components/userDetails/PaymentHistory";
//import { PaymentHistory } from "../components/userDetails/PaymentHistory";



const UserDetails = () => {

    const { user: loggedInUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{id: string }>();

    const [data, setData] = useState<any | null>(null) // Contain user, attendanceHistory, coaches...
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState("");
    const [allPlans, setAllPlans] = useState<MembershipPlan[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [paymentsData, setPaymentsData] = useState<any>({ payments: [], pagination: {} })

    const fetchUser = async () => {
        if (!id) return

        try {
            const userData = await userService.getUserById(id);
            setData(userData);
            //console.log(userData);
        } catch (error) {
            console.log("Failed to fetch user!",error);
        } finally {
            setLoading(false)
        }
    }

    //  Fetch all membership plans
    const fetchPlans = async () => {
        const plans = await membershipService.getPlans();
        setAllPlans(plans);
    };
   

    //  Fetch member's payment history
    const fetchPaymentHistory = async (page: number) => {
        if (!id) return;

        try {
            const data = await membershipService.getMemberPayment(id, page);

            console.log(data);
            
            setPaymentsData({
                payments: data.payments || [],
                pagination: data.paginations || null,
            });
            

        } catch (error) {
            console.log("Error loading paymentss", error);
            
        }
    }

    useEffect(() => {
      fetchUser();
      fetchPlans();
      fetchPaymentHistory(1)
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

    const handleAssignPlan = async (planId: string) => {
        try {
            if (!id) return;
            await membershipService.subscribeMember(id, planId);
            await fetchUser();
            setIsModalOpen(false);
            alert("Warrior Membership Activated!")

        } catch (error) {
            alert("Failed on assign plan");
            console.log(error);
        }
    }

    if (loading) return <Spinner/>
    if (!data) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Member not found..</div>

    const { user, attendanceHistory, coaches, subscription } = data

    const isViewinMember = user.role === 'member';
    const isAdmin = loggedInUser?.role === 'admin';
    //console.log(data);

    return (
        <div className='max-w-6xl mx-auto space-y-6 pb-10'>
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

            { isViewinMember && subscription ? (
                <SubscriptionCard
                    planName={subscription.plan.name}
                    startDate={subscription.startDate}
                    endDate={subscription.endDate}
                    price={subscription.plan.price}
                />
            ) : isViewinMember && !subscription && isAdmin && (
                <div className="bg-warrior-grey p-6 border border-neutral-600 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                    <p className="italic mb-4">No active membership found</p>
                    {isAdmin && (
                        <button
                            onClick={() => setIsPlanModalOpen(true)}
                            className="text-warrior-orange hover:text-white text-xs font-bold uppercase border border-warrior-orange px-4 py-2 rounded-lg hover:bg-warrior-orange transition-all duration-200 cursor-pointer"
                        >
                            Assign Plan
                        </button>
                    )}
                </div>
            ) }

            

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

            <div>
                {isViewinMember ? (
                    <PaymentHistory 
                        payments={paymentsData.payments} 
                        pagination={paymentsData.pagination} 
                        onPageChange={(page) => fetchPaymentHistory(page)}
                    />
                ): (
                    <div></div>
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

            <AssignPlanModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                plans={allPlans}
                onConfirm={handleAssignPlan}
            />

            

            
        </div>
    )
}

export default UserDetails
