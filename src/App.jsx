import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { CartProvider } from "./context/CartContext"; // ✅ import provider

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </CartProvider>
  );
}
