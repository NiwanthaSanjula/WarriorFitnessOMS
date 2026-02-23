/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { membershipService } from '../../services/membershipService';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { MdAttachMoney, MdReceiptLong } from 'react-icons/md';
import { PaymentHistory } from '../../components/userDetails/PaymentHistory';

const PaymentsHistory = () => {
    const [paymentsData, setPaymentsData] = useState<any>({payments: [], paginations: {}})
    const [loading, setloading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchAllPayments = async () => {
        setloading(true)
        try {
            const data = await membershipService.getAllpayments(page, search);
            console.log(data);
            setPaymentsData(data)

        } catch (error) {
            console.log("Failed to fetch global payments",error);
            
        } finally {
            setloading(false)
        }
    };

    useEffect(() => {
      fetchAllPayments();
    }, [page, search])

    //  Calculating page stats
    const totalAmount =  paymentsData.paginations?.totalIncome;
    const totalRecords = paymentsData.paginations?.total || 0

    console.log(totalAmount);
    
    
    return (
        <div className='max-w-6xl mx-auto space-y-6 pb-10'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h2  className='text-lg md:text-2xl font-bold italic text-gray-300'>
                        Payments History
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Master Transaction History [cite: 216]
                    </p>
                </div>

                <div className='w-full md:w-72'>
                    <Input
                        placeholder='Search Invoice #...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

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
                        <p className='text-xl font-black text-white'>{totalAmount} LKR</p>
                    </div> 

                </div>
            </div>

            {loading ? <Spinner/> : (
                <PaymentHistory
                    payments={paymentsData.payments}
                    pagination={paymentsData.paginations}
                    onPageChange={(p) => setPage(p)}
                />
            )}
        </div>
    )
}

export default PaymentsHistory
