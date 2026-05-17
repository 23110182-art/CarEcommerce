import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { HomePage } from '../pages/HomePage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import CarsPage from '../pages/CarsPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/brands" element={<div style={{ padding: 40, textAlign: 'center' }}>Brands Page (Coming Soon)</div>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="cars" element={<div>Cars Management</div>} />
        <Route path="brands" element={<div>Brands Management</div>} />
        <Route path="users" element={<div>Users Management</div>} />
      </Route>
    </Routes>
  );
};
