import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const { cartItems }                   = useCart();
  const navigate                        = useNavigate();
  const location                        = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if current page is admin
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={isLoggedIn ? '/restaurants' : '/login'}>
          FoodHub
        </Link>
      </div>

      {isLoggedIn && (
        <div className="navbar-links">

          {isAdminPage ? (
            // Admin page navbar — only dashboard link and logout
            <>
              <Link to="/admin">Admin Dashboard</Link>
              <button onClick={handleLogout} className="btn-link">
                Logout
              </button>
            </>
          ) : (
            // Regular user navbar
            <>
              <Link to="/restaurants">Restaurants</Link>
              <Link to="/cart">Cart ({cartItems.length})</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/payments">Payments</Link> 
              <Link to="/profile">Profile</Link>
              {isAdmin && (
                <Link to="/admin">Admin</Link>
              )}
              <button onClick={handleLogout} className="btn-link">
                Logout
              </button>
            </>
          )}

        </div>
      )}
    </nav>
  );
}

export default Navbar;
