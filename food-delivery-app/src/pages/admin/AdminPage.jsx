import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

function AdminPage() {
  const [restaurants, setRestaurants]         = useState([]);
  const [selectedRestaurant, setSelected]     = useState(null);
  const [menuItems, setMenuItems]             = useState([]);
  const [activeTab, setActiveTab]             = useState('restaurants');
  const [message, setMessage]                 = useState('');
  const [error, setError]                     = useState('');

  const [restForm, setRestForm] = useState({
    name: '', cuisineType: '', address: '', rating: ''
  });

  const [menuForm, setMenuForm] = useState({
    name: '', description: '', price: '',
    category: '', isAvailable: true, imageUrl: ''
  });

  useEffect(() => { loadRestaurants(); }, []);

  const loadRestaurants = async () => {
    try {
      const res = await api.get('/api/restaurants');
      setRestaurants(res.data);
    } catch {
      setError('Failed to load restaurants.');
    }
  };

  const loadMenu = async (restaurantId) => {
    try {
      const res = await api.get(
        `/api/restaurants/${restaurantId}/menu`);
      setMenuItems(res.data);
    } catch {
      setMenuItems([]);
    }
  };

  const handleSelectRestaurant = (r) => {
    setSelected(r);
    setActiveTab('menu');
    loadMenu(r.id);
    setMessage('');
    setError('');
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await api.post('/api/restaurants', {
        name:        restForm.name,
        cuisineType: restForm.cuisineType,
        address:     restForm.address,
        rating:      parseFloat(restForm.rating) || 0,
      });
      setMessage('Restaurant added successfully.');
      setRestForm({ name:'', cuisineType:'', address:'', rating:'' });
      loadRestaurants();
    } catch {
      setError('Failed to add restaurant.');
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await api.post(
        `/api/restaurants/${selectedRestaurant.id}/menu`, {
        name:        menuForm.name,
        description: menuForm.description,
        price:       parseFloat(menuForm.price),
        category:    menuForm.category,
        isAvailable: menuForm.isAvailable,
        imageUrl:    menuForm.imageUrl || null,
      });
      setMessage('Menu item added successfully.');
      setMenuForm({
        name:'', description:'', price:'',
        category:'', isAvailable: true, imageUrl:''
      });
      loadMenu(selectedRestaurant.id);
    } catch {
      setError('Failed to add menu item.');
    }
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    if (!window.confirm('Remove this menu item?')) return;
    try {
      await api.delete(
        `/api/restaurants/${selectedRestaurant.id}/menu/${menuItemId}`
      );
      setMessage('Menu item removed.');
      loadMenu(selectedRestaurant.id);
    } catch {
      setError('Failed to remove menu item.');
    }
  };

  return (
    <div className="page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error   && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'restaurants' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('restaurants');
            setMessage(''); setError('');
          }}
        >
          All Restaurants
        </button>
        <button
          className={activeTab === 'add-restaurant' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('add-restaurant');
            setMessage(''); setError('');
          }}
        >
          Add Restaurant
        </button>
        {selectedRestaurant && (
          <button
            className={activeTab === 'menu' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('menu')}
          >
            Menu — {selectedRestaurant.name}
          </button>
        )}
      </div>

      {/* Restaurants list */}
      {activeTab === 'restaurants' && (
        <div className="admin-section">
          <p className="admin-hint">
            Click Manage Menu to add or remove items.
          </p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Cuisine</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.cuisineType}</td>
                  <td>{r.address}</td>
                  <td>{r.rating}</td>
                  <td>
                    <button
                      className="btn-manage"
                      onClick={() => handleSelectRestaurant(r)}
                    >
                      Manage Menu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add restaurant */}
      {activeTab === 'add-restaurant' && (
        <div className="admin-section">
          <h3>Add New Restaurant</h3>
          <form onSubmit={handleAddRestaurant}
            className="admin-form">
            <div className="form-group">
              <label>Restaurant Name</label>
              <input
                type="text"
                value={restForm.name}
                onChange={(e) =>
                  setRestForm({ ...restForm, name: e.target.value })}
                placeholder="e.g. Ariya Nivaas"
                required
              />
            </div>
            <div className="form-group">
              <label>Cuisine Type</label>
              <input
                type="text"
                value={restForm.cuisineType}
                onChange={(e) =>
                  setRestForm({
                    ...restForm, cuisineType: e.target.value })}
                placeholder="e.g. Kerala Vegetarian"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={restForm.address}
                onChange={(e) =>
                  setRestForm({
                    ...restForm, address: e.target.value })}
                placeholder="e.g. Killipalam, Trivandrum"
              />
            </div>
            <div className="form-group">
              <label>Rating (0 to 5)</label>
              <input
                type="number"
                step="0.1" min="0" max="5"
                value={restForm.rating}
                onChange={(e) =>
                  setRestForm({
                    ...restForm, rating: e.target.value })}
                placeholder="e.g. 4.2"
              />
            </div>
            <button type="submit" className="btn-primary">
              Add Restaurant
            </button>
          </form>
        </div>
      )}

      {/* Menu management */}
      {activeTab === 'menu' && selectedRestaurant && (
        <div className="admin-section">
          <h3>Menu — {selectedRestaurant.name}</h3>

          {menuItems.length === 0 ? (
            <p className="admin-hint">
              No menu items yet. Add one below.
            </p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>Rs. {item.price}</td>
                    <td>{item.isAvailable ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        className="btn-remove"
                        onClick={() =>
                          handleDeleteMenuItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 style={{ marginTop: '28px' }}>Add Menu Item</h3>
          <form onSubmit={handleAddMenuItem} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, name: e.target.value })}
                  placeholder="e.g. Butter Chicken"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={menuForm.category}
                  onChange={(e) =>
                    setMenuForm({
                      ...menuForm, category: e.target.value })}
                  placeholder="e.g. Main Course"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={menuForm.description}
                onChange={(e) =>
                  setMenuForm({
                    ...menuForm, description: e.target.value })}
                placeholder="Short description"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (Rs.)</label>
                <input
                  type="number" min="1"
                  value={menuForm.price}
                  onChange={(e) =>
                    setMenuForm({
                      ...menuForm, price: e.target.value })}
                  placeholder="e.g. 280"
                  required
                />
              </div>
              <div className="form-group">
                <label>Available</label>
                <select
                  value={menuForm.isAvailable}
                  onChange={(e) =>
                    setMenuForm({
                      ...menuForm,
                      isAvailable: e.target.value === 'true'
                    })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input
                type="text"
                value={menuForm.imageUrl}
                onChange={(e) =>
                  setMenuForm({
                    ...menuForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <button type="submit" className="btn-primary">
              Add Menu Item
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminPage;