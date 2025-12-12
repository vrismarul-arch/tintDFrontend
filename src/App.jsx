import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext"; 
import { PartnerAuthProvider } from "./hooks/usePartnerAuth.jsx"; 

// Import the loader
import BeautyLoader from "./components/loader/BeautyLoader";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Loader runs for 2 seconds (change if needed)
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <PartnerAuthProvider>   
          {loading ? (
            <BeautyLoader duration={2} onFinish={() => setLoading(false)} />
          ) : (
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          )}
        </PartnerAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}
