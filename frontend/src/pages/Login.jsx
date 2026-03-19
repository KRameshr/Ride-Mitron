import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/apiRoutes';
import { useNavigate } from 'react-router-dom';
import { Navigation, ShieldCheck, Banknote, ArrowRight, Loader2, Sparkles, User, Mail, Phone, Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Signup States
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState({});

    // Login States
    const [loginData, setLoginData] = useState({
        identifier: '',
        password: ''
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const validateSignup = () => {
        const errors = {};
        if (!signupData.name) errors.name = 'This field is required.';
        if (!signupData.email) errors.email = 'This field is required.';
        if (!signupData.phone) {
            errors.phone = 'This field is required.';
        } else if (!/^\d{10}$/.test(signupData.phone)) {
            errors.phone = 'Please enter a valid 10-digit mobile number.';
        }
        if (!signupData.password) errors.password = 'This field is required.';
        if (!signupData.confirmPassword) {
            errors.confirmPassword = 'This field is required.';
        } else if (signupData.password !== signupData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validateSignup()) return;

        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.signup({
                name: signupData.name,
                email: signupData.email,
                phoneNumber: signupData.phone,
                password: signupData.password,
                confirmPassword: signupData.confirmPassword
            });
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.login({
                identifier: loginData.identifier,
                password: loginData.password
            });
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 min-h-screen flex w-full flex-col lg:flex-row bg-[#020617] overflow-y-auto selection:bg-primary-500/30">
            
            {/* Stunning Left Section */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden items-center justify-center p-20">
                {/* Advanced Animated Background with Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/hero-bg.jpg" 
                        alt="Ride Mitron Hero" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] opacity-80"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl animate-fade-in">
                    <div className="flex items-center gap-5 mb-12">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full group-hover:bg-primary-500/40 transition-all"></div>
                            <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-[1.5rem] relative z-10 border border-white/10 shadow-2xl transition-transform group-hover:scale-110" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter">Ride <span className="text-primary-400">Mitron</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Connecting Commuters</p>
                        </div>
                    </div>

                    <h2 className="text-7xl font-black text-white leading-[0.9] mb-10 tracking-tighter">
                        Move Smarter.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-primary-400 to-indigo-400 animate-gradient-x">
                            Connect Faster.
                        </span>
                    </h2>

                    <p className="text-xl text-slate-400 mb-16 leading-relaxed font-medium max-w-lg">
                        Ride Mitron is your smart gateway to urban mobility. Share journeys, split costs, and build a greener world together.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <FeatureItem 
                            icon={<Sparkles className="w-6 h-6" />}
                            title="Save Travel Cost"
                            desc="Share rides and reduce daily transportation expenses."
                        />
                        <FeatureItem 
                            icon={<Navigation className="w-6 h-6" />}
                            title="Smart Ride Matching"
                            desc="Find drivers and riders going in the same direction."
                        />
                        <FeatureItem 
                            icon={<ShieldCheck className="w-6 h-6" />}
                            title="Safe Community"
                            desc="Verified users for safer ride sharing journeys."
                        />
                        <FeatureItem 
                            icon={<Zap className="w-6 h-6" />}
                            title="Eco Friendly"
                            desc="Reduce traffic and pollution by sharing rides."
                        />
                    </div>
                </div>
            </div>

            {/* Premium Right Login/Signup Section */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 relative z-10 overflow-y-auto">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl lg:hidden"></div>
                
                <div className="w-full max-w-md animate-slide-up relative py-8 sm:py-12">
                    <div className="bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-12 rounded-[2.5rem] border border-white/10 w-full relative shine-effect">
                        <div className="mb-10 text-center">
                            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full mb-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <ShieldCheck className="w-3 h-3 text-primary-500" /> {isSignup ? 'Node Registry' : 'Identity Verification'}
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
                                {isSignup ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="text-slate-500 font-bold text-sm">
                                {isSignup ? 'Initialize your profile on the Mitron Grid.' : 'Synchronize your session to continue.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 animate-fade-in flex items-center gap-3 text-xs font-bold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {isSignup ? (
                            <form onSubmit={handleSignup} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className={`input-field pl-12 ${formErrors.name ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                                placeholder="Enter full name"
                                                value={signupData.name}
                                                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                                            />
                                        </div>
                                        {formErrors.name && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Identifier</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                className={`input-field pl-12 ${formErrors.email ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                                placeholder="name@example.com"
                                                value={signupData.email}
                                                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                                            />
                                        </div>
                                        {formErrors.email && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{formErrors.email}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                className={`input-field pl-12 ${formErrors.phone ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                                placeholder="10-digit number"
                                                value={signupData.phone}
                                                onChange={(e) => setSignupData({...signupData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                                            />
                                        </div>
                                        {formErrors.phone && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{formErrors.phone}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Key (Password)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`input-field pl-12 pr-12 ${formErrors.password ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                                placeholder="Min 6 characters"
                                                value={signupData.password}
                                                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {formErrors.password && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{formErrors.password}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Security Key</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={`input-field pl-12 pr-12 ${formErrors.confirmPassword ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                                                placeholder="Repeat password"
                                                value={signupData.confirmPassword}
                                                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                                            />
                                        </div>
                                        {formErrors.confirmPassword && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{formErrors.confirmPassword}</p>}
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn-primary group !py-5 disabled:opacity-30 disabled:cursor-not-allowed" 
                                    disabled={loading || !signupData.name || !signupData.email || !signupData.phone || !signupData.password || !signupData.confirmPassword}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                        <span className="flex items-center justify-center gap-3">
                                            SIGN UP <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email or Phone Identifier</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className="input-field pl-12"
                                                placeholder="Enter identifier"
                                                value={loginData.identifier}
                                                onChange={(e) => setLoginData({...loginData, identifier: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Security Key</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="input-field pl-12 pr-12"
                                                placeholder="Enter password"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary group !py-5" disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                        <span className="flex items-center justify-center gap-3">
                                            SIGN IN <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm font-bold text-slate-500">
                                {isSignup ? 'Already registered on the grid?' : 'New to Ride Mitron?'}
                            </p>
                            <button 
                                onClick={() => {
                                    setIsSignup(!isSignup);
                                    setError('');
                                }}
                                className="mt-2 text-primary-600 font-black uppercase tracking-[0.2em] text-[10px] hover:text-primary-700 hover:tracking-[0.3em] transition-all"
                            >
                                {isSignup ? 'Access Existing Identity' : 'SIGN UP'}
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-[9px] text-slate-500 mt-10 font-black uppercase tracking-[0.2em]">
                        Authenticated access secures your trajectory on the network.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }) {
    return (
        <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group hover:scale-[1.02]">
            <div className="bg-primary-500/20 p-3 rounded-2xl text-primary-400 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="font-black text-white text-sm tracking-tight mb-1">{title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-tight">{desc}</p>
            </div>
        </div>
    );
}
