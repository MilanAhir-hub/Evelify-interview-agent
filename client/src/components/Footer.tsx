import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-xl font-bold italic text-white">E</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Evelify</h2>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
              AI powered interview preparation platform designed to improve communication skills, technical depth and professional confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">Mock Interviews</Link></li>
              <li><Link to="/" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link to="/" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">AI Evaluation</Link></li>
              <li><Link to="/" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">Interview Modes</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 text-sm hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="mailto:hello@evelify.com" className="text-gray-400 text-sm flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" /> hello@evelify.com
              </a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Evelify AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">System Status: Operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
