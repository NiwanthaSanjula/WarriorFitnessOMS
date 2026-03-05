/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdArrowForward, MdCheck } from 'react-icons/md';
import { GiTrophy, GiMuscleUp, GiLaurelCrown } from 'react-icons/gi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { membershipService, type MembershipPlan } from '../../services/membershipService';
import Spinner from '../../components/ui/Spinner';

const getTier = (price: number) => {
    if (price >= 5000) return { 
        label: 'Elite', 
        icon: GiLaurelCrown, 
        gradient: 'from-yellow-400 via-yellow-500 to-orange-500',
        borderColor: 'border-yellow-500/50',
        iconBg: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
        accentColor: 'text-yellow-400'
    };
    if (price >= 2500) return { 
        label: 'Pro', 
        icon: GiMuscleUp, 
        gradient: 'from-orange-400 via-red-500 to-pink-500',
        borderColor: 'border-orange-500/50',
        iconBg: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
        accentColor: 'text-orange-400'
    };
    return { 
        label: 'Starter', 
        icon: GiTrophy, 
        gradient: 'from-blue-400 via-cyan-500 to-teal-500',
        borderColor: 'border-blue-500/50',
        iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
        accentColor: 'text-blue-400'
    };
};

const durationLabel = (days: number) => {
    if (days % 365 === 0) return `${days / 365} Year${days / 365 > 1 ? 's' : ''}`;
    if (days % 30 === 0) return `${days / 30} Month${days / 30 > 1 ? 's' : ''}`;
    if (days % 7 === 0) return `${days / 7} Week${days / 7 > 1 ? 's' : ''}`;
    return `${days} Days`;
};

