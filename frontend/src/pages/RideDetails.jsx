import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rideAPI, bookingAPI, paymentAPI } from '../api/apiRoutes';
import { useAuth } from '../context/AuthContext';
import { Clock, Users, Info, CarFront, Calculator, Globe, Zap, Target, ShieldCheck, ChevronRight, Navigation } from 'lucide-react';
import Loader from '../components/Loader';

export default function RideDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [seats, setSeats] = useState(1);

    useEffect(() => {
        const fetchRide = async () => {
            try {
                const { data } = await rideAPI.getRideDetails(id);
                setRide(data);
            } catch (error) {
                console.error("Failed to fetch ride details");
                navigate('/search-ride');
            } finally {
                setLoading(false);
            }
        };
        fetchRide();
    }, [id, navigate]);

    const handleBook = async () => {
        setBookingLoading(true);
        try {
            const reqData = await bookingAPI.requestBooking({ rideId: ride._id, seatsRequested: seats });
            const rideRequest = reqData.data;

            const { data: orderData } = await paymentAPI.createOrder({ requestId: rideRequest._id });

            const options = {
                key: orderData.keyId,
                amount: orderData.order.amount,
                currency: "INR",
                name: "Ride Mitron",
                description: "Platform Fee to Unlock Ride Details",
                order_id: orderData.order.id,
                handler: async function (response) {
                    try {
                        await paymentAPI.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            requestId: rideRequest._id,
                            paymentType: 'RIDER_FEE'
                        });
                        alert("Payment successful! Request submitted.");
                        navigate('/dashboard');
                    } catch (err) {
                        alert("Payment verification failed.");
                        setBookingLoading(false);
                    }
                },
                prefill: {
                    name: user?.name,
                    contact: user?.phoneNumber
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert(response.error.description);
                setBookingLoading(false);
            });
            rzp.open();

        } catch (error) {
            alert(error.response?.data?.message || 'Failed to request booking');
            setBookingLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (!ride) return <div>Ride not found</div>;

    const totalCapacity = ride.totalSeats + 1;
    const singleFuelShare = ride.fuelCost / totalCapacity;

    const rideDate = new Date(ride.startTime);
    const dateFormatted = rideDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    const timeFormatted = rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="max-w-6xl mx-auto py-12 lg:py-20 px-4 animate-fade-in relative z-10 w-full mb-32">
            
            <div className="glass-panel overflow-hidden border-none shadow-3xl bg-white/20">
                
                {/* Advanced Header - Carbon Fiber + Cinematic Gradients */}
                <div className="bg-[#020617] text-white p-10 sm:p-16 relative overflow-hidden rounded-t-[3rem] sm:rounded-t-[4rem]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-5 py-2 rounded-full mb-10 text-primary-200 font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl">
                                <Globe className="w-4 h-4 text-primary-400 animate-spin-slow" /> Network Trajectory: {ride.distanceKm.toFixed(1)} KM
                            </div>
                            
                            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-4 uppercase italic">
                                {ride.origin.name.split(',')[0]} 
                                <span className="text-primary-500 font-normal mx-4 animate-pulse">/</span> 
                                {ride.destination.name.split(',')[0]}
                            </h1>
                            
                            <div className="flex items-center gap-6 mt-8">
                                <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
                                    <Clock className="w-4 h-4 text-indigo-400" /> {dateFormatted}
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                                <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
                                    <Zap className="w-4 h-4 text-primary-400" /> {timeFormatted}
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <div className="glass-panel !bg-white/5 border-white/10 p-10 rounded-[3rem] text-center shadow-3xl">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-300 mb-4 opacity-70">Energy Quota / Unit</p>
                                <p className="text-7xl font-black text-white leading-none tracking-tighter">₹{ride.costPerSeat.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 sm:p-20 grid lg:grid-cols-12 gap-16 lg:gap-24 relative">
                    {/* Decorative Background Element */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

                    {/* Telemetry Panel (Left side) */}
                    <div className="lg:col-span-7 space-y-20 relative z-10">
                        
                        {/* Driver Profile Vector */}
                        <div>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Operator Identity</h3>
                            </div>

                            <div className="flex items-center gap-10 bg-white/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/60 shadow-xl group">
                                <div className="relative">
                                    <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-[#020617] to-indigo-950 flex items-center justify-center text-white font-black text-5xl shadow-2xl relative z-10 overflow-hidden transform group-hover:rotate-6 transition-transform">
                                        <div className="absolute inset-0 bg-primary-600/20 mix-blend-overlay"></div>
                                        {ride.driver.name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-white rounded-full z-20 flex items-center justify-center text-white">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-slate-900 text-3xl mb-3 tracking-tight">{ride.driver.name}</h4>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-2xl font-black text-xs border border-amber-100 uppercase tracking-widest shadow-sm">
                                            {ride.driver.rating?.toFixed(1) || '5.0'} Score <Zap className="w-3.5 h-3.5 fill-amber-500" />
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-2xl font-black text-xs border border-emerald-100 uppercase tracking-widest shadow-sm">
                                            {ride.driver.totalRidesGiven || 0} Transfers
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-3 bg-[#020617] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-colors">
                                        <CarFront className="w-4 h-4 text-primary-400" /> {ride.vehicleType} Class Asset
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Vectors */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Route Telemetry</h3>
                            </div>

                            <div className="relative bg-[#020617] rounded-[3rem] p-10 md:p-16 border-none shadow-3xl flex flex-col gap-12 group overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px]"></div>

                                <div className="flex items-start gap-8 relative z-10 group/point">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-2xl ring-4 ring-white/10 group-hover/point:scale-110 transition-transform">
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <div className="py-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Origin Beacon</p>
                                        <p className="font-black text-2xl text-white tracking-tight leading-tight">{ride.origin.name}</p>
                                    </div>
                                </div>

                                <div className="absolute left-[3.8rem] md:left-[5.8rem] top-32 bottom-32 w-1 bg-white/5 rounded-none z-0">
                                    <div className="w-full h-1/2 bg-gradient-to-b from-primary-500 to-indigo-500 animate-slide-up opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.5)]"></div>
                                </div>

                                <div className="flex items-start gap-8 relative z-10 group/point pt-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-primary-600/30 ring-4 ring-primary-500/20 group-hover/point:scale-110 transition-transform">
                                        <Navigation className="w-8 h-8 transform rotate-45" />
                                    </div>
                                    <div className="py-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-2">Target Destination Vector</p>
                                        <p className="font-black text-2xl text-white tracking-tight leading-tight italic uppercase">{ride.destination.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Protocol Panel (Right side) */}
                    <div className="lg:col-span-5 space-y-12 relative z-10">

                        {/* Economy Logic */}
                        <div className="glass-panel !bg-white/60 p-10 rounded-[3rem] border-white/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <h3 className="font-black text-slate-900 text-xl border-b border-slate-100 pb-6 mb-10 flex items-center gap-4 relative z-10">
                                <div className="bg-primary-50 p-3 rounded-2xl text-primary-600 shadow-sm"><Calculator className="w-6 h-6" /></div> 
                                <span className="uppercase tracking-[0.2em] text-xs">Platform Economics</span>
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center group">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Path Distance</span>
                                    <span className="font-black text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 uppercase tracking-tighter">{ride.distanceKm.toFixed(1)} Unit-KM</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Fuel Calibration</span>
                                        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">Split: {totalCapacity} Units</span>
                                    </div>
                                    <span className="font-black text-xl text-slate-900">₹{singleFuelShare.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Network Access Fee</span>
                                    <span className="font-black text-sm text-slate-900">₹{ride.riderFee?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-end relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2 leading-none">Mitigated Cost</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Final Settlement</span>
                                </div>
                                <span className="font-black text-primary-600 text-6xl tracking-tighter shadow-primary-500/10">₹{ride.costPerSeat.toFixed(0)}</span>
                            </div>

                            <div className="mt-12 bg-[#020617] p-8 rounded-[2rem] flex items-start gap-4 relative z-10 shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-primary-600/5 group-hover:bg-primary-600/10 transition-colors"></div>
                                <Info className="w-6 h-6 text-primary-400 shrink-0 mt-0.5 animate-pulse" />
                                <p className="text-[9px] font-black text-slate-400 leading-relaxed text-left uppercase tracking-[0.2em]">
                                    Mitron Node Protocol: We catalyze peer synchronization. Drivers operate under zero-profit mandate, splitting direct energy costs exclusively.
                                </p>
                            </div>
                        </div>

                        {/* Synchronization Controls */}
                        <div className="bg-[#020617] p-10 rounded-[4rem] shadow-3xl border-none relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px]"></div>

                            <div className="flex justify-between items-center text-white mb-10 relative z-10">
                                <span className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-500">Node Capacity</span>
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-3xl px-5 py-2 rounded-2xl text-xs font-black text-emerald-400 border border-white/5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> {ride.availableSeats} UNITS OPEN
                                </div>
                            </div>

                            <div className="mb-12 relative z-10">
                                <label className="block font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-4 ml-1">Allocate Sync Units:</label>
                                <div className="relative group/sel">
                                    <select
                                        value={seats}
                                        onChange={(e) => setSeats(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 text-white font-black text-2xl p-6 rounded-[2rem] appearance-none cursor-pointer focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all group-hover/sel:bg-white/10">
                                        {[...Array(ride.availableSeats)].map((_, i) => (
                                            <option className="text-slate-900" key={i} value={i + 1}>{i + 1} PEER UNIT{(i + 1) > 1 ? 'S' : ''}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none group-hover/sel:scale-110 transition-transform">
                                        <Users className="w-8 h-8 text-primary-500" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBook}
                                disabled={bookingLoading || ride.availableSeats === 0}
                                className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 text-white font-black py-8 rounded-[2.5rem] text-sm flex flex-col items-center justify-center gap-2 transition-all shadow-2xl shadow-primary-600/30 active:scale-95 disabled:active:scale-100 relative z-10 shine-effect uppercase tracking-[0.3em]">
                                {bookingLoading ? (
                                    <Zap className="h-8 w-8 animate-spin text-white" />
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4">
                                            Initialize Synchronization <ChevronRight className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] text-white/60 font-medium">SETTLEMENT: ₹{(seats * ride.costPerSeat).toFixed(0)}</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            
            {/* Global Warning Protocol */}
            <div className="mt-16 text-center max-w-2xl mx-auto px-6 opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] leading-loose">
                    Security Notice: All transmissions are end-to-end encrypted. Payment handlers operate under Razorpay Secure Protocol. Node identifiers are subject to system-wide audit for trust score maintenance. Ride Mitron reserves the right to terminate signal synchronization in case of protocol violation.
                </p>
            </div>
        </div>
    );
}
