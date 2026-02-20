/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { authService } from '../../services/authService'; // 🔥 Using your authService
import { UserInfoCard } from '../../components/userDetails/UserInfoCard';
import { Button } from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { MdAdminPanelSettings, MdSecurity, MdHistory } from 'react-icons/md';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Your getMe returns { status: 'success', data: { user: {...} } }
                const response = await authService.getMe();
                setAdminData(response.data.user);
            } catch (error) {
                console.error("Failed to load admin profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <Spinner />;
    if (!adminData) return <div className="text-gray-400">Error loading admin profile.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-4 bg-warrior-orange/10 rounded-2xl border border-warrior-orange/20">
                    <MdAdminPanelSettings size={40} className="text-warrior-orange" />
                </div>
                <div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                        Admin <span className="text-warrior-orange">Profile</span>
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Warrior Fitness Management</p>
                </div>
            </div>

            {/* 🔥 Name Card Section */}
            <div className="bg-gradient-to-r from-warrior-grey to-neutral-800 p-8 rounded-3xl border border-neutral-700 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                        <span className="text-warrior-orange text-[10px] font-black uppercase tracking-[0.2em]">Authorized Personnel</span>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                            {adminData.name}
                        </h1>
                        <p className="text-gray-400 font-medium">{adminData.email}</p>
                    </div>
                    <div className="px-6 py-2 flex items-center justify-center bg-black/30 rounded-full border border-white/5">
                        <span className="text-white font-bold italic text-center uppercase tracking-widest text-xs">System Master</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserInfoCard user={adminData} />

                {/* Account Security Card */}
                <div className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                            <MdSecurity className="text-warrior-orange" /> System Security
                        </h3>
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                            You are currently logged in as a Super Admin. Ensure your credentials are kept private.
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <Button className="w-full text-xs py-3" variant="outline">
                            Change Master Password
                        </Button>
                        <Button className="w-full text-xs border-neutral-700 text-gray-400 hover:text-white py-3" variant="outline">
                            Update Admin Contact
                        </Button>
                    </div>
                </div>

                {/* Audit Info */}
                <div className="md:col-span-2 bg-warrior-grey p-6 rounded-2xl border border-neutral-600">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                        <MdHistory className="text-warrior-orange" /> System Audit
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col p-3 bg-black/20 rounded-xl">
                            <span className="text-gray-500 text-[10px] uppercase font-bold mb-1">Internal Reference ID</span>
                            <span className="text-gray-300 font-mono text-xs">{adminData._id}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-black/20 rounded-xl">
                            <span className="text-gray-500 text-[10px] uppercase font-bold mb-1">Global Permissions</span>
                            <span className="text-warrior-orange font-bold text-xs uppercase">All Access Granted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;