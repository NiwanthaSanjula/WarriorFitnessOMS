/* eslint-disable @typescript-eslint/no-explicit-any */
import { MdChevronLeft, MdChevronRight, MdAccountCircle } from "react-icons/md";

interface GlobalPaymentTableProps {
    payments: any[];
    pagination: {
        currentPage: number;
        pages: number;
        total: number;
    } | null;
    onPageChange: (page: number) => void;
}

export const GlobalPaymentTable = ({ payments, pagination, onPageChange }: GlobalPaymentTableProps) => {
    const currentPage = pagination?.currentPage || 1;
    const totalPages = pagination?.pages || 1;

    return (
        <div className="bg-warrior-grey rounded-2xl border border-neutral-600 overflow-hidden shadow-2xl">
            {/* Desktop & Mobile Responsive Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/40 border-b border-neutral-700">
                        <tr className="text-[9px] sm:text-[10px] md:text-xs uppercase text-gray-400 font-black tracking-widest">
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">Member</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 ">Plan</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 ">Invoice</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 ">Amount</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 ">Date</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right ">Admin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {payments.length > 0 ? (
                            payments.map((p) => (
                                <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                    {/* Member Column */}
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="bg-neutral-800 p-1 sm:p-1.5 rounded-full border border-neutral-700 text-warrior-orange flex-shrink-0">
                                                <MdAccountCircle size={16} className="sm:size-[18px]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-bold text-xs sm:text-sm leading-tight uppercase italic truncate">
                                                    {p.member?.name || "Deleted User"}
                                                </p>
                                                <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 lowercase truncate">
                                                    {p.member?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Plan Column (Hidden on Mobile) */}
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <span className="bg-warrior-orange/10 text-warrior-orange text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-warrior-orange/20 uppercase italic inline-block">
                                            {p.plan?.name}
                                        </span>
                                    </td>

                                    {/* Invoice Column (Hidden on Mobile & Tablet) */}
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-mono text-[10px] md:text-[11px] text-gray-500 uppercase ">
                                        {p.invoinceNo}
                                    </td>

                                    {/* Amount Column */}
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <p className="text-warrior-orange font-black text-xs sm:text-sm">
                                            {p.amount.toLocaleString()} <span className="text-[8px] sm:text-[9px]">LKR</span>
                                        </p>
                                    </td>

                                    {/* Date Column (Hidden on Mobile) */}
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                        <p className="text-gray-400 text-[9px] sm:text-xs font-medium">
                                            {new Date(p.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                    </td>

                                    {/* Admin Column (Hidden on Mobile & Tablet) */}
                                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right hidden md:table-cell">
                                        <span className="text-[9px] md:text-[10px] bg-neutral-900 border border-neutral-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-gray-500 uppercase font-bold inline-block">
                                            {p.recoredBy?.name?.split(' ')[0] || "System"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="py-16 sm:py-20 text-center text-gray-600 italic text-xs sm:text-sm px-3">
                                    No transaction records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-black/30 border-t border-neutral-700 flex items-center justify-between gap-3">
                    <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-tighter whitespace-nowrap">
                        Page <span className="text-white">{currentPage}</span>/<span className="text-white">{totalPages}</span>
                    </p>
                    <div className="flex gap-1.5 sm:gap-2 ml-auto">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="p-1 sm:p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-gray-400 disabled:opacity-20 hover:text-warrior-orange transition-all cursor-pointer"
                        >
                            <MdChevronLeft size={18} className="sm:size-[20px]" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="p-1 sm:p-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-gray-400 disabled:opacity-20 hover:text-warrior-orange transition-all cursor-pointer"
                        >
                            <MdChevronRight size={18} className="sm:size-[20px]" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};