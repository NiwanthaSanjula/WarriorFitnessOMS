import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {

    const { user, loading } = useAuth();

    if (loading) return <div className='h-screen bg-warrior-dark flex items-center justify-center text-gray-300'>Loading...</div>

    // Not logged in? Back to login
    if (!user) return <Navigate to="/login" replace />;
    
    //  Logged in but wrong role? Back to their default dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return < Navigate to="/" replace />;
    }
        
    return < Outlet/>
}

export default ProtectedRoute
