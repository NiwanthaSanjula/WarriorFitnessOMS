/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../services/userService";
import { MdArrowBack } from "react-icons/md";
import { GiMuscleUp, GiWhistle } from "react-icons/gi";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { ProfileHeader } from "../components/userDetails/ProfileHeader";
import { AssignCoachModel } from "../components/userDetails/AssignCoachModel";
import { membershipService, type MembershipPlan } from "../services/membershipService";
import { AssignPlanModal } from "../components/userDetails/AssignPlanModal";
import { MemberDetails } from "../components/userDetails/MemberDetails";
import { CoachDetails } from "../components/userDetails/CoachDetails";

const UserDetails = () => {
    const { user: loggedInUser } = useAuth();
    const navigate  = useNavigate();
    const { id }    = useParams<{ id: string }>();

    const [data, setData]                     = useState<any | null>(null);
    const [loading, setLoading]               = useState(true);
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [selectedCoach, setSelectedCoach]   = useState('');
    const [allPlans, setAllPlans]             = useState<MembershipPlan[]>([]);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    const fetchUser = async () => {
        if (!id) return;
        try {
            const userData = await userService.getUserById(id);
            setData(userData);
        } catch (error) {
            console.error('Failed to fetch user!', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        const plans = await membershipService.getPlans();
        setAllPlans(plans);
    };

    useEffect(() => { fetchUser(); fetchPlans(); }, [id]);

    const handleAssignCoach = async () => {
        if (!selectedCoach || !id) return;
        try {
            await userService.assignCoach(id, selectedCoach);
            await fetchUser();
            setIsModalOpen(false);
            alert('Coach assigned successfully!');
        } catch (error) {
            alert('Failed to assign coach. Please try again.');
            console.error(error);
        }
    };

    const handleAssignPlan = async (planId: string) => {
        if (!id) return;
        try {
            await membershipService.subscribeMember(id, planId);
            await fetchUser();
            setIsModalOpen(false);
            alert('Warrior Membership Activated!');
        } catch (error) {
            alert('Failed to assign plan');
            console.error(error);
        }
    };

    if (loading) return <Spinner />;
    if (!data)   return (
        <div className="text-warrior-orange w-full h-full flex items-center justify-center">
            Member not found..
        </div>
    );

    const { user, attendanceHistory, coaches, subscription, specialProfile } = data;
    const isAdmin  = loggedInUser?.role === 'admin';
    const isMember = user.role === 'member';

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── Back + Header ── */}
            <button
                className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest"
                onClick={() => navigate(-1)}
            >
                <MdArrowBack size={14} /> Back to Member List
            </button>

            {/* ── Page title ── */}
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                    isMember
                        ? 'bg-warrior-orange/10 border-warrior-orange/20'
                        : 'bg-blue-900/20 border-blue-800/30'
                }`}>
                    {isMember
                        ? <GiMuscleUp  className="text-warrior-orange" size={24} />
                        : <GiWhistle   className="text-blue-400"       size={24} />
                    }
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                        {isMember ? 'Member' : 'Coach'}{' '}
                        <span className={isMember ? 'text-warrior-orange' : 'text-blue-400'}>Profile</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                        {user.name} — Detailed View
                    </p>
                </div>
            </div>

            {/* ── Profile Header ── */}
            <ProfileHeader
                user={user}
                isMember={isMember}
                onAssignClick={isAdmin && isMember ? () => setIsModalOpen(true) : null}
            />

            {/* ── Role Content ── */}
            <div>
                {isMember && (
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

            {/* ── Modals ── */}
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
    );
};

export default UserDetails;