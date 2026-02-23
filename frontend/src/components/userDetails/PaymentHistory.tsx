/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { MdPayments, MdChevronLeft, MdChevronRight, MdReceipt, MdExpandLess, MdExpandMore, MdPerson, MdCalendarToday, MdAccountCircle } from "react-icons/md";

interface PaymentHistoryProps {
    payments: any[];
    pagination: {
        currentPage: number;
        pages: number;
        total: number;
    } | null;
    onPageChange: (page: number) => void;
}

export const PaymentHistory = ({ payments, pagination, onPageChange }: PaymentHistoryProps) => {

    const [expandedId, setexpandedId] = useState<string | null>();
    const currentPage = pagination?.currentPage || 1;
    const totalPages = pagination?.pages || 1;
    const totalRecords = pagination?.total || 0;

    const toggleExpand = (id: string) => {
        setexpandedId(expandedId === id ? null : id)
    }
    

    if (payments.length === 0) {
        return (
            <div className="bg-warrior-grey rounded-2xl border border-neutral-700 p-6 md:p-8">
                <div className="flex items-center gap-2">
                    <MdPayments size={20} className="text-warrior-orange" />
                    <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                        Payment History
                    </h3>
                </div>

                <div className="py-12 text-center">
                    <p className="text-gray-500 text-sm italic">No payment records found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-warrior-grey rounded-2xl border border-neutral-600 overflow-hidden p-6">

            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="bg-warrior-orange/10 p-2 rounded-lg">
                        <MdPayments size={20} className="text-warrior-orange " />
                    </div>
                    <div className="">
                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                            Payment History
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-1">{totalRecords} Total Transactions</p>
                    </div>
                </div>
            </div>

            {/* Expandable cards */}
            <div className="space-y-2 mt-4">
                {payments.map((payment) => {

                    const isExpanded = expandedId === payment._id
                    const memberName = payment.member?.name || "Unknown Member"
                    const memberEmail = payment.member?.email || ""

                    return (
                        <div
                            key={payment._id}
                            className={`border transition-all duration-300 rounded-xl overflow-hidden
                                        ${isExpanded ? 'border-warrior-orange bg-warrior-dark' : 'border-neutral-700/80 bg-neutral-800/50'}`}
                        >

                                {/* ALWAYS VISIBLE */}
                                <div
                                    onClick={() => toggleExpand(payment._id)}
                                    className="p-4 flex items-start justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* User Avatar Icon */}
                                        <div className={`p-2 rounded-lg shrink-0 ${isExpanded ? 'bg-warrior-orange text-white' : 'bg-neutral-700 text-gray-300'}`}>
                                            <MdAccountCircle size={18}/>
                                        </div>
                                        
                                        {/* User & Plan Info */}
                                        <div className="min-w-0 flex-1s">
                                            <p className="text-xs font-bold uppercase italic text-white leading-none truncate">
                                                {memberName}
                                            </p>
                                            <p className="text-[9px] text-gray-500 mt-1 lowercase truncate">
                                                {memberEmail}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                                                {payment.plan?.name || "Custom Plan"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount & Expand Icon */}
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-warrior-orange">
                                                {payment.amount.toLocaleString()} LKR
                                            </p>
                                            <p className="text-[9px] text-gray-500 mt-0.5">
                                                {new Date(payment.createdAt).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        {isExpanded ? <MdExpandLess size={20} className="text-gray-500" /> : <MdExpandMore size={20} className="text-gray-500" />}
                                    </div>
                                </div>

                                {/*Expandable Section */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-700"> 
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-semibold">
                                                <MdReceipt size={14} className="text-warrior-orange shrink-0"/>
                                                <span>Invoice ID: <span className="text-gray-200 font-mono">{payment.invoinceNo}</span></span>
                                            </div>

                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-semibold">
                                                <MdPerson size={14} className="text-warrior-orange shrink-0"/>
                                                <span>Recorded By: <span className="text-gray-200 font-mono">{payment.recoredBy?.name || 'System'}</span></span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-semibold">
                                                <MdCalendarToday size={14} className="text-warrior-orange shrink-0"/>
                                                <span>Processed At: <span className="text-gray-200 font-mono">{new Date(payment.createdAt).toLocaleTimeString()}</span></span>
                                            </div>

                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                                <span>Status: <span className="text-green-500">Success</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )
                })}
            </div>

            {/* Paginations */}
            {totalPages > 1 && (   
                <div className="p-1 mt-4 flex items-center justify-center">  
                    <div className="flex items-center gap-3">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-400 disabled:opacity-20 hover:border-warrior-orange hover:text-warrior-orange transition-all duration-200 cursor-pointer"
                        >
                            <MdChevronLeft size={20}/>
                        </button>

                        <span className="text-warrior-orange text-[10px] uppercase font-black tracking-tighter">Page {currentPage} of {totalPages}</span>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-gray-400 disabled:opacity-20 hover:border-warrior-orange hover:text-warrior-orange transition-all duration-200 cursor-pointer"
                        >
                            <MdChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
      
    )
};