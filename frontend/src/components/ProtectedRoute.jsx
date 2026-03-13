import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ adminOnly = false }) {
    const { user, token, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
