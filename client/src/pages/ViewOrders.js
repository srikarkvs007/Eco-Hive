import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import {useEffect, useState} from 'react';

function ViewOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminHasWarehouse, setAdminHasWarehouse] = useState(true);

    useEffect(() => {
        const adminId = localStorage.getItem('userId');
        
        // 1. Fetch Admin profile to verify if address is set
        axios.get(`http://localhost:5001/api/users/${adminId}`)
            .then(res => {
                const hasAddress = !!res.data.address;
                setAdminHasWarehouse(hasAddress);
                
                // 2. Fetch local orders
                return axios.get(`http://localhost:5001/api/orders/all?adminId=${adminId}`);
            })
            .then((res) => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch orders or admin info", err);
                setLoading(false);
            });
    }, []);

    const updateStatus = (orderId, index, newStatus) => {
        axios.put(`http://localhost:5001/api/orders/updateStatus/${orderId}`, { status: newStatus })
            .then(() => {
                const updatedOrders = [...orders];
                updatedOrders[index].status = newStatus;
                setOrders(updatedOrders);
            })
            .catch(err => alert('Failed to update status'));
    };

    return (
        <AdminLayout>
            <div className='container py-5' style={{ maxWidth: '1000px' }}>
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bolder text-dark mb-1">Smart Dispatch Console</h2>
                        <p className="text-muted mb-0">Monitor and manage live logistics routes.</p>
                    </div>
                    <div>
                        <span className="badge bg-primary rounded-pill px-3 py-2 fs-6 shadow-sm">
                            {orders.length} Active Routes
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="premium-card p-5 text-center">
                        {!adminHasWarehouse ? (
                            <div className="py-4">
                                <span className="fs-1 mb-3 d-block">⚠️</span>
                                <h4 className="fw-bold mb-3 text-danger">No Warehouse Configured</h4>
                                <p className="text-muted mb-4 max-w-md mx-auto">
                                    You must configure your Warehouse / Region Address in settings to view and manage local dispatches.
                                </p>
                                <button className="btn btn-dark rounded-pill px-4" onClick={() => window.location.href = '/settings'}>
                                    Go to Settings
                                </button>
                            </div>
                        ) : (
                            <h5 className="text-muted mb-0">No active dispatch orders found for your local warehouse region.</h5>
                        )}
                    </div>
                ) : (
                    <div className="row g-4">
                        {orders.map((order, index) => (
                            <div key={order.id} className="col-12 col-md-6">
                                <div className="premium-card transition-all hover-lift">
                                    {/* Card Header */}
                                    <div className={`card-header border-0 py-3 px-4 d-flex justify-content-between align-items-center ${order.status === 'Delivered' ? 'bg-success bg-opacity-10' : ''}`} style={{ backgroundColor: 'var(--surface-color, #fff)', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge rounded-pill ${order.deliveryMode.includes('Drone') ? 'bg-success' : 'bg-dark'}`}>
                                                {order.deliveryMode}
                                            </span>
                                            {order.isPremium && (
                                                <span className="badge bg-warning text-dark rounded-pill">⭐ Premium</span>
                                            )}
                                        </div>
                                        <span className={`fw-bold small ${order.status === 'Delivered' ? 'text-success' : 'text-primary'}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="card-body px-4 py-4">
                                        {/* Route Details */}
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="d-flex flex-column align-items-center me-3">
                                                <div className="bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                                                <div style={{ width: '2px', height: '30px', backgroundColor: '#e5e5e5', margin: '4px 0' }}></div>
                                                <div className="bg-danger rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="mb-2">
                                                    <span className="text-muted small fw-bold text-uppercase d-block lh-1">Pickup</span>
                                                    <span className="fw-medium text-dark">{order.pickupLocation}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted small fw-bold text-uppercase d-block lh-1">Dropoff</span>
                                                    <span className="fw-medium text-dark">{order.dropLocation}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Package Info Grid */}
                                        <div className="row g-3 bg-light rounded-3 p-3 mb-4 border">
                                            <div className="col-6">
                                                <span className="text-muted small d-block">Package Type</span>
                                                <span className="fw-medium">{order.packageType}</span>
                                            </div>
                                            <div className="col-6">
                                                <span className="text-muted small d-block">Weight</span>
                                                <span className="fw-medium">{order.weight} kg</span>
                                            </div>
                                            <div className="col-6">
                                                <span className="text-muted small d-block">Sensitivity</span>
                                                <span className="fw-medium">{order.sensitivity}</span>
                                            </div>
                                            <div className="col-6">
                                                <span className="text-muted small d-block">Extra Fee</span>
                                                <span className="fw-medium text-danger">${order.extraFee}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {order.status === 'Pending' ? (
                                            <button 
                                                className="btn btn-primary w-100 rounded-pill py-2 fw-medium shadow-sm"
                                                onClick={() => updateStatus(order.id, index, 'In Transit')}
                                            >
                                                🚀 Launch Dispatch
                                            </button>
                                        ) : order.status === 'In Transit' ? (
                                            <button 
                                                className="btn btn-dark w-100 rounded-pill py-2 fw-medium shadow-sm"
                                                onClick={() => updateStatus(order.id, index, 'Delivered')}
                                            >
                                                ✓ Mark as Delivered
                                            </button>
                                        ) : (
                                            <div className="text-center text-success fw-bold py-2 bg-success bg-opacity-10 rounded-pill">
                                                Route Completed Successfully
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`
                .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
            `}</style>
        </AdminLayout>
    );
}

export default ViewOrders;