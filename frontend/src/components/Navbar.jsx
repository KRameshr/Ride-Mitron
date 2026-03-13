import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, LogOut, User as UserIcon, PlusCircle, Search, Home, Shield } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navLinkClass = (path) => `text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all ${location.pathname === path
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`;

    return (
        <nav className="bg-white/80 backdrop-blur-3xl border-b border-slate-200 sticky top-0 z-[100] premium-shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center text-slate-900 font-black text-2xl tracking-tighter gap-3 group">
                            <div className="bg-primary-600 p-2.5 rounded-[1rem] text-white shadow-xl shadow-primary-600/30 group-hover:scale-110 group-hover:rotate-12 transition-all">
                                <Navigation className="h-6 w-6 transform rotate-45" />
                            </div>
                            <span className="hidden md:block">Ride <span className="text-primary-600">Mitron</span></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-3">
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" className={navLinkClass('/admin')}>
                                    <Shield className="w-3.5 h-3.5" /> Core Ops
                                </Link>
                            )}
                            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                                <Home className="w-3.5 h-3.5" /> Home
                            </Link>
                            <Link to="/search-ride" className={navLinkClass('/search-ride')}>
                                <Search className="w-3.5 h-3.5" /> Find Node
                            </Link>
                            <Link to="/post-ride" className={navLinkClass('/post-ride')}>
                                <PlusCircle className="w-3.5 h-3.5" /> Dispatch Ride
                            </Link>
                        </div>

                        {/* Mobile & Tablet quick icons */}
                        <div className="flex lg:hidden gap-1.5 mr-2">
                             {user.role === 'ADMIN' && (
                                <Link to="/admin" className="p-3 text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded-2xl"><Shield className="w-5 h-5" /></Link>
                            )}
                            <Link to="/dashboard" className="p-3 text-slate-600 hover:text-primary-600 bg-slate-50 rounded-2xl"><Home className="w-5 h-5" /></Link>
                            <Link to="/search-ride" className="p-3 text-slate-600 hover:text-primary-600 bg-slate-50 rounded-2xl"><Search className="w-5 h-5" /></Link>
                        </div>

                        <div className="h-10 w-px bg-slate-200 hidden lg:block mx-2"></div>

                        <div className="flex items-center gap-4 pl-4 border-l border-slate-100 lg:border-none">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-black text-slate-900 tracking-tight">{user.name}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">{user.role}</span>
                            </div>
                            <button 
                                onClick={handleLogout} 
                                className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 transition-all border border-slate-200 group"
                            >
                                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
