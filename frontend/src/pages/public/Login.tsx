import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";
import { motion, type Variants } from "framer-motion";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';




const Login = () => {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError]               = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, user } = useAuth();
    const navigate        = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardVariants: Variants = {
        hidden:  { opacity: 0, y: 40, scale: 0.97 },
        visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

            {/* ── BACKGROUND IMAGE ─────────────────────────────────────────── */}
            <div className="absolute inset-0 z-">
                 <img
                    src={assets.login_bg}
                    alt="Warrior Gym"
                    className="w-full h-full object-cover object-center"
                />

                {/* Dark gradient overlay — keeps text readable over any image */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Extra vignette for depth */}
                <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/20 to-black/60" />
            </div>

            {/* ── LOGIN CARD ───────────────────────────────────────────────── */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="rounded-2xl border border-warrior-orange/30 border-t-2 border-t-warrior-orange bg-black/50 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">

                    {/* ── CARD HEADER ── */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-white/5">

                        {/* Logo ring */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15, duration: 0.55, ease: 'backOut' }}
                            className="mx-auto mb-5 w-20 h-20 rounded-full
                                       bg-warrior-orange/10 border-2 border-warrior-orange/40
                                       flex items-center justify-center
                                       shadow-lg shadow-warrior-orange/20"
                        >
                            <img src={assets.LOGO} alt="Warrior" className="w-12 h-12 object-contain" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-BabesNeue font-black italic uppercase tracking-tighter text-white leading-none">
                                Welcome <span className="text-warrior-orange">Back</span>
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="h-px w-8 bg-warrior-orange/50" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-warrior-orange/70">
                                    Warrior Fitness Portal
                                </p>
                                <div className="h-px w-8 bg-warrior-orange/50" />
                            </div>
                        </motion.div>
                    </div>

                    {/* ── FORM ── */}
                    <div className="px-8 py-7 space-y-4">

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                            >
                                <span className="w-4 h-4 rounded-full bg-red-500/30 border border-red-500/60 flex items-center justify-center shrink-0 text-red-400 text-[10px] font-black">!</span>
                                <p className="text-red-400 text-xs font-semibold">{error}</p>
                            </motion.div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>

                            {/* Email */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35, duration: 0.5 }}
                            >
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <MdEmail
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warrior-orange/50 pointer-events-none"
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 font-medium
                                                   bg-white/5 border border-white/10
                                                   focus:outline-none focus:border-warrior-orange focus:bg-white/8
                                                   hover:border-white/20
                                                   transition-all duration-200 backdrop-blur-sm"
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45, duration: 0.5 }}
                            >
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <MdLock
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warrior-orange/50 pointer-events-none"
                                    />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-gray-600 font-medium
                                                   bg-white/5 border border-white/10
                                                   focus:outline-none focus:border-warrior-orange focus:bg-white/8
                                                   hover:border-white/20
                                                   transition-all duration-200 backdrop-blur-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warrior-orange/50 hover:text-warrior-orange transition-colors"
                                    >
                                        {showPassword ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55, duration: 0.5 }}
                                className="w-full mt-2 py-3.5 rounded-xl font-BabesNeue font-black italic uppercase tracking-widest text-base
                                           bg-warrior-orange hover:bg-orange-500
                                           text-white shadow-lg shadow-warrior-orange/30
                                           hover:shadow-xl hover:shadow-warrior-orange/50
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           transition-all duration-300"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing In...
                                    </span>
                                ) : 'Sign In'}
                            </motion.button>
                        </form>
                    </div>

                    {/* ── CARD FOOTER ── */}
                    <div className="px-8 pb-7 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                            Not a member? <span className="text-warrior-orange/70">Contact gym admin</span>
                        </p>
                    </div>
                </div>

                {/* Bottom copyright */}
                <p className="text-center text-[9px] font-black uppercase tracking-widest text-white/20 mt-5">
                    Warrior Fitness © {new Date().getFullYear()}
                </p>
            </motion.div>
        </div>
    );
};

export default Login;