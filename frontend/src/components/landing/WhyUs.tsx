import { motion } from 'framer-motion';
import { assets } from '../../assets/assets';

const whyUsData = [
    {
        id: 1,
        title: 'Modern Equipment',
        description: 'Train with the latest machines and gear designed for maximum results.',
        icon: assets.WhyUs1,
    },
    {
        id: 2,
        title: 'Nutrition Guidance',
        description: 'Meal plans and advice that complement your training.',
        icon: assets.WhyUs2,
    },
    {
        id: 3,
        title: 'Expert Trainers',
        description: 'Work with certified professionals who guide you every step of the way.',
        icon: assets.WhyUs3,
    },
    {
        id: 4,
        title: 'Supportive Community',
        description: 'Stay motivated with a fitness family that pushes you forward.',
        icon: assets.WhyUs4,
    },
];

const containerVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const itemVariants = {
    hidden:  { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const iconVariants = {
    hidden:   { scale: 0, rotate: -20 },
    visible:  { scale: 1, rotate: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    hover:    { scale: 1.1, rotate: 5, transition: { duration: 0.3 } },
};

const WhyUs = () => {
    return (
        <section className="w-full py-10 md:py-16 lg:py-20 px-4 md:px-6 bg-warrior-orange">

            {/* ── HEADING ── */}
            <motion.div
                className="max-w-7xl mx-auto text-center mb-8 md:mb-12 lg:mb-16"
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: false }}
            >
                <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl font-BabesNeue lg:text-6xl font-bold italic uppercase  text-warrior-grey mb-2 md:mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: false }}
                >
                    Why Choose Us
                </motion.h2>

                <motion.p
                    className="text-sm sm:text-base md:text-lg lg:text-2xl font-black uppercase tracking-widest text-white/70"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: false }}
                >
                    Push Your Limits Forward
                </motion.p>
            </motion.div>

            {/* ── CARDS GRID ── */}
            <motion.div
                className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
            >
                {whyUsData.map((item) => (
                    <motion.div
                        key={item.id}
                        variants={itemVariants}
                        className="group"
                    >
                        <motion.div
                            className="h-full flex flex-col items-center text-center p-4 md:p-6 lg:p-8 rounded-2xl bg-warrior-grey border-2 border-neutral-800 hover:border-warrior-orange transition-all duration-300 cursor-pointer"
                            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.25)' }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Icon circle */}
                            <motion.div
                                className="w-16 md:w-20 lg:w-24 h-16 md:h-20 lg:h-24 p-2 rounded-full bg-warrior-dark border border-warrior-orange/20 flex items-center justify-center mb-3 md:mb-4 lg:mb-6"
                                variants={iconVariants}
                                whileHover="hover"
                            >
                                <img src={item.icon} alt={item.title} className="w-10 h-10 object-contain" />
                            </motion.div>

                            {/* Title */}
                            <h3 className="text-white font-BabesNeue text-xl sm:text-2xl md:text-3xl max-w-45 font-black italic uppercase tracking-widest mb-2 md:mb-3">
                                {item.title}
                            </h3>

                            {/* Orange divider */}
                            <div className="w-8 h-0.5 bg-warrior-orange rounded-full mb-3" />

                            {/* Description */}
                            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default WhyUs;