import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

function AdminPage() {
  const [restaurants, setRestaurants]         = useState([]);
  const [selectedRestaurant, setSelected]     = useState(null);
  const [menuItems, setMenuItems]             = useState([]);
  const [activeTab, setActiveTab]             = useState('restaurants');
  const [message, setMessage]                 = useState('');
  const [error, setError]                     = useState('');

   const [orders, setOrders] = useState([]);

  // Edit state
  const [editingItem, setEditingItem]         = useState(null);
  // editingItem holds the menu item currently being edited
  // null means no item is being edited

  const [editForm, setEditForm] = useState({
    name: '', description: '', price: '',
    category: '', isAvailable: true, imageUrl: ''
  });

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
        `/api/restaurants/${restaurantId}/menu/all`);
      setMenuItems(res.data);
    } catch {
      setMenuItems([]);
    }
  };

    const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/admin');
      setOrders(res.data);
    } catch {
      setError('Failed to load orders.');
    }
  };

  const handleSelectRestaurant = (r) => {
    setSelected(r);
    setActiveTab('menu');
    loadMenu(r.id);
    setMessage('');
    setError('');
    setEditingItem(null); // clear any active edit
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
      setRestForm({
        name: '', cuisineType: '', address: '', rating: ''
      });
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
        name: '', description: '', price: '',
        category: '', isAvailable: true, imageUrl: ''
      });
      loadMenu(selectedRestaurant.id);
    } catch {
      setError('Failed to add menu item.');
    }
  };

  // Called when Edit button is clicked on a menu item
  const handleEditClick = (item) => {
    setEditingItem(item);
    // Pre-fill the edit form with current values
    setEditForm({
      name:        item.name,
      description: item.description  || '',
      price:       item.price.toString(),
      category:    item.category     || '',
      isAvailable: item.isAvailable,
      imageUrl:    item.imageUrl     || ''
    });
    setMessage('');
    setError('');
  };

  // Called when Save button is clicked in edit form
  const handleEditSave = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    // Basic validation
    if (!editForm.name.trim()) {
      setError('Item name is required.');
      return;
    }
    if (!editForm.price || parseFloat(editForm.price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    try {
      await api.put(
        `/api/restaurants/${selectedRestaurant.id}` +
        `/menu/${editingItem.id}`,
        {
          name:        editForm.name.trim(),
          description: editForm.description.trim(),
          price:       parseFloat(editForm.price),
          category:    editForm.category.trim(),
          isAvailable: editForm.isAvailable,
          imageUrl:    editForm.imageUrl.trim() || null,
        }
      );
      setMessage(
        `${editForm.name} updated successfully.`);
      setEditingItem(null); // close edit form
      loadMenu(selectedRestaurant.id); // refresh list
    } catch {
      setError('Failed to update menu item.');
    }
  };

  // Called when Cancel button is clicked in edit form
  const handleEditCancel = () => {
    setEditingItem(null);
    setEditForm({
      name: '', description: '', price: '',
      category: '', isAvailable: true, imageUrl: ''
    });
    setError('');
  };

  const handleDeleteMenuItem = async (menuItemId) => {
    if (!window.confirm('Remove this menu item?')) return;
    setMessage(''); setError('');
    try {
      await api.delete(
        `/api/restaurants/${selectedRestaurant.id}` +
        `/menu/${menuItemId}`
      );
      setMessage('Menu item removed.');
      if (editingItem?.id === menuItemId) {
        setEditingItem(null); // close edit if deleted item was open
      }
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

      {message && (
        <div className="success-message">{message}</div>
      )}
      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'restaurants'
            ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('restaurants');
            setMessage(''); setError('');
            setEditingItem(null);
          }}
        >
          All Restaurants
        </button>
        <button
          className={activeTab === 'add-restaurant'
            ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('add-restaurant');
            setMessage(''); setError('');
            setEditingItem(null);
          }}
        >
          Add Restaurant
        </button>
         <button
          className={activeTab === 'orders' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('orders');
            loadOrders(); // 🔥 load orders
          }}
        >
          All Orders
        </button>
        {selectedRestaurant && (
          <button
            className={activeTab === 'menu'
              ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('menu')}
          >
            Menu — {selectedRestaurant.name}
          </button>
        )}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-section">
          <h3>All Orders</h3>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Restaurant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.userName}</td>
                    <td>{o.userEmail}</td>
                    <td>{o.restaurantName}</td>
                    <td>₹{o.totalAmount}</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.placedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* All Restaurants tab */}
      {activeTab === 'restaurants' && (
        <div className="admin-section">
          <p className="admin-hint">
            Click Manage Menu to add, edit, or remove items.
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
                      onClick={() =>
                        handleSelectRestaurant(r)}
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

      {/* Add Restaurant tab */}
      {activeTab === 'add-restaurant' && (
        <div className="admin-section">
          <h3>Add New Restaurant</h3>
          <form
            onSubmit={handleAddRestaurant}
            className="admin-form"
          >
            <div className="form-group">
              <label>Restaurant Name</label>
              <input
                type="text"
                value={restForm.name}
                onChange={(e) =>
                  setRestForm({
                    ...restForm, name: e.target.value })}
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

      {/* Menu Management tab */}
      {activeTab === 'menu' && selectedRestaurant && (
        <div className="admin-section">
          <h3>Menu — {selectedRestaurant.name}</h3>

          {/* Edit Form — shown when editingItem is set */}
          {editingItem && (
            <div className="edit-form-container">
              <h4>
                Editing: {editingItem.name}
              </h4>
              <form
                onSubmit={handleEditSave}
                className="admin-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => {
                        setEditForm({
                          ...editForm,
                          name: e.target.value });
                        setError('');
                      }}
                      placeholder="Item name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          category: e.target.value })}
                      placeholder="e.g. Main Course"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value })}
                    placeholder="Short description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (Rs.)</label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.price}
                      onChange={(e) => {
                        setEditForm({
                          ...editForm,
                          price: e.target.value });
                        setError('');
                      }}
                      placeholder="e.g. 280"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Available</label>
                    <select
                      value={editForm.isAvailable}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isAvailable:
                            e.target.value === 'true'
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
                    value={editForm.imageUrl}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="edit-form-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      width: 'auto', padding: '10px 28px'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleEditCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Menu Items Table */}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      editingItem?.id === item.id
                        ? 'editing-row' : ''
                    }
                  >
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>Rs. {item.price}</td>
                    <td>
                      {item.isAvailable ? (
                        <span className="badge-available">
                          Yes
                        </span>
                      ) : (
                        <span className="badge-unavailable">
                          No
                        </span>
                      )}
                    </td>
                    <td className="action-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(item)}
                        disabled={editingItem?.id === item.id}
                      >
                        {editingItem?.id === item.id
                          ? 'Editing...' : 'Edit'}
                      </button>
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

          {/* Add Menu Item Form */}
          {!editingItem && (
            <>
              <h3 style={{ marginTop: '28px' }}>
                Add Menu Item
              </h3>
              <form
                onSubmit={handleAddMenuItem}
                className="admin-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={menuForm.name}
                      onChange={(e) =>
                        setMenuForm({
                          ...menuForm,
                          name: e.target.value })}
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
                          ...menuForm,
                          category: e.target.value })}
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
                        ...menuForm,
                        description: e.target.value })}
                    placeholder="Short description"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (Rs.)</label>
                    <input
                      type="number"
                      min="1"
                      value={menuForm.price}
                      onChange={(e) =>
                        setMenuForm({
                          ...menuForm,
                          price: e.target.value })}
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
                          isAvailable:
                            e.target.value === 'true'
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
                        ...menuForm,
                        imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Add Menu Item
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;