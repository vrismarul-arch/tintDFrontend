import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PartnerRoute from "./PartnerRoute";

import Home from "../pages/home/Home";
import CategoryServices from "../pages/services/CategoryServices";
import Navbar from "../components/Navbar";
import NotFoundPage from "../pages/NotFoundPage";

// User Pages
import CartPage from "../pages/cart/CartPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import PaymentPage from "../pages/payment/PaymentPage";
import ProfilePage from "../pages/profile/ProfilePage";
import UserBookingDetails from "../pages/profile/UserBookingDetails";
import SuccessPage from "../pages/payment/SuccessPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import BookingHistoryPage from "../pages/profile/BookingHistoryPage";

// Admin Pages
import AdminLayout from "../pages/Admin/AdminLayout";
import ServicesPage from "../pages/Admin/categories/ServicesPage";
import CategoriesPage from "../pages/Admin/categories/CategoriesPage";
import BannersPage from "../pages/Admin/addbanner/BannersPage";
import AdminBookingOrders from "../pages/Admin/bookings/AdminBookingOrders";
import BookingDetails from "../pages/Admin/bookings/BookingDetails";
import AdminProfile from "../pages/Admin/profile/AdminProfile";
import AdminPartnersPage from "../pages/Admin/partner/AdminPartnersPage";
import AdminPartnerDetailPage from "../pages/Admin/partner/AdminPartnerDetailPage";
import AdminDashboard from "../pages/Admin/dashbord/AdminDashboard";

// Partner Pages
import PartnerLayout from "../pages/partner/layout/PartnerLayout";
import PartnerRegisterForm from "../pages/partner/home/PartnerRegisterForm";
import Sendotp from "../pages/partner/otp/Sendotp";
import VerifyOTP from "../pages/partner/otp/VerifyOTP";
import PartnerLoginPage from "../pages/partner/login/PartnerLoginPage";

import PartnerAppLayout from "../pages/partner/layout/PartnerAppLayout";
import PartnerDashboard from "../pages/partner/dashboard/PartnerDashboard";
import PartnerProfile from "../pages/partner/home/profile/PartnerProfile";
import PartnerNotifications from "../pages/partner/notification/PartnerNotifications";
import PartnerMessages from "../pages/partner/notification/PartnerMessages";
import PartnerOrderHistory from "../pages/partner/home/history/PartnerOrderHistory";

// Policy Pages
import RefundPolicy from "../pages/policies/RefundPolicy";
import PrivacyPolicy from "../pages/policies/PrivacyPolicy";
import TermsConditions from "../pages/policies/TermsConditions";
import PartnerHome from "../pages/partner/home/main/PartnerHome";

function WithNavbarFooter({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<WithNavbarFooter><Home /></WithNavbarFooter>} />
      <Route path="/home" element={<WithNavbarFooter><Home /></WithNavbarFooter>} />
      <Route path="/category/:id" element={<WithNavbarFooter><CategoryServices /></WithNavbarFooter>} />
      <Route path="/booking-history" element={<WithNavbarFooter><BookingHistoryPage /></WithNavbarFooter>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/success" element={<SuccessPage />} />

      {/* Policy Pages */}
      <Route path="/refund-policy" element={<WithNavbarFooter><RefundPolicy /></WithNavbarFooter>} />
      <Route path="/privacy-policy" element={<WithNavbarFooter><PrivacyPolicy /></WithNavbarFooter>} />
      <Route path="/terms-conditions" element={<WithNavbarFooter><TermsConditions /></WithNavbarFooter>} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<WithNavbarFooter><CartPage /></WithNavbarFooter>} />
        <Route path="/checkout" element={<WithNavbarFooter><CheckoutPage /></WithNavbarFooter>} />
        <Route path="/payment" element={<WithNavbarFooter><PaymentPage /></WithNavbarFooter>} />
        <Route path="/profile" element={<WithNavbarFooter><ProfilePage /></WithNavbarFooter>} />
        <Route path="/profile/bookings/:id" element={<WithNavbarFooter><UserBookingDetails /></WithNavbarFooter>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="profile" element={<AdminProfile />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="partners/:id" element={<AdminPartnerDetailPage />} />
        <Route path="bookings" element={<AdminBookingOrders />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
      </Route>

      {/* Partner Routes */}
    <Route path="/partner" element={<PartnerLayout />}>
    <Route index element={<PartnerHome />} />  {/* Accesses PartnerHome at /partner */}
    <Route path="register" element={<PartnerRegisterForm />} />
    <Route path="sendotp" element={<Sendotp />} />
    <Route path="verifyotp" element={<VerifyOTP />} />
    <Route path="login" element={<PartnerLoginPage />} />
</Route>

      <Route path="/partnerapp" element={<PartnerAppLayout />}>
        <Route element={<PartnerRoute />}>
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="profile" element={<PartnerProfile />} />
          <Route path="order-history" element={<PartnerOrderHistory />} />
          <Route path="notifications" element={<PartnerNotifications />} />
          <Route path="messages" element={<PartnerMessages />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
