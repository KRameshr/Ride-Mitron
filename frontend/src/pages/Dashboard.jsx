import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI, bookingAPI, paymentAPI, rideAPI } from '../api/apiRoutes';
import axiosConfig from '../api/axiosConfig';
import Loader from '../components/Loader';
import { Settings, CheckCircle, XCircle, Navigation, Calendar, Car, Fuel, Zap, Route, Users, Globe, UserCircle, History, Activity, Sparkles, ShieldCheck, MapPin, Search, ArrowRight, Clock, Star, Banknote, MessageCircle } from 'lucide-react';
import AntiGravityZone from '../components/AntiGravityZone';
// redundant import removed

const StatusTicker = () => (
    <div className="w-full bg-primary-600/10 py-3 border-b border-primary-500/10 overflow-hidden whitespace-nowrap relative z-50">
        <div className="inline-block animate-marquee">
            {[1, 2, 3, 4].map((i) => (
                <span key={i} className="inline-flex items-center gap-4 mx-12">
                    <span className="text-[8px] font-black text-primary-400 uppercase tracking-[0.4em]">● GRID STATUS: OPTIMAL</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">NODES: 1,208</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">SYNC: ACTIVE</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">LATENCY: 24MS</span>
                </span>
            ))}
        </div>
    </div>
);

const LogItem = ({ time, action, desc, status }) => (
    <div className="flex gap-4 group/log">
        <span className="text-[8px] font-bold text-slate-600 mt-1">{time}</span>
        <div className="flex-grow pb-4 border-l border-white/5 pl-4 relative">
            <div className="absolute -left-[2.5px] top-1.5 w-1 h-1 rounded-full bg-white/10 group-hover/log:bg-primary-500 transition-colors"></div>
            <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                {action}
                <span className={`text-[7px] px-1.5 py-0.5 rounded ${status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'}`}>{status}</span>
            </p>
            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter leading-none">{desc}</p>
        </div>
    </div>
);

const TelemetryBox = ({ label, value, icon, subtext, colorClass }) => (
    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl group hover:bg-white/[0.06] transition-all duration-500 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass}`}>{icon}</div>
            <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-primary-500 transition-colors animate-pulse"></div>
        </div>
        <div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
            <h4 className="text-xl font-black text-white tracking-tighter uppercase">{value}</h4>
            <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest mt-1">{subtext}</p>
        </div>
    </div>
);

const FeatureItem = ({ icon, title, desc, colorClass, delay }) => (
    <div 
        className="glass-panel group relative overflow-hidden p-6 sm:p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-700 hover:-translate-y-3 flex flex-col items-start animate-slide-up"
        style={{ animationDelay: `${delay}s` }}
    >
        <div className={`absolute -right-8 -top-8 w-32 h-32 blur-[60px] opacity-10 rounded-full transition-all duration-700 group-hover:opacity-30 ${colorClass}`}></div>
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 relative z-10 shadow-2xl ${colorClass} bg-opacity-10 text-white group-hover:bg-opacity-100 transition-all duration-500`}>
            {icon}
        </div>
        
        <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase relative z-10">{title}</h3>
        <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10 flex-grow group-hover:text-slate-200 transition-colors">{desc}</p>
        
        <div className="mt-8 pt-8 border-t border-white/5 w-full flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-500 group-hover:text-primary-400 transition-colors uppercase">
            <ShieldCheck className="w-3 h-3" /> Secure Sync
        </div>
    </div>
);

