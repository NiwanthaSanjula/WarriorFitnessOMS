/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import Spinner from '../../components/ui/Spinner';
import { MdAdminPanelSettings, MdEdit, MdSave, MdClose, MdLock, MdExpandMore, MdExpandLess } from 'react-icons/md';

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ msg, ok }: { msg: string; ok: boolean }) => (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-black shadow-2xl border ${
        ok ? 'bg-green-900/90 border-green-700 text-green-300' : 'bg-red-900/90 border-red-700 text-red-300'
    }`}>{msg}</div>
);

const AdminProfile = () => {
    const [admin, setAdmin]         = useState<any>(null);
    const [loading, setLoading]     = useState(true);

    // Edit basic info
    const [editing, setEditing]     = useState(false);
    const [editForm, setEditForm]   = useState({ name: '', phone: '' });
    const [editSaving, setEditSaving] = useState(false);

    // Change password
    const [pwOpen, setPwOpen]       = useState(false);
    const [pwForm, setPwForm]       = useState({ current: '', next: '', confirm: '' });
    const [pwSaving, setPwSaving]   = useState(false);

    // Toast
    const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        authService.getMe()
            .then(res => {
                const u = res.data.user;
                setAdmin(u);
                setEditForm({ name: u.name ?? '', phone: u.phone ?? '' });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSaveInfo = async () => {
        setEditSaving(true);
        try {
            await userService.updateMe({ name: editForm.name, phone: editForm.phone });
            setAdmin((a: any) => ({ ...a, ...editForm }));
            setEditing(false);
            showToast('Profile updated');
        } catch {
            showToast('Failed to update profile', false);
        } finally { setEditSaving(false); }
    };

    const handleChangePassword = async () => {
        if (pwForm.next.length < 6)          return showToast('Password must be at least 6 characters', false);
        if (pwForm.next !== pwForm.confirm)  return showToast('Passwords do not match', false);
        setPwSaving(true);
        try {
            await userService.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
            setPwForm({ current: '', next: '', confirm: '' });
            setPwOpen(false);
            showToast('Password changed successfully');
        } catch (err: any) {
            showToast(err?.response?.data?.message ?? 'Failed to change password', false);
        } finally { setPwSaving(false); }
    };

    if (loading) return <Spinner />;
    if (!admin) return <div className="text-gray-400">Error loading profile.</div>;

    const joinDate = new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="max-w-6xl mx-auto space-y-5 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center">
                    <MdAdminPanelSettings className="text-warrior-orange" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        Admin <span className="text-warrior-orange">Profile</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">System Administrator</p>
                </div>
            </div>

            {/* ── PROFILE CARD ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">


                <div className="p-6">
                    {/* Avatar + name row */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center text-2xl font-black text-warrior-orange uppercase">
                            {admin.name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <p className="text-xl font-black italic uppercase text-white tracking-tight">{admin.name}</p>
                            <p className="text-xs text-gray-500">{admin.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border text-warrior-orange bg-warrior-orange/10 border-warrior-orange/30">
                                    Admin
                                </span>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border text-green-400 bg-green-900/20 border-green-800/40">
                                    Active
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditing(!editing); setEditForm({ name: admin.name ?? '', phone: admin.phone ?? '' }); }}
                            className="p-2 text-gray-500 hover:text-warrior-orange transition-colors rounded-xl hover:bg-neutral-800"
                        >
                            {editing ? <MdClose size={18} /> : <MdEdit size={18} />}
                        </button>
                    </div>

                    {/* Info grid — view or edit */}
                    {editing ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.phone}
                                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors"
                                    />
                                </div>
                            </div>
                            <p className="text-[9px] text-gray-600 italic">Email and NIC cannot be changed here.</p>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setEditing(false)}
                                    className="flex-1 py-2.5 bg-neutral-800 text-gray-400 rounded-xl text-xs font-black uppercase hover:bg-neutral-700 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSaveInfo} disabled={editSaving}
                                    className="flex-1 py-2.5 bg-warrior-orange text-white rounded-xl text-xs font-black uppercase hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                    <MdSave size={14} /> {editSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Email',    value: admin.email              },
                                { label: 'Phone',    value: admin.phone || '—'       },
                                { label: 'NIC',      value: admin.nic   || '—'       },
                                { label: 'Member Since', value: joinDate             },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-neutral-800/50 rounded-xl p-3">
                                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">{label}</p>
                                    <p className="text-xs font-bold text-gray-300 break-all">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── CHANGE PASSWORD ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-3 border-l-warrior-orange">
                <button
                    onClick={() => setPwOpen(!pwOpen)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                            <MdLock className="text-gray-400" size={16} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black uppercase text-white italic">Change Password</p>
                            <p className="text-[10px] text-gray-500 font-bold">Update your master password</p>
                        </div>
                    </div>
                    {pwOpen ? <MdExpandLess className="text-gray-500" /> : <MdExpandMore className="text-gray-500" />}
                </button>

                {pwOpen && (
                    <div className="border-t border-neutral-700 p-5 space-y-3">
                        {[
                            { label: 'Current Password', key: 'current', placeholder: 'Enter current password'  },
                            { label: 'New Password',     key: 'next',    placeholder: 'Min 6 characters'        },
                            { label: 'Confirm New',      key: 'confirm', placeholder: 'Repeat new password'     },
                        ].map(({ label, key, placeholder }) => (
                            <div key={key}>
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-1.5">{label}</label>
                                <input
                                    type="password"
                                    placeholder={placeholder}
                                    value={(pwForm as any)[key]}
                                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-warrior-orange transition-colors"
                                />
                            </div>
                        ))}

                        {/* Live hints */}
                        {pwForm.next.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { ok: pwForm.next.length >= 6,              label: '6+ chars'   },
                                    { ok: /[A-Z]/.test(pwForm.next),            label: 'Uppercase'  },
                                    { ok: /[0-9]/.test(pwForm.next),            label: 'Number'     },
                                    { ok: pwForm.next === pwForm.confirm && pwForm.confirm.length > 0, label: 'Matches' },
                                ].map(({ ok, label }) => (
                                    <span key={label} className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                                        ok ? 'text-green-400 bg-green-900/20 border-green-800/40' : 'text-gray-600 bg-neutral-800 border-neutral-700'
                                    }`}>
                                        {ok ? '✓' : '○'} {label}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            <button onClick={() => { setPwOpen(false); setPwForm({ current: '', next: '', confirm: '' }); }}
                                className="flex-1 py-2.5 bg-neutral-800 text-gray-400 rounded-xl text-xs font-black uppercase hover:bg-neutral-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleChangePassword} disabled={pwSaving}
                                className="flex-1 py-2.5 bg-warrior-orange text-white rounded-xl text-xs font-black uppercase hover:bg-orange-600 disabled:opacity-50 transition-colors">
                                {pwSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── SYSTEM INFO ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5 border-l-3 border-l-warrior-orange">
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-3">System Info</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-neutral-800/50 rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">Admin ID</p>
                        <p className="text-xs font-mono text-gray-400 break-all">{admin._id}</p>
                    </div>
                    <div className="bg-neutral-800/50 rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">Permissions</p>
                        <p className="text-xs font-black text-warrior-orange uppercase">All Access Granted</p>
                    </div>
                </div>
            </div>

            {toast && <Toast msg={toast.msg} ok={toast.ok} />}
        </div>
    );
};

export default AdminProfile;