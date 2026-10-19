import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../../api/axios";
import { MdQrCode2, MdRefresh, MdCheckCircle, MdTimer, MdShield } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";

interface QRData {
    token: string;
    member: { name: string; profileImage?: string };
    expiresIn: number; // seconds
}

const MemberQRCard = () => {
    const { user } = useAuth();
    const [qrData, setQrData]       = useState<QRData | null>(null);
    const [loading, setLoading]     = useState(true);
    const [timeLeft, setTimeLeft]   = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const fetchQR = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const res = await api.get('/attendance/my-qr');
            setQrData(res.data.data);
            setTimeLeft(res.data.data.expiresIn);
        } catch {
            // silently fail — will retry on refresh
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => { fetchQR(); }, [fetchQR]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => fetchQR(true), 4.5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchQR]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const tick = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { fetchQR(true); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [timeLeft, fetchQR]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const urgency  = timeLeft < 60;
    const pct      = (timeLeft / 300) * 100;

    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden border-l-4 border-l-warrior-orange">
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center">
                        <MdQrCode2 className="text-warrior-orange" size={22} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">My Check-in QR Code</p>
                        <p className="text-xs font-bold text-gray-300 mt-0.5">Show this to the front desk</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchQR(true)}
                    disabled={refreshing}
                    title="Refresh QR"
                    className="p-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-warrior-orange text-gray-400 hover:text-warrior-orange transition-all disabled:opacity-40 cursor-pointer"
                >
                    <MdRefresh size={18} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* QR + info */}
            <div className="px-6 pb-6 flex flex-col items-center gap-5">
                {/* QR Code Box */}
                <div className={`relative p-5 rounded-2xl border-2 transition-all duration-500 ${
                    urgency
                        ? "border-red-500/60 bg-red-900/10"
                        : "border-warrior-orange/30 bg-neutral-900"
                }`}>
                    {loading ? (
                        <div className="w-48 h-48 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-warrior-orange border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : qrData ? (
                        <>
                            <QRCodeSVG
                                value={qrData.token}
                                size={192}
                                bgColor="transparent"
                                fgColor={urgency ? "#f87171" : "#f97316"}
                                level="M"
                                includeMargin={false}
                            />
                            {/* Corner marks */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-warrior-orange rounded-tl-sm" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-warrior-orange rounded-tr-sm" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-warrior-orange rounded-bl-sm" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-warrior-orange rounded-br-sm" />
                        </>
                    ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center gap-2">
                            <MdQrCode2 className="text-gray-700" size={48} />
                            <p className="text-xs text-gray-600 text-center">Failed to load QR</p>
                        </div>
                    )}
                </div>

                {/* Member Name */}
                <div className="text-center">
                    <p className="text-xl font-black italic uppercase text-white tracking-tight">
                        {user?.name}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                        <MdShield size={11} className="text-warrior-orange" />
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Warrior Fitness Member</p>
                    </div>
                </div>

                {/* Countdown bar */}
                {qrData && (
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <MdTimer size={13} className={urgency ? "text-red-400" : "text-gray-500"} />
                                <p className={`text-[10px] font-black uppercase tracking-widest ${urgency ? "text-red-400" : "text-gray-500"}`}>
                                    {urgency ? "Expiring soon!" : "Valid for"}
                                </p>
                            </div>
                            <p className={`text-sm font-black font-mono tabular-nums ${urgency ? "text-red-400" : "text-warrior-orange"}`}>
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </p>
                        </div>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                    urgency ? "bg-red-500" : "bg-warrior-orange"
                                }`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-gray-600 text-center">Auto-refreshes when expired</p>
                    </div>
                )}

                {/* Already checked in hint */}
                <div className="flex items-center gap-2 bg-green-900/10 border border-green-800/20 rounded-xl px-4 py-2.5 w-full">
                    <MdCheckCircle className="text-green-500 shrink-0" size={15} />
                    <p className="text-[10px] text-green-400 font-bold">
                        Each QR is valid for one check-in per day
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MemberQRCard;
