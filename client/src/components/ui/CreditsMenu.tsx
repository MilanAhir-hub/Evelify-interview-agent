import React from 'react';
import { Coins, PlusCircle } from 'lucide-react';
import Dropdown from './Dropdown';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const CreditsMenu = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const trigger = (
    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-medium text-gray-200">
        {user?.credits} <span className="text-gray-500 font-light ml-0.5">Credits</span>
      </span>
    </div>
  );

  return (
    <Dropdown trigger={trigger}>
      <div className="p-5 text-center">
        <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/20">
          <Coins className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">Low on Credits?</p>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Need more credits to continue your interview journey?
        </p>
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold py-2.5 px-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 transition-all active:scale-[0.98]">
          <PlusCircle className="w-4 h-4" />
          <span>Buy more credits</span>
        </button>
      </div>
    </Dropdown>
  );
};

export default CreditsMenu;
