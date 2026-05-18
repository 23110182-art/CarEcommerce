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
import { ProfilePage } from '../pages/ProfilePage';
import { CarDetailsPage } from '../pages/CarDetailsPage';
import CarsManagementPage from '../pages/admin/CarsManagementPage';
import BrandsManagementPage from '../pages/admin/BrandsManagementPage';
import BannersManagementPage from '../pages/admin/BannersManagementPage';
import UsersManagementPage from '../pages/admin/UsersManagementPage';
import PromotionsManagementPage from '../pages/admin/PromotionsManagementPage';

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
        <Route path="/cars/:idOrSlug" element={<CarDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/brands" element={<div style={{ padding: 40, textAlign: 'center' }}>Brands Page (Coming Soon)</div>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="cars" element={<CarsManagementPage />} />
        <Route path="brands" element={<BrandsManagementPage />} />
        <Route path="banners" element={<BannersManagementPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="promotions" element={<PromotionsManagementPage />} />
      </Route>
    </Routes>
  );
};
