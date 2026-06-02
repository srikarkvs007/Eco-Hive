import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AdminCustomerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/v1/admin/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching customer orders:", err);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`http://localhost:5001/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error("Failed to update status", err);
            alert('Failed to update status');
        }
    };

    const checkInventory = (items) => {
        // Return true if all items have enough stock
        return items.every(item => item.quantity <= item.product.stockQuantity);
    };

    return (
        <AdminLayout>
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bolder">E-Commerce Orders</h2>
                    <span className="badge bg-primary fs-6">{orders.length} Total Orders</span>
                </div>

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : orders.length === 0 ? (
                    <div className="alert alert-info">No customer orders found.</div>
                ) : (
                    <div className="row g-4">
                        {orders.map(order => {
                            const isStockAvailable = checkInventory(order.items);
                            return (
                                <div key={order.id} className="col-12">
                                    <div className="premium-card">
                                        <div className="card-header border-bottom-0 pt-4 pb-0 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--surface-color, transparent)', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
                                            <div>
                                                <h5 className="fw-bold mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h5>
                                                <p className="text-muted small mb-0">
                                                    {new Date(order.createdAt).toLocaleString()} • {order.user?.name || 'Unknown User'} ({order.user?.email || 'N/A'})
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <span className={`badge ${
                                                    order.status === 'Paid' ? 'bg-success' : 
                                                    order.status === 'Processing' ? 'bg-info text-dark' : 
                                                    order.status === 'Dispatched' ? 'bg-warning text-dark' : 
                                                    order.status === 'Delivered' ? 'bg-secondary' : 'bg-primary'
                                                } mb-2`}>
                                                    {order.status}
                                                </span>
                                                <h5 className="fw-bold m-0">${order.totalAmount.toFixed(2)}</h5>
                                            </div>
                                        </div>
                                        <div className="card-body px-4 py-3">
                                            <div className="mb-3">
                                                <span className="fw-bold small text-muted text-uppercase">Shipping Address</span>
                                                <p className="mb-0">{order.shippingAddress}</p>
                                            </div>

                                            <div className="table-responsive">
                                                <table className="table table-sm align-middle mb-0">
                                                    <thead className="text-muted small" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                        <tr>
                                                            <th>Item</th>
                                                            <th>Price</th>
                                                            <th>Qty Ordered</th>
                                                            <th>Warehouse Stock</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.items.map(item => {
                                                            const hasStock = item.quantity <= item.product.stockQuantity;
                                                            return (
                                                                <tr key={item.id}>
                                                                    <td className="fw-medium">{item.product.title}</td>
                                                                    <td>${item.priceAtPurchase.toFixed(2)}</td>
                                                                    <td>{item.quantity}</td>
                                                                    <td>{item.product.stockQuantity}</td>
                                                                    <td>
                                                                        {hasStock ? (
                                                                            <span className="text-success small fw-bold">✓ Available</span>
                                                                        ) : (
                                                                            <span className="text-danger small fw-bold">✗ Out of Stock</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-white border-top-0 pb-4 px-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="fw-bold small text-muted text-uppercase me-2">Inventory Check:</span>
                                                {isStockAvailable ? (
                                                    <span className="badge bg-success text-white px-3 py-2 rounded-pill">All Items in Stock</span>
                                                ) : (
                                                    <span className="badge bg-danger text-white px-3 py-2 rounded-pill">Insufficient Stock</span>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                {order.status === 'Paid' && (
                                                    <button className="btn btn-sm btn-primary rounded-pill px-3 py-2 fw-medium" onClick={() => updateStatus(order.id, 'Processing')}>
                                                        ⚙️ Process Order
                                                    </button>
                                                )}
                                                {order.status === 'Processing' && (
                                                    <button className="btn btn-sm btn-warning rounded-pill px-3 py-2 fw-medium text-dark" onClick={() => updateStatus(order.id, 'Dispatched')}>
                                                        🚚 Dispatch Order
                                                    </button>
                                                )}
                                                {order.status === 'Dispatched' && (
                                                    <button className="btn btn-sm btn-success rounded-pill px-3 py-2 fw-medium" onClick={() => updateStatus(order.id, 'Delivered')}>
                                                        ✓ Deliver Order
                                                    </button>
                                                )}
                                                {order.status === 'Delivered' && (
                                                    <span className="text-success small fw-bold">
                                                        ✓ Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCustomerOrders;
