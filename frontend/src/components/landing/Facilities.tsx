/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

import { FaDumbbell } from "react-icons/fa";
import { MdPeopleAlt, MdElectricBolt, MdAcUnit, MdShower, MdWifi, MdCardGiftcard, MdSecurityUpdateGood } from 'react-icons/md';

const Facilities = () => {
  const facilities = [
    {
      id: 1,
      title: "State-of-the-Art Equipment",
      description: "Premium gym machines and free weights from leading brands, regularly maintained for safety and performance.",
      icon: FaDumbbell,
      gradient: "from-orange-500 to-red-500"
    },
    {
      id: 2,
      title: "Expert Trainers",
      description: "Certified fitness professionals ready to guide you with personalized workout plans and form corrections.",
      icon: MdPeopleAlt,
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      id: 3,
      title: "High-Performance Space",
      description: "Spacious training areas with dedicated zones for cardio, strength training, and functional fitness.",
      icon: MdElectricBolt,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      title: "Air Conditioning",
      description: "Climate-controlled environment to keep you cool and comfortable during intense workouts.",
      icon: MdAcUnit,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 5,
      title: "Showers & Lockers",
      description: "Clean facilities with shower stalls, secure lockers, and changing rooms for your convenience.",
      icon: MdShower,
      gradient: "from-teal-500 to-green-500"
    },
    {
      id: 6,
      title: "High-Speed WiFi",
      description: "Stay connected with complimentary high-speed internet throughout the facility.",
      icon: MdWifi,
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      id: 7,
      title: "Member Benefits",
      description: "Exclusive discounts on supplements, nutrition plans, and access to member-only events.",
      icon: MdCardGiftcard,
      gradient: "from-pink-500 to-rose-500"
    },
    {
      id: 8,
      title: "Safety First",
      description: "Professional surveillance, trained staff, and first aid equipment for your security and wellbeing.",
      icon: MdSecurityUpdateGood,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full relative overflow-hidden py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-16 xl:px-24 2xl:px-48">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=1080&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADING */}
        <motion.div
          className="text-center mb-8 md:mb-12 lg:mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-BabesNeue text-white mb-2 md:mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false }}
          >
            OUR FACILITIES
          </motion.h2>

          <motion.p
            className="text-xs sm:text-sm md:text-base lg:text-xl text-orange-500 font-semibold"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: false }}
          >
            World-class amenities for your fitness journey
          </motion.p>
        </motion.div>

        {/* FACILITIES GRID */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {facilities.map((facility) => {
            const IconComponent = facility.icon;
            return (
              <motion.div
                key={facility.id}
                variants={itemVariants}
                className="group"
              >
                <motion.div
                  className="relative h-full p-4 md:p-6 rounded-2xl border-2 border-orange-500/50 bg-gray-900/40 backdrop-blur-sm hover:border-orange-500 transition-all duration-300 overflow-hidden"
                  whileHover={{
                    y: -8,
                    boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
                  }}
                >
                  {/* Background gradient */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-linear-to-r ${facility.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-300`} />

                  {/* Icon */}
                  <motion.div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-linear-to-r ${facility.gradient} p-0.5 mb-4 md:mb-6`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                      <IconComponent className="w-7 h-7 md:w-8 md:h-8 text-orange-500" />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">
                      {facility.title}
                    </h3>

                    <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                      {facility.description}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${facility.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>


      </div>
    </section>
  );
};

export default Facilities;