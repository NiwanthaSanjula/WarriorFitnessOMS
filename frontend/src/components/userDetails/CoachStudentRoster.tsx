/* eslint-disable @typescript-eslint/no-explicit-any */
import { MdGroups, MdMail, MdOpenInNew, MdPerson, MdPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom"

export const CoachStudentRoster = ({ clients }: { clients: any[]  }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden ">
            <div className="p-6 border-b border-neutral-700 flex justify-between items-center">
                <div className="flex itc gap-3">
                    <div className="bg-warrior-orange/10 p-2 rounded-lg"> 
                        <MdGroups size={22} className="text-warrior-orange" />
                    </div>

                    <div>
                        <h3 className="text-gray-300 text-xs font-black uppercase tracking-widest">Assigned Warriors</h3>
                        <p className="text-[10px] text-gray-400 uppercase">{clients.length} Members Assigned</p>
                    </div>
                </div>
            </div>

            <div>
                {clients.length > 0 ? (
                    <div className="p-6">
                        {clients.map((client) => (
                            <div key={client._id} className="flex items-start justify-between p-4 bg-warrior-dark rounded-lg border border-neutral-700/75">
                                <div className="flex flex-col text-gray-400 text-xs md:text-sm">
                                    <span className="flex items-center gap-2"> <MdPerson size={16} className="text-warrior-orange"/> {client.name}</span>
                                    <span className="flex items-center gap-2" > <MdMail size={16} className="text-warrior-orange" />{client.email}</span>
                                    <span className="flex items-center gap-2">  <MdPhone size={16} className="text-warrior-orange" /> {client.phone}</span>
                                </div>

                                <div 
                                    className="text-gray-600 cursor-pointer hover:text-warrior-orange transition-all duration-300"
                                    onClick={() => navigate(`/admin/members/${client._id}`)}
                                >
                                    <MdOpenInNew size={22}/>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <span>No clients assigned</span>
                    </div>
                )}
            </div>
        </div>
    )
}