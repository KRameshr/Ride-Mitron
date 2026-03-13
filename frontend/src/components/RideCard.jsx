import { Link } from 'react-router-dom';
import { Users, Car, Clock, ChevronRight, Zap, Target } from 'lucide-react';

export default function RideCard({ ride }) {
    // Format dates securely
    const rideDate = new Date(ride.startTime);
    const formattedTime = rideDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = rideDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <div className="glass-panel group overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 relative border-white/40">

            {/* Futuristic Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600"></div>

            <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5 bg-slate-900/5 px-4 py-2 rounded-2xl w-fit">
                            <Clock className="w-4 h-4 text-primary-600 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{formattedDate} • {formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 bg-primary-50 px-3 py-1 rounded-full w-fit">
                            <Zap className="w-3.5 h-3.5 fill-primary-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Signal</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                            <span className="text-sm font-bold text-slate-400 mr-1 italic">₹</span>{ride.costPerSeat.toFixed(0)}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Energy Share</p>
                    </div>
                </div>

                <div className="relative mb-10 pl-6 border-l-2 border-dashed border-slate-200 py-2 space-y-8">
                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow-lg shadow-primary-500/20"></div>
                    <div className="absolute -left-[9px] bottom-2 w-4 h-4 rounded-full bg-slate-900 border-4 border-white shadow-lg shadow-slate-950/20"></div>

                    <div className="w-full group/loc">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1 leading-none">Origin Vector</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate group-hover/loc:text-primary-600 transition-colors">{ride.origin.name.split(',')[0]}</h3>
                    </div>

                    <div className="w-full group/loc">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1 leading-none">Target Vector</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate group-hover/loc:text-indigo-600 transition-colors uppercase italic">{ride.destination.name.split(',')[0]}</h3>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#020617] flex items-center justify-center text-white font-black text-xl shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent"></div>
                            {ride.driver?.name.charAt(0)}
                        </div>
                        <div>
                            <span className="block font-black text-slate-900 text-sm tracking-tight leading-none mb-1 uppercase">{ride.driver?.name}</span>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                <Car className="w-3.5 h-3.5 text-indigo-500" /> {ride.vehicleType}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-emerald-700 font-black text-[10px] tracking-widest uppercase">
                            {ride.availableSeats} UNITS <Users className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>

                {/* Cyberpunk Link Overlay */}
                <Link to={`/ride/${ride._id}`} className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/90 backdrop-blur-md flex items-center justify-center">
                    <div className="p-10 text-center scale-90 group-hover:scale-100 transition-transform duration-500">
                        <div className="bg-primary-600 w-16 h-16 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-primary-600/40">
                            <Target className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase">INTERCEPT ROUTE</h4>
                        <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-8">Full Telemetry & Payment</p>
                        <div className="btn-primary !py-4 px-10 text-[10px] tracking-widest uppercase">
                            Connect Signal <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
