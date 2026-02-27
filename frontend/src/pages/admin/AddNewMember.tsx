/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { userService } from "../../services/userService";
import Spinner from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { MdArrowBack, MdCheckCircle, MdEdit, MdPersonAdd } from "react-icons/md";
import { membershipService, type MembershipPlan } from "../../services/membershipService";
import { CoachForm } from "../../components/admin/CoachForm";
import { MemberForm } from "../../components/admin/MemberForm";


const AddNewMember = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [step, setStep] = useState(1); // 1 = Basic Info, 2 = Coach Details
    const [loading, setloading] = useState(false);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [fetchingData, setfetchingData] = useState(isEditMode);
    const [newUserId, setnewUserId] = useState("")
    const activeId = id || newUserId;   // The "Source of Truth" for the record ID

    //  FORM 1 : BASIC USER DATA
    const [formData, setFormData] = useState({
        name: '',
        nic:'',
        email: '',
        phone: '',
        role: 'member',
        status: 'active',
    });
    
    //  SECOND FORM : COACH
    const [coachData, setCoachData] = useState({
        specialties: "",   // We'll convert string to array on submit
        bio: "",
        certifications: "",
        experienceYears: 0,
        rating: 5.0
    })

    //  SECOND FORM : MEMBER
    const [memberData, setMemberData] = useState({
        medicalConditions: "",
        fitnessGoal: "",
        weight: 0,
        height: 0,
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        planId: "",
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
            const loadUserData = async () => {
                try {
                    const responseData = await userService.getUserById(id as string);
                    const { user, subscription , specialProfile } = responseData;

                    //console.log("USER ID : ", id);
                    //console.log("RESPONSE DATA :", responseData);
                    
                    //  Extracting the user from the nested data structure
                    setFormData({
                        name: user.name || '',
                        nic: user.nic || '',
                        email:user.email || '',
                        phone: user.phone || '',
                        role: user.role || 'member',
                        status: user.status || 'active',
                    })                    

                    //  Step: 2 Set special user info
                    if (user.role === 'coach' && specialProfile) {
                        setCoachData({
                            specialties: specialProfile.specialties?.join(', ') || "",
                            bio: specialProfile.bio || "",
                            certifications: specialProfile.certifications?.join(',') || "",
                            experienceYears: specialProfile.experienceYears || 0,
                            rating: specialProfile.rating || 5.0
                        });
                    } else if (user.role === 'member' && specialProfile) {
                        setMemberData({
                            medicalConditions: specialProfile.medicalConditions?.join(',') || "",
                            fitnessGoal: specialProfile.fitnessGoal?.join(',') || "",
                            weight: specialProfile.weight || "",
                            height: specialProfile.height || "",
                            emergencyContactName: specialProfile.emergencyContactName || "",
                            emergencyContactPhone: specialProfile.emergencyContactPhone || "",
                            emergencyContactRelation: specialProfile.emergencyContactRelation || "",
                            planId : subscription?.plan?._id
                        });
                    }
                    
                    
                } catch (error) {
                    alert("Could no find user")
                    console.log(error);
                    
                } finally {
                    setfetchingData(false)
                }
            };
            loadUserData();
        }
    },[id, isEditMode, navigate])

    //  HANDLER FOR STEP 1 : Basic Info
    const handleStepOneSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setloading(true);

        try {
            // If we have a URL ID or a session-created Id, we can UPDATE (PATCH)
            // If we have neither, we use CREATE (POST)   
            if (activeId) {
                await userService.updateUser(activeId, formData);
            } else {
               const newUser = await userService.createNewUser(formData);
               setnewUserId(newUser._id)
            }
            setStep(2);

        } catch (error: any) {    
                alert(error.response?.data?.message || "Operation failed!!");
        } finally {
            setloading(false);
        }
    }

    //  HANDLER FOR STEP 2: Coach Profile
    const handleStepTwoSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setloading(true);

        try {   
            let profileToSubmit: any = {};

            if (formData.role === 'coach') {
                profileToSubmit = {
                    ...coachData,
                    specialities: coachData.specialties.split(',').map(s => s.trim()).filter(s => s !== ""),
                    certifications: coachData.certifications.split(',').map(c => c.trim()).filter(c => c !== ""),  
                }
            } else if (formData.role === 'member') {
                profileToSubmit = {
                    ...memberData,
                    medicalConditions: memberData.medicalConditions.split(',').map(m => m.trim()).filter(m => m !== ""),
                    fitnessGoal: memberData.fitnessGoal.split(',').map(f => f.trim()).filter(f => f !== ""), 
                    planId: isEditMode ? undefined : memberData.planId
                };
            }

            await userService.updateSpecialProfile(id || newUserId, formData.role, profileToSubmit);
            alert(`${formData.role} registration complete`)
            navigate(formData.role === 'coach' ? '/admin/coaches' : '/admin/members')
            
        } catch (error: any) {
            alert("Failed to update coach profile");
            console.log("Failed to update profile  :",error);
        } finally {
            setloading(false)
        }
    }

    if (fetchingData) return <Spinner/>

    //  RENDER STEP 2: Coach Proffesional Form
    if (step === 2) {
        return(
            <div>
                <div className="mb-4">
                    <button onClick={() => setStep(1)} className="text-gray-400 flex items-center gap-2 mb-4 hover:text-white cursor-pointer"><MdArrowBack/> Back to Account Info </button>
                    <h2 className="text-2xl font-bold italic text-gray-300 uppercase">Step 2: <span className="text-warrior-orange">{formData.role} Details</span></h2>
                </div>

                <form
                    onSubmit={handleStepTwoSubmit}
                    className="bg-warrior-grey p-6 rounded-2xl border border-neutral-600 space-y-4"
                >
                    {/* Switch which form is shown */}
                    {formData.role === 'coach' && <CoachForm data={coachData} onChange={setCoachData} />}
                    {formData.role === 'member' && <MemberForm data={memberData} onChange={setMemberData} plans={plans} isEditMode={isEditMode} />}

                    <Button 
                        type="submit"
                        loading={loading}

                    >
                        <MdCheckCircle size={18} /> {isEditMode ? 'Update' : 'Complete'} {formData.role} Profile
                    </Button> 

                </form>
            </div>

        )
    }

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

            <form onSubmit={handleStepOneSubmit} className="bg-warrior-grey p-6 rounded-2xl  border border-neutral-600 space-y-4">

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
