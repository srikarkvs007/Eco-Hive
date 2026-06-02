import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

// Setup custom icons for map
const getMarkerIcon = (emoji, color) => {
    return L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="font-size: 28px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); display: flex; align-items: center; justify-content: center; background: ${color || 'white'}; border-radius: 50%; width: 44px; height: 44px; border: 2px solid white;">${emoji}</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });
};

const MapController = ({ center, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (center) {
            map.setView(center, 13);
        }
    }, [center, bounds, map]);
    return null;
};

const OrderStatus = () => {
    const [searchId, setSearchId] = useState('');
    const [orders, setOrders] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);
    
    // Animation coordinate state for the carrier (drone/van)
    const [carrierCoord, setCarrierCoord] = useState(null);

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // Fetch user orders if logged in
    useEffect(() => {
        if (userId && token) {
            setOrdersLoading(true);
            axios.get(`http://localhost:5001/api/customer-orders/user/${userId}`)
                .then(res => {
                    setOrders(res.data);
                    if (res.data.length > 0) {
                        // Load the most recent order automatically
                        fetchOrderDetails(res.data[0].id);
                    }
                })
                .catch(err => {
                    console.error("Error loading user orders:", err);
                })
                .finally(() => {
                    setOrdersLoading(false);
                });
        }
    }, [userId, token]);

    // Animate carrier along polyline if order is active
    useEffect(() => {
        if (currentOrder && (currentOrder.status === 'Processing' || currentOrder.status === 'Dispatched')) {
            const start = [48.8566, 2.3522]; // Paris Central Warehouse
            
            // Generate seed-based destination coordinate in Paris
            const hash = currentOrder.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const latOffset = ((hash % 100) / 1000) - 0.05; // -0.05 to +0.05
            const lngOffset = (((hash >> 2) % 100) / 1000) - 0.05;
            const dest = [48.8566 + latOffset, 2.3522 + lngOffset];
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 0.01;
                if (progress > 1) progress = 0; // loop animation
                
                const curLat = start[0] + (dest[0] - start[0]) * progress;
                const curLng = start[1] + (dest[1] - start[1]) * progress;
                setCarrierCoord([curLat, curLng]);
            }, 100);
            
            return () => clearInterval(interval);
        } else {
            setCarrierCoord(null);
        }
    }, [currentOrder]);

    const fetchOrderDetails = async (orderId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5001/api/customer-orders/${orderId}`);
            setCurrentOrder(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load order details. Please check the Order ID.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            toast.error("Please enter a valid Order ID");
            return;
        }
        fetchOrderDetails(searchId.trim());
    };

    const getStatusProgress = (status) => {
        const statuses = ['Pending', 'Paid', 'Processing', 'Dispatched', 'Delivered'];
        const currentIndex = statuses.indexOf(status);
        const percentage = currentIndex === -1 ? 0 : (currentIndex / (statuses.length - 1)) * 100;
        return { currentIndex, percentage, statuses };
    };

    // Calculate map bounds and locations based on order info
    let mapData = null;
    if (currentOrder) {
        const startCoord = [48.8566, 2.3522]; // Hub
        const hash = currentOrder.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const latOffset = ((hash % 100) / 1000) - 0.05;
        const lngOffset = (((hash >> 2) % 100) / 1000) - 0.05;
        const endCoord = [48.8566 + latOffset, 2.3522 + lngOffset];
        const courierEmoji = currentOrder.totalAmount > 100 ? '🚚' : '🚁';
        const bounds = [startCoord, endCoord];
        mapData = { startCoord, endCoord, courierEmoji, bounds };
    }

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Track Your Order | Order Status Support" 
                description="Monitor your sustainable drone or EV delivery in real time and see your ecological carbon offset." 
            />
            <Navbar />

            <div className="container flex-grow-1" style={{ maxWidth: '1200px', paddingTop: '150px', paddingBottom: 'var(--spacing-premium)' }}>
                
                {/* Search Header */}
                <div className="card border-0 rounded-5 p-4 p-md-5 mb-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                    <div className="row align-items-center">
                        <div className="col-12 col-md-6 mb-4 mb-md-0">
                            <h1 className="fw-bolder text-dark mb-2" style={{ fontSize: '38px', letterSpacing: '-0.02em' }}>Track Your Order</h1>
                            <p className="text-muted mb-0">Enter your order identifier to track real-time shipping logs and logistics.</p>
                        </div>
                        <div className="col-12 col-md-6">
                            <form onSubmit={handleSearch} className="d-flex gap-2">
                                <input 
                                    type="text" 
                                    className="form-control rounded-pill px-4"
                                    placeholder="Enter Order ID (e.g. 7ae5d6b4...)"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    style={{ height: '48px', fontSize: '15px', backgroundColor: 'var(--surface-color)', border: 'none', boxShadow: 'var(--shadow-sm)' }}
                                />
                                <button type="submit" className="btn btn-primary rounded-pill px-4 fw-medium" style={{ height: '48px' }}>
                                    Track
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Logged in: Order list sidebar */}
                    {token && (
                        <div className="col-12 col-lg-3">
                            <div className="card border-0 rounded-5 p-4 shadow-sm h-100" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <h5 className="fw-bolder text-dark mb-4">Recent Orders</h5>
                                {ordersLoading ? (
                                    <div className="d-flex justify-content-center py-4">
                                        <div className="spinner-border spinner-border-sm text-primary"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <p className="text-muted small">No order logs found in your account.</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '600px' }}>
                                        {orders.map(o => (
                                            <button
                                                key={o.id}
                                                onClick={() => fetchOrderDetails(o.id)}
                                                className={`btn text-start p-3 rounded-4 transition-all w-100 ${currentOrder?.id === o.id ? 'bg-primary text-white shadow-sm' : 'btn-light text-dark hover-bg-light'}`}
                                                style={{ fontSize: '13px' }}
                                            >
                                                <div className="fw-bold mb-1">Order #{o.id.slice(0, 8)}</div>
                                                <div className="d-flex justify-content-between opacity-75 small">
                                                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                                                    <span>${o.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Details View */}
                    <div className={token ? 'col-12 col-lg-9' : 'col-12'}>
                        {loading ? (
                            <div className="card border-0 rounded-5 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <div className="spinner-border text-primary mb-3"></div>
                                <h5 className="fw-bold">Fetching order tracker logs...</h5>
                            </div>
                        ) : currentOrder ? (
                            <div className="d-flex flex-column gap-4">
                                
                                {/* Tracking Status Progress Card */}
                                <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom">
                                        <div>
                                            <span className="text-muted small fw-bold text-uppercase tracking-wider">Tracking Reference</span>
                                            <h4 className="fw-bolder text-dark mb-0">Order #{currentOrder.id}</h4>
                                        </div>
                                        <div className="text-md-end mt-3 mt-md-0">
                                            <span className="text-muted small fw-bold text-uppercase tracking-wider">Estimated Delivery</span>
                                            <h4 className="fw-bolder text-success mb-0">
                                                {new Date(new Date(currentOrder.createdAt).getTime() + 3*24*60*60*1000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Timeline progress bar */}
                                    <div className="px-3 pb-5 mb-4 border-bottom">
                                        <div className="position-relative mt-4 mb-2">
                                            <div className="progress overflow-visible" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                                <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${getStatusProgress(currentOrder.status).percentage}%`, backgroundColor: 'var(--accent-blue)' }}></div>
                                            </div>
                                            <div className="d-flex justify-content-between position-absolute w-100" style={{ top: '-10px', left: '0' }}>
                                                {getStatusProgress(currentOrder.status).statuses.map((s, idx) => {
                                                    const isPassed = idx <= getStatusProgress(currentOrder.status).currentIndex;
                                                    return (
                                                        <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '40px' }}>
                                                            <div 
                                                                className={`rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-all ${isPassed ? 'bg-primary text-white' : 'bg-white text-muted'}`}
                                                                style={{ width: '26px', height: '26px', fontSize: '12px', border: isPassed ? 'none' : '2px solid rgba(0,0,0,0.1)' }}
                                                            >
                                                                {isPassed ? '✓' : ''}
                                                            </div>
                                                            <span className={`small mt-2 ${isPassed ? 'fw-bold text-dark' : 'text-muted'}`} style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{s}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logistics Specifications */}
                                    <div className="row g-4 pt-3">
                                        <div className="col-12 col-md-3">
                                            <span className="small text-muted text-uppercase fw-bold">Carrier</span>
                                            <p className="fw-bolder text-dark mb-0 mt-1" style={{ fontSize: '15px' }}>
                                                {currentOrder.totalAmount > 100 ? '🚚 EV Electric Van' : '🚁 Autonomous Drone'}
                                            </p>
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <span className="small text-muted text-uppercase fw-bold">Eco Offset Saved</span>
                                            <p className="fw-bolder text-success mb-0 mt-1" style={{ fontSize: '15px' }}>
                                                🌱 2.5 kg CO2
                                            </p>
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <span className="small text-muted text-uppercase fw-bold">Weight specifications</span>
                                            <p className="fw-bolder text-dark mb-0 mt-1" style={{ fontSize: '15px' }}>
                                                📦 {currentOrder.items?.reduce((sum, i) => sum + i.quantity, 0) * 1.2} kg
                                            </p>
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <span className="small text-muted text-uppercase fw-bold">Shipping Address</span>
                                            <p className="fw-bolder text-dark mb-0 mt-1" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                {currentOrder.shippingAddress || 'Eco-Hive Logistics Hub'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Leaflet Live Route Tracker */}
                                {mapData && (
                                    <div className="premium-card rounded-5 overflow-hidden shadow-sm" style={{ height: '420px', border: 'var(--glass-border)' }}>
                                        <MapContainer center={mapData.startCoord} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                                            />
                                            <MapController bounds={mapData.bounds} />
                                            
                                            {/* Pickup Marker */}
                                            <Marker position={mapData.startCoord} icon={getMarkerIcon('🏭', '#10b981')}>
                                                <Popup>
                                                    <strong>Eco-Hive Central Warehouse</strong><br/>
                                                    Pickup Depot
                                                </Popup>
                                            </Marker>

                                            {/* Drop Marker */}
                                            <Marker position={mapData.endCoord} icon={getMarkerIcon('🏠', '#3b82f6')}>
                                                <Popup>
                                                    <strong>Delivery Destination</strong><br/>
                                                    {currentOrder.shippingAddress}
                                                </Popup>
                                            </Marker>

                                            {/* Route Polyline */}
                                            <Polyline positions={[mapData.startCoord, mapData.endCoord]} color="var(--accent-blue)" dashArray="8, 8" weight={4} />

                                            {/* Animated Carrier Marker */}
                                            {carrierCoord && (
                                                <Marker position={carrierCoord} icon={getMarkerIcon(mapData.courierEmoji, '#f59e0b')}>
                                                    <Popup>
                                                        <strong>Autonomous Eco-Carrier</strong><br/>
                                                        In-transit telemetry...
                                                    </Popup>
                                                </Marker>
                                            )}
                                        </MapContainer>
                                    </div>
                                )}

                                {/* Order Items list summary */}
                                <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    <h5 className="fw-bolder text-dark mb-4">Items in Shipment</h5>
                                    <div className="d-flex flex-column gap-3">
                                        {currentOrder.items?.map(item => (
                                            <div key={item.id} className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                                                <div className="bg-white rounded-3 p-2 me-4 shadow-sm" style={{ width: '60px', height: '60px' }}>
                                                    <img src={item.product?.imageUrl || 'https://via.placeholder.com/60'} alt={item.product?.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '15px' }}>{item.product?.title}</h6>
                                                    <span className="text-muted fw-medium small">Quantity: {item.quantity}</span>
                                                </div>
                                                <div className="fw-bold text-dark fs-5">
                                                    ${item.priceAtPurchase.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 rounded-5 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <span style={{ fontSize: '72px' }}>📦</span>
                                <h4 className="fw-bold mt-4">Order Status Center</h4>
                                <p className="text-muted">Enter your Order ID in the lookup bar above or check recent orders in your account sidebar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default OrderStatus;
