import { MdChevronLeft, MdChevronRight, MdEmail, MdPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
    members: any[];
    pagination: any;
    onPageChange: (page: number) => void;
}

export const PendingMembersTable = ({ members, pagination, onPageChange }: Props) => {
    const navigate = useNavigate();
    const currentPage = pagination?.currentPage || 1;
    const totalPages = pagination?.pages || 1;
    
    if (members.length === 0) {
        return (
            <div className="bg-warrior-grey py-6 rounded-2xl flex items-center justify-center border border-neutral-600 text-gray-500 text-xs uppercase font-bold tracking-widest ">
                No Pending Payments 
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-warrior-grey rounded-2xl border border-neutral-600 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 border-b border-neutral-700">
                            <tr className="text-[10px] uppercase text-gray-500 font-bold tracking-widest px-6 ">
                                <th className="px-5 py-4">Member</th>
                                <th className="px-5 py-4">Contact</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-700 ">
                            { members.map((m) => (
                                <tr key={m._id} className="">
                                    <td className="px-6 py-3">
                                        <p className="text-gray-300 font-bold tracking-wider">{m.name}</p>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs md:text-sm"> <MdEmail size={14} className="text-warrior-orange" /> {m.email}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-1 text-gray-400 text-xs md:text-sm"> <MdPhone size={14} className="text-warrior-orange" /> {m.phone}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="bg-red-500/10 text-red-500 text-[9px] font-black px-2 py-1 rounded border border-red-500/20 uppercase italic animate-pulse"> Payment Overdue</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/members/${m._id}`)}
                                            className="bg-warrior-orange text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-white transition-all cursor-pointer flex items-start"
                                        >
                                            Renew Now
                                        </button>
                                    </td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
                {members.map((m) => (
                    <div key={m._id} className="bg-warrior-grey rounded-2xl border border-neutral-600 p-4 shadow-lg">
                        {/* Member Info */}
                        <div className="mb-4">
                            <p className="text-gray-300 font-bold tracking-wider text-sm mb-2">{m.name}</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <MdEmail size={16} className="text-warrior-orange flex-shrink-0" />
                                    <span className="break-all">{m.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                    <MdPhone size={16} className="text-warrior-orange flex-shrink-0" />
                                    <span>{m.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status and Action */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="bg-red-500/10 text-red-500 text-[9px] font-black px-3 py-2 rounded border border-red-500/20 uppercase italic animate-pulse">
                                Payment Overdue
                            </div>
                            <button 
                                onClick={() => navigate(`/admin/members/${m._id}`)}
                                className="bg-warrior-orange text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-white transition-all cursor-pointer whitespace-nowrap"
                            >
                                Renew Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 pt-4">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-400 disabled:opacity-20 hover:border-warrior-orange hover:text-warrior-orange transition-all duration-200 cursor-pointer"
                >
                    <MdChevronLeft size={20} />
                </button>
                <span className="text-warrior-orange text-xs uppercase font-bold tracking-widest">Page {currentPage} of {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-400 disabled:opacity-20 hover:border-warrior-orange hover:text-warrior-orange transition-all duration-200 cursor-pointer"
                >
                    <MdChevronRight size={20} />
                </button>
            </div>
        </div>
    )

}