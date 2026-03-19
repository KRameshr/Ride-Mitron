import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ShieldCheck, Zap, Lock, Unlock, Phone, Star, Send, X, ArrowRight, Loader2, Info, User, CheckCircle } from 'lucide-react';
import { agzAPI } from '../api/agzApi';
import { useAuth } from '../context/AuthContext';

export default function AntiGravityZone({ requestId, onClose }) {
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    const stages = ['MATCHED', 'CHATTING', 'CONFIRMED', 'PAID', 'UNLOCKED'];
    
    const fetchSession = async () => {
        try {
            const { data } = await agzAPI.getSession(requestId);
            setSession(data);
            if (data) fetchMessages(data._id);
        } catch (err) {
            console.error("Failed to fetch AGZ session", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const { data } = await agzAPI.getChatMessages(sessionId);
            setMessages(data);
        } catch (err) {
            console.error("Failed to fetch chat", err);
        }
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(() => {
            if (session?._id) fetchMessages(session._id);
            if (session?.currentStage !== 'UNLOCKED') agzAPI.syncStatus(requestId).then(({data}) => setSession(data));
        }, 3000);
        return () => clearInterval(interval);
    }, [requestId, session?._id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;
        setSending(true);
        try {
            await agzAPI.sendChatMessage({ sessionId: session._id, content: newMessage });
            setNewMessage('');
            fetchMessages(session._id);
        } catch (err) {
            console.error("Send failed", err);
        } finally {
            setSending(false);
        }
    };

    const handleConfirm = async () => {
        try {
            const { data } = await agzAPI.confirmInterest(requestId);
            setSession(data);
        } catch (err) {
            alert("Confirmation failed");
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
    );

    const isRider = user._id === session?.rideRequest?.passenger?._id;
    const partner = isRider ? session?.rideRequest?.ride?.driver : session?.rideRequest?.passenger;
    const currentStageIndex = stages.indexOf(session?.currentStage || 'MATCHED');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl p-2 sm:p-6"
        >
            <div className="relative w-full max-w-5xl h-[95vh] sm:h-[90vh] bg-white/[0.03] border border-white/10 rounded-3xl sm:rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-3xl">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left Sidebar: Flow Tracking & Trust */}
                <div className="w-full lg:w-[350px] bg-white/[0.02] border-r border-white/5 p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white">Anti-Gravity Zone</h2>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Secure Interaction Layer</p>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="space-y-6">
                            {stages.map((stage, idx) => (
                                <div key={stage} className={`flex items-start gap-4 transition-all ${idx <= currentStageIndex ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                                    <div className="relative flex flex-col items-center">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${idx <= currentStageIndex ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-700 text-slate-700'}`}>
                                            {idx < currentStageIndex ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        {idx < stages.length - 1 && <div className={`w-0.5 h-10 mt-1 ${idx < currentStageIndex ? 'bg-primary-500' : 'bg-slate-800'}`}></div>}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{stage}</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">
                                            {stage === 'MATCHED' && 'Initial sync detected'}
                                            {stage === 'CHATTING' && 'Protocol communication open'}
                                            {stage === 'CONFIRMED' && 'Commitment phase'}
                                            {stage === 'PAID' && 'Settlement verified'}
                                            {stage === 'UNLOCKED' && 'Direct link established'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Block */}
                    <div className="bg-primary-600/5 border border-primary-500/10 rounded-3xl p-6 mt-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                                {partner?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-white uppercase text-sm tracking-tight">{partner?.name}</p>
                                <div className="flex items-center gap-1.5 text-amber-500">
                                    <Star className="w-3 h-3 fill-amber-500" />
                                    <span className="text-[10px] font-black">{partner?.rating || '5.0'}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">
                            Verified peer journey participant. Complete this flow within the platform for 100% claim protection.
                        </p>
                    </div>
                </div>

                {/* Main Content Area: Chat & Actions */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between ">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <Zap className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Live Connection Matrix</h3>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Encrypted Stream</span>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <MessageSquare className="w-12 h-12 text-slate-500" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Channel initialized. Start syncing.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${msg.sender._id === user._id ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white/5 text-slate-200 border border-white/5 rounded-bl-none'}`}>
                                    {msg.content}
                                    <p className="text-[8px] opacity-40 mt-1 uppercase text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Stage Control / Actions */}
                    <div className="p-6 bg-white/[0.01] border-t border-white/5 space-y-6">
                        {session?.currentStage === 'MATCHED' || session?.currentStage === 'CHATTING' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                                    <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                                        Negotiate units and pickup details. Confirm commitment to proceed.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={isRider ? session.isRiderConfirmed : session.isDriverConfirmed}
                                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${ (isRider ? session.isRiderConfirmed : session.isDriverConfirmed) ? 'bg-slate-800 text-slate-500' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/20' }`}
                                >
                                    {(isRider ? session.isRiderConfirmed : session.isDriverConfirmed) ? 'Signal Sent' : 'Confirm Interest'} 
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : session?.currentStage === 'CONFIRMED' ? (
                            <div className="p-10 bg-primary-600/10 border border-primary-500/30 rounded-3xl text-center space-y-6">
                                <p className="text-xl font-black text-white uppercase tracking-tighter italic">Commitment Lock Required</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Proceed to payment to unlock direct contact link.</p>
                                <div className="flex justify-center">
                                    {isRider && !session.rideRequest.riderPaid ? (
                                        <p className="text-[10px] font-black text-primary-400 uppercase bg-primary-500/10 px-6 py-3 rounded-full border border-primary-500/20">
                                            Close this overlay and pay Rider Fee in Dashboard
                                        </p>
                                    ) : !isRider && !session.rideRequest.driverPaid ? (
                                        <p className="text-[10px] font-black text-primary-400 uppercase bg-primary-500/10 px-6 py-3 rounded-full border border-primary-500/20">
                                            Close this overlay and pay Driver Fee in Dashboard
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-3 text-emerald-500 animate-pulse">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="font-black text-xs uppercase tracking-widest">Waiting for peer settlement...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : session?.currentStage === 'UNLOCKED' ? (
                            <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center space-y-6">
                                <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-2xl shadow-emerald-500/40">
                                    <Unlock className="w-10 h-10" />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">Sync Link Unlocked</h4>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] font-mono leading-none">{partner?.phoneNumber}</p>
                                </div>
                                <a href={`tel:${partner?.phoneNumber}`} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-950/50">
                                    <Phone className="w-5 h-5 fill-white" /> Initiate Voice Comms
                                </a>
                            </div>
                        ) : null}

                        {/* Chat Input */}
                        {session?.currentStage !== 'UNLOCKED' && (
                            <form onSubmit={handleSendMessage} className="relative mt-4">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Execute text protocol..."
                                    className="w-full bg-white/5 border border-white/10 text-white p-6 rounded-2xl pr-20 focus:ring-4 focus:ring-primary-500/20 focus:outline-none placeholder:text-slate-600 text-sm font-medium transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary-600 hover:bg-primary-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
