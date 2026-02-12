import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const adminData = JSON.parse(localStorage.getItem("admin"));

    return adminData && adminData.token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
