import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";

function ProtectedRoute({children}) {

const [isChecking, setIsChecking] = useState(true);
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  let mounted = true;

  const checkAuth = async () => {
    try {
      await API.get("/auth/me");
      if (mounted) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      if (mounted) {
        setIsAuthenticated(false);
      }
    } finally {
      if (mounted) {
        setIsChecking(false);
      }
    }
  };

  checkAuth();

  return () => {
    mounted = false;
  };
}, []);

if (isChecking) {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-300">
      Checking session...
    </div>
  );
}

if(!isAuthenticated){
  return <Navigate to="/" replace />
}

return children;
}

export default ProtectedRoute;
