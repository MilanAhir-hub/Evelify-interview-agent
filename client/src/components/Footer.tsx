import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="dark:bg-[#050505] light:bg-gray-50 border-t dark:border-white/5 light:border-gray-200 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-10"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-14 md:mb-16">
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-6 group">
              <motion.div 
                whileHover={{ rotate: 6, scale: 1.05 }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"
              >
                <span className="text-lg sm:text-xl font-bold italic text-white">E</span>
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight dark:text-white light:text-gray-900">Evelify</h2>
            </Link>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="dark:text-gray-400 light:text-gray-600 text-sm leading-relaxed max-w-sm font-light"
            >
              AI powered interview preparation platform designed to improve communication skills, technical depth and professional confidence.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="dark:text-white light:text-gray-900 font-bold mb-4 sm:mb-6">Product</h4>
            <ul className="space-y-3 sm:space-y-4">
              {['Mock Interviews', 'Pricing', 'AI Evaluation', 'Interview Modes'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }}>
                  <Link to="/" className="dark:text-gray-400 light:text-gray-600 text-sm hover:text-blue-400 transition-colors">
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="dark:text-white light:text-gray-900 font-bold mb-4 sm:mb-6">Support</h4>
            <ul className="space-y-3 sm:space-y-4">
              {['Help Center', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }}>
                  <a href="#" className="dark:text-gray-400 light:text-gray-600 text-sm hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </motion.li>
              ))}
              <motion.li whileHover={{ x: 5 }}>
                <a href="mailto:hello@evelify.com" className="dark:text-gray-400 light:text-gray-600 text-sm flex items-center gap-2 hover:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4" /> hello@evelify.com
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-6 sm:pt-8 border-t dark:border-white/5 light:border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4"
        >
          <p className="dark:text-gray-500 light:text-gray-400 text-xs">
            © {new Date().getFullYear()} Evelify AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <p className="dark:text-gray-500 light:text-gray-400 text-[10px] uppercase tracking-widest font-bold">System Status: Operational</p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
