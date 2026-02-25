import { MdAttachMoney, MdReceiptLong } from "react-icons/md";
import { PaymentHistory } from "../userDetails/PaymentHistory";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MasterLedgerProps {
    payments: any[];
    pagination: any;
    onPageChange: (page: number) => void;
    totalIncome: number;
    totalRecords: number;
}

export const MasterLedger = ({ payments, pagination, onPageChange, totalIncome, totalRecords }: MasterLedgerProps ) => {
    return (

        <div className="space-y-6">
            {/* Stat cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='bg-warrior-grey rounded-xl p-4 flex items-center gap-4 border border-neutral-600 border-l-3 border-l-blue-500'>
                    <div className='bg-blue-500/15 text-blue-500 p-2 rounded-lg'>
                        <MdReceiptLong size={24} />
                    </div>
                    <div>
                        <p className='text-xs font-bold text-gray-300 italic uppercase tracking-widest'>Total Records</p>
                        <p className='text-xl font-black text-white'>{totalRecords}</p>
                    </div>
                </div>

                <div className='bg-warrior-grey rounded-xl p-4 flex items-center gap-4 border border-neutral-600 border-l-3 border-l-green-500'>
                    <div className='bg-green-500/15 text-green-500 p-2 rounded-lg'>
                        <MdAttachMoney size={24} />
                    </div> 
                    <div>
                        <p className='text-xs font-bold text-gray-300 italic uppercase tracking-widest'>Total Income</p>
                        <p className='text-xl font-black text-white'>{totalIncome} LKR</p>
                    </div> 

                </div>
            </div>

            <PaymentHistory
                payments={payments}
                pagination={pagination}
                onPageChange={onPageChange}
            />
        </div>

    )
}