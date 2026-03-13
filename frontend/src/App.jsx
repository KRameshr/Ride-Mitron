import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';

// Lazy load pages for module-shift performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PostRide = lazy(() => import('./pages/PostRide'));
const SearchRide = lazy(() => import('./pages/SearchRide'));
const RideDetails = lazy(() => import('./pages/RideDetails'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function AppContent() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col font-sans animated-bg-gradient text-gray-900 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden relative">
            {/* High-Performance Optimized Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#fafafa]">
                {/* Fixed Surface Layer - Zero repaint cost */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                
                {/* Lightweight Animated Light Nodes - Uses hardware acceleration */}
                <div className="ambient-orb w-[60vw] h-[60vw] bg-primary-400/20 -top-[20%] -left-[10%]"></div>
                <div className="ambient-orb w-[50vw] h-[50vw] bg-indigo-400/20 bottom-[10%] -right-[10%]" style={{ animationDelay: '-4s' }}></div>
                <div className="ambient-orb w-[40vw] h-[40vw] bg-purple-400/20 top-[40%] left-[30%]" style={{ animationDelay: '-8s' }}></div>

                {/* Subtle static gradient overlay (Replaces expensive video/blur) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-transparent to-white/40"></div>
                <div className="absolute inset-0 backdrop-blur-[4px]"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen flex-grow">
                {!isAuthPage && <Navbar />}

                <main className={`flex-grow relative ${!isAuthPage ? 'container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12' : ''}`}>
                    <Suspense fallback={<Loader />}>
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
                    </Suspense>
                </main>
            </div>
        </div>
    );
}

function App() {
    return <AppContent />;
}

export default App;
