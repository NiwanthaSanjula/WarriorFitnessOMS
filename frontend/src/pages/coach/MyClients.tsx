import { useEffect, useState } from "react"
import type { User } from "../../types/auth"
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import { MdCheckCircle, MdChevronRight, MdFitnessCenter, MdRadioButtonUnchecked } from "react-icons/md";
import { assets } from "../../assets/assets";
import { progressService } from "../../services/progressService";


const MyClients = () => {

    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await progressService.getCoachMembers();
                setClients(data);
            } catch (error) {
                console.log("Failed to fetch clients", error);
            } finally {
                setLoading(false);
            }
        };
      fetchClients();

    }, [])

    const handleViewMember = (memberId: string) => {
        navigate(`/coach/members/${memberId}`);
    };

    if (loading) return <Spinner/>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg md:text-2xl font-bold  italic text-gray-400 uppercase">
                    My CLIENTS
                </h2>
                <div className="text-sm font-bold text-gray-400 uppercase bg-neutral-800 px-3 py-1 rounded-full border border-neutral-600">
                    Total : {clients.length}
                </div>
            </div>

            <div className="bg-warrior-grey border border-neutral-700  rounded-2xl overflow-hidden">
                {clients.length > 0 ? (
                    <div>
                        {clients.map((client) => (
                            <div
                                key={client._id}
                                onClick={() => handleViewMember(client._id)}
                                className="flex items-center justify-between p-4 hover:bg-neutral-800 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className='w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden'>
                                        <img src={assets.dpPlaceholder} alt="" className="className='w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity'"/>
                                    </div>

                                    <div>
                                        <h3 className='text-white font-bold italic uppercase text-sm md:text-base'>{client.name}</h3>
                                        <p className='text-gray-500 text-xs'>{client.email}</p>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
              
                ) : (
                    <div className='p-20 text-center flex flex-col items-center gap-4'>
                    <MdFitnessCenter size={48} className='text-neutral-800' />
                    <p className='text-gray-500 font-medium'>No Warriors assigned to you yet.</p>
                </div>
                )}

            </div>
        </div>
    )
}

export default MyClients
