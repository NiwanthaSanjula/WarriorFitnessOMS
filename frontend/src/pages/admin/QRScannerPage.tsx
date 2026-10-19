/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../api/axios";
import {
    MdQrCodeScanner, MdCheckCircle, MdCancel,
    MdRefresh, MdCameraAlt, MdPerson,
    MdCalendarToday, MdSportsGymnastics
} from "react-icons/md";
import { GiMuscleUp } from "react-icons/gi";

// ── Types ────────────────────────────────────────────────────────────────────
interface ScanResult {
    success: boolean;
    member?: { name: string; profileImage?: string; status?: string };
    message?: string;
    time?: string;
}

// ── Main Page ────────────────────────────────────────────────────────────────
const QRScannerPage = () => {
    const scannerRef    = useRef<Html5Qrcode | null>(null);
    const [scanning, setScanning]       = useState(false);
    const [result, setResult]           = useState<ScanResult | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [processing, setProcessing]   = useState(false);
    const [todayCount, setTodayCount]   = useState(0);
    const resultTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Start camera ────────────────────────────────────────────────────────
    const startScanner = async () => {
        setCameraError(null);
        setResult(null);

        try {
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                () => {} // ignore intermediate errors
            );
            setScanning(true);
        } catch (err: any) {
            setCameraError("Could not access camera. Please allow camera permissions and try again.");
            setScanning(false);
        }
    };

    // ── Stop camera ─────────────────────────────────────────────────────────
    const stopScanner = async () => {
        if (scannerRef.current && scanning) {
            await scannerRef.current.stop();
            scannerRef.current = null;
        }
        setScanning(false);
    };

    // ── Handle successful scan ───────────────────────────────────────────────
    const onScanSuccess = async (decodedText: string) => {
        if (processing) return;
        setProcessing(true);

        // Pause scanner briefly to avoid duplicate scans
        await stopScanner();

        try {
            const res = await api.post('/attendance/scan', { token: decodedText });
            const member = res.data.data.member;
            setResult({
                success: true,
                member,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            });
            setTodayCount(c => c + 1);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Check-in failed';
            setResult({ success: false, message: msg });
        } finally {
            setProcessing(false);
            // Auto-restart scanner after 3 seconds
            resultTimeout.current = setTimeout(() => {
                setResult(null);
                startScanner();
            }, 3000);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScanner();
            if (resultTimeout.current) clearTimeout(resultTimeout.current);
        };
    }, []);

    return (
        <div className="max-w-lg mx-auto space-y-6 pb-10">

            {/* ── HEADER ── */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warrior-orange/20 border border-warrior-orange/30 flex items-center justify-center">
                    <MdQrCodeScanner className="text-warrior-orange" size={26} />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                        QR <span className="text-warrior-orange">Check-In</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                        Scan member QR to record attendance
                    </p>
                </div>
                {/* Today's count badge */}
                <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-warrior-orange/10 border border-warrior-orange/20 rounded-xl">
                    <MdCalendarToday size={13} className="text-warrior-orange" />
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Today</p>
                        <p className="text-lg font-black text-warrior-orange leading-none">{todayCount}</p>
                    </div>
                </div>
            </div>

            {/* ── RESULT OVERLAY ── */}
            {result && (
                <div className={`rounded-2xl border overflow-hidden transition-all ${
                    result.success
                        ? "border-green-700/50 bg-green-900/20"
                        : "border-red-700/50 bg-red-900/20"
                }`}>
                    <div className="p-6 flex flex-col items-center gap-4 text-center">
                        {result.success ? (
                            <>
                                {/* Success */}
                                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-bounce">
                                    <MdCheckCircle className="text-green-400" size={36} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-green-600 tracking-widest">Checked In!</p>
                                    <p className="text-2xl font-black italic uppercase text-white mt-1">
                                        {result.member?.name}
                                    </p>
                                    <p className="text-sm text-green-400 font-bold mt-1">{result.time}</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/30 border border-green-700/30 rounded-full">
                                    <GiMuscleUp size={14} className="text-green-400" />
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                                        Welcome, Warrior!
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Error */}
                                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                                    <MdCancel className="text-red-400" size={36} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-red-500 tracking-widest">Check-in Failed</p>
                                    <p className="text-sm font-bold text-red-300 mt-2">{result.message}</p>
                                </div>
                            </>
                        )}
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest">
                            Scanner restarting automatically…
                        </p>
                    </div>
                </div>
            )}

            {/* ── SCANNER AREA ── */}
            {!result && (
                <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
                    {/* Camera view */}
                    <div className="relative bg-black">
                        <div id="qr-reader" className="w-full" style={{ minHeight: scanning ? 'auto' : 0 }} />

                        {/* Corner decorations over camera */}
                        {scanning && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="relative w-56 h-56">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-warrior-orange rounded-tl-lg" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-warrior-orange rounded-tr-lg" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-warrior-orange rounded-bl-lg" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-warrior-orange rounded-br-lg" />
                                    {/* Scan line animation */}
                                    <div className="absolute left-0 right-0 h-0.5 bg-warrior-orange/70 animate-scan-line" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-5 space-y-3">
                        {!scanning ? (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-3 py-8">
                                    <div className="w-20 h-20 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                        <MdQrCodeScanner className="text-gray-600" size={40} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black italic uppercase text-gray-400">Camera Off</p>
                                        <p className="text-xs text-gray-600 mt-1">Press Start to activate scanner</p>
                                    </div>
                                </div>

                                {cameraError && (
                                    <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-3 text-center">
                                        <p className="text-xs text-red-400">{cameraError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={startScanner}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-warrior-orange hover:bg-orange-500 text-white font-black uppercase text-sm rounded-xl transition-all tracking-widest cursor-pointer"
                                >
                                    <MdCameraAlt size={18} />
                                    Start Scanner
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-xs font-bold text-green-400">Scanning…</p>
                                    <p className="text-[10px] text-gray-600">Point at member's QR code</p>
                                </div>
                                <button
                                    onClick={stopScanner}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 hover:border-red-500 text-gray-400 hover:text-red-400 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                                >
                                    <MdCancel size={14} />
                                    Stop
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── MANUAL FALLBACK ── */}
            <ManualCheckIn onSuccess={() => setTodayCount(c => c + 1)} />

            {/* ── INSTRUCTIONS ── */}
            <div className="bg-warrior-grey border border-neutral-700 rounded-2xl p-5">
                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-3">How it works</p>
                <div className="space-y-3">
                    {[
                        { icon: <MdSportsGymnastics size={14} />, text: "Member opens their Attendance page and shows their QR code" },
                        { icon: <MdQrCodeScanner size={14} />, text: "Press Start Scanner and point camera at the member's QR" },
                        { icon: <MdCheckCircle size={14} />, text: "Green confirmation means check-in recorded for today" },
                        { icon: <MdRefresh size={14} />, text: "Each QR is valid for 5 minutes and one check-in per day" },
                    ].map(({ icon, text }, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center text-warrior-orange shrink-0 mt-0.5">
                                {icon}
                            </div>
                            <p className="text-xs text-gray-500">{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Manual Fallback Check-in ─────────────────────────────────────────────────
const ManualCheckIn = ({ onSuccess }: { onSuccess: () => void }) => {
    const [open, setOpen]       = useState(false);
    const [userId, setUserId]   = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId.trim()) return;
        setLoading(true);
        setMsg(null);
        try {
            await api.post('/attendance/check-in', { userId: userId.trim() });
            setMsg({ type: 'ok', text: 'Checked in successfully!' });
            setUserId('');
            onSuccess();
        } catch (err: any) {
            setMsg({ type: 'err', text: err.response?.data?.message || 'Failed to check in' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <MdPerson size={16} className="text-gray-500" />
                    <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Manual ID Check-in</p>
                </div>
                <div className={`w-4 h-4 border border-gray-600 rounded-sm flex items-center justify-center transition-transform ${open ? 'rotate-45' : ''}`}>
                    <span className="text-gray-500 text-xs">+</span>
                </div>
            </button>

            {open && (
                <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
                    <input
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        placeholder="Paste Member ID…"
                        className="w-full bg-neutral-900 border border-neutral-700 focus:border-warrior-orange rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors font-mono"
                    />
                    {msg && (
                        <p className={`text-xs font-bold ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                            {msg.text}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !userId.trim()}
                        className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                    >
                        {loading ? 'Checking in…' : 'Check In'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default QRScannerPage;
