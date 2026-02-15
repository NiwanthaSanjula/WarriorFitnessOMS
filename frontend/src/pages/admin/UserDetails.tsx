/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { userService } from "../../services/userService";
import { MdArrowBack } from "react-icons/md";

const UserDetails = () => {

    const navigate = useNavigate();

    const { id } = useParams<{id: string }>();

    const [data, setData] = useState<any | null>(null) // Contain user, attendanceHistory, coaches...
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState("");

    useEffect(() => {
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
      fetchUser();
      
    }, [id])

    const handleAssignCoach = async () => {
        if (!selectedCoach || !id) return;

        try {
            await userService.assignCoach(id, selectedCoach);

            //  Refresh the page data to show the new coach
            const updatedData = await userService.getUserById(id);
            setData(updatedData);

            setIsModalOpen(false);
            alert("Coach assigned successfully!")

        } catch (error) {
            alert("Failed to assign coach.Please try again")
            console.log(error);
            
        }
    }

    if (loading) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Loading Users...</div>
    if (!data) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Member not found..</div>

    const { user, attendanceHistory, coaches } = data.data
    const isMember = user.role === 'member';
    //console.log(data);
    
    

    // Logic for the Calendar/Heatmap
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    return (
        <div className='max-w-5xl space-y-6 pb-10'>
            {/* Header: Back button */}
            <button
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-4"
                onClick={() => navigate(-1)}
            >
                <MdArrowBack/> Back to Member List
            </button>

            {/* Profile Overview */}
            <div className="bg-warrior-grey p-8 rounded-xl border border-neutral-600 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 rounded-full bg-neutral-600 text-4xl flex items-center justify-center text-warrior-orange font-bold">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">{user.name}</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">{user.email}</p>
                </div>

                {isMember && <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-warrior-orange text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
                >
                    Assign Coach
                </button>
}
                {/*<div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold italic uppercase text-gray-300 ">{user.name}</h1>
                    <div className="flex gap-2 justify-center md:justify-start mt-2">
                        <span className="bg-warrior-orange/30 px-3 py-1 text-warrior-orange rounded-full text-[10px] font-bold uppercase tracking-widest border border-warrior-orange/50">
                            {user.role}
                        </span>

                        <span className="bg-green-500/20 text-green-500 text-[10px] tracking-widest px-3 py-1 rounded-full border border-green-500/50 font-bold uppercase">
                            Active
                        </span>
                    </div>
                </div>*/}
            </div>

            {/* Account Details */}
            <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 space-y-4">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">User Info</h3>
                <div className="flex justify-between border-b border-neutral-700 pb-1">
                    <span className="text-gray-400 text-sm font-semibold">Role</span>
                    <span className="text-gray-300 text-sm uppercase font-bold">{user.role}</span>
                </div>

                <div className="flex justify-between border-b border-neutral-700 pb-1">
                    <span className="text-gray-400 text-sm font-semibold">Member Since</span>
                    <span className="text-gray-300 text-sm uppercase font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between border-b border-neutral-700 pb-1">
                    <span className="text-gray-400 text-sm font-semibold">Status</span>
                    <span className="text-green-500 text-sm font-bold uppercase">Active</span>
                </div>

                <div className="flex justify-between items-center mb-1 border-b border-neutral-700 pb-1">
                    <span className="text-gray-400 text-sm font-semibold">Assigned Coach</span>
                    <span className="text-warrior-orange text-xs font-bold uppercase ">
                        {user.coach ? ( user.coach as any).name : 'No Coach Assigned'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
               {isMember ? (<div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Attendance Consistency</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(daysInMonth)].map((_, i) => {
                            const dayNum = i + 1;
                            const isPresent = attendanceHistory.some((r: any) => new Date(r.date).getDate() === dayNum);
                            return(
                                <div 
                                    key={i}
                                    className={`aspect-square rounded-md flex items-center justify-center text-xs md:text-sm font-bold ${isPresent ? 'bg-green-500/20 text-green-500 border border-green-500/40' : "bg-neutral-800 text-gray-300 border border-neutral-700"}`}
                                >
                                    {dayNum}
                                </div>
                            )
                        })}
                    </div>
                </div>) : (
                    <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 flex items-center justify-center text-gray-400">
                        Coach performance statics coming soon...
                    </div>
                )}
            </div>

            {/* Assign coach to member model */}   
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
                    <div className="bg-warrior-grey border border-neutral-600 w-full max-w-md p-8 rounded-2xl shadow-lg shadow-warrior-orange/50">
                        <h3 className="text-2xl font-bold italic text-gray-300 uppercase mb-6">
                            Assign <span className="text-warrior-orange">Coach</span>
                        </h3>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Select Coach</label>
                            <select
                                value={selectedCoach}
                                onChange={(e) => setSelectedCoach(e.target.value)}
                                className="w-full bg-neutral-700 border border-neutral-600 text-gray-300 p-2 rounded-lg outline-none focus:border-warrior-orange transition-colors"
                            >
                                <option value="">Choose a Coach...</option>
                                {coaches?.map((coach: any) => (
                                    <option key={coach._id} value={coach._id}>{coach.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-gray-400 font-bold uppercase text-xs hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleAssignCoach}
                                    className="flex-1 py-4 bg-warrior-orange text-white font-bold uppercase text-xs rounded-lg hover:scale-105 cursor-pointer hover:bg-warrior-orange/90 transition-all duration-200"
                                >
                                    Confirm
                                </button>
                        </div>
                    </div>
                </div>

            )}
        </div>
    )
}

export default UserDetails
