import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AuthGuard = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (!user || !isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export const GuestGuard = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (user && isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
