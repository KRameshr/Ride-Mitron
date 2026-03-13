import { useState, useEffect } from 'react';
import { adminAPI } from '../api/apiRoutes';
import Loader from '../components/Loader';
import { 
    Settings, Users, ArrowUpRight, Shield, FuelIcon, Activity, 
    TrendingUp, MapPin, CreditCard, ShieldAlert, CheckCircle2, 
    XCircle, Clock, Search, Filter, Download
} from 'lucide-react';

export default function AdminPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Local state for forms
    const [pricingForm, setPricingForm] = useState({
        driverMinFee: 0,
        riderMinFee: 0,
        driverPercentage: 0,
        riderPercentage: 0,
        petrolPrice: 0,
        dieselPrice: 0
    });
    const [blockPhone, setBlockPhone] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await adminAPI.getStats();
            setStats(statsRes.data);
            
            if (statsRes.data.currentConfig) {
                setPricingForm({
                    driverMinFee: statsRes.data.currentConfig.driverMinFee || 10,
                    riderMinFee: statsRes.data.currentConfig.riderMinFee || 15,
                    driverPercentage: statsRes.data.currentConfig.driverPercentage || 5,
                    riderPercentage: statsRes.data.currentConfig.riderPercentage || 10,
                    petrolPrice: statsRes.data.currentConfig.petrolPricePerLitre || 100,
                    dieselPrice: statsRes.data.currentConfig.dieselPricePerLitre || 90
                });
            }
        } catch (error) {
            console.error("Admin fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await adminAPI.updateConfig({
                driverMinFee: Number(pricingForm.driverMinFee),
                riderMinFee: Number(pricingForm.riderMinFee),
                driverPercentage: Number(pricingForm.driverPercentage),
                riderPercentage: Number(pricingForm.riderPercentage),
                petrolPricePerLitre: Number(pricingForm.petrolPrice),
                dieselPricePerLitre: Number(pricingForm.dieselPrice)
            });
            alert('Pricing Parameters Updated!');
            fetchData();
        } catch (err) {
            alert('Failed to update: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleBlockUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.blockUser({ phoneNumber: blockPhone });
            alert(`User status updated for ${blockPhone}`);
            setBlockPhone('');
            fetchData();
        } catch (err) {
            alert('Failed to update user: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:py-12 animate-fade-in relative z-10 mb-20">

            {/* Premium Header */}
            <div className="mb-10 p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full mb-6 text-indigo-300 font-bold uppercase tracking-[0.2em] text-[10px]">
                            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Command & Control Center
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                            Ride <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Mitron</span> OS
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-xl">Centralized node for network economics, platform safety, and ecosystem telemetry.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center min-w-[140px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">System Status</p>
                            <div className="flex items-center justify-center gap-2 text-emerald-400 font-black">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                                Operational
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <MetricCard 
                    title="Total Ecosystem Users" 
                    value={stats?.totalUsers || 0} 
                    icon={<Users className="w-6 h-6" />}
                    trend="+12%"
                    color="blue"
                />
                <MetricCard 
                    title="Live Network Rides" 
                    value={stats?.totalRides || 0} 
                    icon={<MapPin className="w-6 h-6" />}
                    trend="+5.4%"
                    color="indigo"
                />
                <MetricCard 
                    title="Total Interactions" 
                    value={stats?.totalBookings || 0} 
                    icon={<Activity className="w-6 h-6" />}
                    trend="+22%"
                    color="purple"
                />
                <MetricCard 
                    title="Net Platform Revenue" 
                    value={`₹${stats?.totalRevenue?.toFixed(2) || '0.00'}`} 
                    icon={<TrendingUp className="w-6 h-6" />}
                    trend="+8.1%"
                    color="emerald"
                />
            </div>

            <div className="grid lg:grid-cols-[1fr_450px] gap-10 mb-12">
                {/* Users Management Section */}
                <div className="space-y-10">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Users className="text-primary-600" /> Recent Network Entities
                                </h2>
                                <p className="text-sm font-medium text-slate-500">Monitoring last 10 registered nodes.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                <Search className="w-4 h-4 text-slate-400 ml-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search nodes..." 
                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 w-40"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Member</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Phone Identifier</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Role</th>
                                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 text-right">Verification</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats?.recentUsers?.map((user) => (
                                        <tr key={user._id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="py-5 px- group-hover:px-2 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 border border-slate-200">
                                                        {user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-extrabold text-slate-900">{user.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-500 capitalize">{user.status || 'Active'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-2 text-sm font-bold text-slate-600">
                                                {user.phoneNumber}
                                            </td>
                                            <td className="py-5 px-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                                    user.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-5 px-2 text-right">
                                                {user.isVerified ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 inline" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-slate-300 inline" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]"></div>
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                    <MapPin className="text-primary-400" /> Recent Network Dispatches
                                </h2>
                                <p className="text-sm font-medium text-slate-400">Real-time ride activity across the grid.</p>
                            </div>
                            <button className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl transition-all border border-white/10">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {stats?.recentRides?.map((ride) => (
                                <div key={ride._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.08] transition-all group">
                                    <div className="flex items-center gap-6 w-full">
                                        <div className="hidden sm:flex flex-col items-center gap-1">
                                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                            <div className="w-0.5 h-6 bg-white/10"></div>
                                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white truncate">{ride.origin.name}</p>
                                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{ride.distanceKm} KM · {ride.vehicleType}</p>
                                            <p className="text-sm font-black text-indigo-400 mt-1 truncate">{ride.destination.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-10 w-full sm:w-auto">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</p>
                                            <p className="text-lg font-black text-white leading-none mt-1">₹{(ride.driverPlatformFee + ride.riderPlatformFee)?.toFixed(2)}</p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                                        <div className="flex -space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-600 border-4 border-slate-900 flex items-center justify-center font-black text-white shadow-lg">
                                                {ride.driver?.name?.[0]}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column Controls */}
                <div className="space-y-10">
                    {/* Economy Config Panel */}
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-2xl relative">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <TrendingUp className="text-primary-600" /> Platform Economics
                                </h2>
                                <p className="text-sm font-medium text-slate-500">Master controls for network pricing.</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <CreditCard className="w-6 h-6 text-slate-400" />
                            </div>
                        </div>

                        <form onSubmit={handleUpdateConfig} className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Petrol ₹/L</label>
                                    <div className="relative">
                                        <FuelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                        <input 
                                            type="number" 
                                            value={pricingForm.petrolPrice} 
                                            onChange={(e) => setPricingForm({...pricingForm, petrolPrice: e.target.value})}
                                            className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-slate-900 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Diesel ₹/L</label>
                                    <div className="relative">
                                        <FuelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                        <input 
                                            type="number" 
                                            value={pricingForm.dieselPrice} 
                                            onChange={(e) => setPricingForm({...pricingForm, dieselPrice: e.target.value})}
                                            className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-slate-900 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Driver Min Fee (₹)</label>
                                        <input type="number" value={pricingForm.driverMinFee} onChange={(e) => setPricingForm({...pricingForm, driverMinFee: e.target.value})} className="w-full bg-white border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Platform Cut (%)</label>
                                        <input type="number" value={pricingForm.driverPercentage} onChange={(e) => setPricingForm({...pricingForm, driverPercentage: e.target.value})} className="w-full bg-white border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-900" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Rider Min Fee (₹)</label>
                                        <input type="number" value={pricingForm.riderMinFee} onChange={(e) => setPricingForm({...pricingForm, riderMinFee: e.target.value})} className="w-full bg-white border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Rider Platform Share (%)</label>
                                        <input type="number" value={pricingForm.riderPercentage} onChange={(e) => setPricingForm({...pricingForm, riderPercentage: e.target.value})} className="w-full bg-white border-slate-200 rounded-xl p-2 text-sm font-bold text-slate-900" />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={updating}
                                className="w-full py-5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                {updating ? <Clock className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                                {updating ? 'DEPLOYING PARAMS...' : 'PROPAGATE ECONOMY UPDATE'}
                            </button>
                        </form>
                    </div>

                    {/* Security Protocol Panel */}
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-red-50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl group-hover:bg-red-100 transition-colors"></div>
                        
                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <ShieldAlert className="text-red-500" /> Security Protocol
                                </h2>
                                <p className="text-sm font-medium text-slate-500">Toggle account network access.</p>
                            </div>
                        </div>

                        <form onSubmit={handleBlockUser} className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Phone Identifier</label>
                                <input 
                                    type="tel" 
                                    placeholder="Enter full phone number"
                                    value={blockPhone}
                                    onChange={(e) => setBlockPhone(e.target.value)}
                                    className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 px-6 text-xl font-black text-slate-900 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full py-5 bg-slate-900 hover:bg-red-600 text-white font-black rounded-2xl shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                            >
                                <ShieldAlert className="w-5 h-5" />
                                EXECUTE STATUS TOGGLE
                            </button>
                        </form>
                    </div>

                    {/* Placeholder for Phase 2 */}
                    <div className="bg-linear-to-br from-slate-100 to-slate-200 p-8 rounded-[2rem] border border-slate-300 border-dashed text-center">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 opacity-50">Future Expansion Node</p>
                        <p className="text-sm font-bold text-slate-400">Audit logs and dispute resolution module are scheduled for Phase 2 deployment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, trend, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-2.5 h-2.5" /> {trend}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">v.1.0.4</p>
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
        </div>
    );
}
