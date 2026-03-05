import { motion } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import { GiMuscleUp, GiTrophy, GiWeightLiftingUp } from 'react-icons/gi';
import { Link } from 'react-router-dom';

const aboutImages = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1623874106686-5be2b325c8f1?q=80&w=687&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1637430308606-86576d8fef3c?q=80&w=687&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
];

const stats = [
    { number: '5000+', label: 'Active Members',   icon: GiMuscleUp        },
    { number: '50+',   label: 'Expert Trainers',  icon: GiTrophy          },
    { number: '9+',    label: 'Years Experience', icon: GiWeightLiftingUp },
];

const containerVariants = {
    hidden:   { opacity: 0 },
    visible:  { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
    hidden:   { opacity: 0, y: 30 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const imageVariants = {
    hidden:   { opacity: 0, scale: 0.85 },
    visible:  { opacity: 1, scale: 1, transition: { duration: 0.55 } },
    hover:    { scale: 1.04, transition: { duration: 0.3 } },
};

const AboutUs = () => {
    return (
        <div className="w-full bg-warrior-dark text-white">
            <section className="py-20 md:py-28 px-6 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

                        {/* ── LEFT — TEXT & STATS ── */}
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: false }}
                        >
                            {/* Label */}

                            {/* Heading */}
                            <motion.h2
                                className="text-4xl md:text-5xl lg:text-6xl font-BabesNeue font-black italic uppercase leading-tight tracking-wider"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: false }}
                            >
                                Your Ultimate{' '}
                                <span className="text-warrior-orange">Fitness</span>{' '}
                                Destination
                            </motion.h2>

                            {/* Orange accent bar */}
                            <motion.div
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, scaleX: 0 }}
                                whileInView={{ opacity: 1, scaleX: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                viewport={{ once: false }}
                                style={{ originX: 0 }}
                            >
                                <div className="h-1 w-12 bg-warrior-orange rounded-full" />
                                <div className="h-1 w-3  bg-warrior-orange rounded-full" />
                            </motion.div>

                            {/* Body text */}
                            <motion.p
                                className="text-gray-300 text-base leading-relaxed"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                viewport={{ once: false }}
                            >
                                Since 2015, we've been transforming lives through world-class fitness
                                facilities, expert guidance, and a community that believes in pushing every
                                boundary.
                            </motion.p>

                            <motion.p
                                className="text-gray-500 text-sm leading-relaxed"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                viewport={{ once: false }}
                            >
                                From cutting-edge equipment to certified trainers and personalised nutrition
                                plans — we provide everything you need to conquer your goals.
                            </motion.p>

                            {/* Stats grid */}
                            <motion.div
                                className="grid grid-cols-3 gap-3"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.2 }}
                            >
                                {stats.map(({ number, label, icon: Icon }, i) => (
                                    <motion.div
                                        key={i}
                                        variants={itemVariants}
                                        className="bg-warrior-grey border border-neutral-700 border-l-4 border-l-warrior-orange rounded-2xl p-4 hover:border-warrior-orange/60 transition-all duration-300"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center mb-2">
                                            <Icon className="text-warrior-orange" size={16} />
                                        </div>
                                        <p className="text-2xl font-black italic text-warrior-orange leading-none">{number}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{label}</p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                viewport={{ once: false }}
                            >
                                <Link
                                    to="/plans"
                                    className="inline-flex items-center gap-2 bg-warrior-orange text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-orange-500 transition-all duration-200 shadow-lg shadow-warrior-orange/20"
                                >
                                    View Our Plans <MdArrowForward size={15} />
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* ── RIGHT — IMAGE GRID ── */}
                        <motion.div
                            className="grid grid-cols-2 gap-3"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: false, amount: 0.2 }}
                        >
                            {aboutImages.map((src, i) => (
                                <motion.div
                                    key={i}
                                    variants={imageVariants}
                                    whileHover="hover"
                                    className={`rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 ${
                                        i === 0 ? 'row-span-1' : ''
                                    } ${i === 1 ? 'mt-6' : ''} ${i === 3 ? '-mt-6' : ''}`}
                                >
                                    <img
                                        src={src}
                                        alt={`Warrior Gym facility ${i + 1}`}
                                        className="w-full h-48 md:h-56 object-cover"
                                    />
                                    {/* orange bottom accent */}
                                    <div className="h-0.5 bg-warrior-orange/60" />
                                </motion.div>
                            ))}
                        </motion.div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;