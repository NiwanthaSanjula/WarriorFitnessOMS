/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../services/userService";
import Spinner from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { MdArrowBack, MdCheckCircle, MdEdit, MdPersonAdd, MdPerson, MdShield, MdSportsMartialArts } from "react-icons/md";
import { GiMuscleUp, GiWhistle } from "react-icons/gi";
import { membershipService, type MembershipPlan } from "../../services/membershipService";
import { CoachForm } from "../../components/admin/CoachForm";
import { MemberForm } from "../../components/admin/MemberForm";

const ROLE_ICON: Record<string, React.ReactNode> = {
    member: <GiMuscleUp size={22} className="text-warrior-orange" />,
    coach:  <GiWhistle  size={22} className="text-blue-400" />,
    admin:  <MdShield   size={22} className="text-purple-400" />,
};
const ROLE_ACCENT: Record<string, string> = {
    member: 'text-warrior-orange',
    coach:  'text-blue-400',
    admin:  'text-purple-400',
};
const ROLE_BORDER: Record<string, string> = {
    member: 'border-warrior-orange/20 bg-warrior-orange/10',
    coach:  'border-blue-800/30 bg-blue-900/20',
    admin:  'border-purple-800/30 bg-purple-900/20',
};

// ── Step Indicator ────────────────────────────────────────────────────────────
const StepBar = ({ step, role }: { step: number; role: string }) => {
    const accent = ROLE_ACCENT[role] || 'text-warrior-orange';
    const steps = ['Account Info', `${role.charAt(0).toUpperCase() + role.slice(1)} Details`];
    return (
        <div className="flex items-center gap-3">
            {steps.map((label, i) => {
                const idx = i + 1;
                const active   = step === idx;
                const complete = step > idx;
                return (
                    <React.Fragment key={idx}>
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                                complete ? 'border-green-500 bg-green-500/20 text-green-400' :
                                active   ? `border-current ${accent} bg-current/10` :
                                           'border-neutral-700 text-gray-600'
                            }`}>
                                {complete ? <MdCheckCircle size={14} /> : idx}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                                active ? accent : complete ? 'text-green-400' : 'text-gray-600'
                            }`}>{label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-px ${step > 1 ? 'bg-green-800' : 'bg-neutral-700'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ── Select Field ──────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, children }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</label>
        <select
            className="w-full bg-neutral-800/60 border border-neutral-700 text-gray-300 px-3 py-2.5 rounded-xl outline-none focus:border-warrior-orange transition-colors cursor-pointer text-sm"
            value={value}
            onChange={onChange}
        >
            {children}
        </select>
    </div>
);

const AddNewMember = () => {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const isEditMode = !!id;

    const [step, setStep]               = useState(1);
    const [loading, setLoading]         = useState(false);
    const [plans, setPlans]             = useState<MembershipPlan[]>([]);
    const [fetchingData, setFetchingData] = useState(isEditMode);
    const [newUserId, setNewUserId]     = useState('');
    const activeId = id || newUserId;

    const [formData, setFormData] = useState({
        name: '', nic: '', email: '', phone: '',
        role: 'member', status: 'active',
    });

    const [coachData, setCoachData] = useState({
        specialties: '', bio: '', certifications: '',
        experienceYears: 0, rating: 5.0,
    });

    const [memberData, setMemberData] = useState({
        medicalConditions: '', fitnessGoal: '',
        weight: 0, height: 0,
        emergencyContactName: '', emergencyContactPhone: '',
        emergencyContactRelation: '', planId: '',
    });

    useEffect(() => {
        const fetchPlans = async () => {
            const data = await membershipService.getPlans();
            setPlans(data);
        };
        fetchPlans();

        if (isEditMode) {
            const loadUserData = async () => {
                try {
                    const responseData = await userService.getUserById(id as string);
                    const { user, subscription, specialProfile } = responseData;
                    setFormData({
                        name: user.name || '', nic: user.nic || '',
                        email: user.email || '', phone: user.phone || '',
                        role: user.role || 'member', status: user.status || 'active',
                    });
                    if (user.role === 'coach' && specialProfile) {
                        setCoachData({
                            specialties: specialProfile.specialties?.join(', ') || '',
                            bio: specialProfile.bio || '',
                            certifications: specialProfile.certifications?.join(',') || '',
                            experienceYears: specialProfile.experienceYears || 0,
                            rating: specialProfile.rating || 5.0,
                        });
                    } else if (user.role === 'member' && specialProfile) {
                        setMemberData({
                            medicalConditions: specialProfile.medicalConditions?.join(',') || '',
                            fitnessGoal: specialProfile.fitnessGoal?.join(',') || '',
                            weight: specialProfile.weight || 0,
                            height: specialProfile.height || 0,
                            emergencyContactName: specialProfile.emergencyContactName || '',
                            emergencyContactPhone: specialProfile.emergencyContactPhone || '',
                            emergencyContactRelation: specialProfile.emergencyContactRelation || '',
                            planId: subscription?.plan?._id || '',
                        });
                    }
                } catch (error) {
                    alert('Could not find user');
                    console.error(error);
                } finally {
                    setFetchingData(false);
                }
            };
            loadUserData();
        }
    }, [id, isEditMode, navigate]);

    const handleStepOneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeId) {
                await userService.updateUser(activeId, formData);
            } else {
                const newUser = await userService.createNewUser(formData);
                setNewUserId(newUser._id);
            }
            setStep(2);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Operation failed!');
        } finally {
            setLoading(false);
        }
    };

    const handleStepTwoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let profileToSubmit: any = {};
            if (formData.role === 'coach') {
                profileToSubmit = {
                    ...coachData,
                    specialities: coachData.specialties.split(',').map(s => s.trim()).filter(Boolean),
                    certifications: coachData.certifications.split(',').map(c => c.trim()).filter(Boolean),
                };
            } else if (formData.role === 'member') {
                profileToSubmit = {
                    ...memberData,
                    medicalConditions: memberData.medicalConditions.split(',').map(m => m.trim()).filter(Boolean),
                    fitnessGoal: memberData.fitnessGoal.split(',').map(f => f.trim()).filter(Boolean),
                    planId: isEditMode ? undefined : memberData.planId,
                };
            }
            await userService.updateSpecialProfile(id || newUserId, formData.role, profileToSubmit);
            alert(`${formData.role} registration complete`);
            navigate(formData.role === 'coach' ? '/admin/coaches' : '/admin/members');
        } catch (error: any) {
            alert('Failed to update profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) return <Spinner />;

    const roleAccent = ROLE_ACCENT[formData.role] || 'text-warrior-orange';
    const roleBorder = ROLE_BORDER[formData.role] || ROLE_BORDER.member;

    // ── STEP 2 ──
    if (step === 2) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 pb-10">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${roleBorder}`}>
                        {ROLE_ICON[formData.role]}
                    </div>
                    <div>
                        <h1 className={`text-3xl font-black italic uppercase text-white tracking-tighter leading-none`}>
                            Step 2: <span className={roleAccent}>{formData.role} Details</span>
                        </h1>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                            {formData.name || 'New User'} — Professional Info
                        </p>
                    </div>
                </div>

                {/* Step bar */}
                <StepBar step={2} role={formData.role} />

                {/* Back */}
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest"
                >
                    <MdArrowBack size={14} /> Back to Account Info
                </button>

                <form onSubmit={handleStepTwoSubmit}
                    className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-6 space-y-5"
                >
                    {formData.role === 'coach'  && <CoachForm  data={coachData}  onChange={setCoachData}  />}
                    {formData.role === 'member' && <MemberForm data={memberData} onChange={setMemberData} plans={plans} isEditMode={isEditMode} />}

                    <Button type="submit" loading={loading}>
                        <MdCheckCircle size={16} />
                        {isEditMode ? 'Update' : 'Complete'} {formData.role} Profile
                    </Button>
                </form>
            </div>
        );
    }

    // ── STEP 1 ──
    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* Back nav */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest"
            >
                <MdArrowBack size={14} /> Back
            </button>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${roleBorder}`}>
                    <MdPerson size={22} className={roleAccent} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter leading-none">
                        {isEditMode ? 'Edit' : 'Register'}{' '}
                        <span className="text-warrior-orange">Warrior</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-0.5">
                        Step 1 — Account Information
                    </p>
                </div>
            </div>

            {/* Step bar */}
            <StepBar step={1} role={formData.role} />

            {/* Form */}
            <form
                onSubmit={handleStepOneSubmit}
                className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-6 space-y-5"
            >
                {/* Section: Identity */}
                <div>
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-3 flex items-center gap-2">
                        <MdPerson size={12} className="text-warrior-orange" /> Identity
                    </p>
                    <div className="space-y-3">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="e.g. John Snow"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="e.g. johnsnow@gmail.com"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                                label="NIC Number"
                                type="text"
                                placeholder="e.g. 199XXXXXXXXX"
                                required
                                value={formData.nic}
                                onChange={e => setFormData({ ...formData, nic: e.target.value })}
                            />
                            <Input
                                label="Contact Number"
                                type="text"
                                placeholder="07XXXXXXXX"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-5">
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-3 flex items-center gap-2">
                        <MdSportsMartialArts size={12} className="text-warrior-orange" /> System Access
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <SelectField
                            label="System Role"
                            value={formData.role}
                            onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="member">Member</option>
                            <option value="coach">Coach</option>
                            <option value="admin">Admin</option>
                        </SelectField>
                        <SelectField
                            label="Account Status"
                            value={formData.status}
                            onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="pending-payment">Pending Payment</option>
                            <option value="blocked">Blocked</option>
                        </SelectField>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-5 space-y-2">
                    <Button type="submit" loading={loading}>
                        {isEditMode
                            ? <><MdEdit size={16} /> Update Account</>
                            : <><MdPersonAdd size={16} /> Continue to {formData.role} Details</>
                        }
                    </Button>
                    {!isEditMode && (
                        <p className="text-[10px] text-gray-600 italic">
                            * New members will use their NIC as their initial password.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddNewMember;