import { useState } from 'react';
import { rideAPI, authAPI } from '../api/apiRoutes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Users, ShieldAlert, CheckCircle, Car, Globe, ArrowRight, Zap, Info, Clock } from 'lucide-react';

export default function PostRide() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const getNowFormatted = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
        originName: '',
        destName: '',
        startTime: getNowFormatted(),
        totalSeats: 1,
        manualDistance: ''
    });

    const [isTimeApplied, setIsTimeApplied] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'startTime') setIsTimeApplied(false);
    };

    const handleApplyTime = (e) => {
        e.preventDefault();
        if (formData.startTime) {
            setIsTimeApplied(true);
        } else {
            alert("Please select a valid time first.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await rideAPI.createRide({
                origin: { coordinates: [null, null], name: formData.originName },
                destination: { coordinates: [null, null], name: formData.destName },
                startTime: formData.startTime,
                totalSeats: Number(formData.totalSeats),
                manualDistance: formData.manualDistance ? Number(formData.manualDistance) : undefined
            });
            alert("Ride Posted Successfully! Fare calculated.");
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to post ride');
            setLoading(false);
        }
    };

    const [showVehicleForm, setShowVehicleForm] = useState(!user?.vehicleDetails?.hasVehicle);
    const [vehicleData, setVehicleData] = useState({
        vehicleType: 'bike',
        fuelType: 'petrol',
        mileage: '',
        vehicleNumberPlate: ''
    });
    const { login } = useAuth();

    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        if (vehicleData.vehicleNumberPlate.length < 6) {
            alert("Number plate must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await authAPI.updateProfile({
                name: user.name,
                vehicleDetails: {
                    ...vehicleData,
                    mileage: Number(vehicleData.mileage),
                    hasVehicle: true
                }
            });
            login(data, localStorage.getItem('token'));
            setShowVehicleForm(false);
            alert("Vehicle registered! Dispatch your journey now.");
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update vehicle details');
        } finally {
            setLoading(false);
        }
    };

    if (showVehicleForm) {
        return (
            <div className="flex justify-center items-center min-h-[80vh] px-4 animate-fade-in relative z-20">
                <div className="glass-panel p-8 sm:p-12 max-w-2xl w-full relative overflow-hidden group border-primary-500/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    
                    <div className="flex items-center gap-6 mb-10">
                        <div className="bg-primary-50 w-20 h-20 rounded-[2rem] flex items-center justify-center border border-primary-100 shadow-xl shadow-primary-500/5">
                            <Car className="w-10 h-10 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Vehicle Asset Registration</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect your hardware to the Mitron grid</p>
                        </div>
                    </div>

                    <form onSubmit={handleVehicleSubmit} className="space-y-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Class</label>
                                <select 
                                    className="input-field !bg-slate-50 !text-slate-900 !border-slate-200"
                                    value={vehicleData.vehicleType}
                                    onChange={(e) => setVehicleData({...vehicleData, vehicleType: e.target.value})}
                                >
                                    <option value="bike">Motorcycle</option>
                                    <option value="car">Car / SUV</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Energy Matrix</label>
                                <select 
                                    className="input-field !bg-slate-50 !text-slate-900 !border-slate-200"
                                    value={vehicleData.fuelType}
                                    onChange={(e) => setVehicleData({...vehicleData, fuelType: e.target.value})}
                                >
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Consumption (KM/L)</label>
                                <input 
                                    type="number"
                                    step="0.1"
                                    required
                                    className="input-field !bg-slate-50 !text-slate-900 !border-slate-200"
                                    placeholder="Enter mileage"
                                    value={vehicleData.mileage}
                                    onChange={(e) => setVehicleData({...vehicleData, mileage: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Node Identifier (Number Plate)</label>
                                <input 
                                    type="text"
                                    required
                                    className="input-field !bg-slate-50 !text-slate-900 !border-slate-200"
                                    placeholder="e.g., AP09AB1234"
                                    value={vehicleData.vehicleNumberPlate}
                                    onChange={(e) => setVehicleData({...vehicleData, vehicleNumberPlate: e.target.value.toUpperCase()})}
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn-primary w-full tracking-[0.3em] uppercase text-xs py-6 shadow-primary-500/20"
                            >
                                {loading ? 'Synchronizing...' : 'Initialize Asset Link'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                Back to Control Center
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative min-h-screen pb-40">
             {/* Background Decor */}
             <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 left-0 w-[60rem] h-[60rem] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-primary-600/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="max-w-7xl mx-auto pt-16 lg:pt-24 px-6 relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16 px-2">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-md border border-white/60 px-5 py-2 rounded-full mb-8 text-emerald-600 font-black uppercase tracking-[0.3em] text-[9px] shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> Identity Core Verified
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-[-0.05em] mb-6 leading-none">
                            DISPATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 uppercase">JOURNEY</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-xl">
                            Synchronize your {user.vehicleDetails.vehicleType} class asset with the Mitron grid and optimize energy split flows.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                        
                        {/* Route Vectors */}
                        <div className="lg:col-span-8 space-y-10">
                            <div className="glass-panel !p-6 sm:!p-12 !rounded-[4rem] group hover:shadow-primary-600/5 transition-all">
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Trajectory Vectors</h3>
                                </div>
                                
                                <div className="space-y-12">
                                    <div className="relative group/input">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-500 scale-75 sm:scale-100 transition-transform group-focus-within/input:scale-110">
                                            <div className="p-3 sm:p-4 rounded-2xl bg-primary-50 border border-primary-100 shadow-sm"><MapPin className="w-5 h-5 sm:w-6 h-6" /></div>
                                        </div>
                                        <div className="w-full pl-16 sm:pl-24">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Origin Point</label>
                                            <input 
                                                name="originName" 
                                                value={formData.originName} 
                                                onChange={handleChange} 
                                                className="w-full bg-transparent border-b-2 border-slate-100 py-4 text-lg sm:text-2xl font-black text-slate-900 focus:outline-none focus:border-primary-500 transition-colors placeholder:text-slate-200" 
                                                placeholder="Enter Origin Location" 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group/input">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-indigo-500 scale-75 sm:scale-100 transition-transform group-focus-within/input:scale-110">
                                            <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm"><Navigation className="w-5 h-5 sm:w-6 h-6 transform rotate-45" /></div>
                                        </div>
                                        <div className="w-full pl-16 sm:pl-24">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Target Convergence</label>
                                            <input 
                                                name="destName" 
                                                value={formData.destName} 
                                                onChange={handleChange} 
                                                className="w-full bg-transparent border-b-2 border-slate-100 py-4 text-lg sm:text-2xl font-black text-slate-900 focus:outline-none focus:border-primary-500 transition-colors placeholder:text-slate-200" 
                                                placeholder="Enter Destination Location" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg"><Car className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Locked Asset</p>
                                        <p className="font-black text-slate-900 uppercase">
                                            {user.vehicleDetails.vehicleNumberPlate || user.vehicleDetails.vehicleType} · {user.vehicleDetails.fuelType}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm flex flex-col gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg"><Zap className="w-6 h-6" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Manual Override</p>
                                            <input 
                                                type="number" 
                                                name="manualDistance" 
                                                value={formData.manualDistance || ''} 
                                                onChange={handleChange} 
                                                placeholder="Manual KM (Optional)" 
                                                className="w-full bg-transparent border-b border-indigo-200 text-xs font-black text-slate-900 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-20">
                                        If Maps shows wrong distance, correction here.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Config Panel */}
                        <div className="lg:col-span-4 space-y-10">
                            <div className="bg-[#020617] rounded-[4rem] p-10 sm:p-12 text-white shadow-3xl relative overflow-hidden flex flex-col justify-between group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]"></div>
                                
                                <div className="space-y-12 relative z-10">
                                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Sync Parameters</h3>
                                    
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Time Synchronicity</label>
                                                {isTimeApplied && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 animate-fade-in"><CheckCircle className="w-2.5 h-2.5" /> SECURELY LOCKED</span>}
                                            </div>
                                            <div className="relative group">
                                                <input 
                                                    type="datetime-local" 
                                                    name="startTime" 
                                                    value={formData.startTime} 
                                                    onChange={handleChange} 
                                                    className={`w-full bg-white/5 border rounded-[2rem] px-8 py-5 text-sm font-black text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer ${isTimeApplied ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`} 
                                                    required 
                                                />
                                                <Clock className={`absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${isTimeApplied ? 'text-emerald-500' : 'text-slate-500'}`} />
                                            </div>
                                            {!isTimeApplied && (
                                                <button 
                                                    onClick={handleApplyTime}
                                                    className="w-full py-3 bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 border border-primary-600/30 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Apply Synchronicity
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Payload Units (Seats)</label>
                                            <div className="relative group/select">
                                                <select 
                                                    name="totalSeats" 
                                                    value={formData.totalSeats} 
                                                    onChange={handleChange} 
                                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-sm font-black text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer appearance-none group-hover/select:bg-white/10"
                                                >
                                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                                        <option key={num} value={num} className="bg-slate-900 text-white uppercase">{num} PEER UNITS</option>
                                                    ))}
                                                </select>
                                                <Users className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 pointer-events-none group-hover/select:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 space-y-6 relative z-10">
                                    <button 
                                        type="submit" 
                                        disabled={loading || !isTimeApplied} 
                                        className={`btn-primary !py-8 !rounded-[2.5rem] relative overflow-hidden group/btn !w-full ${!isTimeApplied ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        {loading ? (
                                            <Globe className="w-6 h-6 animate-spin mx-auto text-white" />
                                        ) : (
                                            <div className="flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.3em]">
                                                DISPATCH SIGNAL <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer pointer-events-none"></div>
                                    </button>
                                    
                                    <div className="bg-white/5 p-6 rounded-3xl flex gap-4">
                                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                        <p className="text-[8px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                                            Signal broadcast costs ₹0. Final fare split is calculated upon successful peer convergence.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 text-center opacity-40">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.5em] leading-loose">
                                    All telemetry is encrypted. Node violations subject to trust score penalties.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
