import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/apiRoutes';
import { useNavigate } from 'react-router-dom';
import { Navigation, ShieldCheck, Banknote, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await authAPI.requestOTP({ phoneNumber: phone });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.verifyOTP({ phoneNumber: phone, otp });
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 min-h-screen flex w-full flex-col lg:flex-row bg-[#020617] overflow-hidden selection:bg-primary-500/30">
            
            {/* Stunning Left Section */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden items-center justify-center p-20">
                {/* Advanced Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-600/30 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl animate-fade-in">
                    <div className="flex items-center gap-5 mb-12">
                        <div className="bg-white/5 p-5 rounded-[2rem] backdrop-blur-3xl border border-white/10 shadow-2xl hover:scale-110 transition-all cursor-pointer group shine-effect">
                            <Navigation className="w-10 h-10 text-primary-400 transform rotate-45 group-hover:rotate-[225deg] transition-transform duration-700" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter">Ride <span className="text-primary-400">Mitron</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Smart Commuting Engine</p>
                        </div>
                    </div>

                    <h2 className="text-7xl font-black text-white leading-[0.9] mb-10 tracking-tighter">
                        Move Smarter.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 animate-gradient-x">
                            Save Together.
                        </span>
                    </h2>

                    <p className="text-xl text-slate-400 mb-16 leading-relaxed font-medium max-w-lg">
                        The evolution of carpooling. Built for the modern commuter who values sustainability, cost-efficiency, and community.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <FeatureItem 
                            icon={<ShieldCheck className="w-6 h-6" />}
                            title="Trusted Nodes"
                            desc="Every member verified via OTP"
                        />
                        <FeatureItem 
                            icon={<Banknote className="w-6 h-6" />}
                            title="True Sharing"
                            desc="Zero platform-driven markups"
                        />
                        <FeatureItem 
                            icon={<Sparkles className="w-6 h-6" />}
                            title="AI Matching"
                            desc="Optimized route algorithms"
                        />
                        <FeatureItem 
                            icon={<Loader2 className="w-6 h-6" />}
                            title="Live Tracking"
                            desc="Real-time coordinate stream"
                        />
                    </div>
                </div>
            </div>

            {/* Premium Right Login Section */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl lg:hidden"></div>
                
                <div className="w-full max-w-md animate-slide-up relative">
                    <div className="auth-card shine-effect">
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full mb-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <Loader2 className="w-3 h-3 animate-spin" /> Secure Auth Protocol
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Enter the Grid</h2>
                            <p className="text-slate-500 font-bold">Authentication required to synchronize nodes.</p>
                        </div>

                        {error && (
                            <div className="mb-8 animate-fade-in flex items-center gap-3 text-sm font-bold text-red-600 bg-red-50 p-5 rounded-2xl border-2 border-red-100">
                                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleRequestOTP} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Cellular Identifier</label>
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-6 flex items-center text-slate-400 font-black text-xl group-focus-within:text-primary-600 transition-colors">+91</span>
                                        <input
                                            type="tel"
                                            className="input-field pl-[4.5rem] tracking-widest text-xl"
                                            placeholder="000 000 0000"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary group" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            INITIALIZING...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-3">
                                            CONTINUE WITH OTP
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-8 animate-fade-in">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Security Verification Token
                                    </label>
                                    <p className="text-[10px] font-bold text-slate-400 mb-2 ml-1">Sent to <span className="text-slate-900">+91 {phone}</span></p>
                                    <input
                                        type="text"
                                        className="input-field text-center tracking-[0.8em] text-4xl font-black py-8 bg-slate-50/50"
                                        placeholder="------"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary group" disabled={loading}>
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            VALIDATING...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-3">
                                            VERIFY & SYNC
                                            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </span>
                                    )}
                                </button>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        className="text-xs font-black text-slate-400 hover:text-primary-600 transition-all uppercase tracking-widest hover:tracking-[0.2em]"
                                        onClick={() => {
                                            setStep(1);
                                            setOtp('');
                                        }}>
                                        Change Identifier
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <p className="text-center text-[10px] text-slate-500 mt-12 font-black uppercase tracking-[0.2em] relative z-10 w-full">
                        By entering, you accept the <span className="text-slate-400 hover:text-primary-400 cursor-pointer transition-colors border-b border-slate-700 pb-0.5">Network Protocols</span>
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
