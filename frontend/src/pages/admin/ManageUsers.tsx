/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import type { User } from '../../types/auth'
import { userService } from '../../services/userService';
import { MdCheckCircleOutline, MdEdit, MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { attendanceService } from '../../services/attendanceService';
import Spinner from '../../components/ui/Spinner';

// Props to accespt the rolee filter
interface ManageUserProps {
    roleFilter: 'member' | 'coach'
}

const ManageUsers = ({ roleFilter } : ManageUserProps ) => {

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();


    const fetchUsers = async () => {
        setLoading(true); //reset loading when switching tabs
        try {
            const data = await userService.getAllUsers();
            //  Filter by rolee immediately after fetching
            const filterByRole = data.filter( u => u.role === roleFilter);
            setUsers(filterByRole);

        } catch (error) {
            console.log("Failed to fetch users", error);
            
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchUsers();
        console.log(users);
        
    }, [roleFilter]);


    //  Search filtering within the specific role list
    const filteredUsers = useMemo(() => {
        return users.filter( user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);


    //  Handle attendance marks
    const handleAttendance = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        try {
            await attendanceService.checkInMember(userId);
            alert('Warrior Checked In!');
            fetchUsers();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert (error.response?.data?.message || 'Check-in failed')
        }
    };

    if (loading) return <Spinner/>

    return (
        <div className='space-y-6 max-w-6xl mx-auto'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2 justify-between'>
                <h2 className='text-lg md:text-2xl font-bold italic text-gray-300'>
                    MANAGE {roleFilter === 'member' ? 'MEMBERS' : 'COACHES'}
                </h2>

                <div className='relative w-full md:w-80'>
                    <MdSearch size={20} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-50'/>
                    <input 
                        type="text" 
                        placeholder='Search by name or email...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full bg-neutral-800 border border-neutral-700 rounded-lg py-1.5 md:py-2.5 pl-10 pr-4 text-sm md:text-base text-white focus:border-warrior-orange outline-none transition-all'
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
                {filteredUsers.map((user) => (
                    <div 
                        key={user._id}
                        onClick={() => navigate(`/admin/members/${user._id}`)}
                        className='bg-neutral-900 border border-neutral-800 rounded-lg p-3 transition-all duration-300 hover:border-warrior-orange/75 flex flex-col justify-between cursor-pointer hover:-translate-y-2'
                    >
                        {/*  Image*/}
                        <div className='mb-3 w-fit aspect-square bg-neutral-800 rounded overflow-hidden'>
                            <img src={assets.dpPlaceholder} alt="Display-Image" />
                             
                        </div>

                        {/* Header Section */}
                        <div className='mb-3 min-h-12'>
                            <h3 
                                className='text-xs md:text-base font-semibold text-gray-300 truncate'
                            >
                                {user.name}
                            </h3>
                            <p className='text-[10px] md:text-sm text-gray-400 truncate mt-0.5 line-clamp-1'>{user.email}</p>
                        </div>

                        {/* Attendance Button (ONLY MEMBERS) */}
                        {roleFilter === 'member' && (
                            <button 
                                onClick={(e) => handleAttendance(e, user._id)}
                                disabled={user.isCheckedIn}
                                className={`w-full mb-3 flex items-center justify-center gap-1.5 py-1.5 rounded border transition-all duration-200 uppercase text-[10px] md:text-sm font-bold
                                            ${user.isCheckedIn
                                                ? 'bg-green-500/10 text-green-500 border-green-500/40 cursor-not-allowed'
                                                : 'bg-warrior-orange/10 hover:bg-warrior-orange text-warrior-orange hover:text-white border-warrior-orange/40'
                                            } `}
                            >

                                {user.isCheckedIn ? (
                                    <>
                                        <MdCheckCircleOutline size={14} /> 
                                        Checked-In
                                    </>

                                ) : (
                                    <>
                                        <MdCheckCircleOutline size={14} /> 
                                        Check-In
                                     </>
                                )}

                                
                            </button>
                        )}

                        {/* Role Badge */}
                        {/*<div className='mb-3'>
                            <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase ${
                                    user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                    user.role === 'coach' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>*/}

                        {/* Actions Footer */}
                        <div className='flex gap-2 pt-2 border-t border-neutral-800'>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); //Stop from navigating to Details page
                                    navigate(`/admin/members/edit/${user._id}`)
                                }}
                                className='flex-1 gap-2 flex items-center justify-center py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-warrior-orange transition-colors duration-200 group'
                                title='Edit user'
                            >
                                <MdEdit size={14} className='group-hover:scale-110 transition-transform' /> Edit User
                            </button>

                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {users.length === 0 && !loading && (
                <div className='flex items-center justify-center py-12'>
                    <p className='text-gray-400 text-lg'>No users found</p>
                </div>
            )}
        </div>
    )
}

export default ManageUsers