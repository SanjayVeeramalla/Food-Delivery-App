import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

function MenuPage() {
  const { restaurantId }            = useParams();
  const [menu, setMenu]             = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const { addItem, decreaseQty, cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const restRes = await api.get(
          `/api/restaurants/${restaurantId}`);
        setRestaurant(restRes.data);

        try {
          const menuRes = await api.get(
            `/api/restaurants/${restaurantId}/menu`);
          setMenu(menuRes.data);
        } catch (menuErr) {
          setMenu([]);
        }

      } catch (err) {
        if (err.response?.status === 404) {
          setError('Restaurant not found.');
        } else {
          setError('Failed to load menu. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  const getCartQty = (itemId) => {
    const found = cartItems.find((i) => i.menuItemId === itemId);
    return found ? found.quantity : 0;
  };

  const handleAdd = (item) => {
    addItem({
      menuItemId: item.id,
      itemName:   item.name,
      unitPrice:  item.price,
    }, parseInt(restaurantId));
  };

  const handleDecrease = (item) => {
    decreaseQty(item.id);
  };

  if (loading) return (
    <div className="page-center">Loading menu...</div>
  );

  if (error) return (
    <div className="page">
      <div className="error-message">{error}</div>
      <button
        className="btn-primary"
        style={{ width: 'auto', padding: '10px 24px', marginTop: '16px' }}
        onClick={() => navigate('/restaurants')}
      >
        Back to Restaurants
      </button>
    </div>
  );

  return (
    <div className="page">
      {restaurant && (
        <div className="menu-header">
          <h2>{restaurant.name}</h2>
          <p>{restaurant.cuisineType} - {restaurant.address}</p>
        </div>
      )}

      {menu.length === 0 ? (
        <div className="menu-empty">
          <p>Menu coming soon.</p>
          <p style={{
            fontSize: '13px', color: '#aaa', marginTop: '6px'
          }}>
            This restaurant has not added menu items yet.
          </p>
        </div>
      ) : (
        <div className="menu-grid">
          {menu.map((item) => {
            const qty = getCartQty(item.id);
            return (
              <div key={item.id} className="menu-card">
                <img
                  src={item.imageUrl || DEFAULT_IMAGE}
                  alt={item.name}
                  className="menu-card-image"
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                />
                <div className="menu-card-body">
                  <div className="menu-card-info">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <span className="item-category">
                      {item.category}
                    </span>
                  </div>
                  <div className="menu-card-footer">
                    <span className="item-price">
                      Rs. {item.price}
                    </span>
                    {qty === 0 ? (
                      <button
                        className="btn-add"
                        onClick={() => handleAdd(item)}
                      >
                        Add
                      </button>
                    ) : (
                      <div className="menu-qty-control">
                        <button
                          className="menu-qty-btn"
                          onClick={() => handleDecrease(item)}
                        >
                          -
                        </button>
                        <span className="menu-qty-value">{qty}</span>
                        <button
                          className="menu-qty-btn"
                          onClick={() => handleAdd(item)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MenuPage;