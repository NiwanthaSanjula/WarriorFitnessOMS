import { useState } from "react"
import { useAuth } from "../../context/AuthContext";
import { useNavigate,  } from "react-router-dom";
import axios from "axios";
import { assets } from "../../assets/assets";
import { motion, type Variants } from "framer-motion";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false)
 
    const { login } = useAuth();
    const navigate = useNavigate();

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
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };
    

    return (
        <div className="min-h-screen flex items-center justify-center px-4 md:px-6 pt-20 md:pt-24 pb-10 relative overflow-hidden">
            {/* Background Images with Overlay */}
            <div className="absolute inset-0 -z-20">
                {/* Left side image placeholder */}
                <div 
                    className="absolute left-0 top-0 w-1/2 h-full bg-cover bg-center opacity-30 bg-gray-900"
                    style={{
                        backgroundImage: 'url()',  // Add your image URL here
                        backgroundColor: 'rgb(17, 24, 39)',
                    }}
                >
                    {/* Placeholder text for left side */}
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-bold">LEFT IMAGE</p>
                            <p className="text-gray-700 text-xs">Add your fitness image here</p>
                        </div>
                    </div>
                </div>
                {/* Right side image placeholder */}
                <div 
                    className="absolute right-0 top-0 w-1/2 h-full bg-cover bg-center opacity-30 bg-gray-900"
                    style={{
                        backgroundImage: 'url()',  // Add your image URL here
                        backgroundColor: 'rgb(17, 24, 39)',
                    }}
                >
                    {/* Placeholder text for right side */}
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-bold">RIGHT IMAGE</p>
                            <p className="text-gray-700 text-xs">Add your fitness image here</p>
                        </div>
                    </div>
                </div>
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/70" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                {/* Glassmorphism Card */}
                <div className="rounded-2xl border-2 border-warrior-orange/40 bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden">
                    {/* Header Section with Logo */}
                    <div className="relative p-8 md:p-10 border-b border-warrior-orange/20 bg-linear-to-b from-black/60 to-transparent text-center">
                        {/* Logo Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="mb-6"
                        >
                            <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-br from-warrior-orange/20 to-orange-600/20 border border-warrior-orange/40 flex items-center justify-center backdrop-blur-sm">
                                <img 
                                    src={assets.LOGO} 
                                    alt="Warrior Gym" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-BabesNeue font-black italic uppercase tracking-tight mb-2">
                                <span className="text-warrior-orange">SIGN IN</span>
                            </h1>
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-1 w-8 bg-linear-to-r from-warrior-orange to-transparent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-warrior-orange">Warrior Fitness</span>
                                <div className="h-1 w-8 bg-linear-to-l from-warrior-orange to-transparent" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 md:p-10 space-y-5">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg bg-red-500/15 border border-red-500/40 p-3 flex items-start gap-3 backdrop-blur-sm"
                            >
                                <div className="w-5 h-5 rounded-full bg-red-500/30 border border-red-500/60 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-red-400 text-xs font-black">!</span>
                                </div>
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </motion.div>
                        )}

                        {/* Form */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Username/Email Field */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                <label className="text-xs font-black uppercase tracking-widest text-gray-300 block mb-2.5">
                                    Username
                                </label>
                                <div className="relative">
                                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-warrior-orange/60 pointer-events-none" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email or username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-black/40 border-2 border-warrior-orange/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-warrior-orange focus:bg-black/50 transition-all duration-300 text-sm font-medium backdrop-blur-sm hover:border-warrior-orange/50"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                <label className="text-xs font-black uppercase tracking-widest text-gray-300 block mb-2.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warrior-orange/60 pointer-events-none" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-black/40 border-2 border-warrior-orange/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-warrior-orange focus:bg-black/50 transition-all duration-300 text-sm font-medium backdrop-blur-sm hover:border-warrior-orange/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-warrior-orange/60 hover:text-warrior-orange transition-colors"
                                    >
                                        {showPassword ? (
                                            <MdVisibilityOff size={18} />
                                        ) : (
                                            <MdVisibility size={18} />
                                        )}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Login Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="w-full py-3.5 rounded-lg font-black uppercase tracking-widest text-base bg-linear-to-r from-warrior-orange via-orange-500 to-red-600 text-white hover:from-orange-600 hover:via-orange-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-warrior-orange/40 hover:shadow-xl hover:shadow-warrior-orange/60 mt-6 font-BabesNeue"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    'Login'
                                )}
                            </motion.button>
                        </form>

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;