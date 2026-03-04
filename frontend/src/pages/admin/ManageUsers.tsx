/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import type { User } from '../../types/auth';
import { userService } from '../../services/userService';
import { MdCheckCircleOutline, MdEdit, MdSearch } from 'react-icons/md';
import { GiMuscleUp, GiWhistle } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { attendanceService } from '../../services/attendanceService';
import Spinner from '../../components/ui/Spinner';

interface ManageUserProps {
    roleFilter: 'member' | 'coach';
}

const ManageUsers = ({ roleFilter }: ManageUserProps) => {
    const [users, setUsers]           = useState<User[]>([]);
    const [loading, setLoading]       = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const isMember = roleFilter === 'member';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data.filter((u: User) => u.role === roleFilter));
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [roleFilter]);

    const filteredUsers = useMemo(() =>
        users.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    const handleAttendance = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        try {
            await attendanceService.checkInMember(userId);
            alert('Warrior Checked In!');
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Check-in failed');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                        isMember
                            ? 'bg-warrior-orange/10 border-warrior-orange/20'
                            : 'bg-warrior-orange/20 border-warrior-orange/30'
                    }`}>
                        {isMember
                            ? <GiMuscleUp className="text-warrior-orange" size={24} />
                            : <GiWhistle className="text-warrior-orange" size={24} />
                        }
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                            Manage{' '}
                            <span className={isMember ? 'text-warrior-orange' : 'text-warrior-orange'}>
                                {isMember ? 'Members' : 'Coaches'}
                            </span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                            {users.length} {isMember ? 'warrior' : 'coach'}{users.length !== 1 ? 's' : ''} registered
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-warrior-orange outline-none transition-colors placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* ── GRID ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredUsers.map(user => (
                    <div
                        key={user._id}
                        onClick={() => navigate(`/admin/members/${user._id}`)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 transition-all duration-300 hover:border-warrior-orange/75 flex flex-col justify-between cursor-pointer hover:-translate-y-2"
                    >
                        {/* Avatar */}
                        <div className="mb-3 w-fit aspect-square bg-neutral-800 rounded overflow-hidden">
                            <img src={assets.dpPlaceholder} alt="Display" />
                        </div>

                        {/* Name + email */}
                        <div className="mb-3 min-h-12">
                            <h3 className="text-xs md:text-base font-semibold text-gray-300 truncate">{user.name}</h3>
                            <p className="text-[10px] md:text-sm text-gray-400 truncate mt-0.5 line-clamp-1">{user.email}</p>
                        </div>

                        {/* Check-in button (members only) */}
                        {isMember && (
                            <button
                                onClick={e => handleAttendance(e, user._id)}
                                disabled={(user as any).isCheckedIn}
                                className={`w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 rounded border transition-all duration-200 uppercase text-[10px] md:text-sm font-bold ${
                                    (user as any).isCheckedIn
                                        ? 'bg-green-500/10 text-green-500 border-green-500/40 cursor-not-allowed'
                                        : 'bg-warrior-orange/10 hover:bg-warrior-orange text-warrior-orange hover:text-white border-warrior-orange/40'
                                }`}
                            >
                                <MdCheckCircleOutline size={14} />
                                {(user as any).isCheckedIn ? 'Checked-In' : 'Check-In'}
                            </button>
                        )}

                        {/* Edit footer */}
                        <div className="flex gap-2 pt-2 border-t border-neutral-800">
                            <button
                                onClick={e => { e.stopPropagation(); navigate(`/admin/members/edit/${user._id}`); }}
                                className="flex-1 gap-2 flex items-center justify-center py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-warrior-orange transition-colors duration-200 group"
                            >
                                <MdEdit size={14} className="group-hover:scale-110 transition-transform" /> Edit User
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredUsers.length === 0 && !loading && (
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-400 text-lg">
                        {searchTerm ? `No results for "${searchTerm}"` : 'No users found'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;