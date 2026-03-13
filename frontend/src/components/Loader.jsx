import { Loader2 } from 'lucide-react';

export default function Loader({ fullScreen = true }) {
    return (
        <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-[80vh]' : 'h-full w-full py-12'}`}>
            <div className="relative">
                {/* Glowing background behind spinner */}
                <div className="absolute inset-0 bg-primary-400 blur-xl opacity-20 rounded-full"></div>

                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-primary-500/10 border border-slate-100 relative z-10 backdrop-blur-md">
                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                </div>
            </div>
            <p className="text-primary-600 font-bold mt-6 tracking-widest text-sm uppercase animate-pulse">Loading securely...</p>
        </div>
    );
}
