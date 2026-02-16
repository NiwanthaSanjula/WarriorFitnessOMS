

import type { User } from "../../types/auth"

interface ProfileHeaderProps {
    user : User;
    isMember : boolean;
    onAssignClick: (() => void) | null
}

export const ProfileHeader = ({ user, isMember, onAssignClick }: ProfileHeaderProps ) => (
    <div className="bg-warrior-grey p-8 rounded-xl border border-neutral-600 flex flex-col md:flex-row gap-6 items-center">
    <div className="w-24 h-24 rounded-full bg-neutral-600 text-4xl flex items-center justify-center text-warrior-orange font-bold">
        {user.name.charAt(0).toUpperCase()}
    </div>

    <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">{user.name}</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">{user.email}</p>
    </div>

    {onAssignClick && isMember && (
         <button 
            onClick={onAssignClick}
            className="px-6 py-3 bg-warrior-orange text-white text-xs font-black uppercase rounded-xl hover:scale-105 transition-all"
        >
            Assign Coach
        </button>
    )}   
</div>
)