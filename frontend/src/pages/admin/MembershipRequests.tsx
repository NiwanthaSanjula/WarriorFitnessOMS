import React, { useEffect, useState } from 'react'
import type { MembershipRequest } from '../../services/membershipRequestService';
import { membershipRequestService } from '../../services/membershipRequestService';
import Spinner from '../../components/ui/Spinner';
import { MdCardMembership, MdCheck, MdClose, MdEmail, MdPhone } from 'react-icons/md';

const MembershipRequests = () => {

    const [requests, setRequests] = useState<MembershipRequest[]>([]);
    const [loading, setloading] = useState(true);

    const fetchRequests = async () => {
        try {
            const data = await membershipRequestService.getInbox();
            setRequests(data);
            console.log(data);
            

        } catch (error) {
            console.log("Failed to fetch Requests", error);
            
        } finally {
            setloading(false)
        }
    };

    useEffect(() => {
      fetchRequests();
    }, []);

    const handleApprove = async ( id: string ) => {
        if (!window.confirm("Approve this request?"))
        try {
            await membershipRequestService.approveRequest(id);
            alert("Request Approved!");
            fetchRequests();

        } catch (error) {
            alert("Failed to approve request");
            console.log(error);
        }
    }

    const handleReject = async (id: string) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            await membershipRequestService.rejectRequest(id);
            alert("Request Rejected.");
            fetchRequests(); // Refresh the list 
        } catch (error) {
            alert("Failed to reject request.");
            console.log(error);
            
        }
    };

    if(loading) return <Spinner/>

    return (
        <div className='space-y-6'>
            <h2 className='text-lg md:text-2xl font-bold italic text-gray-300'>
                Membership Requests
            </h2>

            <div className='bg-warrior-grey border border-neutral-600 rounded-2xl overflow-hidden'>
                {requests.length > 0 ? (
                    <div className='divide-y divide-neutral-700 '>
                        {requests.map((req) => (
                            <div key={req._id} className='p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-800 transition-colors'>
                                <div className='space-y-1'>
                                    <h3 className='text-gray-300 text-lg font-bold uppercase italic'>{req.name}</h3>
                                    <div className='flex flex-wrap gap-4 text-sm text-gray-400 font-medium'>
                                        <span className='flex items-center gap-1'><MdEmail className='bg-warrior-orange' /> {req.email}</span>
                                        <span className='flex items-center gap-1'><MdPhone className='bg-warrior-orange' /> {req.phone}</span>
                                    </div>
                                    <div className='pt-2'>
                                        <span className='bg-neutral-800 px-3 py-1 rounded-full text-[12px] font-bold text-warrior-orange border border-neutral-600 uppercase flex items-center gap-1 w-fit '>
                                            <MdCardMembership /> Interested in: {req.interestedPlan.name}
                                        </span>
                                    </div>
                                </div>

                                <div className='flex gap-2 w-full md:w-auto'>
                                    <button
                                        onClick={() => handleApprove(req._id)}
                                        className='flex-1 md:flex-none bg-green-500/10 text-green-500 hover:scale-105 p-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase cursor-pointer transition-all duration-200'
                                    >
                                        <MdCheck/> Approve
                                    </button>

                                    <button
                                        onClick={() => handleReject(req._id)}
                                        className='flex-1 md:flex-none bg-red-500/10 text-red-500 hover:scale-105 p-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase cursor-pointer transition-all duration-200'
                                    
                                    >
                                        <MdClose/> Reject
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='p-20 text-center text-gray-500 italic'>
                        No pending membership requests
                    </div>
                )}
            </div>
        </div>
    )
}

export default MembershipRequests
