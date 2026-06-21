import { useState } from "react";
import { useSelector } from "react-redux"
import type { RootState } from "../redux/store";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import UserMenu from "./ui/UserMenu";
import CreditsMenu from "./ui/CreditsMenu";
import ThemeToggle from "./ui/ThemeToggle";

const Navbar = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <>
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed top-0 left-0 right-0 z-50 dark:bg-[#0B1120]/70 light:bg-white/70 backdrop-blur-xl dark:border-white/5 light:border-gray-200"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">
                        <Link to="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"
                            >
                                <span className="text-lg sm:text-xl font-bold italic text-white">E</span>
                            </motion.div>
                            <span className="text-xl sm:text-2xl font-bold tracking-tight dark:text-white light:text-gray-900">
                                Evelify
                            </span>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
                            <div className="hidden lg:block">
                                <ThemeToggle />
                            </div>
                            
                            {isAuthenticated && user ? (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="hidden md:block"
                                    >
                                        <CreditsMenu />
                                    </motion.div>

                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="hidden md:flex items-center gap-2 sm:gap-3.5 pl-3 sm:pl-4 dark:border-white/10 light:border-gray-200"
                                    >
                                        <div className="text-right hidden lg:block">
                                            <p className="text-[10px] dark:text-gray-500 light:text-gray-400 font-bold uppercase tracking-wider mb-0.5">Welcome</p>
                                            <p className="text-sm font-semibold dark:text-white light:text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                                        </div>
                                        <UserMenu />
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="hidden md:block"
                                >
                                    <Link 
                                        to="/auth" 
                                        className="inline-flex items-center justify-center px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl dark:bg-white light:bg-gray-900 dark:text-[#0B1120] light:text-white font-semibold text-sm hover:dark:bg-gray-100 hover:light:bg-gray-800 transition-all shadow-sm"
                                    >
                                        Get Started
                                    </Link>
                                </motion.div>
                            )}

                            <button 
                                onClick={toggleMobileMenu}
                                className="lg:hidden p-2 rounded-lg dark:text-white light:text-gray-900 hover:dark:bg-white/10 hover:light:bg-gray-100 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 left-0 right-0 z-40 lg:hidden dark:bg-[#0B1120] light:bg-white border-b dark:border-white/10 light:border-gray-200 shadow-xl"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                            <div className="flex justify-center">
                                <ThemeToggle />
                            </div>
                            
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center justify-between py-2 border-t dark:border-white/10 light:border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-800 dark:to-gray-900 light:from-gray-200 light:to-gray-300 border dark:border-white/10 light:border-gray-200 flex items-center justify-center text-sm font-bold dark:text-blue-400 light:text-blue-600">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold dark:text-white light:text-gray-900">{user.name.split(' ')[0]}</p>
                                                <p className="text-xs dark:text-gray-500 light:text-gray-400">Welcome back</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Link 
                                        to="/interview"
                                        className="block w-full text-center py-3 rounded-xl dark:bg-blue-600 light:bg-blue-600 text-white font-semibold"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Start Interview
                                    </Link>
                                    <Link 
                                        to="/history"
                                        className="block w-full text-center py-3 rounded-xl dark:bg-white/5 light:bg-gray-100 dark:text-white light:text-gray-900 font-medium border dark:border-white/10 light:border-gray-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        View History
                                    </Link>
                                    <Link 
                                        to="/aptitude"
                                        className="block w-full text-center py-3 rounded-xl dark:bg-white/5 light:bg-gray-100 dark:text-white light:text-gray-900 font-medium border dark:border-white/10 light:border-gray-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Aptitude Test
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-center py-3 rounded-xl dark:text-red-400 light:text-red-500 font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link 
                                    to="/auth" 
                                    className="block w-full text-center py-3 rounded-xl dark:bg-white light:bg-gray-900 dark:text-[#0B1120] light:text-white font-semibold"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;