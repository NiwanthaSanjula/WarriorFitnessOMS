/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { userService } from "../services/userService";
import { MdArrowBack } from "react-icons/md";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

import { ProfileHeader } from "../components/userDetails/ProfileHeader";
import { AssignCoachModel } from "../components/userDetails/AssignCoachModel";
import { membershipService, type MembershipPlan } from "../services/membershipService";
import { AssignPlanModal } from "../components/userDetails/AssignPlanModal";
import { MemberDetails } from "../components/userDetails/MemberDetails";
import { CoachDetails } from "../components/userDetails/CoachDetails";
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
    //  const [paymentsData, setPaymentsData] = useState<any>({ payments: [], pagination: {} })

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

    //  Fetch all membership plans
    const fetchPlans = async () => {
        const plans = await membershipService.getPlans();
        setAllPlans(plans);
    };
   

    //  Fetch member's payment history
    /*const fetchPaymentHistory = async (page: number) => {
        if (!id) return;

        try {
            const data = await membershipService.getMemberPayment(id, page);
            //console.log(data);
            setPaymentsData({
                payments: data.payments || [],
                pagination: data.paginations || null,
            });

        } catch (error) {
            console.log("Error loading paymentss", error);  
        }
    }*/

    useEffect(() => {
      fetchUser();
      fetchPlans();
      //fetchPaymentHistory(1)
    }, [id])

    //  Assign a coach to the member
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

    //  Assign a plan to the Member
    const handleAssignPlan = async (planId: string) => {
        if (!id) return;
        try {
            await membershipService.subscribeMember(id, planId);
            await fetchUser();
            setIsModalOpen(false);
            alert("Warrior Membership Activated!")

        } catch (error) {
            alert("Failed on assign plan");
            console.log( "Error Assign a Plan :", error);
        }
    }

    if (loading) return <Spinner/>
    if (!data) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Member not found..</div>

    const { user, attendanceHistory, coaches, subscription, specialProfile } = data
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
                isMember={user.role === 'member'}
                onAssignClick={isAdmin && user.role === 'member' ? () => setIsModalOpen(true) : null}
            />

            <div className="grid grid-cols-1">

                {/* Role-Specific Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {user.role === 'member' && (
                        <MemberDetails
                            user={user}
                            userId={user._id}
                            profile={specialProfile}
                            subscription={subscription}
                            attendance={attendanceHistory}
                            isAdmin={isAdmin}
                            onOpenPlanModal={() => setIsPlanModalOpen(true)}
                        />
                    )}

                    {user.role === 'coach' && (
                        <CoachDetails user={user} profile={specialProfile} />
                    )}
                </div>

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
