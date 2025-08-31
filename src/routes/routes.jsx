import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import CategoryServices from "../pages/services/CategoryServices";
import AdminLayout from "../pages/Admin/AdminLayout";
import ServicesPage from "../pages/Admin/categories/ServicesPage";
import CategoriesPage from "../pages/Admin/categories/CategoriesPage";
import BannersPage from "../pages/Admin/addbanner/BannersPage";
import AdminBookingOrders from "../pages/Admin/bookings/AdminBookingOrders";
import BookingDetails from "../pages/Admin/bookings/BookingDetails";
import CartPage from "../pages/cart/CartPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import PaymentPage from "../pages/payment/PaymentPage";
import Navbar from "../components/Navbar";
import ProfilePage from "../pages/profile/ProfilePage";
import UserBookingDetails from "../pages/profile/UserBookingDetails"; // create this page for user-side booking
import AdminEmployees from "../pages/Admin/employee/AdminEmployees";
import SuccessPage from "../pages/payment/SuccessPage";

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
      {/* Public Routes with Navbar */}
      <Route path="/" element={<WithNavbar><Home /></WithNavbar>} />
      <Route path="/home" element={<WithNavbar><Home /></WithNavbar>} />
      <Route path="/category/:id" element={<WithNavbar><CategoryServices /></WithNavbar>} />
      <Route path="/category" element={<WithNavbar><CategoryServices /></WithNavbar>} />
      <Route path="/cart" element={<WithNavbar><CartPage /></WithNavbar>} />
      <Route path="/checkout" element={<WithNavbar><CheckoutPage /></WithNavbar>} />
      <Route path="/payment" element={<WithNavbar><PaymentPage /></WithNavbar>} />
      <Route path="/profile" element={<WithNavbar><ProfilePage/></WithNavbar>} />
      <Route path="/profile/bookings/:id" element={<WithNavbar><UserBookingDetails/></WithNavbar>} />

      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/success" element={<SuccessPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="employee" element={<AdminEmployees />} />
        <Route path="bookings" element={<AdminBookingOrders />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<WithNavbar><p style={{ textAlign: "center", marginTop: "2rem" }}>Page Not Found</p></WithNavbar>} />
    </Routes>
  );
}
