import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GiTrophy } from 'react-icons/gi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { contentService } from '../../services/contentService';

interface Story {
    _id: string;
    memberName: string;
    quote: string;
    duration: string;
    beforeImage: string;
    afterImage: string;
    order: number;
}

const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.3 } }
};

const SuccessStories = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await contentService.getPublicStories();
                setStories(data);
            } catch (error) {
                console.error('Failed to fetch stories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) {
        return (
            <section className="w-full py-20 md:py-28 px-6 bg-warrior-dark">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="w-8 h-8 border-2 border-warrior-orange border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </section>
        );
    }

    if (stories.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-20 md:py-28 px-6 bg-warrior-dark text-white">
            <div className="max-w-7xl mx-auto">
                {/* ── HEADER ── */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: false }}
                >
                    <motion.div
                        className="flex items-center justify-center gap-3 mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: false }}
                    >
                        <GiTrophy className="text-warrior-orange" size={28} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-warrior-orange">
                            Real Transformations
                        </span>
                    </motion.div>

                    <motion.h2
                        className="text-4xl md:text-5xl lg:text-6xl font-BabesNeue font-black italic uppercase leading-tight mb-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: false }}
                    >
                        Success <span className="text-warrior-orange">Stories</span>
                    </motion.h2>

                    <motion.p
                        className="text-gray-400 text-lg max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: false }}
                    >
                        See the incredible transformations of our community members who pushed their limits and achieved their goals.
                    </motion.p>

                    {/* Orange accent */}
                    <motion.div
                        className="flex items-center justify-center gap-3 mt-6"
                        initial={{ opacity: 0, scaleX: 0 }}
                        whileInView={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        viewport={{ once: false }}
                        style={{ originX: 'center' }}
                    >
                        <div className="h-1 w-3 bg-warrior-orange rounded-full" />
                        <div className="h-1 w-12 bg-warrior-orange rounded-full" />
                        <div className="h-1 w-3 bg-warrior-orange rounded-full" />
                    </motion.div>
                </motion.div>

                {/* ── SWIPER CAROUSEL ── */}
                <div className="relative">
                    <Swiper
                        modules={[Autoplay, Navigation]}
                        spaceBetween={24}
                        slidesPerView={1}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3,
                                spaceBetween: 24,
                            },
                        }}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next-stories',
                            prevEl: '.swiper-button-prev-stories',
                        }}
                        loop={true}
                        className="pb-6"
                    >
                        {stories.map((story) => (
                            <SwiperSlide key={story._id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: false }}
                                    className="group h-full"
                                >
                                    <div className="bg-warrior-grey border border-neutral-700 rounded-2xl overflow-hidden hover:border-warrior-orange/40 transition-all duration-300 h-full flex flex-col">
                                        {/* ── BEFORE/AFTER IMAGES ── */}
                                        <div className="grid grid-cols-2 gap-0 overflow-hidden h-48">
                                            {/* Before */}
                                            <motion.div
                                                className="relative overflow-hidden"
                                                variants={imageVariants}
                                                whileHover="hover"
                                            >
                                                <img
                                                    src={story.beforeImage}
                                                    alt="Before"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                                                <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase bg-black/80 text-warrior-orange px-2 py-0.5 rounded">
                                                    Before
                                                </span>
                                            </motion.div>

                                            {/* After */}
                                            <motion.div
                                                className="relative overflow-hidden"
                                                variants={imageVariants}
                                                whileHover="hover"
                                            >
                                                <img
                                                    src={story.afterImage}
                                                    alt="After"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                                                <span className="absolute bottom-2 left-2 text-[8px] font-black uppercase bg-warrior-orange text-black px-2 py-0.5 rounded">
                                                    After
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* ── CONTENT ── */}
                                        <div className="p-5 flex flex-col flex-1">
                                            {/* Member Name & Duration */}
                                            <div className="mb-3">
                                                <h3 className="text-white font-black italic uppercase text-lg tracking-tight mb-1">
                                                    {story.memberName}
                                                </h3>
                                                <p className="text-warrior-orange text-[11px] font-black uppercase tracking-widest">
                                                    {story.duration}
                                                </p>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-0.5 bg-linear-to-r from-warrior-orange/60 to-transparent mb-3" />

                                            {/* Quote */}
                                            <p className="text-gray-400 text-sm italic flex-1 mb-4 line-clamp-3">
                                                "{story.quote}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* ── NAVIGATION ARROWS ── */}
                    <button className="swiper-button-prev-stories absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-10 z-10 w-10 h-10 rounded-full bg-warrior-orange/20 backdrop-blur-sm hover:bg-warrior-orange/40 transition-all flex items-center justify-center group">
                        <svg
                            className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <button className="swiper-button-next-stories absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-10 z-10 w-10 h-10 rounded-full bg-warrior-orange/20 backdrop-blur-sm hover:bg-warrior-orange/40 transition-all flex items-center justify-center group">
                        <svg
                            className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SuccessStories;