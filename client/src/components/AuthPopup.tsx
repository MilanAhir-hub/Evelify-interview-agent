import React from 'react';
import { GoogleIcon } from 'hugeicons-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';
import { server_url } from '../AppRoutes';
import { X } from 'lucide-react';

interface AuthPopupProps {
  onClose?: () => void;
}

const AuthPopup = ({ onClose }: AuthPopupProps) => {
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
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
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Popup Content */}
      <div className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        
        {/* Close Button (Optional) */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon/Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3">
             <span className="text-3xl font-bold italic text-white">E</span>
          </div>
        </div>

        {/* Text Section */}
        <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
          Login to Continue
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-10 px-2 font-light">
          Unlock the full potential of Evelify. Sign in to save your interview progress and access advanced AI features.
        </p>

        {/* Google Button */}
        <button 
          onClick={handleGoogleAuth}
          className="w-full group bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg hover:shadow-white/10"
        >
          <GoogleIcon className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
          <span>Continue with Google</span>
        </button>

        {/* Subtle Footer */}
        <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
          Evelify AI Agent
        </p>
      </div>
    </div>
  );
};

export default AuthPopup;