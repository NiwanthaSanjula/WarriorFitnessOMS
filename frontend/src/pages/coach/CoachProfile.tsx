/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import Spinner from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
    MdPerson, MdEmail, MdPhone, MdBadge, MdCalendarToday,
    MdLock, MdCheckCircle, MdError, MdEdit, MdClose, MdSave,
    MdAdd, MdDelete, MdExpandMore, MdExpandLess, MdStar
} from "react-icons/md";
import { GiWeightLiftingUp, GiTrophy, GiProgression } from "react-icons/gi";

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }: { msg: string; type: "success" | "error" }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl text-sm font-bold ${
        type === "success"
            ? "bg-green-900/90 border-green-700 text-green-300"
            : "bg-red-900/90 border-red-700 text-red-300"
    }`}>
        {type === "success" ? <MdCheckCircle size={18} /> : <MdError size={18} />}
        {msg}
    </div>
);

// ── Section Card ───────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, children, collapsible = false, accent = "text-blue-400", accentBg = "bg-blue-900/20", accentBorder = "border-blue-800/30" }: {
    title: string; icon: React.ReactNode; children: React.ReactNode;
    collapsible?: boolean; accent?: string; accentBg?: string; accentBorder?: string;
}) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
            <button
                onClick={() => collapsible && setOpen(!open)}
                className={`w-full flex items-center justify-between p-5 ${collapsible ? "hover:bg-neutral-700/20 transition-colors cursor-pointer" : "cursor-default"}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${accentBg} border ${accentBorder} flex items-center justify-center ${accent}`}>
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

// ── Tag editor ─────────────────────────────────────────────────────────────────
const TagEditor = ({ items, onChange, placeholder, color }: {
    items: string[]; onChange: (items: string[]) => void;
    placeholder: string; color: string;
}) => {
    const [input, setInput] = useState("");
    const add = () => {
        const v = input.trim();
        if (v && !items.includes(v)) { onChange([...items, v]); setInput(""); }
    };
    const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 bg-neutral-800 border border-neutral-700 text-gray-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-blue-500"
                />
                <button type="button" onClick={add}
                    className="px-3 py-2 bg-blue-900/30 border border-blue-800/40 text-blue-400 rounded-xl hover:bg-blue-900/50 transition-colors">
                    <MdAdd size={16} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                    <span key={i} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${color}`}>
                        {item}
                        <button type="button" onClick={() => remove(i)} className="hover:opacity-70 transition-opacity">
                            <MdDelete size={11} />
                        </button>
                    </span>
                ))}
                {items.length === 0 && <p className="text-xs text-gray-600 italic">None added yet</p>}
            </div>
        </div>
    );
};

// ── Rating stars ───────────────────────────────────────────────────────────────
const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(s => (
            <MdStar key={s} size={16}
                className={s <= Math.round(rating) ? "text-yellow-400" : "text-neutral-700"} />
        ))}
        <span className="text-xs font-black text-yellow-400 ml-1">{rating.toFixed(1)}</span>
    </div>
);

