import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, History } from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import axios from 'axios';
import { server_url } from '../../AppRoutes';
import type { RootState } from '../../redux/store';
import Dropdown from './Dropdown';

const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing prematurely if needed
    try {
      await axios.post(`${server_url}/api/auth/logout`, {}, { withCredentials: true });
      dispatch(logoutUser());
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) return null;

  const trigger = (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center text-sm font-bold text-blue-400 shadow-inner hover:border-blue-500/50 transition-all active:scale-95">
      {user.name.slice(0, 2).toUpperCase()}
    </div>
  );

  return (
    <Dropdown trigger={trigger}>
      {/* User Info Section */}
      <div className="p-4 border-b border-white/5 bg-white/5">
        <p className="text-xs text-gray-500 font-medium mb-1">Signed in as</p>
        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
        <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <Link 
          to="/history" 
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-colors group"
        >
          <History className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
          <span>Interview History</span>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group text-left"
        >
          <LogOut className="w-4 h-4 text-red-500/50 group-hover:text-red-400 transition-colors" />
          <span>Log out</span>
        </button>
      </div>
    </Dropdown>
  );
};

export default UserMenu;
