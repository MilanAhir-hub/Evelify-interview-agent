import React from 'react';
import { Coins, PlusCircle } from 'lucide-react';
import Dropdown from './Dropdown';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import PricingModal from './PricingModal';

const CreditsMenu = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isPricingOpen, setIsPricingOpen] = React.useState(false);

  const trigger = (
    <div className="flex items-center gap-2 dark:bg-white/5 light:bg-gray-100 bg-white/5 px-4 py-2 rounded-full border dark:border-white/10 light:border-gray-200 border-white/10 hover:dark:bg-white/10 hover:light:bg-gray-200/80 transition-colors">
      <Coins className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-medium dark:text-gray-200 light:text-gray-800 text-gray-200">
        {user?.credits} <span className="dark:text-gray-500 light:text-gray-400 text-gray-500 font-light ml-0.5">Credits</span>
      </span>
    </div>
  );

  return (
    <>
    <Dropdown trigger={trigger}>
      <div className="p-5 text-center">
        <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/20">
          <Coins className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-sm font-semibold dark:text-white light:text-gray-900 text-white mb-1">Low on Credits?</p>
        <p className="text-xs dark:text-gray-400 light:text-gray-600 text-gray-400 mb-4 leading-relaxed">
          Need more credits to continue your interview journey?
        </p>
        <button 
          onClick={() => setIsPricingOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold py-2.5 px-4 rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 transition-all active:scale-[0.98]">
          <PlusCircle className="w-4 h-4" />
          <span>Buy more credits</span>
        </button>
      </div>
    </Dropdown>
    <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
};

export default CreditsMenu;
