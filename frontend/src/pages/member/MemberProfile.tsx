/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import Spinner from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
    MdPerson, MdEmail, MdPhone, MdBadge, MdCalendarToday,
    MdSportsMartialArts, MdLock, MdCheckCircle, MdError,
    MdExpandMore, MdExpandLess, MdFitnessCenter, MdMedicalServices,
    MdFlag, MdEmergency, MdEdit, MdClose, MdSave
} from "react-icons/md";
import { GiTrophy, GiMuscleUp } from "react-icons/gi";

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    active:           { label: "Active",          color: "text-green-400",  bg: "bg-green-900/20",  border: "border-green-800/40"  },
    "pending-payment":{ label: "Pending Payment", color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-800/40" },
    blocked:          { label: "Blocked",         color: "text-red-400",    bg: "bg-red-900/20",    border: "border-red-800/40"    },
};

// ── Info Row ───────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0">
        <div className="flex items-center gap-2.5">
            <span className="text-gray-600">{icon}</span>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-200">{value || "—"}</span>
    </div>
);

// ── Section Card ───────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, children, collapsible = false }: {
    title: string; icon: React.ReactNode; children: React.ReactNode; collapsible?: boolean;
}) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
            <button
                onClick={() => collapsible && setOpen(!open)}
                className={`w-full flex items-center justify-between p-5 ${collapsible ? "hover:bg-neutral-700/20 transition-colors cursor-pointer" : "cursor-default"}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center text-warrior-orange">
                        {icon}
                    </div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{title}</p>
                </div>
                {collapsible && (open ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />)}
            </button>
            {open && <div className="px-5 pb-5">{children}</div>}
        </div>
    );
};

// ── Tag List ───────────────────────────────────────────────────────────────────
const TagList = ({ items, color }: { items: string[]; color: string }) => (
    <div className="flex flex-wrap gap-2 mt-2">
        {items?.length > 0
            ? items.map((item, i) => (
                <span key={i} className={`px-3 py-1 rounded-full border text-xs font-bold ${color}`}>{item}</span>
            ))
            : <span className="text-xs text-gray-600 italic">None recorded</span>
        }
    </div>
);

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: "success" | "error" }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl text-sm font-bold animate-in ${
        type === "success"
            ? "bg-green-900/90 border-green-700 text-green-300"
            : "bg-red-900/90 border-red-700 text-red-300"
    }`}>
        {type === "success" ? <MdCheckCircle size={18} /> : <MdError size={18} />}
        {msg}
    </div>
);

