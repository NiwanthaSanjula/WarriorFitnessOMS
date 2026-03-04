/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import type { User } from "../../types/auth"
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import { MdFitnessCenter, MdArrowForward, MdSearch, MdPeople } from "react-icons/md";
import { GiMuscleUp } from "react-icons/gi";
import { assets } from "../../assets/assets";
import { progressService } from "../../services/progressService";

const STATUS_STYLES: Record<string, string> = {
    active:           "text-green-400 bg-green-900/20 border-green-800/40",
    blocked:          "text-red-400 bg-red-900/20 border-red-800/40",
    "pending-payment":"text-yellow-400 bg-yellow-900/20 border-yellow-800/40",
};

const MyClients = () => {
    const [clients, setClients]   = useState<User[]>([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState("");
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
    }, []);

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                        <MdPeople className="text-warrior-orange" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                            My <span className="text-warrior-orange">Clients</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            {clients.length} warrior{clients.length !== 1 ? "s" : ""} under your wing
                        </p>
                    </div>
                </div>

                {/* Total badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl">
                    <GiMuscleUp className="text-warrior-orange" size={16} />
                    <span className="text-sm font-black text-white">{clients.length}</span>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total</span>
                </div>
            </div>

            {/* ── SEARCH ── */}
            {clients.length > 0 && (
                <div className="relative">
                    <MdSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-warrior-orange transition-colors placeholder:text-gray-600"
                    />
                </div>
            )}

            {/* ── CLIENT LIST ── */}
            {filtered.length > 0 ? (
                <div className="space-y-2">
                    {filtered.map((client, index) => (
                        <div
                            key={client._id}
                            onClick={() => navigate(`/coach/members/${client._id}`)}
                            className="group flex items-center gap-4 p-4 bg-warrior-grey border border-neutral-700 hover:border-warrior-orange/50 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-warrior-orange/10"
                            style={{ animationDelay: `${index * 40}ms` }}
                        >
                            {/* Index number */}
                            <span className="text-[10px] font-black text-gray-700 w-5 text-center shrink-0 group-hover:text-warrior-orange transition-colors">
                                {index + 1}
                            </span>

                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-neutral-700 group-hover:border-warrior-orange/50 transition-colors shrink-0">
                                <img
                                    src={assets.dpPlaceholder}
                                    alt={client.name}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black italic uppercase text-white truncate group-hover:text-warrior-orange transition-colors">
                                    {client.name}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">{client.email}</p>
                            </div>

                            {/* Status badge */}
                            {(client as any).status && (
                                <span className={`hidden md:inline-flex text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${STATUS_STYLES[(client as any).status] ?? "text-gray-400 bg-neutral-800 border-neutral-700"}`}>
                                    {(client as any).status}
                                </span>
                            )}

                            {/* Phone */}
                            {(client as any).phone && (
                                <span className="hidden lg:block text-[10px] text-gray-500 font-medium shrink-0">
                                    {(client as any).phone}
                                </span>
                            )}

                            {/* Arrow */}
                            <MdArrowForward
                                size={16}
                                className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0"
                            />
                        </div>
                    ))}
                </div>
            ) : clients.length === 0 ? (
                /* No clients at all */
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-4">
                        <MdFitnessCenter size={32} className="text-neutral-600" />
                    </div>
                    <p className="text-white font-black italic uppercase text-xl mb-1">No Warriors Yet</p>
                    <p className="text-gray-500 text-sm">No clients have been assigned to you yet.</p>
                </div>
            ) : (
                /* Search returned nothing */
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-12 text-center">
                    <MdSearch size={32} className="text-neutral-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No clients match <span className="text-white font-bold">"{search}"</span></p>
                    <button onClick={() => setSearch("")} className="mt-2 text-[10px] font-black uppercase text-blue-400 hover:underline">
                        Clear search
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyClients;