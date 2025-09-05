import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; 
import { PartnerAuthProvider } from "./hooks/usePartnerAuth.jsx"; // ✅ add this

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PartnerAuthProvider>   {/* ✅ wrap here */}
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PartnerAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}
