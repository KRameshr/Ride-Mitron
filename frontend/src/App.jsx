import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostRide from './pages/PostRide';
import SearchRide from './pages/SearchRide';
import RideDetails from './pages/RideDetails';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col font-sans animated-bg-gradient text-gray-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden relative">
            {/* Premium Cinematic Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#fafafa]">
                {/* Dynamic Surface Layer */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply"></div>
                
                {/* Advanced Light Nodes */}
                <div className="ambient-orb w-[60vw] h-[60vw] bg-primary-400/10 -top-[20%] -left-[10%] blur-[120px]"></div>
                <div className="ambient-orb w-[50vw] h-[50vw] bg-indigo-400/10 bottom-[10%] -right-[10%] blur-[120px]" style={{ animationDelay: '-4s' }}></div>
                <div className="ambient-orb w-[40vw] h-[40vw] bg-purple-400/10 top-[40%] left-[30%] blur-[150px]" style={{ animationDelay: '-8s' }}></div>

                {/* High-End Cinematic Backdrop */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.04] grayscale contrast-125"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-cars-on-a-highway-at-night-34531-large.mp4" type="video/mp4" />
                </video>
                
                {/* Sophisticated Glass Overlay */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[6px]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen flex-grow">
                {!isAuthPage && <Navbar />}

                <main className={`flex-grow relative ${!isAuthPage ? 'container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12' : ''}`}>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/post-ride" element={<PostRide />} />
                            <Route path="/search-ride" element={<SearchRide />} />
                            <Route path="/ride/:id" element={<RideDetails />} />
                            <Route path="/admin" element={<AdminPanel />} />
                        </Route>
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function App() {
    return <AppContent />;
}

export default App;
