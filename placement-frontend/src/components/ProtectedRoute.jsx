import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { Spinner } from './UI';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
      <Spinner />
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (roles && !roles.includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-red-100 items-center justify-center mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
          <p className="text-slate-500 mt-2">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }
  
  return <Layout>{children}</Layout>;
}
