import { useSelector } from "react-redux"
import type { RootState } from "../redux/store";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserMenu from "./ui/UserMenu";
import CreditsMenu from "./ui/CreditsMenu";

const Navbar = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#0B1120]/70 backdrop-blur-xl border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"
                        >
                            <span className="text-xl font-bold italic text-white">E</span>
                        </motion.div>
                        <span className="text-2xl font-bold tracking-tight text-white">
                            Evelify
                        </span>
                    </Link>

                    <div className="flex items-center gap-4 md:gap-8">
                        {isAuthenticated && user ? (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <CreditsMenu />
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-3.5 pl-4 border-l border-white/10"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Welcome</p>
                                        <p className="text-sm font-semibold text-white leading-none">{user.name.split(' ')[0]}</p>
                                    </div>
                                    <UserMenu />
                                </motion.div>
                            </>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link 
                                    to="/auth" 
                                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white text-[#0B1120] font-semibold text-sm hover:bg-gray-100 transition-all shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;