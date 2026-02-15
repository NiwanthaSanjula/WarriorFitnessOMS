import React, { useEffect, useState } from 'react'
import type { User } from '../../types/auth'
import { userService } from '../../services/userService';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

const ManageUsers = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
       const fetchUsers = async () => {
            try {
                const data = await userService.getAllUsers();
                setUsers(data)

            } catch (error) {
                console.log("Failed to fetch users", error);
                
            } finally {
                setLoading(false)
            }
        };
        fetchUsers();
        console.log(users);
        

    }, [])

    if (loading) return <div className='text-warrior-orange w-full h-full flex items-center justify-center'>Loading Users...</div>

    return (
        <div className='space-y-6'>
            <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold italic text-gray-300'>
                    MANAGE MEMBERS
                </h2>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
                {users.map((user) => (
                    <div 
                        key={user._id}
                        onClick={() => navigate(`/users/${user._id}`)}
                        className='bg-neutral-900 border border-neutral-800 rounded-lg p-3 transition-all duration-300 hover:border-warrior-orange/75 flex flex-col justify-between cursor-pointer hover:-translate-y-2'
                    >
                        {/*  Image*/}
                        <div className='mb-3 w-fit aspect-square'>
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

                        {/* Role Badge */}
                        <div className='mb-3'>
                            <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase ${
                                    user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                    user.role === 'coach' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>

                        {/* Actions Footer */}
                        <div className='flex gap-2 pt-2 border-t border-neutral-800'>
                            <button 
                                className='flex-1 flex items-center justify-center py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-warrior-orange transition-colors duration-200 group'
                                title='Edit user'
                            >
                                <MdEdit size={14} className='group-hover:scale-110 transition-transform' />
                            </button>
                            <button 
                                className='flex-1 flex items-center justify-center py-1 rounded bg-neutral-800 hover:bg-red-500/10 text-gray-300 hover:text-warrior-red transition-colors duration-200 group'
                                title='Delete user'
                            >
                                <MdDelete size={14} className='group-hover:scale-110 transition-transform' />
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