// ── Change Password Form ───────────────────────────────────────────────────────
const ChangePasswordForm = () => {
    const [form, setForm]       = useState({ current: "", next: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.next !== form.confirm) { showToast("Passwords do not match", "error"); return; }
        if (form.next.length < 6)       { showToast("Min. 6 characters required", "error"); return; }
        setLoading(true);
        try {
            await authService.changePassword({ currentPassword: form.current, newPassword: form.next });
            setForm({ current: "", next: "", confirm: "" });
            showToast("Password updated!", "success");
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to update password", "error");
        } finally { setLoading(false); }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Current Password" type="password" required placeholder="Enter current password"
                    value={form.current} onChange={e => set("current", e.target.value)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="New Password" type="password" required placeholder="Min. 6 characters"
                        value={form.next} onChange={e => set("next", e.target.value)} />
                    <Input label="Confirm New Password" type="password" required placeholder="Repeat new password"
                        value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                </div>
                {form.next && (
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { label: "6+ chars", ok: form.next.length >= 6 },
                            { label: "Uppercase", ok: /[A-Z]/.test(form.next) },
                            { label: "Number",    ok: /\d/.test(form.next)    },
                            { label: "Matches",   ok: form.next === form.confirm && form.confirm.length > 0 },
                        ].map(h => (
                            <span key={h.label} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                h.ok ? "text-green-400 bg-green-900/20 border-green-800/40"
                                     : "text-gray-600 bg-neutral-800 border-neutral-700"
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

// ── Main Page ──────────────────────────────────────────────────────────────────
const CoachProfile = () => {
    const { user: authUser }      = useAuth();
    const [data, setData]         = useState<any>(null);
    const [loading, setLoading]   = useState(true);
    const [editBasic, setEditBasic] = useState(false);
    const [editProf, setEditProf]   = useState(false);
    const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);

    // Basic info form
    const [basicForm, setBasicForm] = useState({ name: "", phone: "" });
    // Professional profile form
    const [profForm, setProfForm]   = useState({
        bio: "", experienceYears: 0,
        specialties: [] as string[], certifications: [] as string[]
    });

    const showToast = (msg: string, type: "success" | "error") => {
        setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
    };

    const fetchProfile = async () => {
        try {
            const res = await userService.getMyProfile();
            setData(res);
            setBasicForm({ name: res.user?.name || "", phone: (res.user as any)?.phone || "" });
            setProfForm({
                bio:             res.specialProfile?.bio             || "",
                experienceYears: res.specialProfile?.experienceYears || 0,
                specialties:     res.specialProfile?.specialties     || [],
                certifications:  res.specialProfile?.certifications  || [],
            });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, [authUser]);

    const handleSaveBasic = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.updateMe(basicForm);
            showToast("Info updated!", "success");
            setEditBasic(false);
            fetchProfile();
        } catch (err: any) { showToast(err.response?.data?.message || "Update failed", "error"); }
    };

    const handleSaveProf = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.updateSpecialProfile((data?.user as any)?._id, "coach", profForm);
            showToast("Profile updated!", "success");
            setEditProf(false);
            fetchProfile();
        } catch (err: any) { showToast(err.response?.data?.message || "Update failed", "error"); }
    };

    if (loading) return <Spinner />;
    if (!data)   return <div className="text-center text-gray-500 py-20">Could not load profile.</div>;

    const { user, specialProfile: profile } = data;
    const daysSince = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
                <div className="px-6 py-6 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-warrior-orange text-white text-3xl font-black flex items-center justify-center border-4 border-neutral-900 shadow-2xl shrink-0 uppercase">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 pb-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">{user.name}</h1>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase text-warrior-orange bg-warrior-orange/20 border-warrior-orange/40">
                                <MdCheckCircle size={10} /> Coach
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                <MdCalendarToday size={12} className="text-warrior-orange" />
                                Coaching for {daysSince} days
                            </span>
                            {profile?.experienceYears > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                    <GiTrophy size={12} className="text-warrior-orange" />
                                    {profile.experienceYears} yrs experience
                                </span>
                            )}
                            {profile?.rating && <RatingStars rating={profile.rating} />}
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditBasic(!editBasic)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${
                                editBasic ? "bg-neutral-700 border-neutral-600 text-gray-300" : "bg-warrior-orange/20 border-warrior-orange/30 text-warrior-orange hover:bg-warrior-orange/30"
                            }`}>
                            {editBasic ? <><MdClose size={13}/> Cancel</> : <><MdEdit size={13}/> Edit Info</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── EDIT BASIC INFO ── */}
            {editBasic && (
                <SectionCard title="Edit Basic Info" icon={<MdEdit size={14} />}>
                    <form onSubmit={handleSaveBasic} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input label="Full Name" value={basicForm.name} onChange={e => setBasicForm(f => ({...f, name: e.target.value}))} />
                            <Input label="Phone Number" value={basicForm.phone} onChange={e => setBasicForm(f => ({...f, phone: e.target.value}))} />
                        </div>
                        <p className="text-[10px] text-gray-600 italic">Email and NIC cannot be changed. Contact an admin if needed.</p>
                        <Button type="submit"><MdSave size={14} className="mr-1.5" /> Save Changes</Button>
                    </form>
                </SectionCard>
            )}

            {/* ── PERSONAL INFO ── */}
            <SectionCard title="Personal Information" icon={<MdPerson size={14} />}>
                {[
                    { icon: <MdEmail size={14}/>,        label: "Email",       value: user.email                       },
                    { icon: <MdBadge size={14}/>,        label: "NIC",         value: user.nic                         },
                    { icon: <MdPhone size={14}/>,        label: "Phone",       value: (user as any).phone              },
                    { icon: <MdCalendarToday size={14}/>,label: "Member Since",value: fmtDate(user.createdAt)          },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0">
                        <div className="flex items-center gap-2.5">
                            <span className="text-gray-600">{icon}</span>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-200">{value || "—"}</span>
                    </div>
                ))}
            </SectionCard>

            {/* ── PROFESSIONAL PROFILE ── */}
            <SectionCard title="Professional Profile" icon={<GiWeightLiftingUp size={14} />}>
                <div className="flex justify-end mb-3">
                    <button onClick={() => setEditProf(!editProf)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all ${
                            editProf ? "bg-neutral-700 border-neutral-600 text-gray-400" : "bg-blue-900/20 border-blue-800/30 text-blue-400 hover:bg-blue-900/30"
                        }`}>
                        {editProf ? <><MdClose size={12}/> Cancel</> : <><MdEdit size={12}/> Edit</>}
                    </button>
                </div>

                {editProf ? (
                    <form onSubmit={handleSaveProf} className="space-y-5">
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1">Bio</label>
                            <textarea
                                value={profForm.bio}
                                onChange={e => setProfForm(f => ({...f, bio: e.target.value}))}
                                className="w-full bg-neutral-800 border border-neutral-700 text-gray-300 text-xs p-3 rounded-xl outline-none focus:border-blue-500 min-h-20"
                                placeholder="Write a short bio..."
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1">Years of Experience</label>
                            <input
                                type="number" min="0" max="50"
                                value={profForm.experienceYears}
                                onChange={e => setProfForm(f => ({...f, experienceYears: parseInt(e.target.value) || 0}))}
                                className="w-32 bg-neutral-800 border border-neutral-700 text-gray-300 text-xs px-3 py-2 rounded-xl outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Specialties</p>
                            <TagEditor items={profForm.specialties}
                                onChange={v => setProfForm(f => ({...f, specialties: v}))}
                                placeholder="e.g. Strength Training"
                                color="text-blue-400 bg-blue-900/10 border-blue-800/30"
                            />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Certifications</p>
                            <TagEditor items={profForm.certifications}
                                onChange={v => setProfForm(f => ({...f, certifications: v}))}
                                placeholder="e.g. ACE Personal Trainer"
                                color="text-green-400 bg-green-900/10 border-green-800/30"
                            />
                        </div>
                        <Button type="submit"><MdSave size={14} className="mr-1.5" /> Save Profile</Button>
                    </form>
                ) : (
                    <div className="space-y-5">
                        {/* Bio */}
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Bio</p>
                            <p className="text-sm text-gray-300 leading-relaxed bg-neutral-800/40 rounded-xl p-4 italic">
                                {profile?.bio || "No bio added yet."}
                            </p>
                        </div>
                        {/* Exp + rating row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Experience</p>
                                <p className="text-2xl font-black text-blue-400">{profile?.experienceYears ?? 0}<span className="text-xs font-normal text-gray-500 ml-1">yrs</span></p>
                            </div>
                            <div className="bg-neutral-800/60 rounded-xl p-4 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Rating</p>
                                <RatingStars rating={profile?.rating ?? 5} />
                            </div>
                        </div>
                        {/* Specialties */}
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Specialties</p>
                            <div className="flex flex-wrap gap-2">
                                {profile?.specialties?.length > 0
                                    ? profile.specialties.map((s: string, i: number) => (
                                        <span key={i} className="px-3 py-1 rounded-full border text-xs font-bold text-blue-400 bg-blue-900/10 border-blue-800/30">{s}</span>
                                    ))
                                    : <p className="text-xs text-gray-600 italic">No specialties added</p>
                                }
                            </div>
                        </div>
                        {/* Certifications */}
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Certifications</p>
                            <div className="flex flex-wrap gap-2">
                                {profile?.certifications?.length > 0
                                    ? profile.certifications.map((c: string, i: number) => (
                                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold text-green-400 bg-green-900/10 border-green-800/30">
                                            <GiProgression size={10} />{c}
                                        </span>
                                    ))
                                    : <p className="text-xs text-gray-600 italic">No certifications added</p>
                                }
                            </div>
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ── CHANGE PASSWORD ── */}
            <SectionCard title="Change Password" icon={<MdLock size={14} />} collapsible>
                <ChangePasswordForm />
            </SectionCard>

            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    );
};

export default CoachProfile;