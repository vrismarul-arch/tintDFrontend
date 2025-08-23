import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext"; // ✅ import provider

export default function App() {
  return (
    <CartProvider>  {/* ✅ wrap everything */}
      <BrowserRouter>
        <Navbar />
        <AppRoutes />
      </BrowserRouter>
    </CartProvider>
  );
}