// ── Change Password Form ───────────────────────────────────────────────────────
const ChangePasswordForm = () => {
    const [form, setForm]       = useState({ current: "", next: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.next !== form.confirm) {
            showToast("New passwords do not match", "error"); return;
        }
        if (form.next.length < 6) {
            showToast("Password must be at least 6 characters", "error"); return;
        }
        setLoading(true);
        try {
            await userService.changePassword({ currentPassword: form.current, newPassword: form.next });
            setForm({ current: "", next: "", confirm: "" });
            showToast("Password updated successfully!", "success");
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to update password", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-neutral-800/40 rounded-xl p-4 space-y-1 mb-2">
                    <p className="text-[10px] text-yellow-400 font-bold">
                        💡 Your initial password was set to your NIC number.
                    </p>
                    <p className="text-[10px] text-gray-500">We recommend changing it to something personal and secure.</p>
                </div>

                <Input
                    label="Current Password"
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={form.current}
                    onChange={e => set("current", e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        label="New Password"
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={form.next}
                        onChange={e => set("next", e.target.value)}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        required
                        placeholder="Repeat new password"
                        value={form.confirm}
                        onChange={e => set("confirm", e.target.value)}
                    />
                </div>

                {/* Strength hints */}
                {form.next && (
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { label: "6+ chars",   ok: form.next.length >= 6  },
                            { label: "Uppercase",  ok: /[A-Z]/.test(form.next) },
                            { label: "Number",     ok: /\d/.test(form.next)    },
                            { label: "Matches",    ok: form.next === form.confirm && form.confirm.length > 0 },
                        ].map(h => (
                            <span key={h.label} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                h.ok ? "text-green-400 bg-green-900/20 border-green-800/40" : "text-gray-600 bg-neutral-800 border-neutral-700"
                            }`}>
                                {h.ok ? <MdCheckCircle size={10} /> : <MdClose size={10} />} {h.label}
                            </span>
                        ))}
                    </div>
                )}

                <Button type="submit" loading={loading}>
                    <MdLock size={14} className="mr-1.5" /> Update Password
                </Button>
            </form>
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </>
    );
};

// ── Edit Personal Info Form ────────────────────────────────────────────────────
const EditInfoForm = ({ user, onSaved }: { user: any; onSaved: () => void }) => {
    const [form, setForm]       = useState({ name: user.name || "", phone: (user as any).phone || "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userService.updateMe(form);
            showToast("Profile updated!", "success");
            setTimeout(onSaved, 1000);
        } catch (err: any) {
            showToast(err.response?.data?.message || "Update failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="Full Name" value={form.name} onChange={e => set("name", e.target.value)} />
                    <Input label="Phone Number" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <p className="text-[10px] text-gray-600 italic">Email and NIC cannot be changed. Contact an admin if needed.</p>
                <Button type="submit" loading={loading}>
                    <MdSave size={14} className="mr-1.5" /> Save Changes
                </Button>
            </form>
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const MemberProfile = () => {
    const { user: authUser } = useAuth();
    const [data, setData]       = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editInfo, setEditInfo] = useState(false);

    const fetchProfile = async () => {
        if (!authUser) return;
        try {
            const res = await userService.getMyProfile();
            setData(res);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, [authUser]);

    if (loading) return <Spinner />;
    if (!data)   return <div className="text-center text-gray-500 py-20">Could not load profile.</div>;

    const { user, specialProfile: profile, subscription } = data;
    const status = statusConfig[user.status] ?? statusConfig["pending-payment"];

    // Days since joined
    const daysSince = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* ── PROFILE HEADER ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
                <div className="px-6 py-6 flex flex-col md:flex-row md:items-end gap-4">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl bg-warrior-orange text-white text-3xl font-black flex items-center justify-center border-4 border-neutral-900 shadow-2xl shrink-0 uppercase">
                        {user.name.charAt(0)}
                    </div>
                    {/* Name + badges */}
                    <div className="flex-1 pb-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-black italic uppercase text-white tracking-tight">{user.name}</h1>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase ${status.color} ${status.bg} ${status.border}`}>
                                <MdCheckCircle size={10} /> {status.label}
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                <MdSportsMartialArts size={12} className="text-warrior-orange" />
                                {user.role.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                <MdCalendarToday size={12} className="text-warrior-orange" />
                                Member for {daysSince} days
                            </span>
                            {subscription && (
                                <span className="flex items-center gap-1 text-[10px] text-warrior-orange font-bold">
                                    <GiTrophy size={12} />
                                    {subscription.plan?.name}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Edit toggle */}
                    <button onClick={() => setEditInfo(!editInfo)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all shrink-0 ${
                            editInfo
                                ? "bg-neutral-700 border-neutral-600 text-gray-300 hover:bg-neutral-600"
                                : "bg-warrior-orange/10 border-warrior-orange/30 text-warrior-orange hover:bg-warrior-orange/20"
                        }`}>
                        {editInfo ? <><MdClose size={13} /> Cancel</> : <><MdEdit size={13} /> Edit Info</>}
                    </button>
                </div>
            </div>

            {/* ── EDIT PERSONAL INFO ── */}
            {editInfo && (
                <SectionCard title="Edit Personal Info" icon={<MdEdit size={14} />}>
                    <EditInfoForm user={user} onSaved={() => { setEditInfo(false); fetchProfile(); }} />
                </SectionCard>
            )}

            {/* ── PERSONAL INFORMATION ── */}
            <SectionCard title="Personal Information" icon={<MdPerson size={14} />}>
                <InfoRow icon={<MdEmail size={14} />}    label="Email"        value={user.email}               />
                <InfoRow icon={<MdBadge size={14} />}    label="NIC"          value={user.nic}                 />
                <InfoRow icon={<MdPhone size={14} />}    label="Phone"        value={(user as any).phone}      />
                <InfoRow icon={<MdCalendarToday size={14} />} label="Member Since" value={fmtDate(user.createdAt)} />
                {user.coach && (
                    <InfoRow icon={<GiMuscleUp size={14} />} label="Assigned Coach"
                        value={typeof user.coach === "object" ? user.coach.name : "—"} />
                )}
            </SectionCard>

            {/* ── PHYSICAL STATS ── */}
            {profile && (profile.weight || profile.height) && (
                <SectionCard title="Physical Stats" icon={<MdFitnessCenter size={14} />}>
                    <div className="grid grid-cols-2 gap-3 mt-1 ">
                        {profile.weight && (
                            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Weight</p>
                                <p className="text-2xl font-black text-warrior-orange">{profile.weight}<span className="text-xs font-normal text-gray-500 ml-1">kg</span></p>
                            </div>
                        )}
                        {profile.height && (
                            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Height</p>
                                <p className="text-2xl font-black text-blue-400">{profile.height}<span className="text-xs font-normal text-gray-500 ml-1">cm</span></p>
                            </div>
                        )}
                        {profile.weight && profile.height && (() => {
                            const bmi = parseFloat((profile.weight / ((profile.height / 100) ** 2)).toFixed(1));
                            const cat = bmi < 18.5 ? { label: "Underweight", color: "text-blue-400" }
                                      : bmi < 25   ? { label: "Normal",       color: "text-green-400" }
                                      : bmi < 30   ? { label: "Overweight",   color: "text-yellow-400" }
                                      :              { label: "Obese",         color: "text-red-400" };
                            return (
                                <div className="col-span-2 bg-neutral-800/60 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">BMI</p>
                                        <p className={`text-2xl font-black ${cat.color}`}>{bmi}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full border text-xs font-black uppercase ${cat.color} bg-neutral-900 border-neutral-700`}>
                                        {cat.label}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>
                </SectionCard>
            )}

            {/* ── FITNESS GOALS & MEDICAL ── */}
            {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    <SectionCard title="Fitness Goals" icon={<MdFlag size={14} />} collapsible>
                        <TagList
                            items={profile.fitnessGoal || []}
                            color="text-warrior-orange bg-warrior-orange/10 border-warrior-orange/20"
                        />
                    </SectionCard>
                    <SectionCard title="Medical Conditions" icon={<MdMedicalServices size={14} />} collapsible>
                        <TagList
                            items={profile.medicalConditions || []}
                            color="text-red-400 bg-red-900/10 border-red-800/30"
                        />
                    </SectionCard>
                </div>
            )}

            {/* ── EMERGENCY CONTACT ── */}
            {profile?.emergencyContactName && (
                <SectionCard title="Emergency Contact" icon={<MdEmergency size={14} />} collapsible>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                        {[
                            { label: "Name",     value: profile.emergencyContactName     },
                            { label: "Relation", value: profile.emergencyContactRelation },
                            { label: "Phone",    value: profile.emergencyContactPhone    },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-neutral-800/60 rounded-xl p-3">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">{label}</p>
                                <p className="text-sm font-bold text-white">{value || "—"}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── CHANGE PASSWORD ── */}
            <SectionCard title="Change Password" icon={<MdLock size={14} />} collapsible>
                <ChangePasswordForm />
            </SectionCard>

        </div>
    );
};

export default MemberProfile;