import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import PartnerRoute from "./PartnerRoute";

import Home from "../pages/home/Home";
import CategoryServices from "../pages/services/CategoryServices";
import Navbar from "../components/Navbar";
import NotFoundPage from "../pages/NotFoundPage";

import CartPage from "../pages/cart/CartPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import PaymentPage from "../pages/payment/PaymentPage";
import ProfilePage from "../pages/profile/ProfilePage";
import UserBookingDetails from "../pages/profile/UserBookingDetails";
import SuccessPage from "../pages/payment/SuccessPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";


import AdminLayout from "../pages/Admin/AdminLayout";
import ServicesPage from "../pages/Admin/categories/ServicesPage";
import CategoriesPage from "../pages/Admin/categories/CategoriesPage";
import BannersPage from "../pages/Admin/addbanner/BannersPage";
import AdminBookingOrders from "../pages/Admin/bookings/AdminBookingOrders";
import BookingDetails from "../pages/Admin/bookings/BookingDetails";
import AdminProfile from "../pages/Admin/profile/AdminProfile";
import AdminPartnersPage from "../pages/Admin/partner/AdminPartnersPage";

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
import BookingHistoryPage from "../pages/profile/BookingHistoryPage";

function WithNavbar({ children }) {
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
      <Route path="/" element={<WithNavbar><Home /></WithNavbar>} />
      <Route path="/home" element={<WithNavbar><Home /></WithNavbar>} />
      <Route path="/category/:id" element={<WithNavbar><CategoryServices /></WithNavbar>} />
      <Route path="/category" element={<WithNavbar><CategoryServices /></WithNavbar>} />
      <Route path="/booking-history" element={<WithNavbar><BookingHistoryPage /></WithNavbar>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/success" element={<SuccessPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<WithNavbar><CartPage /></WithNavbar>} />
        <Route path="/checkout" element={<WithNavbar><CheckoutPage /></WithNavbar>} />
        <Route path="/payment" element={<WithNavbar><PaymentPage /></WithNavbar>} />
        <Route path="/profile" element={<WithNavbar><ProfilePage /></WithNavbar>} />
        <Route path="/profile/bookings/:id" element={<WithNavbar><UserBookingDetails /></WithNavbar>} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="profile" element={<AdminProfile />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="bookings" element={<AdminBookingOrders />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
      </Route>

      <Route path="/partner" element={<PartnerLayout />}>
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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
