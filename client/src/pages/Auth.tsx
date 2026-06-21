import React from 'react';
import { GoogleIcon } from 'hugeicons-react';
import { signInWithPopup } from 'firebase/auth';
import { auth,provider } from '../utils/firebase';
import axios from 'axios';
import { server_url } from '../config';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

import { Loader2 } from 'lucide-react';

const Auth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleGoogleAuth = async () => {
        if (isLoading) return; // Prevent multiple clicks
        
        setIsLoading(true);
        try {
            const response = await signInWithPopup(auth, provider);
            let user = response.user;
            const idToken = await user.getIdToken();

            const result = await axios.post(server_url + "/api/auth/google", { idToken }, { withCredentials: true });

            // Update Redux state with the user data returned from the server
            if (result.data.success) {
                dispatch(setUser(result.data.user));
                navigate('/', { replace: true });
            }
            console.log(result);
        } catch (error: any) {
            console.error("Firebase Auth Error:", error);
            // Handle common firebase errors
            if (error.code === 'auth/popup-closed-by-user') {
                console.log("User closed the popup");
            }
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <div className="min-h-screen dark:bg-[#050505] light:bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden dark:text-white light:text-gray-900 font-inter">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md dark:bg-[#111111]/80 light:bg-white/80 backdrop-blur-xl dark:border-white/10 light:border-gray-200 rounded-[2rem] p-10 shadow-2xl relative z-10 transition-all hover:dark:border-white/20 hover:light:border-gray-300">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3 group hover:rotate-6 transition-transform">
             <span className="text-3xl font-bold italic text-white">E</span>
          </div>
        </div>

        {/* Text Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3 dark:text-white light:text-gray-900">
            Welcome to Evelify
          </h1>
          <p className="dark:text-gray-400 light:text-gray-600 text-sm font-medium leading-relaxed">
            Experience the future of interview preparation with AI-powered simulations.
          </p>
        </div>

        {/* Login Button */}
        <button 
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className={`w-full group dark:bg-white light:bg-gray-900 hover:dark:bg-gray-100 hover:light:bg-gray-800 dark:text-[#0B1120] light:text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin dark:text-[#0B1120] light:text-white" />
          ) : (
            <GoogleIcon className="w-6 h-6 dark:text-[#0B1120] light:text-white group-hover:scale-110 transition-transform" />
          )}
          <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>


        {/* Footer Text */}
        <div className="mt-10 text-center">
          <p className="text-[11px] dark:text-gray-500 light:text-gray-400 max-w-[280px] mx-auto leading-relaxed font-medium">
            By continuing, you agree to our 
            <span className="text-blue-400 cursor-pointer hover:underline mx-1">Terms</span> 
            and 
            <span className="text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;