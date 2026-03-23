import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/api/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      console.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);

    if (!val.trim()) {
      // Restore full list when cleared
      fetchRestaurants();
      return;
    }

    try {
      const res = await api.get(`/api/restaurants/search?q=${val.trim()}`);
      setRestaurants(res.data);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  if (loading) return <div className="page-center">Loading restaurants...</div>;

  return (
    <div className="page">
      <h2>Restaurants</h2>
      <input
        className="search-input"
        type="text"
        placeholder="Search by name, cuisine or dish..."
        value={search}
        onChange={handleSearch}
      />

      {restaurants.length === 0 ? (
        <p style={{ color: '#888', marginTop: '20px' }}>
          No restaurants found for "{search}".
        </p>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="restaurant-card"
              onClick={() => navigate(`/menu/${r.id}`)}
            >
              <div className="restaurant-card-body">
                <h3>{r.name}</h3>
                <p>{r.cuisineType}</p>
                <p className="restaurant-address">{r.address}</p>
              </div>
              <div className="restaurant-card-footer">
                <span className="rating-badge">{r.rating} / 5</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RestaurantListPage;