export default function Dashboard() {
    const { user, login } = useAuth();
    const [searchParams] = useSearchParams();
    const [requests, setRequests] = useState({ asPassenger: [], asDriver: [] });
    const [myRides, setMyRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'history'
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [activeAgzRequest, setActiveAgzRequest] = useState(null);

    const timeGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const stats = useMemo(() => ({
        trust: user?.rating || '5.0',
        syncs: (requests.asPassenger?.length + requests.asDriver?.length) || 0,
        asset: user?.vehicleDetails?.hasVehicle ? 'ACTIVE' : 'NONE',
        efficiency: user?.vehicleDetails?.mileage ? `${user.vehicleDetails.mileage} KM/L` : '---'
    }), [user, requests]);

    // Deep link handling from mobile menu
    useEffect(() => {
        const view = searchParams.get('view');
        const edit = searchParams.get('edit');
        if (view) setViewMode(view);
        if (edit === 'true') setIsEditingProfile(true);
    }, [searchParams]);

    // Profile update state
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        hasVehicle: user?.vehicleDetails?.hasVehicle || false,
        vehicleType: user?.vehicleDetails?.vehicleType || 'bike',
        fuelType: user?.vehicleDetails?.fuelType || 'petrol',
        mileage: user?.vehicleDetails?.mileage || '',
        vehicleNumberPlate: user?.vehicleDetails?.vehicleNumberPlate || ''
    });

    const fetchDashboardData = useCallback(async () => {
        try {
            const [reqRes, rideRes] = await Promise.all([
                bookingAPI.getMyRequests(),
                rideAPI.getMyRides()
            ]);
            setRequests(reqRes.data);
            setMyRides(rideRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleResponse = useCallback(async (req, action) => {
        try {
            if (action === 'REJECT') {
                await bookingAPI.respondBooking(req._id, { action });
                fetchDashboardData();
                return;
            }

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
                        fetchDashboardData();
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
    }, [user, fetchDashboardData]);

    const handleCancelRide = async (rideId) => {
        if (!window.confirm("Abort this entire journey stream?")) return;
        try {
            await rideAPI.cancelRide(rideId);
            alert("Journey terminated.");
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel ride");
        }
    };

    const handleCancelRequest = async (requestId) => {
        if (!window.confirm("Detach from this journey stream?")) return;
        try {
            await bookingAPI.cancelBooking(requestId);
            alert("Sync request detached.");
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel request");
        }
    };

    const handleCompleteRide = async (rideId) => {
        if (!window.confirm("Mark this ride as completed?")) return;
        try {
            await rideAPI.updateRideStatus(rideId, { status: 'COMPLETED' });
            alert("Ride marked as completed!");
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to complete ride");
        }
    };

    const handleProfileSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            const { data } = await authAPI.updateProfile({
                name: profileData.name,
                vehicleDetails: {
                    hasVehicle: profileData.hasVehicle,
                    vehicleType: profileData.vehicleType,
                    fuelType: profileData.fuelType,
                    mileage: Number(profileData.mileage),
                    vehicleNumberPlate: profileData.vehicleNumberPlate
                }
            });
            login(data, localStorage.getItem('token'));
            setIsEditingProfile(false);
        } catch (err) {
            alert('Failed to update profile');
        }
    }, [profileData, login]);

    const passengerList = useMemo(() => {
        const filtered = requests.asPassenger.filter(req => {
            const isFinished = req.ride?.status === 'COMPLETED' || req.ride?.status === 'CANCELLED' || req.status === 'REJECTED';
            return viewMode === 'history' ? isFinished : !isFinished;
        });

        if (filtered.length === 0) {
            return (
                <div className="glass-panel flex flex-col items-center justify-center text-center py-20 border-dashed border-2 border-white/10">
                    <Route className="w-12 h-12 text-slate-700 mb-5" />
                    <p className="text-white font-bold text-lg uppercase tracking-widest">No Active Journeys</p>
                </div>
            );
        }
        return filtered.map((req, index) => (
            <div key={req._id} className="glass-panel group relative overflow-hidden animate-slide-up hover:bg-white/[0.05]" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-4">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {req.ride?.status === 'COMPLETED' ? 'COMPLETED' : req.status}
                        </span>
                        <div className="text-white font-black text-2xl tracking-tighter flex items-center gap-3">
                            {req.ride?.origin?.name?.split(',')[0]}
                            <Navigation className="w-5 h-5 text-primary-500 rotate-45" />
                            {req.ride?.destination?.name?.split(',')[0]}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Fee</p>
                        <p className="text-3xl font-black text-white tracking-tighter">₹{req.totalCost.toFixed(0)}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-2 text-primary-400"><Users className="w-4 h-4" /> {req.seatsRequested} Seats</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {req.status !== 'REJECTED' && req.status !== 'CANCELLED' && (
                            <button 
                                onClick={() => setActiveAgzRequest(req._id)}
                                className="flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <MessageCircle className="w-4 h-4" /> Sync Hub
                            </button>
                        )}
                        {req.status !== 'REJECTED' && req.status !== 'CANCELLED' && req.ride?.status === 'ACTIVE' && (
                            <button onClick={() => handleCancelRequest(req._id)} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ));
    }, [requests.asPassenger, viewMode]);

    const driverList = useMemo(() => {
        const activeRides = myRides.filter(ride => {
            const isFinished = ride.status === 'COMPLETED' || ride.status === 'CANCELLED';
            return viewMode === 'history' ? isFinished : !isFinished;
        });

        const activeRequests = requests.asDriver.filter(req => {
            const isFinished = req.ride?.status === 'COMPLETED' || req.ride?.status === 'CANCELLED' || req.status === 'REJECTED';
            return viewMode === 'history' ? isFinished : !isFinished;
        });

        if (activeRides.length === 0 && activeRequests.length === 0) {
            return (
                <div className="glass-panel flex flex-col items-center justify-center text-center py-20 border-dashed border-2 border-white/10">
                    <Users className="w-12 h-12 text-slate-700 mb-5" />
                    <p className="text-white font-bold text-lg uppercase tracking-widest">No Incoming Signals</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* Active Rides Section */}
                {activeRides.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Live Dispatches</p>
                        {activeRides.map((ride, idx) => (
                            <div key={ride._id} className="glass-panel border-l-4 border-l-primary-500 hover:bg-white/[0.05] transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-white font-black text-xl tracking-tight flex items-center gap-2">
                                            {ride.origin?.name?.split(',')[0]} <ArrowRight className="w-3 h-3 text-primary-500" /> {ride.destination?.name?.split(',')[0]}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                            {new Date(ride.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-400 border border-primary-500/20`}>
                                            {ride.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ride.availableSeats} Seats left</span>
                                        <span className="flex items-center gap-1 text-primary-400"><Banknote className="w-3 h-3" /> ₹{ride.costPerSeat}/seat</span>
                                    </div>
                                    <button onClick={() => handleCancelRide(ride._id)} className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors">
                                        Abort Stream
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Requests Section */}
                {activeRequests.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Incoming Connections</p>
                        {activeRequests.map((req, index) => (
                            <div key={req._id} className="glass-panel animate-slide-up hover:bg-white/[0.05]" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-2xl border border-primary-500/20">
                                            {req.passenger?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-xl tracking-tight leading-none mb-2">{req.passenger?.name}</p>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span>{req.passenger?.rating || '5.0'} Trust</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Units</p>
                                        <p className="text-2xl font-black text-white tracking-tighter">{req.seatsRequested}</p>
                                    </div>
                                </div>

                                {req.status === 'PENDING' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleResponse(req, 'ACCEPT')} className="btn-primary !py-4 text-xs font-black tracking-[0.2em] uppercase">
                                            Accept Request
                                        </button>
                                        <button onClick={() => handleResponse(req, 'REJECT')} className="btn-secondary !py-4 text-xs font-black tracking-[0.2em] uppercase hover:text-red-500 hover:border-red-500/50">
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className={`py-4 rounded-xl text-[10px] font-black text-center uppercase tracking-[0.3em] border ${req.status === 'ACCEPTED' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/5 text-slate-500 border-white/5'}`}>
                                            {req.status}
                                        </div>
                                        {req.status === 'ACCEPTED' && req.ride?.status === 'ACTIVE' && (
                                            <div className="flex gap-3">
                                                <button onClick={() => handleCompleteRide(req.ride._id)} className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                    Complete
                                                </button>
                                                <button onClick={() => handleCancelRide(req.ride._id)} className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                    Abort
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'ACCEPTED' && (
                                            <>
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400"><Navigation className="w-4 h-4" /></div>
                                                        <p className="text-sm font-bold text-white tracking-tight">{req.passenger?.phoneNumber}</p>
                                                    </div>
                                                    <a href={`tel:${req.passenger?.phoneNumber}`} className="p-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors text-white">
                                                        <Zap className="w-4 h-4 fill-white" />
                                                    </a>
                                            </div>
                                            <button 
                                                    onClick={() => setActiveAgzRequest(req._id)}
                                                    className="w-full mt-4 flex items-center justify-center gap-3 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-primary-500/20"
                                                >
                                                    <MessageCircle className="w-5 h-5" /> Open Sync Hub
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }, [requests.asDriver, myRides, viewMode, handleResponse]);

    if (loading) return <Loader />;

    return (
        <div className="w-full relative min-h-screen mesh-bg selection:bg-primary-500/30">
            <StatusTicker />
            {/* HERO SECTION */}
            <div className="w-full relative h-[85vh] sm:h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden py-12 sm:py-24 lg:py-0">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#020617] opacity-60"></div>
                    <img src="/hero-bg.jpg" alt="Background" className="w-full h-full object-cover mix-blend-overlay brightness-50" />
                    
                    {/* Animated Grid Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 px-4 sm:px-6 py-2 rounded-full mb-6 sm:mb-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></div>
                        <span className="text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase text-primary-400">System Online</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-[-0.05em] mb-6 sm:mb-8 leading-[0.9] uppercase italic">
                        <span className="text-white">Ride</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-fuchsia-400 animate-gradient-x not-italic">Mitron.</span>
                    </h1>
                    
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl inline-block mb-10">
                        <p className="text-sm sm:text-base font-black text-slate-300 uppercase tracking-[0.4em]">Redefining Urban Mobility</p>
                    </div>

                    <p className="text-base sm:text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed px-4">
                        Welcome, <span className="text-white font-black">{user?.name}</span>. Experience the next generation of carpooling with precision and style.
                    </p>

                    <div className="flex flex-col xs:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
                        <Link to="/search-ride" className="btn-primary !w-full xs:!w-auto !px-10 sm:!px-12 !py-5 sm:!py-6 text-[10px] sm:text-xs tracking-[0.3em] uppercase group">
                            <span className="flex items-center justify-center gap-3">Find a Ride <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                        </Link>
                        <Link to="/post-ride" className="btn-secondary !w-full xs:!w-auto !px-10 sm:!px-12 !py-5 sm:!py-6 text-[10px] sm:text-xs tracking-[0.3em] uppercase bg-white/5 border-white/10">
                            Share a Ride
                        </Link>
                    </div>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
                <div className="mb-16 sm:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
                    <div className="max-w-2xl">
                        <span className="text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase text-primary-500 mb-2 sm:mb-4 block">Platform Core</span>
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">Why Ride<br className="hidden sm:block" /> With Mitron?</h2>
                    </div>
                    <p className="text-slate-500 font-medium text-base sm:text-lg lg:max-w-sm mb-2 opacity-80">Connecting destinations with verified local commuters.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                    <FeatureItem icon={<Banknote />} title="Fair Split" desc="Smart cost allocation for every peer journey." colorClass="text-emerald-500" delay={0.1} />
                    <FeatureItem icon={<Sparkles />} title="Precision" desc="Neural matching for perfect trip pairing." colorClass="text-indigo-500" delay={0.2} />
                    <FeatureItem icon={<ShieldCheck />} title="Verified" desc="Secure identity validation for total trust." colorClass="text-blue-500" delay={0.3} />
                    <FeatureItem icon={<Globe />} title="Impact" desc="Reduce carbon footprint with every ride." colorClass="text-cyan-500" delay={0.4} />
                    <FeatureItem icon={<Clock />} title="Real-time" desc="Instant sync with live navigation signals." colorClass="text-fuchsia-500" delay={0.5} />
                </div>
            </div>

            {/* CONTROL CENTER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-48">
                <div className="glass-panel mb-16 sm:mb-24 relative overflow-hidden group !p-0">
                    <div className="absolute -right-20 -top-20 w-64 sm:w-96 h-64 sm:h-96 bg-primary-500/5 blur-[80px] sm:blur-[120px] rounded-full"></div>
                    
                    <div className="p-8 sm:p-12 lg:p-16 relative z-10 flex flex-col lg:flex-row gap-12">
                        {/* Identity & Core Actions */}
                        <div className="lg:w-1/3 flex flex-col justify-between space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 text-primary-500">
                                    <Activity className="w-5 h-5 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operations Center</span>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] mb-3">{timeGreeting},</p>
                                    <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4">Command<br />Panel.</h2>
                                    <div className="h-1 w-20 bg-primary-600 rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-6 px-10 rounded-2xl flex items-center justify-center gap-4 text-[11px] font-black tracking-[0.3em] uppercase border border-white/5 transition-all">
                                    <Settings className="w-5 h-5" /> Config
                                </button>
                                <button onClick={() => window.location.reload()} className="w-20 h-20 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center transition-all group/zap shadow-2xl shadow-primary-900/20">
                                    <Zap className="w-8 h-8 fill-white group-hover/zap:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Neural Telemetry Deck */}
                        <div className="lg:w-2/3 flex flex-col gap-6">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 sm:p-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                                            <Sparkles className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Neural Telemetry</h3>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time sync established</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Grid Online</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
                                    <TelemetryBox 
                                        label="Trust Factor" 
                                        value={stats.trust} 
                                        icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />} 
                                        subtext="Global Reputation"
                                        colorClass="text-amber-500"
                                    />
                                    <TelemetryBox 
                                        label="Total Syncs" 
                                        value={stats.syncs} 
                                        icon={<Zap className="w-5 h-5 text-primary-500" />} 
                                        subtext="Active Network"
                                        colorClass="text-primary-500"
                                    />
                                    <TelemetryBox 
                                        label="Asset Status" 
                                        value={stats.asset} 
                                        icon={<Car className="w-5 h-5 text-emerald-500" />} 
                                        subtext={user?.vehicleDetails?.vehicleNumberPlate || "None Linked"}
                                        colorClass="text-emerald-500"
                                    />
                                    <TelemetryBox 
                                        label="Consumption" 
                                        value={stats.efficiency} 
                                        icon={<Fuel className="w-5 h-5 text-indigo-500" />} 
                                        subtext="Network Average"
                                        colorClass="text-indigo-500"
                                    />
                                </div>

                                {/* Active Grid Logs */}
                                <div className="flex-grow bg-black/20 border border-white/5 rounded-[2rem] p-6 lg:p-8">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                        <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Intelligence Logs</h4>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-primary-500/20 rounded-full"></div>)}
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-2">
                                        <LogItem time="12:08" action="NEURAL_SYNC" desc="Verifying segment A-09" status="SUCCESS" />
                                        <LogItem time="11:45" action="GRID_RELAY" desc="Node density optimal" status="INFO" />
                                        <LogItem time="10:30" action="WALLET_LINK" desc="Split logic confirmed" status="SUCCESS" />
                                        <LogItem time="09:12" action="AUTH_CORE" desc="Identity packet signed" status="SUCCESS" />
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-primary-600/5 border border-primary-500/10 rounded-2xl group overflow-hidden relative">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary-500/10 blur-3xl -mr-16 -mt-16"></div>
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black text-white uppercase tracking-widest">Sync with new commuters</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Network Optimization: HIGH · Latency: 24ms</p>
                                    </div>
                                    <Link to="/search-ride" className="btn-primary !w-auto !py-3 !px-8 text-[9px] tracking-widest relative z-10 shadow-none">
                                        Initiate Scan
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODE TOGGLES */}
                <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 mb-10 sm:mb-16">
                    <button onClick={() => setViewMode('active')} className={`flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] transition-all border ${viewMode === 'active' ? 'bg-primary-600 text-white border-primary-500' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}>
                        Active Streams
                    </button>
                    <button onClick={() => setViewMode('history')} className={`flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] transition-all border ${viewMode === 'history' ? 'bg-primary-600 text-white border-primary-500' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10'}`}>
                        Journey Archive
                    </button>
                </div>

                {/* PROFILE EDIT FORM */}
                {isEditingProfile && (
                    <div className="glass-panel mb-24 animate-slide-up border-primary-500/30">
                        <form onSubmit={handleProfileSubmit} className="space-y-12">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Name</label>
                                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input-field" required />
                                </div>
                                <div className="flex items-center bg-white/5 p-6 rounded-2xl border border-white/5 group cursor-pointer" onClick={() => setProfileData({ ...profileData, hasVehicle: !profileData.hasVehicle })}>
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${profileData.hasVehicle ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        <Car className="w-7 h-7" />
                                    </div>
                                    <div className="ml-6">
                                        <p className="text-white font-black uppercase tracking-tight">Vehicle Access</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{profileData.hasVehicle ? 'Asset Online' : 'No Asset'}</p>
                                    </div>
                                </div>
                            </div>
                            {profileData.hasVehicle && (
                                <div className="grid md:grid-cols-3 gap-8 animate-fade-in bg-white/5 p-10 rounded-3xl border border-white/5">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-400">Class</label>
                                        <select value={profileData.vehicleType} onChange={(e) => setProfileData({ ...profileData, vehicleType: e.target.value })} className="input-field">
                                            <option value="bike">Motorcycle</option>
                                            <option value="car">Car / SUV</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-400">Energy Matrix</label>
                                        <select value={profileData.fuelType} onChange={(e) => setProfileData({ ...profileData, fuelType: e.target.value })} className="input-field">
                                            <option value="petrol">Petrol</option>
                                            <option value="diesel">Diesel</option>
                                            <option value="electric">Electric</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-400">Rating (KM/L)</label>
                                        <input type="number" step="0.1" value={profileData.mileage} onChange={(e) => setProfileData({ ...profileData, mileage: e.target.value })} className="input-field" required />
                                    </div>
                                    <div className="space-y-4 md:col-span-3 bg-white/5 p-6 rounded-2xl border border-white/5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-400 ml-1">Node Identifier (Number Plate)</label>
                                        <input 
                                            type="text" 
                                            value={profileData.vehicleNumberPlate} 
                                            onChange={(e) => setProfileData({ ...profileData, vehicleNumberPlate: e.target.value.toUpperCase() })} 
                                            className="input-field" 
                                            placeholder="e.g., AP09AB1234"
                                            required 
                                        />
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Required for grid authentication (Min 6 characters)</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button type="submit" className="btn-primary !w-auto px-16">Update Neural Link</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* REEDS GRID */}
                <div className="grid lg:grid-cols-2 gap-10">
                    <div className="space-y-10">
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                            <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                            Joined Journeys
                        </h3>
                        <div className="space-y-6">{passengerList}</div>
                    </div>
                    <div className="space-y-10">
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                            Hosted Streams
                        </h3>
                        <div className="space-y-6">{driverList}</div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {activeAgzRequest && (
                    <AntiGravityZone 
                        requestId={activeAgzRequest} 
                        onClose={() => setActiveAgzRequest(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
