import { useState } from 'react';
import { rideAPI } from '../api/apiRoutes';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Calendar, Users, ShieldAlert, CheckCircle, Car, Globe, ArrowRight } from 'lucide-react';

export default function PostRide() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        originName: '',
        destName: '',
        startTime: '',
        totalSeats: 1
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await rideAPI.createRide({
                origin: { coordinates: [null, null], name: formData.originName },
                destination: { coordinates: [null, null], name: formData.destName },
                startTime: formData.startTime,
                totalSeats: Number(formData.totalSeats)
            });
            alert("Ride Posted Successfully! Fare calculated.");
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to post ride');
            setLoading(false);
        }
    };

    if (!user?.vehicleDetails?.hasVehicle) {
        return (
            <div className="flex justify-center items-center min-h-[70vh] px-4 animate-fade-in">
                <div className="glass-panel p-12 max-w-lg w-full text-center relative overflow-hidden shine-effect">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-[100px] -mr-24 -mt-24"></div>
                    
                    <div className="bg-red-50 w-24 h-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center border border-red-100 shadow-xl shadow-red-500/5">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Network Access Denied</h2>
                    <p className="text-slate-500 font-bold mb-10 text-sm leading-relaxed">
                        To broadcast a journey signal, your node must be associated with a registered vehicle asset. 
                        Please update your identity profile to proceed with the synchronization.
                    </p>

                    <button onClick={() => navigate('/dashboard')} className="btn-primary w-full tracking-[0.2em] uppercase text-xs py-5">Initialize Profile Update</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 lg:py-20 animate-slide-up relative z-10 px-4">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-full mb-8 text-emerald-700 font-black uppercase tracking-[0.2em] text-[10px] shadow-sm border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" /> Node Identity Confirmed
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                    Dispatch <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600">Journey Signal</span>
                </h1>
                <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
                    Split the energy cost of your {user.vehicleDetails.vehicleType} by inviting verified peers to coordinate on your route path.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel !p-2 sm:!p-3 border-none bg-transparent shadow-none">
                <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Route Configuration */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="glass-panel bg-white/60 p-8 sm:p-10 border-white/40">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-10">
                                <Globe className="w-4 h-4 text-primary-500 animate-spin-slow" /> Geolocation Vectors
                            </h3>
                            
                            <div className="space-y-10">
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500 group-focus-within:scale-110 transition-transform">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <input 
                                        name="originName" 
                                        value={formData.originName} 
                                        onChange={handleChange} 
                                        className="input-field pl-16 py-6 text-lg tracking-tight placeholder:font-bold" 
                                        placeholder="Starting Vector Name (Point A)" 
                                        required 
                                    />
                                    <div className="absolute -left-3 top-[calc(100%+12px)] w-0.5 h-10 bg-slate-200 ml-6 rounded-full opacity-50"></div>
                                </div>

                                <div className="relative group pt-2">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:scale-110 transition-transform">
                                        <Navigation className="w-6 h-6 transform rotate-45" />
                                    </div>
                                    <input 
                                        name="destName" 
                                        value={formData.destName} 
                                        onChange={handleChange} 
                                        className="input-field pl-16 py-6 text-lg tracking-tight placeholder:font-bold" 
                                        placeholder="Target Destination Vector (Point B)" 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Parameters */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-panel bg-[#020617] p-8 sm:p-10 text-white border-white/10 h-full flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                            
                            <div className="space-y-10 relative z-10">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-indigo-400" /> Time Synchronization
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Departure Sequence</label>
                                        <input 
                                            type="datetime-local" 
                                            name="startTime" 
                                            value={formData.startTime} 
                                            onChange={handleChange} 
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer" 
                                            required 
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payload Capacity (Seats)</label>
                                        <div className="relative">
                                            <select 
                                                name="totalSeats" 
                                                value={formData.totalSeats} 
                                                onChange={handleChange} 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer appearance-none"
                                            >
                                                {[1, 2, 3, 4, 5, 6].map(num => (
                                                    <option key={num} value={num} className="bg-slate-900 text-white">{num} PEER UNITS</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                <Users className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-6 px-4 rounded-[2rem] shadow-2xl shadow-primary-600/30 active:scale-95 transition-all mt-10 relative z-10 shine-effect flex items-center justify-center gap-4 uppercase tracking-widest text-xs"
                            >
                                {loading ? (
                                    <Globe className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Broadcast Signal
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-16 px-6 leading-loose">
                Coordinates are encrypted via Google Maps Protocol. Fare mitigation logic is peer-to-peer calibrated based on real-time energy prices.
            </p>
        </div>
    );
}
