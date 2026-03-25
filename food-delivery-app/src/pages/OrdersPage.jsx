import { useEffect, useState, useRef } from 'react';
import api from '../api/axiosInstance';

const STATUS_CONFIG = {
  Pending: { color: '#888', label: 'Pending', step: 0 },
  Confirmed: { color: '#2a7ab5', label: 'Order Confirmed', step: 1 },
  Preparing: { color: '#e08000', label: 'Preparing', step: 2 },
  OutForDelivery: { color: '#7a50b5', label: 'Out for Delivery', step: 3 },
  Delivered: { color: '#27ae60', label: 'Delivered', step: 4 },
  Failed: { color: '#c0392b', label: 'Failed', step: -1 },
};

const STEPS = ['Confirmed', 'Preparing', 'OutForDelivery', 'Delivered'];

function OrderStatusTracker({ status }) {
  if (status === 'Failed' || status === 'Pending') return null;

  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="status-tracker">
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isDone = currentStep > stepNum;
        const isCurrent = currentStep === stepNum;

        return (
          <div key={step} className="tracker-step">
            <div className={`tracker-dot ${isDone || isCurrent ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
              {isDone ? '✓' : stepNum}
            </div>
            <div className={`tracker-label ${isCurrent ? 'tracker-label-active' : ''}`}>
              {STATUS_CONFIG[step]?.label}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`tracker-line ${isDone ? 'active' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    intervalRef.current = setInterval(fetchOrders, 15000);

    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <div className="page-center">Loading orders...</div>;

  return (
    <div className="page">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p style={{ color: '#888' }}>You have not placed any orders yet.</p>
      ) : (
        orders.map((order) => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

          return (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span>Order #{String(order.id).padStart(4, '0')}</span>
                <span
                  className="status-badge"
                  style={{ backgroundColor: config.color }}
                >
                  {config.label}
                </span>
              </div>

              <p>Delivery to: {order.deliveryAddress}</p>
              <p>Total: Rs. {order.totalAmount}</p>
              <p>
                Payment:{' '}
                <span className="payment-method-badge">
                  {order.paymentMethod === 'COD' && 'Cash on Delivery'}
                  {order.paymentMethod === 'UPI' && 'UPI'}
                  {order.paymentMethod === 'Card' && 'Credit / Debit Card'}
                  {!order.paymentMethod && 'Card'}
                </span>
              </p>
              <p className="order-date">
                Placed: {new Date(order.placedAt).toLocaleString()}
              </p>

              {/* Status tracker bar */}
              <OrderStatusTracker status={order.status} />

              {/* Order items */}
              {order.items && order.items.map((item) => (
                <div key={item.id} className="order-item-row">
                  {item.itemName} x{item.quantity} — Rs. {item.unitPrice * item.quantity}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

export default OrdersPage;