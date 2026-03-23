import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import { CartProvider }   from './context/CartContext';
import { useAuth }        from './context/AuthContext';
import Navbar             from './components/Navbar';
import ProtectedRoute     from './components/ProtectedRoute';
import AdminRoute         from './components/AdminRoute';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import RestaurantListPage from './pages/RestaurantListPage';
import MenuPage           from './pages/MenuPage';
import CartPage           from './pages/CartPage';
import OrdersPage         from './pages/OrdersPage';
import ProfilePage        from './pages/ProfilePage';
import AdminPage          from './pages/admin/AdminPage';

// Smart default redirect based on role
function DefaultRedirect() {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isAdmin)     return <Navigate to="/admin" replace />;
  return <Navigate to="/restaurants" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer routes */}
            <Route path="/restaurants" element={
              <ProtectedRoute><RestaurantListPage /></ProtectedRoute>
            } />
            <Route path="/menu/:restaurantId" element={
              <ProtectedRoute><MenuPage /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute><CartPage /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><OrdersPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Admin route */}
            <Route path="/admin" element={
              <AdminRoute><AdminPage /></AdminRoute>
            } />

            {/* Default redirect */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;