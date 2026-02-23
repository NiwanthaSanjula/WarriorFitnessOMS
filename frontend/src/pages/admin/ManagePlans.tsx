import React, { useEffect, useState } from 'react'
import { membershipService, type MembershipPlan } from '../../services/membershipService'
import Spinner from '../../components/ui/Spinner';
import { MdAdd, MdAttachMoney, MdTimer } from 'react-icons/md';

const ManagePlans = () => {


    const [plans, setplans] = useState<MembershipPlan[]>([]);
    const [loading, setloading] = useState(true);
    const [isModalOpen, setisModalOpen] = useState(false);

    //  Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        durationDays: '',
        description:''
    });

    const fetchPlans = async () => {
        try {
            const data = await membershipService.getPlans();
            setplans(data);
            console.log(plans);
            

        } catch (error) {
            console.log("Failed to fetch plans", error);
            
        } finally {
            setloading(false)
        }
    }

    useEffect(() => { 
        fetchPlans()
    }, []);

    const handleCreatePlan = async (e: React.SubmitEvent) => {
        e.preventDefault();

        setloading(true)
        try {
            await membershipService.createPlan({
                ...formData,
                price: Number(formData.price),
                durationDays: Number(formData.durationDays)
            });

            setisModalOpen(false);
            setFormData({ name: '', price: '', durationDays: '', description: '' })
            fetchPlans()

        } catch (error) {
            alert("Failed to create plan");
            console.log(error);
        
        }   finally {
            setloading(false)
        }
    }

    if (loading) return <Spinner/>;

    return (
        <div className='space-y-6 max-w-6xl mx-auto'>
            <div className='flex flex-col md:flex-row items-start gap-3 md:justify-between md:items-center'>
                <h2 className='text-lg md:text-2xl font-bold italic text-gray-300 uppercase'>
                    Manage Membership Plans
                </h2>

                <button
                    onClick={() => setisModalOpen(true)}
                    className='flex items-center gap-2 bg-warrior-orange text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:scale-105 transition-all duration-200'
                >
                    <MdAdd size={20}/> Create Plan
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {plans.map(plan => (
                    <div key={plan._id} className='bg-warrior-grey border border-neutral-600 rounded-2xl p-6 overflow-hidden group'>
                        <div className='relative z-10'>
                            <h3 className='text-lg font-bold italic text-gray-300 uppercase mb-2'>{plan.name}</h3>

                            <div className='flex items-center gap-2 text-warrior-orange font-bold text-xl md:text-2xl mb-2'>
                                <MdAttachMoney size={20}/> {plan.price}
                            </div>

                            <div className='flex items-center gap-2 text-gray-400 font-bold text-lg md:text-xl mb-2'>
                                <MdTimer size={20} /> {plan.durationDays} Days
                            </div>
                            <p className='text-gray-400 text-sm line-clamp-2 italic'>{plan.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE PLAN MODAL */}
            { isModalOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4'>
                    <form
                        onSubmit={handleCreatePlan}
                        className='bg-warrior-grey border border-neutral-600 rounded-2xl p-6 w-full max-w-md shadow-lg shadow-warrior-orange'
                    >
                        <h3 className='text-xl text-center font-bold text-gray-300 italic uppercase mb-6'>Create New Plan</h3>

                        <div className='space-y-4'>
                            <input 
                                type="text" 
                                placeholder='Plan Name (e.g. Warrior Monthly)'
                                required
                                className='w-full bg-warrior-dark border border-neutral-700 rounded-lg px-3 py-2 text-gray-300 outline-none focus:border-warrior-orange'
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />

                            <div className='flex flex-col md:flex-row gap-4'>

                                <input 
                                    type="number" 
                                    placeholder='Plan Price (e.g. 2500)'
                                    required
                                    className='w-full bg-warrior-dark border border-neutral-700 rounded-lg px-3 py-2 text-gray-300 outline-none focus:border-warrior-orange'
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                />

                                <input 
                                    type="number" 
                                    placeholder='Duration (Days)'
                                    required
                                    className='w-full bg-warrior-dark border border-neutral-700 rounded-lg px-3 py-2 text-gray-300 outline-none focus:border-warrior-orange'
                                    value={formData.durationDays}
                                    onChange={e => setFormData({...formData, durationDays: e.target.value})}
                                />
                            </div>

                            <textarea 
                                placeholder='Description'
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className='w-full bg-warrior-dark border border-neutral-700 rounded-lg px-3 py-2 text-gray-300 outline-none focus:border-warrior-orange'
                            />
                        </div>

                        <div className='flex gap-3 mt-8'>
                            <button 
                                type='button'
                                onClick={() => setisModalOpen(false)}
                                className='flex-1 text-gray-500 font-black uppercase text-sm cursor-pointer hover:text-white transition-all duration-200' 
                            >
                                Cancel
                            </button>

                            <button 
                                type='submit'
                                className='flex-1 bg-warrior-orange text-white py-3 rounded-lg font-bold uppercase text-sm hover:scale-105 transition-all duration-200 cursor-pointer'
                            >
                                Save Plan
                            </button>
                        </div>

                    </form>
                </div>
            ) }
        
        </div>
    )
}

export default ManagePlans
