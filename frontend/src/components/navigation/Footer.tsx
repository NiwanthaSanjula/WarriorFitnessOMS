/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion';
import { MdPhone, MdEmail, MdLocationOn, MdFacebook} from 'react-icons/md';
import { FaInstagramSquare } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'About Us', path: '/#about' },
        { label: 'Contact', path: '/contact' },
      ]
    },
    {
      title: 'Services',
      links: [
        { label: 'Memberships', path: '/pricing' },
        { label: 'Personal Training', path: '/#facilities' },
        { label: 'Group Classes', path: '/#facilities' },
        { label: 'Nutrition Plans', path: '/#' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', path: '/#faq' },
        { label: 'Terms & Conditions', path: '#' },
        { label: 'Privacy Policy', path: '#' },
        { label: 'Contact Support', path: '#' },
      ]
    }
  ];

  const socialLinks = [
    { icon: MdFacebook, url: '#', label: 'Facebook' },
    { icon: FaInstagramSquare, url: '#', label: 'Instagram' },
  ];

  const contactInfo = [
    { icon: MdPhone, label: 'Phone', value: '+1 (234) 567-8900', href: 'tel:+12345678900' },
    { icon: MdEmail, label: 'Email', value: 'info@warriorgym.com', href: 'mailto:info@warriorgym.com' },
    { icon: MdLocationOn, label: 'Location', value: 'Colombo, Sri Lanka', href: '#' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="w-full bg-black border-t border-neutral-800 text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-8 md:mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
        >
          {/* Brand Section */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2"
          >
            <Link to="/" className="inline-block mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={assets.LOGO} 
                  alt="Warrior Gym" 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                />
                <div>
                  <p className="text-lg md:text-xl font-black italic uppercase tracking-tight text-warrior-red">
                    Warrior
                  </p>
                  <p className=" text-lg md:text-xl font-black uppercase tracking-widest text-white">
                    Fitness
                  </p>
                </div>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6 mt-4">
              Transform your body, strengthen your mind. Join Warrior Gym and become the best version of yourself.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.url}
                    title={social.label}
                    whileHover={{ scale: 1.2, color: '#f97316' }}
                    className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-gray-400 hover:text-warrior-orange transition-colors"
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.path}
                      className="text-gray-400 text-sm hover:text-warrior-orange transition-colors duration-300 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 p-6 rounded-2xl bg-linear-to-r from-neutral-900/40 to-black/40 border border-neutral-800"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
        >
          {contactInfo.map((info, idx) => {
            const Icon = info.icon;
            return (
              <motion.a
                key={idx}
                href={info.href}
                variants={itemVariants}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-warrior-orange/10 border border-warrior-orange/30 flex items-center justify-center group-hover:bg-warrior-orange/20 transition-colors">
                  <Icon size={18} className="text-warrior-orange" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{info.label}</p>
                  <p className="text-sm text-gray-300 font-medium">{info.value}</p>
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-linear-to-r from-transparent via-neutral-700 to-transparent mb-6" />

        {/* Bottom Bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: false }}
        >
          <p className="text-[12px] text-gray-500 font-medium">
            © {currentYear} Warrior Gym. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link to="#" className="text-[12px] text-gray-500 hover:text-warrior-orange transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-[12px] text-gray-500 hover:text-warrior-orange transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-[12px] text-gray-500 hover:text-warrior-orange transition-colors">
              Sitemap
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;