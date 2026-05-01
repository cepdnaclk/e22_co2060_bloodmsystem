import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth/useAuth';

/**
 * RoleRoute – protects a route by both authentication AND role.
 *
 * Usage:
 *   <RoleRoute allowedRoles={['adminDashboard', 'doctor']}>
 *       <DoctorDashboard />
 *   </RoleRoute>
 *
 * • If not logged in  → redirect to /login (preserves intended path)
 * • If logged in but wrong role → redirect to /unauthorized
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    /* Still loading auth state from localStorage */
    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    /* Not logged in at all */
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    /* Logged in but role not in the allowed list */
    const userRole = user?.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleRoute;
