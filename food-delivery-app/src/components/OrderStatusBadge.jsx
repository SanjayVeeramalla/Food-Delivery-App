function OrderStatusBadge({ status }) {
  const colors = {
    Pending:        '#888',
    Confirmed:      '#2a7ab5',
    Preparing:      '#e08000',
    OutForDelivery: '#7a50b5',
    Delivered:      '#2a8a4a',
    Failed:         '#c0392b',
  };

  const color = colors[status] || '#888';

  return (
    <span
      className="status-badge"
      style={{ backgroundColor: color }}
    >
      {status}
    </span>
  );
}

export default OrderStatusBadge;