import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GiLaurelCrown } from 'react-icons/gi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, EffectCoverflow } from 'swiper/modules';

// Styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

import { contentService } from '../../services/contentService';

interface Milestone {
    _id: string;
    title: string;
    description: string;
    year: string;
    image: string;
    order: number;
}

const Milestones = () => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const data = await contentService.getPublicMilestones();
                setMilestones(data.sort((a: Milestone, b: Milestone) => a.order - b.order));
            } catch (error) {
                console.error('Failed to fetch milestones:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMilestones();
    }, []);

    if (loading) {
        return (
            <section className="w-full py-20 px-6 bg-warrior-dark flex justify-center">
                <div className="w-10 h-10 border-4 border-warrior-orange border-t-transparent rounded-full animate-spin" />
            </section>
        );
    }

    if (milestones.length === 0) return null;

    return (
        <section 
            className="w-full py-20 lg:py-32 px-6 bg-warrior-dark text-white relative overflow-hidden"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlays for readability */}
            <div className="absolute inset-0 bg-black/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-warrior-dark via-warrior-dark/60 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* LEFT SECTION — TEXT */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-6xl md:text-7xl lg:text-8xl font-BabesNeue font-black italic uppercase leading-[0.9] tracking-tighter">
                                OUR <br />
                                <span className="text-warrior-orange">HONORS &</span> <br />
                                MILESTONES
                            </h2>
                            <p className="text-warrior-orange text-xl font-black uppercase tracking-widest italic">
                                Excellence in Training since day one
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-16 bg-warrior-orange rounded-full" />
                            <div className="h-1.5 w-4 bg-warrior-orange rounded-full" />
                        </div>

                        <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                            A timeline of sweat, dedication, and the recognition that follows hard work. 
                            Explore the path that made us the region's top fitness destination.
                        </p>
                    </motion.div>

                    {/* RIGHT SECTION — CAROUSEL WITH 3 VISIBLE SLIDES */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative px-4">
                            <Swiper
                                modules={[Autoplay, Navigation, EffectCoverflow]}
                                effect="coverflow"
                                grabCursor={true}
                                centeredSlides={true}
                                slidesPerView="auto"
                                coverflowEffect={{
                                    rotate: 50,
                                    stretch: 0,
                                    depth: 100,
                                    modifier: 1,
                                    slideShadows: true,
                                }}
                                autoplay={{ delay: 5000, disableOnInteraction: false }}
                                navigation={{
                                    nextEl: '.milestone-next',
                                    prevEl: '.milestone-prev',
                                }}
                                loop={milestones.length > 1}
                                className="w-full"
                            >
                                {milestones.map((milestone) => (
                                    <SwiperSlide key={milestone._id} className="!w-64 md:!w-80">
                                        <div className="relative rounded-3xl overflow-hidden border-2 border-warrior-orange/30 bg-neutral-900 group shadow-2xl h-96 md:h-[450px]">
                                            <img
                                                src={milestone.image}
                                                alt={milestone.title}
                                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                            
                                            {/* Content Overlay */}
                                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                                                <div className="flex justify-end">
                                                    <span className="bg-warrior-orange text-white font-black px-4 py-1 md:px-6 md:py-2 rounded-xl italic text-sm shadow-xl">
                                                        {milestone.year}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <h3 className="text-2xl md:text-3xl font-BabesNeue font-black italic uppercase text-white tracking-wide line-clamp-2">
                                                        {milestone.title}
                                                    </h3>
                                                    <div className="h-1 w-12 bg-warrior-orange" />
                                                    <p className="text-gray-200 text-xs md:text-sm line-clamp-2 leading-relaxed">
                                                        {milestone.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <GiLaurelCrown className="text-warrior-orange" size={18} />
                                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-warrior-orange">Certified Milestone</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="milestone-prev w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-warrior-orange flex items-center justify-center text-warrior-orange hover:bg-warrior-orange hover:text-white transition-all shadow-lg hover:shadow-xl hover:shadow-warrior-orange/50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="milestone-next w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-warrior-orange flex items-center justify-center text-warrior-orange hover:bg-warrior-orange hover:text-white transition-all shadow-lg hover:shadow-xl hover:shadow-warrior-orange/50"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Extra spacing for nav buttons */}
                        <div className="h-20 md:h-24" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Milestones;