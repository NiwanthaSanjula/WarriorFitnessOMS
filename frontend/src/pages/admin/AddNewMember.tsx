/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { userService } from "../../services/userService";
import Spinner from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { MdArrowBack, MdEdit, MdPersonAdd } from "react-icons/md";
import { membershipService, type MembershipPlan } from "../../services/membershipService";


const AddNewMember = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setloading] = useState(false);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [fetchingData, setfetchingData] = useState(isEditMode);

    const [formData, setFormData] = useState({
        name: '',
        nic:'',
        email: '',
        phone: '',
        role: 'member',
        status: 'active',
        planId: '',
    })


    //  Load data if in edit mode
    useEffect(() => {

        // Fetch plans for the dropdown
        const fetchPlans = async () => {
            const data = await membershipService.getPlans();
            setPlans(data)
        }
        fetchPlans();


        if (isEditMode) {
            const loadUser = async () => {
                try {
                    const responseData = await userService.getUserById(id);

                    const userData = responseData.user
                    
                    //  Extracting the user from the nested data structure
                    setFormData({
                        name: userData.name || '',
                        nic: userData.nic || '',
                        email:userData.email || '',
                        phone: userData.phone || '',
                        role: userData.role || 'member',
                        status: userData.status || 'active',
                        planId: userData || ''
                    })                    
                    console.log( "Form data populated from:",userData);
                    

                } catch (error) {
                    alert("Could no find user")
                    console.log(error);
                    
                } finally {
                    setfetchingData(false)
                }
            };
            loadUser();
        }
    },[id, isEditMode, navigate])

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setloading(true);

        try {
            if (isEditMode && id) {
                await userService.updateUser(id, formData);
                alert("Member updated successfully!")
            } else {
                await userService.createNewUser(formData);
                alert(`Warrior Registered! Default password is: ${formData.nic} `)
            }
            navigate('/admin/members');
        } catch (error) {
            // Narrow the type of `error`
            if (error instanceof Error) {
                alert(error.message || "Operation failed!!");
            } else if (typeof error === "object" && error !== null && "response" in error) {
                alert((error as any).response?.data?.message || "Operation failed!!");
            } else {
                alert("An unknown error occurred!");
            }

        } finally {
            setloading(false);
        }
    }

    if (fetchingData) return <Spinner/>

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            <div className="flex flex-col ">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-400 flex items-center gap-2 mb-4 cursor-pointer hover:text-gray-300 transition-all duration-200"
                >
                    <MdArrowBack size={18} /> Back to Members
                </button>

                <h2 className="text-lg md:text-2xl font-bold italic text-gray-300 uppercase">
                    {isEditMode ? 'Edit' : 'Register'} <span className="text-warrior-orange">Warrior</span>
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-warrior-grey p-6 rounded-2xl  border border-neutral-600 space-y-4">

                <div className="space-y-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="e.g. Jhon Snow"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name:e.target.value})}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="e.g. jhonsnow@gmail.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email:e.target.value})}
                    />



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="NIC Number"
                            type="text"
                            placeholder="e.g. 199XXXXXXXX"
                            required
                            value={formData.nic}
                            onChange={(e) => setFormData({...formData, nic:e.target.value})}
                        />
                        <Input
                            label="Contact Number"
                            type="text"
                            placeholder="07XXXXXXXX"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone:e.target.value})}
                        />
                    </div>

                    
                    {!isEditMode && formData.role === 'member' && (
                        <div className="flex flex-col gap-2 col-span-2 ">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Initial Membership Plan</label>
                            <select
                            className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all cursor-pointer"
                            value={formData.planId}
                            onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                        >
                            <option value="">-- No Plan (Pay Later) --</option>
                            {plans.map(plan => (
                                <option key={plan._id} value={plan._id}>
                                    {plan.name} - {plan.price} LKR
                                </option>
                            ))}
                        </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Role Selection */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">System Role</label>
                            <select
                                className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all cursor-pointer"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value})}
                            >
                                <option value="member">Member</option>
                                <option value="coach">Coach</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Status Selection (Only show in Edit mode if you want) */}
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">Account Status</label>
                            <select 
                                className="w-full bg-warrior-dark border border-neutral-700 text-gray-300 p-3 rounded-md outline-none focus:border-warrior-orange transition-all cursor-pointer"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="active">Active</option>
                                <option value="pending-payment">Pending Payment</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                    </div>

                </div>

                <div>
                    <Button
                        type="submit"
                        className="flex-1 py-4 text-sm"
                        loading={loading}
                    >
                        {isEditMode ? <> <MdEdit/> Update </> : <><MdPersonAdd/> Add New Member</>}
                    </Button>

                    {isEditMode && (
                        <p className="text-[10px] text-gray-500 italic text-center md:text-left md:max-w-50 ">
                            * New members will use their NIC as their initial password.
                        </p>
                    )}
                </div>

                


            </form>
        </div>
        
    )
}

export default AddNewMember
