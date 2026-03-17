import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Navigation, LogOut, User, Activity, Zap, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 50) {
            setIsVisible(true);
        } else {
            setIsVisible(currentScrollY < lastScrollY);
        }
        
        setLastScrollY(currentScrollY);
        if (currentScrollY > lastScrollY) setIsMobileMenuOpen(false);
    }, [lastScrollY]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const navLinkClass = (path) => `
        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500
        ${location.pathname === path 
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `;

    return (
        <header className={`fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-[95%] max-w-7xl transition-all duration-700 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'}`}>
            <nav className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 rounded-2xl sm:rounded-[2.5rem] p-2 sm:p-3 px-4 sm:px-6 shadow-2xl flex items-center justify-between relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary-500/10 blur-[50px] rounded-full"></div>

                {/* Logo Section */}
                <Link to="/dashboard" className="flex items-center gap-3 sm:gap-4 group relative z-10 no-underline">
                    <img 
                        src="/logo.png" 
                        alt="Ride Mitron Logo" 
                        className="w-9 h-9 sm:w-11 sm:h-11 object-contain group-hover:scale-110 transition-transform flex-shrink-0 drop-shadow-lg" 
                    />
                    <span className="text-lg sm:text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                        Ride <span className="text-primary-400">Mitron</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 sm:gap-3 relative z-10">
                    <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                        <Home className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Home</span>
                    </Link>
                    <Link to="/search-ride" className={navLinkClass('/search-ride')}>
                        <Search className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Search</span>
                    </Link>
                    <Link to="/post-ride" className={navLinkClass('/post-ride')}>
                        <Navigation className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Post</span>
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4 relative z-10">
                    {user && (
                        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[9px] font-black text-white uppercase tracking-widest truncate max-w-[80px] lg:max-w-none">{user.name}</span>
                        </div>
                    )}
                    
                    <button 
                        onClick={logout}
                        className="hidden sm:flex p-2 sm:p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg sm:rounded-xl transition-all duration-500"
                    >
                        <LogOut className="w-4 h-4 sm:w-5 h-5" />
                    </button>

                    {/* Mobile Menu Trigger */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg sm:rounded-xl md:hidden transition-all"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu Drawer Overlay */}
                <div 
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-opacity duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                {/* Mobile Menu Sidebar */}
                <div className={`fixed top-0 right-0 h-screen w-[280px] bg-slate-900/95 backdrop-blur-2xl border-l border-white/5 z-[200] transition-transform duration-500 ease-in-out md:hidden flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <span className="text-sm font-black text-white uppercase tracking-widest">Navigation</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col p-6 gap-2">
                        {user && (
                            <div className="mb-6 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-black">
                                    {user.name?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">{user.name}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Verified User</p>
                                </div>
                            </div>
                        )}

                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass('/dashboard')}>
                            <Home className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/dashboard?view=history" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass('/my-rides')}>
                            <Activity className="w-4 h-4" /> My Rides
                        </Link>
                        <Link to="/dashboard?edit=true" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass('/profile')}>
                            <User className="w-4 h-4" /> My Profile
                        </Link>
                        <div className="h-px bg-white/5 my-4"></div>
                        <button 
                            onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3.5 text-red-500 font-black text-[11px] uppercase tracking-[0.2em] bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Logout Account
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
