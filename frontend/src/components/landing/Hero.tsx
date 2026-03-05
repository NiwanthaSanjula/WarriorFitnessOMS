/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assets } from '../../assets/assets';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'FORAGE YOUR LEGACY',
      subtitle: 'Transform Your Strength',
      image: assets.HeroSlide1,
      color: 'from-orange-900/40 to-transparent'
    },
    {
      title: 'PUSH YOUR LIMITS',
      subtitle: 'Break Every Barrier',
      image: assets.HeroSlide2,
      color: 'from-red-900/40 to-transparent'
    },
    {
      title: 'CONQUER TODAY',
      subtitle: 'Become Unstoppable',
      image: assets.HeroSlide3,
      color: 'from-orange-900/40 to-transparent'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className='relative h-[85vh] flex items-center justify-center overflow-hidden bg-warrior-dark'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          className='absolute inset-0'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background Image */}
          <motion.img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className='w-full h-full object-cover'
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 5, ease: 'easeOut' }}
          />

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-linear-to-r ${slides[currentSlide].color}`}
          />
          <div className='absolute inset-0 bg-linear-to-t from-warrior-dark via-transparent to-transparent' />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className='relative z-10 text-center space-y-6 px-6 max-w-4xl'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className='text-5xl md:text-7xl font-black font-BabesNeue text-warrior-orange italic uppercase tracking-widest leading-tight'>
              {slides[currentSlide].title}
            </h1>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode='wait'>
          <motion.div
            key={`subtitle-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className='text-xl md:text-2xl text-gray-300 font-light tracking-wider'>
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Accent Line */}
        <motion.div
          className='flex items-center justify-center gap-4'
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className='h-1 w-12 bg-warrior-orange' />
          <div className='h-1 w-3 bg-warrior-orange' />
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3'>
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all ${
              currentSlide === index
                ? 'bg-warrior-orange w-8'
                : 'bg-gray-600 w-3 hover:bg-gray-500'
            }`}
            style={{ height: '3px' }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <motion.button
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className='absolute left-8 z-20 p-3 rounded-full bg-warrior-orange/20 backdrop-blur-sm hover:bg-warrior-orange/40 transition-colors'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className='w-6 h-6 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 19l-7-7 7-7'
          />
        </svg>
      </motion.button>

      <motion.button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className='absolute right-8 z-20 p-3 rounded-full bg-warrior-orange/20 backdrop-blur-sm hover:bg-warrior-orange/40 transition-colors'
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className='w-6 h-6 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5l7 7-7 7'
          />
        </svg>
      </motion.button>
    </section>
  );
};

export default Hero;