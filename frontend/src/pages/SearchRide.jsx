import { useState, useCallback, useMemo } from 'react';
import { rideAPI } from '../api/apiRoutes';
import RideCard from '../components/RideCard';

import { Search, MapPin, Navigation, Calendar as CalendarIcon, Filter, Globe, Zap, ArrowRight, Loader2, Users, AlertCircle } from 'lucide-react';

export default function SearchRide() {
    const [loading, setLoading] = useState(false);
    const [rides, setRides] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useState({
        originName: '',
        destName: '',
        date: new Date().toLocaleDateString('en-CA'), // Correct local date format
        time: '',
        seats: 1
    });

    const [appliedMessage, setAppliedMessage] = useState('');


    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
        setError(null);
    }, []);

    const performSearch = useCallback(async (params) => {
        // Check if required fields are provided
        if (!params.originName || !params.destName) {
            setError("Please provide both Pickup and Destination locations.");
            setRides([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { data } = await rideAPI.searchRides(params);
            if (Array.isArray(data)) {
                setRides(data);
                setHasSearched(true);
            } else {
                setRides([]);
                console.warn("Expected array from search, got:", data);
            }
        } catch (error) {
            console.error("Search failed", error);
            setError(error.response?.data?.message || "Quantum synchronization failed. Check your coordinates.");
        } finally {
            setLoading(false);
        }
    }, [hasSearched]);


    const handleFormSubmit = (e) => {
        if (e) e.preventDefault();
        performSearch(searchParams);
    };

    const handleApply = () => {
        performSearch(searchParams);
        setAppliedMessage('Vector Filters Synchronized');
        setTimeout(() => setAppliedMessage(''), 3000);
    };

    const rideList = useMemo(() => {
        if (!Array.isArray(rides)) return null;
        return rides.map((ride, index) => (
            <div 
                key={ride._id} 
                className="animate-slide-up will-change-transform" 
                style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
            >
                <RideCard ride={ride} />
            </div>
        ));
    }, [rides]);

    return (
        <div className="w-full relative min-h-screen flex flex-col items-center bg-[#f8fafc]">

            {/* Futuristic Hero Section */}
            <div className="w-full bg-[#020617] text-white pt-24 pb-48 px-4 sm:px-6 relative overflow-hidden rounded-b-[4rem] sm:rounded-b-[6rem] shadow-2xl mb-10 mt-[-2rem]">
                {/* Advanced Background Orbs */}
                <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-primary-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-1/4 w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                <div className="max-w-5xl mx-auto relative z-10 text-center animate-fade-in">
                    <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-5 py-2 rounded-full mb-10 shadow-2xl">
                        <Zap className="w-3.5 h-3.5 text-primary-400 fill-primary-400 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-300">Synchronizing Live Node Data</span>
                    </div>

                    <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                        Target Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 animate-gradient-x">Destination</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-slate-400 font-bold max-w-2xl mx-auto mb-16 leading-relaxed">
                        Query the Mitron network for active journey signals and participate in optimized energy share flows.
                    </p>
                </div>
            </div>

            {/* High-End Search Console */}
            <div className="max-w-6xl w-full mx-auto px-4 -mt-36 relative z-20 mb-20 animate-slide-up">
                {appliedMessage && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce flex-nowrap whitespace-nowrap">
                        <Zap className="w-3 h-3 fill-white" /> {appliedMessage}
                    </div>
                )}
                
                <form onSubmit={handleFormSubmit} className="glass-panel !p-4 flex flex-col gap-6 shadow-3xl border-white/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                        <div className="flex items-center bg-white/40 border border-slate-100 rounded-[2rem] px-6 py-4 group focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:bg-white transition-all">
                            <MapPin className="text-slate-400 group-focus-within:text-primary-500 w-6 h-6 mr-4 shrink-0 transition-all group-focus-within:scale-110" />
                            <div className="w-full">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Pickup Location</label>
                                <input name="originName" value={searchParams.originName} onChange={handleChange} className="w-full bg-transparent focus:outline-none text-slate-900 font-black text-lg tracking-tight placeholder:text-slate-300" placeholder="Where from?" />
                            </div>
                        </div>

                        <div className="flex items-center bg-white/40 border border-slate-100 rounded-[2rem] px-6 py-4 group focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:bg-white transition-all">
                            <Navigation className="text-indigo-600 group-focus-within:text-primary-500 w-6 h-6 mr-4 shrink-0 transition-all group-focus-within:scale-110 transform rotate-45" />
                            <div className="w-full">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Destination</label>
                                <input name="destName" value={searchParams.destName} onChange={handleChange} className="w-full bg-transparent focus:outline-none text-slate-900 font-black text-lg tracking-tight placeholder:text-slate-300" placeholder="Where to?" />
                            </div>
                        </div>

                        <div className="flex items-center bg-white/40 border border-slate-100 rounded-[2rem] px-6 py-4 group focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:bg-white transition-all">
                            <CalendarIcon className="text-slate-400 group-focus-within:text-primary-500 w-6 h-6 mr-4 shrink-0" />
                            <div className="w-full">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Date</label>
                                <input type="date" name="date" value={searchParams.date} onChange={handleChange} className="bg-transparent focus:outline-none text-slate-900 font-black w-full text-lg cursor-pointer" />
                            </div>
                        </div>

                        <div className="flex items-center bg-white/40 border border-slate-100 rounded-[2rem] px-6 py-4 group focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:bg-white transition-all">
                            <Users className="text-slate-400 group-focus-within:text-primary-500 w-6 h-6 mr-4 shrink-0" />
                            <div className="w-full">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Required Seats</label>
                                <select 
                                    name="seats" 
                                    value={searchParams.seats} 
                                    onChange={handleChange} 
                                    className="bg-transparent focus:outline-none text-slate-900 font-black w-full text-lg cursor-pointer appearance-none"
                                >
                                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s} Seats</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button 
                            type="button" 
                            onClick={handleApply}
                            disabled={loading} 
                            className="bg-primary-600 hover:bg-primary-500 text-white rounded-full py-5 px-16 font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 min-w-[300px]"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>DISPATCH QUERY <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl w-full mx-auto px-6 pb-32 animate-fade-in">

                {error && (
                    <div className="max-w-3xl mx-auto mb-10 bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center gap-6 text-red-600 shadow-sm animate-shake">
                        <div className="bg-red-100 p-4 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Grid Protocol Error</p>
                            <p className="font-bold">{error}</p>
                        </div>
                    </div>
                )}

                {hasSearched && !error && (
                    <div className="flex items-center justify-between mb-12 px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-primary-600 rounded-full"></div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                                Available Streams
                            </h2>
                            {rides.length > 0 && <span className="bg-primary-50 text-primary-600 text-xs py-1.5 px-4 rounded-full font-black tracking-widest uppercase border border-primary-100">{rides.length} MATCHES</span>}
                        </div>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95">
                            <Filter className="w-4 h-4" /> Refine Search
                        </button>
                    </div>
                )}

                {hasSearched && rides.length === 0 && !loading && !error && (
                    <div className="glass-panel p-20 flex flex-col items-center justify-center text-center max-w-3xl mx-auto shadow-2xl border-dashed border-2 bg-transparent">
                        <div className="bg-slate-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-inner mb-10 group">
                            <Globe className="w-12 h-12 text-slate-300 group-hover:text-primary-500 transition-colors group-hover:animate-spin-slow" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Zero Signals Detected</h3>
                        <p className="text-slate-500 font-bold max-w-md pb-10 border-b border-slate-100 w-full mb-10 leading-relaxed uppercase text-[11px] tracking-widest">
                            No active journey markers matched your vector query. Consider adjusting your coordinate parameters.
                        </p>

                        <div className="space-y-6 w-full">
                            <p className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Or be the signal yourself</p>
                            <button onClick={() => window.location.href = '/post-ride'} className="btn-primary flex items-center justify-center gap-4 py-6 px-12 group mx-auto !w-auto">
                                DISPATCH NEW JOURNEY <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {hasSearched && !error && rideList}
                </div>
            </div>
        </div>
    );
}
