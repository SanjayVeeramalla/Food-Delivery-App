import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';

function CartPage() {
  const {
    cartItems, restaurantId, totalAmount,
    removeItem, clearCart, increaseQty, decreaseQty
  } = useCart();

  const [address, setAddress]             = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardNumber, setCardNumber]       = useState('');
  const [upiId, setUpiId]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [paymentStep, setPaymentStep]     = useState('idle');
  const navigate = useNavigate();

  const validateUpi = (id) => {
    return /^[a-zA-Z0-9._-]{3,50}@[a-zA-Z]{2,20}$/.test(id);
  };

  const handlePlaceOrder = async () => {
    setError('');

    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber.trim()) {
        setError('Please enter your card number.');
        return;
      }
      if (cardNumber.trim().length !== 16) {
        setError('Card number must be exactly 16 digits.');
        return;
      }
    }

    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        setError('Please enter your UPI ID.');
        return;
      }
      if (!validateUpi(upiId.trim())) {
        setError(
          'Invalid UPI ID. Format should be like name@bankname ' +
          '(e.g. john@upi, 9876543210@paytm)');
        return;
      }
    }

    setLoading(true);
    setPaymentStep('validating');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setPaymentStep('processing');

      const res = await api.post('/api/orders', {
        restaurantId,
        deliveryAddress: address,
        paymentMethod,
        cardNumber: paymentMethod === 'Card'
          ? cardNumber.trim() : null,
        upiId: paymentMethod === 'UPI'
          ? upiId.trim() : null,
        items: cartItems.map((i) => ({
          menuItemId: i.menuItemId,
          itemName:   i.itemName,
          quantity:   i.quantity,
          unitPrice:  i.unitPrice,
        })),
      });

      const order = res.data;

      if (order.status === 'Failed') {
        setError(
          paymentMethod === 'UPI'
            ? 'UPI payment failed. Please check your UPI ID.'
            : paymentMethod === 'Card'
            ? 'Card payment failed. Please check your card number.'
            : 'Order could not be placed. Please try again.'
        );
        setPaymentStep('idle');
        setLoading(false);
        return;
      }

      setPaymentStep('done');
      await new Promise((r) => setTimeout(r, 800));
      clearCart();
      navigate('/orders');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
      setPaymentStep('idle');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <h2>Your Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => navigate('/restaurants')}
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Your Cart</h2>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="payment-status-bar">
          {paymentStep === 'validating' &&
            <span>Validating your order...</span>}
          {paymentStep === 'processing' &&
            <span>Processing payment, please wait...</span>}
          {paymentStep === 'done' &&
            <span>Payment successful. Redirecting...</span>}
        </div>
      )}

      {/* Cart items */}
      <div className="cart-list">
        {cartItems.map((item) => (
          <div key={item.menuItemId} className="cart-item-row">
            <div className="cart-item-name">
              <span>{item.itemName}</span>
              <span className="cart-item-unit">
                Rs. {item.unitPrice} each
              </span>
            </div>
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => decreaseQty(item.menuItemId)}
                disabled={loading}
              >-</button>
              <span className="qty-value">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => increaseQty(item.menuItemId)}
                disabled={loading}
              >+</button>
            </div>
            <div className="cart-item-total">
              Rs. {item.unitPrice * item.quantity}
            </div>
            <button
              className="btn-remove"
              onClick={() => removeItem(item.menuItemId)}
              disabled={loading}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-total">
        Total: Rs. {totalAmount.toFixed(2)}
      </div>

      {/* Delivery address */}
      <div className="form-group">
        <label>Delivery Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setError('');
          }}
          placeholder="Enter your full delivery address"
          disabled={loading}
        />
      </div>

      {/* Payment method selector */}
      <div className="form-group">
        <label>Payment Method</label>
        <div className="payment-options">
          {['Card', 'UPI', 'COD'].map((method) => (
            <button
              key={method}
              className={`payment-option-btn ${
                paymentMethod === method ? 'active' : ''}`}
              onClick={() => {
                setPaymentMethod(method);
                setError('');
              }}
              disabled={loading}
            >
              {method === 'Card' && 'Credit / Debit Card'}
              {method === 'UPI'  && 'UPI'}
              {method === 'COD'  && 'Cash on Delivery'}
            </button>
          ))}
        </div>
      </div>

      {/* Card fields */}
      {paymentMethod === 'Card' && (
        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setCardNumber(val);
              setError('');
            }}
            placeholder="Enter 16 digit card number"
            maxLength={16}
            disabled={loading}
          />
          {cardNumber.length > 0 && cardNumber.length < 16 && (
            <small style={{ color: '#e74c3c', fontSize: '12px' }}>
              {16 - cardNumber.length} more digits needed
            </small>
          )}
        </div>
      )}

      {/* UPI fields */}
      {paymentMethod === 'UPI' && (
        <div className="form-group">
          <label>UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => {
              setUpiId(e.target.value);
              setError('');
            }}
            placeholder="e.g. yourname@upi or 9876543210@paytm"
            disabled={loading}
          />
          <small style={{ color: '#888', fontSize: '12px' }}>
            Accepted formats: name@upi, number@paytm,
            name@okaxis, name@ybl
          </small>
        </div>
      )}

      {/* COD info */}
      {paymentMethod === 'COD' && (
        <div className="cod-info">
          Pay Rs. {totalAmount.toFixed(2)} in cash when your
          order is delivered.
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading
          ? 'Processing...'
          : `Place Order — Rs. ${totalAmount.toFixed(2)}`}
      </button>
    </div>
  );
}

export default CartPage;