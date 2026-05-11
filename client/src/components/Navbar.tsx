import { useSelector } from "react-redux"
import type { RootState } from "../redux/store";
import { Link } from "react-router-dom";
import UserMenu from "./ui/UserMenu";
import CreditsMenu from "./ui/CreditsMenu";

const Navbar = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <nav className="flex justify-between items-center w-full px-8 py-4 bg-[#0a0a0a]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
            {/* Left side: Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform duration-300">
                    <span className="text-xl font-bold italic text-white">E</span>
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Evelify
                </span>
            </Link>

            {/* Right side: Actions */}
            <div className="flex items-center gap-6">
                {isAuthenticated && user ? (
                    <>
                        {/* Credits Dropdown */}
                        <CreditsMenu />

                        {/* Profile UserMenu */}
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-gray-500 font-medium leading-none mb-1">Welcome back,</p>
                                <p className="text-sm font-semibold text-white leading-none">{user.name.split(' ')[0]}</p>
                            </div>
                            <UserMenu />
                        </div>
                    </>
                ) : (
                    <Link 
                        to="/auth" 
                        className="bg-white text-black px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;