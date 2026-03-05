import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { MdDashboard, MdLogin, MdMenu, MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const { user }        = useAuth();
    const location        = useLocation();
    const [scrolled, setScrolled]   = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActivated = user && user.status === 'active';
    const isHome      = location.pathname === '/';

    // ── Scroll listener ──────────────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on mount
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // On non-home pages always show solid bg
    const solidBg = scrolled || !isHome;

    const navLinks = [
        { label: 'Home',     to: '/'         },
        { label: 'About',    to: '/about'    },
        { label: 'Plans',    to: '/plans'    },
        { label: 'Contact',  to: '/contact'  },
    ];

    return (
        <>
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500 ${
                    solidBg
                        ? 'bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-xl shadow-black/30'
                        : 'bg-transparent border-b border-transparent'
                }`}
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    {/* ── LOGO ── */}
                    <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                        <img src={assets.LOGO} alt="Warrior Fitness" className="w-8 md:w-10 transition-transform group-hover:scale-105 duration-300" />
                        <div className="leading-none">
                            <p className="text-lg md:text-xl font-black italic uppercase text-warrior-orange tracking-tight">WARRIOR</p>
                            <p className="text-lg md:text-xl font-black italic uppercase text-white tracking-tight -mt-1">FITNESS</p>
                        </div>
                    </Link>

                    {/* ── DESKTOP LINKS ── */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`text-[11px] font-black uppercase tracking-widest transition-all duration-200 relative group ${
                                    location.pathname === link.to
                                        ? 'text-warrior-orange'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {link.label}
                                {/* underline on active */}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-warrior-orange transition-all duration-300 ${
                                    location.pathname === link.to ? 'w-full' : 'w-0 group-hover:w-full'
                                }`} />
                            </Link>
                        ))}
                    </div>

                    {/* ── RIGHT ACTIONS ── */}
                    <div className="hidden md:flex items-center gap-3">
                        {isActivated && (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-warrior-orange text-white px-4 py-2 rounded-xl hover:bg-orange-500 transition-all duration-200 shadow-lg shadow-warrior-orange/20"
                            >
                                <MdDashboard size={14} /> Dashboard
                            </Link>
                        )}

                        {!user ? (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-warrior-orange/10 text-warrior-orange border border-warrior-orange/40 px-4 py-2 rounded-xl hover:bg-warrior-orange hover:text-white transition-all duration-300"
                            >
                                <MdLogin size={14} /> Login
                            </Link>
                        ) : (
                            <Link
                                to="/profile"
                                className="w-9 h-9 rounded-full bg-warrior-orange/10 border-2 border-warrior-orange text-warrior-orange font-black text-sm flex items-center justify-center uppercase hover:bg-warrior-orange hover:text-white transition-all duration-200"
                            >
                                {user.name.charAt(0)}
                            </Link>
                        )}
                    </div>

                    {/* ── MOBILE HAMBURGER ── */}
                    <button
                        className="md:hidden text-gray-400 hover:text-white transition-colors"
                        onClick={() => setMobileOpen(o => !o)}
                    >
                        {mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                    </button>
                </div>
            </motion.nav>

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-neutral-950/98 backdrop-blur-md flex flex-col pt-24 px-8 pb-8 md:hidden"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {/* Orange accent line */}
                        <div className="w-12 h-1 bg-warrior-orange mb-8 rounded-full" />

                        <div className="space-y-6 flex-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                >
                                    <Link
                                        to={link.to}
                                        onClick={() => setMobileOpen(false)}
                                        className={`block text-3xl font-black italic uppercase tracking-tight transition-colors ${
                                            location.pathname === link.to
                                                ? 'text-warrior-orange'
                                                : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Mobile CTA */}
                        <div className="space-y-3 mt-auto">
                            {isActivated && (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-warrior-orange text-white font-black text-[11px] uppercase tracking-widest rounded-xl"
                                >
                                    <MdDashboard size={16} /> Dashboard
                                </Link>
                            )}
                            {!user ? (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 border border-warrior-orange/40 text-warrior-orange font-black text-[11px] uppercase tracking-widest rounded-xl"
                                >
                                    <MdLogin size={16} /> Login
                                </Link>
                            ) : (
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center w-full py-3.5 border border-neutral-700 text-gray-300 font-black text-[11px] uppercase tracking-widest rounded-xl"
                                >
                                    {user.name} — Profile
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;