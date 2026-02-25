/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "../../types/auth";

interface UserInfoCardProps {
    user: User;
}

export const UserInfoCard = ({ user }: UserInfoCardProps) => {
    // Safety check for date to prevent "Invalid Date"
    const formattedDate = user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString() 
        : 'N/A';

    const getStatusColor = (status : string) => {
        switch (status) {
            case 'pending-payment':
                return 'text-amber-500';
            case 'blocked':
                return 'text-red-500';
            default:
                return 'text-green-500'
        }
    };

    return (
        <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 space-y-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Detailed Information</h3>
            
            <div className="flex justify-between border-b border-neutral-700 pb-1">
                <span className="text-gray-400 text-sm font-semibold">Role</span>
                <span className="text-gray-300 text-sm uppercase font-bold">{user.role}</span>
            </div>

            <div className="flex justify-between border-b border-neutral-700 pb-1">
                <span className="text-gray-400 text-sm font-semibold">NIC Number</span>
                <span className="text-gray-300 text-sm font-bold">{user.nic || 'Not Provided'}</span>
            </div>

            <div className="flex justify-between border-b border-neutral-700 pb-1">
                <span className="text-gray-400 text-sm font-semibold">Contact</span>
                <span className="text-gray-300 text-sm font-bold">{(user as any).phone || 'Not Provided'}</span>
            </div>

            <div className="flex justify-between border-b border-neutral-700 pb-1">
                <span className="text-gray-400 text-sm font-semibold">Member Since</span>
                <span className="text-gray-300 text-sm font-bold">{formattedDate}</span>
            </div>

            <div className="flex justify-between border-b border-neutral-700 pb-1">
                <span className="text-gray-400 text-sm font-semibold">Account Status</span>
                <span className={`text-sm font-bold uppercase ${getStatusColor(user.status)}`}>{user.status}</span>
            </div>

            {/* Only show Coach info if the user isn't an Admin */}
            {user.role !== 'admin' && (
                <div className="flex justify-between items-center mb-1 border-b border-neutral-700 pb-1">
                    <span className="text-gray-400 text-sm font-semibold">Assigned Coach</span>
                    <span className="text-warrior-orange text-xs font-bold uppercase ">
                        {typeof user.coach === 'object' ? user.coach?.name : 'No Coach Assigned'}
                    </span>
                </div>
            )}
         </div>
    )
}