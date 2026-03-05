/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCalculate, MdElectricBolt } from 'react-icons/md';
import { GiCalculator, GiWeightScale } from 'react-icons/gi';

const Calculators = () => {
  // BMI Calculator State
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<any>(null);

  // Calorie Calculator State
  const [calorieAge, setCalorieAge] = useState('');
  const [calorieGender, setCalorieGender] = useState('male');
  const [calorieHeight, setCalorieHeight] = useState('');
  const [calorieWeight, setCalorieWeight] = useState('');
  const [calorieResult, setCalorieResult] = useState<any>(null);

  // Body Fat Calculator State
  const [bodyFatNeck, setBodyFatNeck] = useState('');
  const [bodyFatWaist, setBodyFatWaist] = useState('');
  const [bodyFatHeight, setBodyFatHeight] = useState('');
  const [bodyFatGender, setBodyFatGender] = useState('male');
  const [bodyFatResult, setBodyFatResult] = useState<any>(null);

  // BMI Calculation
  const calculateBMI = () => {
    if (bmiHeight && bmiWeight) {
      const heightInMeters = parseFloat(bmiHeight) / 100;
      const weightInKg = parseFloat(bmiWeight);
      const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      
      let category = '';
      let color = '';
      
      if (Number(bmi) < 18.5) {
        category = 'Underweight';
        color = 'text-blue-400';
      } else if (Number(bmi) < 25) {
        category = 'Normal';
        color = 'text-green-400';
      } else if (Number(bmi) < 30) {
        category = 'Overweight';
        color = 'text-yellow-400';
      } else {
        category = 'Obese';
        color = 'text-red-400';
      }
      
      setBmiResult({ value: bmi, category, color });
    }
  };

  // Calorie Calculation (Mifflin-St Jeor Equation)
  const calculateCalories = () => {
    if (calorieAge && calorieHeight && calorieWeight) {
      const weight = parseFloat(calorieWeight);
      const height = parseFloat(calorieHeight);
      const age = parseFloat(calorieAge);
      
      let bmr;
      if (calorieGender === 'male') {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }
      
      const maintenance = Math.round(bmr * 1.55);
      
      setCalorieResult({
        maintenance
      });
    }
  };

  // Body Fat Calculation (US Navy Method)
  const calculateBodyFat = () => {
    if (bodyFatNeck && bodyFatWaist && bodyFatHeight) {
      const neck = parseFloat(bodyFatNeck);
      const waist = parseFloat(bodyFatWaist);
      const height = parseFloat(bodyFatHeight);
      
      let bodyFat;
      if (bodyFatGender === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + 0 - neck) + 0.22100 * Math.log10(height)) - 450;
      }
      
      const percentage = Math.max(0, Math.min(100, bodyFat)).toFixed(1);
      
      setBodyFatResult({ percentage });
    }
  };

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
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="w-full relative overflow-hidden py-20 md:py-28 px-6 md:px-10 bg-warrior-dark text-white">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto">
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
              <GiCalculator className="text-warrior-orange" size={24} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-warrior-orange">
              Track Progress
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-BabesNeue font-black italic uppercase leading-tight mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false }}
          >
            Fitness <span className="text-warrior-orange">Calculators</span>
          </motion.h2>

          <motion.p
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: false }}
          >
            Calculate your BMI, daily calorie needs, and body fat percentage with our advanced fitness tools
          </motion.p>
        </motion.div>

        {/* ── CALCULATORS GRID ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {/* BMI CALCULATOR */}
          <motion.div
            variants={itemVariants}
            className="group"
          >
            <motion.div
              whileHover={{ y: -8 }}
              className="relative h-full rounded-2xl overflow-hidden border-2 border-neutral-700 bg-linear-to-br from-neutral-900/60 via-black/60 to-neutral-900/60 backdrop-blur-sm p-6 md:p-8 hover:border-blue-500/40 transition-all duration-300"
            >
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:opacity-20 opacity-10 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4"
                >
                  <MdCalculate size={24} className="text-blue-400" />
                </motion.div>

                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white mb-4 tracking-tight">BMI Calculator</h3>

                {/* Divider */}
                <div className="h-1 w-12 bg-linear-to-r from-blue-500 to-transparent rounded-full mb-5" />

                {/* Input fields */}
                <div className="space-y-3 flex-1">
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm font-medium"
                  />

                  <motion.button
                    onClick={calculateBMI}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-black uppercase text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-4"
                  >
                    Calculate
                  </motion.button>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {bmiResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
                    >
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Your BMI</p>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-3xl font-black ${bmiResult.color}`}>
                          {bmiResult.value}
                        </span>
                        <span className="text-blue-400 text-sm font-black uppercase">
                          {bmiResult.category}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* CALORIE CALCULATOR */}
          <motion.div
            variants={itemVariants}
            className="group"
          >
            <motion.div
              whileHover={{ y: -8 }}
              className="relative h-full rounded-2xl overflow-hidden border-2 border-neutral-700 bg-linear-to-br from-neutral-900/60 via-black/60 to-neutral-900/60 backdrop-blur-sm p-6 md:p-8 hover:border-orange-500/40 transition-all duration-300"
            >
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:opacity-20 opacity-10 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mb-4"
                >
                  <MdElectricBolt size={24} className="text-orange-400" />
                </motion.div>

                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white mb-4 tracking-tight">Calorie Calculator</h3>

                {/* Divider */}
                <div className="h-1 w-12 bg-linear-to-r from-orange-500 to-transparent rounded-full mb-5" />

                {/* Input fields */}
                <div className="space-y-3 flex-1">
                  <input
                    type="number"
                    placeholder="Age"
                    value={calorieAge}
                    onChange={(e) => setCalorieAge(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                  />
                  <select
                    value={calorieGender}
                    onChange={(e) => setCalorieGender(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={calorieHeight}
                    onChange={(e) => setCalorieHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={calorieWeight}
                    onChange={(e) => setCalorieWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors text-sm font-medium"
                  />

                  <motion.button
                    onClick={calculateCalories}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white font-black uppercase text-sm rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 mt-4"
                  >
                    Calculate
                  </motion.button>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {calorieResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30"
                    >
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Daily Maintenance</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-orange-400">
                          {calorieResult.maintenance}
                        </span>
                        <span className="text-orange-400 text-sm font-black uppercase">
                          kcal/day
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* BODY FAT CALCULATOR */}
          <motion.div
            variants={itemVariants}
            className="group"
          >
            <motion.div
              whileHover={{ y: -8 }}
              className="relative h-full rounded-2xl overflow-hidden border-2 border-neutral-700 bg-linear-to-br from-neutral-900/60 via-black/60 to-neutral-900/60 backdrop-blur-sm p-6 md:p-8 hover:border-red-500/40 transition-all duration-300"
            >
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:opacity-20 opacity-10 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4"
                >
                  <GiWeightScale size={24} className="text-red-400" />
                </motion.div>

                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white mb-4 tracking-tight">Body Fat Calculator</h3>

                {/* Divider */}
                <div className="h-1 w-12 bg-linear-to-r from-red-500 to-transparent rounded-full mb-5" />

                {/* Input fields */}
                <div className="space-y-3 flex-1">
                  <input
                    type="number"
                    placeholder="Neck (cm)"
                    value={bodyFatNeck}
                    onChange={(e) => setBodyFatNeck(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Waist (cm)"
                    value={bodyFatWaist}
                    onChange={(e) => setBodyFatWaist(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm font-medium"
                  />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={bodyFatHeight}
                    onChange={(e) => setBodyFatHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm font-medium"
                  />
                  <select
                    value={bodyFatGender}
                    onChange={(e) => setBodyFatGender(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors text-sm font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  <motion.button
                    onClick={calculateBodyFat}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-linear-to-r from-red-500 to-red-600 text-white font-black uppercase text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20 mt-4"
                  >
                    Calculate
                  </motion.button>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {bodyFatResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                    >
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Your Body Fat</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-black text-red-400">
                          {bodyFatResult.percentage}%
                        </span>
                        <span className="text-red-400 text-sm font-black uppercase">
                          Body Fat
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Calculators;