const PricingCard = ({ plan, tier }: { plan: MembershipPlan; tier: any }) => {
    const TierIcon = tier.icon;
    const features: string[] = (plan as any).features ?? [];
    const pricePerDay = (plan.price / plan.durationDays).toFixed(2);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
            className="group h-full"
        >
            <motion.div
                whileHover={{ y: -12, scale: 1.02 }}
                className={`relative h-full rounded-3xl overflow-hidden border-2 ${tier.borderColor} backdrop-blur-xl bg-linear-to-br from-neutral-900/80 via-black/60 to-black/80 p-6 md:p-8 flex flex-col shadow-2xl transition-all duration-300`}
            >
                {/* Animated background glow */}
                <div className={`absolute -top-32 -right-32 w-64 h-64 bg-linear-to-r ${tier.gradient} opacity-10 group-hover:opacity-20 rounded-full blur-3xl transition-opacity duration-500`} />
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 bg-linear-to-r ${tier.gradient} opacity-5 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Tier Badge */}
                    <div className="flex items-center gap-3 mb-6">
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className={`w-12 h-12 rounded-2xl ${tier.iconBg} border border-gray-700/50 flex items-center justify-center`}
                        >
                            <TierIcon size={24} className={tier.accentColor} />
                        </motion.div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Plan Type</p>
                            <p className={`text-lg font-black italic ${tier.accentColor}`}>{tier.label}</p>
                        </div>
                    </div>

                    {/* Plan name */}
                    <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white mb-1 tracking-tight">
                        {plan.name}
                    </h3>

                    {/* divider */}
                    <div className={`h-1 w-16 bg-linear-to-r ${tier.gradient} rounded-full mb-5`} />

                    {/* Price Section */}
                    <div className={`bg-linear-to-br ${tier.iconBg} border border-gray-700/30 rounded-2xl p-4 mb-6`}>
                        <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest mb-2">Investment</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl md:text-4xl font-black ${tier.accentColor}`}>
                                Rs. {plan.price.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-semibold">
                            Rs. {pricePerDay}/day • {durationLabel(plan.durationDays)}
                        </p>
                    </div>

                    {/* Description */}
                    {plan.description && (
                        <p className="text-gray-400 text-sm mb-6 italic leading-relaxed">"{plan.description}"</p>
                    )}

                    {/* Features */}
                    {features.length > 0 && (
                        <div className="flex-1 mb-6 space-y-3">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Includes</p>
                            {features.slice(0, 4).map((feature) => (
                                <div key={feature} className="flex items-start gap-2.5">
                                    <MdCheck size={18} className={`${tier.accentColor} shrink-0 mt-0.5`} />
                                    <p className="text-xs text-gray-300 font-medium">{feature}</p>
                                </div>
                            ))}
                            {features.length > 4 && (
                                <p className={`text-[10px] font-black uppercase tracking-widest ${tier.accentColor} mt-2`}>
                                    + {features.length - 4} more
                                </p>
                            )}
                        </div>
                    )}

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 relative z-10 bg-linear-to-r ${tier.gradient} text-white shadow-lg hover:shadow-2xl transition-all duration-300`}
                    >
                        Join Now <MdArrowForward size={16} />
                    </motion.button>
                </div>

                {/* Subtle border glow */}
                <div className={`absolute inset-0 rounded-3xl bg-linear-to-r ${tier.gradient} opacity-0 group-hover:opacity-5 pointer-events-none`} />
            </motion.div>
        </motion.div>
    );
};

const Pricing = () => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await membershipService.getPlans();
                setPlans(data);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return (
            <section className="w-full py-20 md:py-28 px-6 bg-warrior-dark">
                <div className="max-w-7xl mx-auto text-center">
                    <Spinner />
                </div>
            </section>
        );
    }

    if (plans.length === 0) {
        return (
            <section className="w-full py-20 md:py-28 px-6 bg-warrior-dark">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-white text-lg font-semibold">No membership plans available at this time.</p>
                </div>
            </section>
        );
    }

    // Sort plans by price
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <section className="w-full relative py-20 md:py-28 px-4 md:px-6 bg-warrior-dark text-white overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* ── HEADER ── */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: false }}
                >
                    <motion.p
                        className="text-sm md:text-base font-black uppercase tracking-widest text-warrior-orange mb-3"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: false }}
                    >
                        Flexible Plans For Everyone
                    </motion.p>

                    <motion.h2
                        className="text-4xl md:text-5xl lg:text-6xl font-BabesNeue font-black italic uppercase leading-tight mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: false }}
                    >
                        Choose Your <span className="text-warrior-orange">Fitness Plan</span>
                    </motion.h2>

                    <motion.p
                        className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mt-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: false }}
                    >
                        Start your transformation journey today with our premium membership packages
                    </motion.p>
                </motion.div>

                {/* ── SWIPER CAROUSEL ── */}
                <div className="relative">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={24}
                        slidesPerView={1}
                        breakpoints={{
                            640: {
                                slidesPerView: 1.5,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 24,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 28,
                            },
                        }}
                        autoplay={{
                            delay: 6000,
                            disableOnInteraction: true,
                        }}
                        navigation={{
                            nextEl: '.pricing-next',
                            prevEl: '.pricing-prev',
                        }}
                        loop={plans.length > 3}
                        className="pb-8"
                    >
                        {sortedPlans.map((plan) => (
                            <SwiperSlide key={plan._id} className="h-auto">
                                <PricingCard plan={plan} tier={getTier(plan.price)} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation buttons */}
                    {plans.length > 3 && (
                        <>
                            <button className="pricing-prev absolute left-0 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-linear-to-r from-orange-500 to-red-500 text-white flex items-center justify-center hover:shadow-xl hover:shadow-orange-500/50 transition-all -translate-x-2 md:-translate-x-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="pricing-next absolute right-0 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-linear-to-r from-orange-500 to-red-500 text-white flex items-center justify-center hover:shadow-xl hover:shadow-orange-500/50 transition-all translate-x-2 md:translate-x-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                
            </div>
        </section>
    );
};

export default Pricing;