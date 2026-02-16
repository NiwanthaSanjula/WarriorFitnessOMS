import type { User } from "../../types/auth";

interface UserInfoCardProps {
    user: User;
}

export const UserInfoCard = ({ user }: UserInfoCardProps) => {
    return (
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
                    {typeof  user.coach === 'object' ? user.coach?.name : 'No Coach Assigned'}
                </span>
            </div>
         </div>
    )
}