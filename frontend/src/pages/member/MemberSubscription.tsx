/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { membershipService } from "../../services/membershipService";
import Spinner from "../../components/ui/Spinner";
import { PaymentHistory } from "../../components/userDetails/PaymentHistory";
import { MdCheckCircle, MdCancel, MdAccessTime, MdReceipt, MdCalendarToday, MdPayment } from "react-icons/md";
import { GiTrophy } from "react-icons/gi";
import type { JSX } from "react/jsx-runtime";

// ── Helpers ────────────────────────────────────────────────────────────────────
const daysRemaining = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const daysTotal = (startDate: string, endDate: string) => {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const progressPercent = (startDate: string, endDate: string) => {
    const total = new Date(endDate).getTime() - new Date(startDate).getTime();
    const elapsed = Date.now() - new Date(startDate).getTime();
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        active:    "text-green-400 bg-green-900/20 border-green-800/40",
        expired:   "text-red-400 bg-red-900/20 border-red-800/40",
        cancelled: "text-gray-400 bg-neutral-800 border-neutral-700",
    };
    const icons: Record<string, JSX.Element> = {
        active:    <MdCheckCircle size={12} />,
        expired:   <MdCancel size={12} />,
        cancelled: <MdCancel size={12} />,
    };
    return (
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${styles[status] ?? styles.cancelled}`}>
            {icons[status]} {status}
        </span>
    );
};

// ── Active Plan Card ───────────────────────────────────────────────────────────
const ActivePlanCard = ({ sub }: { sub: any }) => {
    const days     = daysRemaining(sub.endDate);
    const total    = daysTotal(sub.startDate, sub.endDate);
    const progress = progressPercent(sub.startDate, sub.endDate);
    const isActive = sub.status === "active";

    const urgency = days <= 7 ? "text-red-400" : days <= 14 ? "text-yellow-400" : "text-green-400";
    const barColor = days <= 7 ? "from-red-500 to-red-400" : days <= 14 ? "from-yellow-500 to-yellow-400" : "from-green-500 to-emerald-400";

    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
            <div className="h-1 bg-linear-to-r from-warrior-orange via-orange-400 to-transparent" />
            <div className="p-6 space-y-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center shrink-0">
                            <MdPayment className="text-warrior-orange" size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">
                                {isActive ? "Current Plan" : "Last Plan"}
                            </p>
                            <h2 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">
                                {sub.plan?.name ?? "—"}
                            </h2>
                            {sub.plan?.description && (
                                <p className="text-xs text-gray-500 mt-1">{sub.plan.description}</p>
                            )}
                        </div>
                    </div>
                    <StatusBadge status={sub.status} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Price",      value: sub.plan?.price ? `${sub.plan.price.toLocaleString()} LKR` : "—", icon: <MdReceipt size={14} /> },
                        { label: "Duration",   value: `${sub.plan?.durationDays ?? "?"} days`,                          icon: <MdAccessTime size={14} /> },
                        { label: "Start Date", value: fmtDate(sub.startDate),                                           icon: <MdCalendarToday size={14} /> },
                        { label: "End Date",   value: fmtDate(sub.endDate),                                             icon: <MdCalendarToday size={14} /> },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="bg-neutral-800/60 rounded-xl p-3 flex flex-col justify-between border border-neutral-600/50 border-l-2 border-l-warrior-orange ">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-gray-500">{icon}</span>
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{label}</p>
                            </div>
                            <p className="text-sm font-black text-white leading-tight">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Progress bar — only meaningful when active */}
                {isActive && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Plan Progress</p>
                            <div className="flex items-center gap-3">
                                <p className={`text-sm font-black ${urgency}`}>
                                    {days} <span className="text-xs font-normal text-gray-500">days left</span>
                                </p>
                                <p className="text-[10px] text-gray-600">of {total} days</p>
                            </div>
                        </div>
                        <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-linear-to-r ${barColor} rounded-full transition-all duration-700`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <p className="text-[9px] text-gray-600">{fmtDate(sub.startDate)}</p>
                            <p className="text-[9px] text-gray-600">{fmtDate(sub.endDate)}</p>
                        </div>

                        {/* Urgency alert */}
                        {days <= 7 && days > 0 && (
                            <div className="mt-3 bg-red-900/10 border border-red-800/30 rounded-xl p-3 flex items-center gap-2">
                                <MdAccessTime className="text-red-400 shrink-0" size={16} />
                                <p className="text-xs text-red-300 font-bold">
                                    Your membership expires in {days} day{days !== 1 ? "s" : ""}. Contact the gym to renew.
                                </p>
                            </div>
                        )}
                        {days === 0 && (
                            <div className="mt-3 bg-red-900/10 border border-red-800/30 rounded-xl p-3 flex items-center gap-2">
                                <MdCancel className="text-red-400 shrink-0" size={16} />
                                <p className="text-xs text-red-300 font-bold">
                                    Your membership expires today. Contact the gym to renew.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};



// ── Main Page ──────────────────────────────────────────────────────────────────
const MemberSubscription = () => {
    const [subscription, setSubscription] = useState<any>(null);
    const [payments, setPayments]         = useState<any[]>([]);
    const [pagination, setPagination]     = useState<any>(null);
    const [loading, setLoading]           = useState(true);
    const [payPage, setPayPage]           = useState(1);
    const [error, setError]               = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [sub, payData] = await Promise.all([
                    membershipService.getMySubscription(),
                    membershipService.getMyPayments(payPage),
                ]);
                setSubscription(sub);
                setPayments(payData.payments || []);
                setPagination(payData.paginations || null);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load subscription");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [payPage]);

    if (loading) return <Spinner />;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                    <MdPayment className="text-warrior-orange" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        My <span className="text-warrior-orange">Membership</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Subscription & Payment History
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Subscription card */}
            {subscription ? (
                <ActivePlanCard sub={subscription} />
            ) : (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-gray-600 mx-auto mb-4">
                        <GiTrophy size={32} />
                    </div>
                    <p className="text-white font-black italic uppercase text-xl mb-1">No Active Membership</p>
                    <p className="text-gray-500 text-sm">Contact the gym to subscribe to a membership plan.</p>
                </div>
            )}

            {/* Payment history */}
            <PaymentHistory
                payments={payments}
                pagination={pagination}
                onPageChange={setPayPage}
                hideMember
            />
        </div>
    );
};

export default MemberSubscription;