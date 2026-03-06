/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { membershipService } from "../../services/membershipService";
import { SubscriptionCard } from "./SubscriptionCard";
import {  MdFlag, MdMedicalServices } from "react-icons/md";
import { AttendanceCalener } from "./AttendanceCalendar";
import { PaymentHistory } from "./PaymentHistory";
import { UserInfoCard } from "./UserInfoCard";

export const MemberDetails = ({ user, userId, profile, subscription, attendance, isAdmin, onOpenPlanModal }: any) => {

    const [paymentData, setPaymentData] = useState<any>({ payments: [], pagination: {} });

    const fetchPaymentHistory = async (page: number) => {
        try {
            const data = await membershipService.getMemberPayment(userId, page);
            setPaymentData({
                payments: data.payments || [],
                pagination: data.paginations || null
            })

        } catch (error) {
            console.log("Error Fetching Payments History :", error);
        }
    }

    useEffect(() => {
        fetchPaymentHistory(1);
    }, [userId])

    return (

        <div className="space-y-6">

            {subscription ? (
                <SubscriptionCard
                    planName={subscription.plan.name}
                    startDate={subscription.startDate}
                    endDate={subscription.endDate}
                    price={subscription.plan.price}
                />
            ) : isAdmin && (
                <div className="bg-warrior-grey p-6 border border-neutral-600 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                    <p className="italic mb-4">No active membership found</p>
                    <button
                        onClick={onOpenPlanModal}
                        className="text-warrior-orange border border-warrior-orange px-4 py-2 rounded-lg hover:bg-warrior-orange hover:text-white transition-all uppercase font-black text-xs"
                    >
                        Assign Plan
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                <div className="lg:col-span-1 space-y-6">
                    <UserInfoCard user={user} />
                </div>

                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 space-y-4 border-l-3 border-l-warrior-orange">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Emergancy Contatc</h3>

                    <div className="flex justify-between border-b border-neutral-700 pb-1">
                        <span className="text-gray-400 text-sm font-semibold">Name</span>
                        <span className="text-gray-300 text-sm uppercase font-bold">{profile.emergencyContactName}</span>
                    </div>

                    <div className="flex justify-between border-b border-neutral-700 pb-1">
                        <span className="text-gray-400 text-sm font-semibold">Relation</span>
                        <span className="text-gray-300 text-sm uppercase font-bold">{profile.emergencyContactRelation}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-700 pb-1">
                        <span className="text-gray-400 text-sm font-semibold">Contact</span>
                        <span className="text-gray-300 text-sm uppercase font-bold">{profile.emergencyContactPhone}</span>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 space-y-6 lg:space-x-6 ">
                <div className="col-span-2">
                    <AttendanceCalener history={attendance || []} />
                </div>

                <div className="flex flex-col gap-6 bg-warrior-grey p-6 border border-neutral-600 rounded-2xl border-l-3 border-l-warrior-orange">
                    <div className="border-b border-neutral-700 pb-5">
                        <div className="flex items-center gap-2 mb-2">
                            <MdMedicalServices className="text-warrior-orange"/>
                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Medical Conditions</h4>
                        </div>
                        {profile?.medicalConditions?.map((condition: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-warrior-orange rounded-full border border-warrior-orange/50 font-bold bg-warrior-orange/10 px-2 p-1 mb-2">
                                <span>{condition}</span>
                            </div>
                        )) || "No records"}
                    </div>


                    <div className="">
                        <div className="flex items-center gap-2 mb-2">
                            <MdFlag className="text-warrior-orange"/>
                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Fitness Goal</h4>
                        </div>
                        {profile?.fitnessGoal?.map((goal: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-xs  text-warrior-orange rounded-full border border-warrior-orange/50 font-bold bg-warrior-orange/10 px-2 p-1 mb-2">
                                <span>{goal}</span>
                            </div>
                        )) || "No records"}
                    </div>
                </div>
            </div>

            

            <PaymentHistory
                payments={paymentData.payments}
                pagination={paymentData.pagination}
                onPageChange={fetchPaymentHistory}
            />
        </div>

    )
}