import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-[#050505] border-t border-white/5 pt-20 pb-10"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <motion.div 
                whileHover={{ rotate: 6, scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"
              >
                <span className="text-xl font-bold italic text-white">E</span>
              </motion.div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Evelify</h2>
            </Link>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm leading-relaxed max-w-sm font-light"
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
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              {['Mock Interviews', 'Pricing', 'AI Evaluation', 'Interview Modes'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }}>
                  <Link to="/" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
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
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <motion.li key={item} whileHover={{ x: 5 }}>
                  <a href="#" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
                    {item}
                  </a>
                </motion.li>
              ))}
              <motion.li whileHover={{ x: 5 }}>
                <a href="mailto:hello@evelify.com" className="text-gray-400 text-sm flex items-center gap-2 hover:text-blue-400 transition-colors">
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
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Evelify AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">System Status: Operational</p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
