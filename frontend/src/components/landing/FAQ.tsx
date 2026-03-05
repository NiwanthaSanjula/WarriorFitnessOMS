
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdExpandMore } from 'react-icons/md';
import { FaQuestion } from "react-icons/fa"

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What are your operating hours?",
      answer: "We're open 24/7, 365 days a year. Our staffed hours are Monday-Friday 5 AM to 11 PM, Saturday-Sunday 6 AM to 10 PM. Access is available anytime with your membership card."
    },
    {
      question: "Do you offer personal training?",
      answer: "Yes! We offer personalized one-on-one training sessions with certified trainers. Whether you're a beginner or advanced athlete, our trainers will create a customized program to help you reach your fitness goals."
    },
    {
      question: "What membership options do you have?",
      answer: "We offer flexible membership plans including Weekly Pass, Monthly Plan, 6-Month Plan, and 1-Year Plan. Each plan comes with different benefits to suit your needs. Check our pricing page for detailed information."
    },
    {
      question: "Do I need to bring my own towels?",
      answer: "Towels are provided free of charge to all members. We have fresh, clean towels available at the front desk and locker rooms. However, you're welcome to bring your own if you prefer."
    },
    {
      question: "Is there parking available?",
      answer: "Yes, we have ample free parking available for all members and guests. Our parking lot is well-lit and secure, with designated spots close to the entrance for your convenience."
    },
    {
      question: "Can I try a free trial before joining?",
      answer: "Absolutely! We offer a complimentary 1-day trial pass so you can experience our facilities, equipment, and atmosphere before committing to a membership. Contact us or visit in person to schedule your trial."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full py-20 md:py-28 px-6 md:px-10 bg-warrior-dark text-white relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ── HEADER ── */}
        <motion.div
          className="text-center mb-12 md:mb-16"
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
            <div className="w-12 h-12 rounded-2xl bg-warrior-orange/10 border border-warrior-orange/20 flex items-center justify-center">
              <FaQuestion  className="text-warrior-orange" size={24} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-warrior-orange">
              Questions?
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-BabesNeue font-black italic uppercase leading-tight mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false }}
          >
            Frequently Asked <span className="text-warrior-orange">Questions</span>
          </motion.h2>

          <motion.p
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: false }}
          >
            Find answers to common questions about our gym, memberships, and facilities
          </motion.p>
        </motion.div>

        {/* ── FAQ ITEMS ── */}
        <motion.div
          className="space-y-3 md:space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <motion.div
                className="relative rounded-2xl border-2 border-neutral-700 bg-linear-to-r from-neutral-900/60 via-black/60 to-neutral-900/60 backdrop-blur-sm overflow-hidden hover:border-warrior-orange/40 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                {/* Animated border glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-warrior-orange/0 via-warrior-orange/0 to-warrior-orange/0 group-hover:from-warrior-orange/5 group-hover:via-warrior-orange/10 group-hover:to-warrior-orange/5 transition-all duration-300" />

                <motion.button
                  onClick={() => toggleFAQ(index)}
                  className="relative w-full px-5 md:px-7 py-4 md:py-5 flex items-center justify-between text-left"
                  whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.02)' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-5 h-5 rounded-lg bg-warrior-orange/10 border border-warrior-orange/30 flex items-center justify-center shrink-0">
                      <span className="text-warrior-orange font-black text-xs">?</span>
                    </div>
                    <span className="text-white font-bold text-sm md:text-base leading-relaxed wrap-break-word">
                      {faq.question}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 ml-3"
                  >
                    <MdExpandMore size={24} className="text-warrior-orange" />
                  </motion.div>
                </motion.button>

                {/* Divider */}
                <AnimatePresence>
                  {openIndex === index && (
                    <div className="h-px bg-linear-to-r from-transparent via-warrior-orange/20 to-transparent" />
                  )}
                </AnimatePresence>

                {/* Answer section */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="relative px-5 md:px-7 pb-4 md:pb-6 pt-2">
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </p>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-warrior-orange/10 to-transparent" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  );
};

export default FAQ;