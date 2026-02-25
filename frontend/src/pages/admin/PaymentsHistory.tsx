/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { membershipService } from '../../services/membershipService';
import { Input } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { MasterLedger } from '../../components/admin/MasterLedger';
import { PendingMembersTable } from '../../components/admin/PendingMembersTable';

const PaymentsHistory = () => {

    const [activeTab, setactiveTab] = useState<'history' | 'pending' >('history');
    const [paymentsData, setPaymentsData] = useState<any>({payments: [], paginations: {}});
    const [pendingData, setPendingData] = useState<any>({users: [], paginations: {}})
    const [loading, setloading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchAllPayments = async () => {
        setloading(true)
        try {
            if (activeTab === 'history') {
                const data = await membershipService.getAllpayments(page, search);
                //console.log(data);
                setPaymentsData(data)
            } else {
                const data = await membershipService.getPendingPayments(page);
                setPendingData(data);
            }

        } catch (error) {
            console.log("Failed to fetch global payments",error);  
        } finally {
            setloading(false)
        }
    };

    useEffect(() => {
      fetchAllPayments();
    }, [page, search, activeTab])

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
                        Master Transaction History
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

            {/* Tab Switcher */}
            <div className='flex border-b border-neutral-700'>
                <button
                    onClick={() => { setactiveTab('history'); setPage(1); }}
                    className={`pb-3 px-4 w-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'history' ? 'text-warrior-orange border-b-2 ' : 'text-gray-500'}`}
                >
                    Master Ledger
                </button>

                <button
                    onClick={() => { setactiveTab('pending'); setPage(1); }}
                    className={`pb-3 px-4 w-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'pending' ? 'text-warrior-orange border-b-2 ' : 'text-gray-500'}`}
                >
                    Pending Payments ({ pendingData.paginations?.total || 0 })
                </button>
            </div>


            

            {loading ? <Spinner/> : (
               activeTab === 'history' ? (
                    <MasterLedger
                        payments={paymentsData.payments}
                        pagination={paymentsData.paginations}
                        onPageChange={setPage}
                        totalIncome={paymentsData.paginations?.totalIncome}
                        totalRecords={totalRecords}
                    />
                ) : (
                    <PendingMembersTable
                        members={pendingData.users}
                        pagination={pendingData.paginations}
                        onPageChange={setPage}
                    />
                )
            )}
        </div>
    )
}

export default PaymentsHistory
