import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleIcon } from 'hugeicons-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { server_url } from '../config';
import { X, Loader2 } from 'lucide-react';

interface AuthPopupProps {
  onClose?: () => void;
}

const AuthPopup = ({ onClose }: AuthPopupProps) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const response = await signInWithPopup(auth, provider);
      const { displayName: name, email } = response.user;

      const result = await axios.post(
        `${server_url}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );

      if (result.data.success) {
        dispatch(setUser(result.data.user));
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Auth Popup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm dark:bg-[#111111] light:bg-white dark:border-white/10 light:border-gray-200 rounded-[2.5rem] p-10 shadow-2xl text-center"
      >
        {onClose && (
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-6 right-6 dark:text-gray-500 light:text-gray-400 hover:dark:text-white hover:light:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}

        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 3 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
             <span className="text-3xl font-bold italic text-white">E</span>
          </div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold dark:text-white light:text-gray-900 mb-4 tracking-tight"
        >
          Login to Continue
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dark:text-gray-400 light:text-gray-600 text-sm leading-relaxed mb-10 px-2 font-light"
        >
          Unlock the full potential of Evelify. Sign in to save your interview progress and access advanced AI features.
        </motion.p>

        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full group dark:bg-white light:bg-gray-900 hover:dark:bg-gray-100 hover:light:bg-gray-800 dark:text-black light:text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg disabled:opacity-70"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5 dark:text-black light:text-white" />
            </motion.div>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 dark:text-black light:text-white group-hover:scale-110 transition-transform" />
              <span>Continue with Google</span>
            </>
          )}
        </motion.button>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-[10px] dark:text-gray-600 light:text-gray-400 uppercase tracking-widest font-semibold"
        >
          Evelify AI Agent
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default AuthPopup;