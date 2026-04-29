import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import ScrollToTop from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

const Shop = lazy(() => import("./pages/Shop"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Collabs = lazy(() => import("./pages/Collabs"));
const Policies = lazy(() => import("./pages/Policies"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const ProtectedAdminRoute = lazy(() => import("./components/ProtectedAdminRoute"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Lembrancas = lazy(() => import("./pages/Lembrancas"));
const BorrifadoresPage = lazy(() => import("./pages/BorrifadoresPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — avoid refetching on every mount
      gcTime: 1000 * 60 * 10,     // 10 min garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <CartProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<div className="min-h-screen" style={{ background: '#fcf5e0' }} />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/colecoes" element={<Shop />} />
                <Route path="/colecoes/:slug" element={<CollectionPage />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/collabs" element={<Collabs />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<Admin />} />
                </Route>
                <Route path="/lembrancas" element={<Lembrancas />} />
                <Route path="/borrifadores" element={<BorrifadoresPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
