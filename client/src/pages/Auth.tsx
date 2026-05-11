import React from 'react';
import { GoogleIcon } from 'hugeicons-react';
import { signInWithPopup } from 'firebase/auth';
import { auth,provider } from '../utils/firebase';
import axios from 'axios';
import { server_url } from '../AppRoutes';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

const Auth = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

  const handleGoogleAuth = async() =>{
     try {
    const response = await signInWithPopup(auth,provider);
    let user = response.user;
    let name = user.displayName;
    let email = user.email;

    const result = await axios.post(server_url + "/api/auth/google", {name, email}, {withCredentials: true});
    
    // Update Redux state with the user data returned from the server
    if (result.data.success) {
      dispatch(setUser(result.data.user));
      navigate('/');
    }
    console.log(result);
     } catch (error) {
    console.log(error);
}
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden text-white font-outfit">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 transition-all hover:border-white/20">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3">
             <span className="text-3xl font-bold italic">E</span>
          </div>
        </div>

        {/* Text Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Welcome to Evelify
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Start your AI-powered interview journey today.
          </p>
        </div>

        {/* Login Button */}
        <button 
          onClick={handleGoogleAuth}
          className="w-full group bg-white hover:bg-gray-100 text-black font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg hover:shadow-white/10"
        >
          <GoogleIcon className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
          <span>Continue with Google</span>
        </button>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 max-w-[280px] mx-auto leading-relaxed">
            By continuing, you agree to Evelify's 
            <span className="text-gray-400 cursor-pointer hover:underline mx-1">Terms of Service</span> 
            and 
            <span className="text-gray-400 cursor-pointer hover:underline ml-1">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;