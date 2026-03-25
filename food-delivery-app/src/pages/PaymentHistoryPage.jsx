import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const METHOD_LABEL = {
  Card: 'Credit / Debit Card',
  UPI:  'UPI',
  COD:  'Cash on Delivery',
};

const STATUS_STYLE = {
  Success: { background: '#eafaf1', color: '#1a6b3a',
             border: '1px solid #a9dfbf' },
  Failed:  { background: '#fdecea', color: '#c0392b',
             border: '1px solid #f5b7b1' },
};

function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/payments/history');
        setTransactions(res.data);
      } catch (err) {
        setError('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="page-center">Loading payment history...</div>
  );

  return (
    <div className="page">
      <h2>Payment History</h2>

      {error && <div className="error-message">{error}</div>}

      {transactions.length === 0 ? (
        <div className="empty-cart">
          <p>No payment transactions found.</p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => navigate('/restaurants')}
          >
            Order Now
          </button>
        </div>
      ) : (
        <div className="payment-history-list">
          {transactions.map((t) => (
            <div key={t.transactionId}
              className="payment-history-card">

              {/* Card header */}
              <div className="payment-history-header">
                <div>
                  <span className="payment-history-id">
                    Transaction #{t.transactionId}
                  </span>
                  <span className="payment-history-order">
                    Order #{String(t.orderId).padStart(4, '0')}
                  </span>
                </div>
                <span
                  className="payment-history-status"
                  style={STATUS_STYLE[t.status] ||
                    STATUS_STYLE.Failed}
                >
                  {t.status}
                </span>
              </div>

              {/* Card body */}
              <div className="payment-history-body">
                <div className="payment-history-row">
                  <span className="payment-history-label">
                    Amount
                  </span>
                  <span className="payment-history-value amount">
                    Rs. {t.amount}
                  </span>
                </div>
                <div className="payment-history-row">
                  <span className="payment-history-label">
                    Payment Method
                  </span>
                  <span className="payment-history-value">
                    {METHOD_LABEL[t.paymentMethod]
                      || t.paymentMethod}
                  </span>
                </div>
                <div className="payment-history-row">
                  <span className="payment-history-label">
                    Date
                  </span>
                  <span className="payment-history-value">
                    {new Date(t.processedAt)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentHistoryPage;