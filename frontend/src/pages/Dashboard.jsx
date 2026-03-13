import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, paymentAPI } from '../api/apiRoutes';
import axiosConfig from '../api/axiosConfig';
import Loader from '../components/Loader';
import { Settings, CheckCircle, XCircle, Navigation, MapPin, Calendar, Car, Fuel, Zap, Route, Users, Globe, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user, login } = useAuth();
    const [requests, setRequests] = useState({ asPassenger: [], asDriver: [] });
    const [loading, setLoading] = useState(true);

    // Profile update state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        hasVehicle: user?.vehicleDetails?.hasVehicle || false,
        vehicleType: user?.vehicleDetails?.vehicleType || 'bike',
        fuelType: user?.vehicleDetails?.fuelType || 'petrol',
        mileage: user?.vehicleDetails?.mileage || ''
    });

    const fetchRequests = useCallback(async () => {
        try {
            const { data } = await bookingAPI.getMyRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResponse = useCallback(async (req, action) => {
        try {
            if (action === 'REJECT') {
                await bookingAPI.respondBooking(req._id, { action });
                fetchRequests();
                return;
            }

            // If ACCEPT, Driver pays platform fee
            const { data: orderData } = await paymentAPI.createOrder({ requestId: req._id });

            const options = {
                key: orderData.keyId,
                amount: orderData.order.amount,
                currency: "INR",
                name: "Ride Mitron",
                description: "Acceptance Platform Fee",
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        await paymentAPI.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            requestId: req._id,
                            paymentType: 'DRIVER_FEE'
                        });
                        alert("Ride accepted successfully!");
                        fetchRequests();
                    } catch (err) {
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: user?.name,
                    contact: user?.phoneNumber
                },
                theme: { color: "#4F46E5" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp.open();

        } catch (error) {
            alert(error.response?.data?.message || "Failed to respond");
        }
    }, [user, fetchRequests]);

    const handleProfileSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            const { data } = await axiosConfig.put('/auth/profile', {
                name: profileData.name,
                vehicleDetails: {
                    hasVehicle: profileData.hasVehicle,
                    vehicleType: profileData.vehicleType,
                    fuelType: profileData.fuelType,
                    mileage: Number(profileData.mileage)
                }
            });
            login(data, localStorage.getItem('token'));
            setIsEditingProfile(false);
        } catch (err) {
            alert('Failed to update profile');
        }
    }, [profileData, login]);

    const passengerList = useMemo(() => {
        if (requests.asPassenger.length === 0) {
            return (
                <div className="glass-panel flex flex-col items-center justify-center text-center py-20 border-dashed border-2 bg-transparent">
                    <Route className="w-12 h-12 text-slate-200 mb-5" />
                    <p className="text-slate-900 font-black text-lg">No incoming ride streams</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize a search flow to participate</p>
                </div>
            );
        }
        return requests.asPassenger.map((req, index) => (
            <div key={req._id} className="glass-panel group relative overflow-hidden active:scale-95 transition-transform will-change-transform animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 blur-xl ${req.status === 'ACCEPTED' ? 'from-emerald-500' : 'from-yellow-500'}`}></div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-500/10' : req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 shadow-sm shadow-yellow-500/10' : 'bg-red-100 text-red-700 shadow-sm shadow-red-500/10'}`}>
                                {req.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-900 font-black text-2xl tracking-tighter">
                            {req.ride?.origin?.name} 
                            <Navigation className="w-4 h-4 text-primary-500 transform rotate-45" /> 
                            {req.ride?.destination?.name}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cost Allocation</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{req.totalCost.toFixed(0)}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] pt-6 border-t border-slate-100">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2 text-primary-600 bg-primary-50 px-3 py-1 rounded-full"><Users className="w-4 h-4" /> {req.seatsRequested} Seat Allocation</span>
                </div>
            </div>
        ));
    }, [requests.asPassenger]);

    const driverList = useMemo(() => {
        if (requests.asDriver.length === 0) {
            return (
                <div className="glass-panel flex flex-col items-center justify-center text-center py-20 border-dashed border-2 bg-transparent">
                    <Users className="w-12 h-12 text-slate-200 mb-5" />
                    <p className="text-slate-900 font-black text-lg">No external node requests</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Visible signals will materialize here</p>
                </div>
            );
        }
        return requests.asDriver.map((req, index) => (
            <div key={req._id} className="glass-panel hover:border-indigo-200 transition-colors will-change-transform animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner shadow-indigo-600/5">
                            {req.passenger?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 text-xl tracking-tight leading-none mb-1">{req.passenger?.name}</p>
                            <div className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{req.passenger?.rating || '5.0'} TRUST SCORE</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Resource Lock</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter mb-1">{req.seatsRequested} Unit(s)</p>
                        <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">₹{req.totalCost.toFixed(0)} Pool</p>
                    </div>
                </div>

                {req.status === 'PENDING' ? (
                    <div className="flex gap-4">
                        <button onClick={() => handleResponse(req, 'ACCEPT')} className="btn-primary group !py-3.5 !rounded-2xl flex-1 text-xs">
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                                AUTHORIZE ACCESS
                            </span>
                        </button>
                        <button onClick={() => handleResponse(req, 'REJECT')} className="btn-secondary !w-auto !px-6 !py-3.5 !rounded-2xl group border-red-100 hover:bg-red-50 hover:border-red-200">
                            <XCircle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className={`py-4 px-3 text-[10px] font-black rounded-2xl text-center uppercase tracking-[0.2em] shadow-inner ${req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-emerald-500/5' : 'bg-slate-50 text-slate-500 border border-slate-200 shadow-slate-500/5'}`}>
                        STATUS: {req.status}
                    </div>
                )}
            </div>
        ));
    }, [requests.asDriver, handleResponse]);

    if (loading) return <Loader />;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in relative z-10 w-full mb-20 px-4 mt-6">

            {/* Futuristic Dashboard Header */}
            <div className="glass-panel mb-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-primary-600/30">
                                <span className="text-3xl font-black">{user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-3.5 h-3.5 text-primary-500 animate-spin-slow" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Network Status: Online</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Systems Check, {user?.name?.split(' ')[0]}</h1>
                            <p className="text-slate-500 font-bold mt-1">Monitoring your node activity across the Mitron grid.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/post-ride" className="btn-primary !w-auto !py-4 px-8 text-xs tracking-widest uppercase">
                            Dispatch Ride
                        </Link>
                        <button 
                            onClick={() => {
                                const token = localStorage.getItem('token');
                                localStorage.clear();
                                sessionStorage.clear();
                                if(token) localStorage.setItem('token', token);
                                window.location.reload();
                            }} 
                            className="btn-secondary !w-auto !py-4 px-6 text-amber-600 border-amber-100 hover:bg-amber-50"
                            title="Clear Cache & Optimize"
                        >
                            <Zap className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="btn-secondary !w-auto !py-4 px-6">
                            <Settings className={`w-5 h-5 transition-transform duration-700 ${isEditingProfile ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {isEditingProfile && (
                <div className="glass-panel mb-10 animate-slide-up bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-200">
                        <div className="bg-primary-100 p-3 rounded-2xl text-primary-600"><UserCircle className="w-6 h-6" /></div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Asset Management</h2>
                            <p className="text-slate-500 text-sm font-bold">Configure your broadcasting credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Universal ID Name</label>
                                <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input-field" required />
                            </div>

                            <div className="flex items-center bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm">
                                <label className="flex items-center gap-6 cursor-pointer w-full group">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${profileData.hasVehicle ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-slate-200 text-slate-400'}`}>
                                        {profileData.hasVehicle ? <Car className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                                    </div>
                                    <input type="checkbox" checked={profileData.hasVehicle} onChange={(e) => setProfileData({ ...profileData, hasVehicle: e.target.checked })} className="hidden" />
                                    <div>
                                        <p className="font-black text-slate-900 text-lg tracking-tight">Vehicle Ownership</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{profileData.hasVehicle ? 'Asset Online' : 'No Asset Registered'}</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {profileData.hasVehicle && (
                            <div className="grid md:grid-cols-3 gap-8 animate-fade-in p-8 bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100/50 lg:p-10">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 mb-1 ml-1"><Car className="w-3.5 h-3.5" /> Class</label>
                                    <select value={profileData.vehicleType} onChange={(e) => setProfileData({ ...profileData, vehicleType: e.target.value })} className="input-field">
                                        <option value="bike">Motorcycle</option>
                                        <option value="scooty">Scooter</option>
                                        <option value="car">Car / SUV</option>
                                        <option value="auto">Auto Rikshaw</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 mb-1 ml-1"><Fuel className="w-3.5 h-3.5" /> Energy Source</label>
                                    <select value={profileData.fuelType} onChange={(e) => setProfileData({ ...profileData, fuelType: e.target.value })} className="input-field">
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 mb-1 ml-1"><Zap className="w-3.5 h-3.5" /> Efficiency Rating</label>
                                    <div className="relative">
                                        <input type="number" step="0.1" value={profileData.mileage} onChange={(e) => setProfileData({ ...profileData, mileage: e.target.value })} className="input-field pr-16" required placeholder="e.g. 15.5" />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">KM/L</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="btn-primary w-full sm:w-auto px-12 text-sm tracking-widest uppercase">Update Network Profile</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-10">

                {/* Left Stream: Rides I am joining */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Incoming Streams</h2>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{requests.asPassenger.length} ACTIVE</span>
                    </div>

                    <div className="space-y-6">
                        {passengerList}
                    </div>
                </div>

                {/* Right Stream: Requests for my rides */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Outgoing Signals</h2>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{requests.asDriver.length} PENDING</span>
                    </div>

                    <div className="space-y-6">
                        {driverList}
                    </div>
                </div>
            </div>
        </div>
    );
}
