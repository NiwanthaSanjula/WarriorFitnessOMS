import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import type { User } from "../../types/auth";
import { userService } from "../../services/userService";
import { MdArrowBack, MdBadge, MdEmail } from "react-icons/md";

const UserDetails = () => {

    const { id } = useParams<{id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchUser = async () => {
        if (!id) return

        try {
            const userData = await userService.getUserById(id);
            setUser(userData);

        } catch (error) {
            console.log("Failed to fetch user!",error);

        } finally {
            setLoading(false)
        }
      }

      fetchUser();
    }, [id])

    if (loading) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Loading Users...</div>
    if (!user) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Member not found..</div>

    return (
        <div className='max-w-4xl space-y-6'>
            {/* Header: Back button */}
            <button
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-4"
                onClick={() => navigate(-1)}
            >
                <MdArrowBack/> Back to Member List
            </button>

            {/* Profile Overview Card */}
            <div className="bg-warrior-grey p-8 rounded-xl border border-neutral-600 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 rounded-full bg-neutral-600 text-4xl flex items-center justify-center text-warrior-orange font-bold">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold italic uppercase text-gray-300 ">{user.name}</h1>
                    <div className="flex gap-2 justify-center md:justify-start mt-2">
                        <span className="bg-warrior-orange/30 px-3 py-1 text-warrior-orange rounded-full text-[10px] font-bold uppercase tracking-widest border border-warrior-orange/50">
                            {user.role}
                        </span>

                        <span className="bg-green-500/20 text-green-500 text-[10px] tracking-widest px-3 py-1 rounded-full border border-green-500/50 font-bold uppercase">
                            Active
                        </span>
                    </div>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-warrior-grey p-6 rounded-xl border border-neutral-600 space-y-4">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest ">Contact Detils</h3>
                    <div className="flex items-center gap-3 text-gray-300">
                        <MdEmail className="text-warrior-orange" size={20}/>
                        <span className="text-sm">{user.email}</span>
                    </div>
                </div>

                <div className="bg-warrior-grey p-6 rounded-xl border border-neutral-600 space-y-4">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest ">Account Info</h3>
                    <div className="flex items-center gap-3 text-gray-300">
                        <MdBadge className="text-warrior-orange" size={20}/>
                        <span className="text-sm">{user._id}</span>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default UserDetails
