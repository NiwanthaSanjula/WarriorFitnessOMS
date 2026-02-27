/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { UserInfoCard } from "./UserInfoCard";
import { MdStars, MdVerified, MdDescription } from "react-icons/md";
import { userService } from "../../services/userService";
import { CoachStudentRoster } from "./CoachStudentRoster";

export const CoachDetails = ({ user, profile }: any) => {

    const [clients, setclients] = useState([]);

    useEffect(() => {
      const fetchClients = async () => {
        try {
            const response  = await userService.getCoachClients(user._id);
            setclients(response.clients);
            console.log(response);
            

        } catch (error) {
            console.log("Error fetching coach's clients :", error );
            
        }
      }
      if (user?._id) fetchClients()

    }, [user._id])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Account Info */}
            <div className="lg:col-span-1">
                <UserInfoCard user={user} />
            </div>

            {/* Right Column: Professional Profile */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-warrior-grey p-6 rounded-xl border border-neutral-600 text-center">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Experience</p>
                        <p className="text-2xl font-black text-white">{profile?.experienceYears || 0} Years</p>
                    </div>
                    <div className="bg-warrior-grey p-6 rounded-xl border border-neutral-600 text-center">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Rating</p>
                        <p className="text-2xl font-black text-warrior-orange">{profile?.rating || "5.0"}</p>
                    </div>
                </div>

                {/* Specialties */}
                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                    <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MdStars className="text-warrior-orange"/> Specialities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profile?.specialties?.length > 0 ? (
                            profile.specialties.map((s: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-warrior-orange/10 border border-warrior-orange/30 text-warrior-orange text-[10px] font-bold rounded-full uppercase">
                                    {s}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 italic">No specialties listed</span>
                        )}
                    </div>
                </div>

                {/* Bio & Certs */}
                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                    <h3 className="text-white text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MdDescription className="text-warrior-orange"/> Biography
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{profile?.bio || 'No bio provided.'}</p>
                    
                    <div className="pt-4 border-t border-neutral-700">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-1">
                            <MdVerified className="text-green-500" /> Certifications
                        </p>
                        <p className="text-sm text-gray-300 italic">{profile?.certifications?.join(", ") || "No certifications listed."}</p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3">
                <CoachStudentRoster clients={clients} />
            </div>
        </div>
    );
};