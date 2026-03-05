import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { GiLaurelCrown } from 'react-icons/gi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

// Styles
import 'swiper/css';
import 'swiper/css/navigation';

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
                // Sort by order if not handled by API
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

                    {/* RIGHT SECTION — CAROUSEL */}
                    <div className="relative h-[500px] md:h-[600px]">
                        <Swiper
                            modules={[Autoplay, Navigation]}
                            spaceBetween={20}
                            slidesPerView={1}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            navigation={{
                                nextEl: '.milestone-next',
                                prevEl: '.milestone-prev',
                            }}
                            loop={milestones.length > 1}
                            className="h-full rounded-3xl overflow-visible"
                        >
                            {milestones.map((milestone) => (
                                <SwiperSlide key={milestone._id}>
                                    <div className="relative h-full rounded-3xl overflow-hidden border-2 border-warrior-orange/30 bg-neutral-900 group">
                                        <img
                                            src={milestone.image}
                                            alt={milestone.title}
                                            className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        
                                        {/* Content Overlay */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                            <div className="flex justify-end">
                                                <span className="bg-warrior-orange text-white font-black px-6 py-2 rounded-xl italic shadow-xl">
                                                    {milestone.year}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-3xl md:text-4xl font-BabesNeue font-black italic uppercase text-white tracking-wide">
                                                    {milestone.title}
                                                </h3>
                                                <div className="h-1 w-12 bg-warrior-orange" />
                                                <p className="text-gray-200 text-sm md:text-base line-clamp-3 leading-relaxed">
                                                    {milestone.description}
                                                </p>
                                                <div className="flex items-center gap-2 pt-4">
                                                    <GiLaurelCrown className="text-warrior-orange" size={24} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warrior-orange">Certified Milestone</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom Navigation */}
                        <div className="absolute -bottom-10 right-0 flex gap-4 z-30">
                            <button className="milestone-prev w-12 h-12 rounded-full border-2 border-warrior-orange/50 flex items-center justify-center text-warrior-orange hover:bg-warrior-orange hover:text-white transition-all">
                                ←
                            </button>
                            <button className="milestone-next w-12 h-12 rounded-full border-2 border-warrior-orange/50 flex items-center justify-center text-warrior-orange hover:bg-warrior-orange hover:text-white transition-all">
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Milestones;