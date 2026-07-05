import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

const socket = io(API_BASE_URL);

const getEmojiIcon = (mode, isPremium) => {
    let emoji = '📦';
    if (mode === 'Van') emoji = '🚚';
    else if (mode === 'Drone') emoji = '🚁';

    return L.divIcon({
        className: 'custom-emoji-icon',
        html: `<div style="font-size: 24px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); ${isPremium ? 'color: gold;' : ''}">${emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    let orderId = searchParams.get('order_id');
    if (!orderId) {
        const sessionId = searchParams.get('session_id');
        if (sessionId && sessionId.startsWith('mock_session_')) {
            orderId = sessionId.replace('mock_session_', '');
        }
    }

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liveLocation, setLiveLocation] = useState(null);

    useEffect(() => {
        if (!orderId) return;
        socket.on('live_locations', (activeDeliveries) => {
            const myDelivery = activeDeliveries.find(d => d.customerOrderId === orderId);
            if (myDelivery) {
                setLiveLocation(myDelivery);
            }
        });

        socket.on('order_status_updated', (data) => {
            if (data.orderId === orderId) {
                setOrder(prev => prev ? { ...prev, status: data.status } : null);
                if (data.status === 'Delivered') {
                    setLiveLocation(null);
                }
            }
        });

        return () => {
            socket.off('live_locations');
            socket.off('order_status_updated');
        };
    }, [orderId]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/customer-orders/${orderId}`);
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to fetch order details", err);
                // If the order doesn't exist or there is an error, redirect home
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        } else {
            navigate('/home');
        }
    }, [orderId, navigate]);

    if (loading) {
        return (
            <div className="bg-light min-vh-100 d-flex flex-column">
                <Navbar />
                <div className="flex-grow-1 d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-success" role="status"></div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <Navbar />
            <div className="container flex-grow-1 py-5 d-flex justify-content-center align-items-center" style={{ paddingTop: '160px' }}>
                <div className="card border-0 shadow-sm rounded-5 overflow-hidden" style={{ maxWidth: '600px', width: '100%' }}>
                    
                    {/* Header Banner */}
                    <div className="bg-success text-white p-5 text-center position-relative">
                        <div className="position-absolute w-100 h-100 top-0 start-0 opacity-25" style={{ background: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }}></div>
                        <div className="position-relative z-1">
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm mb-4" style={{ width: '80px', height: '80px' }}>
                                <span className="text-success fw-bolder" style={{ fontSize: '40px' }}>✓</span>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ letterSpacing: '-0.02em' }}>Order Successful!</h2>
                            <p className="mb-0 fw-medium">Thank you for shopping sustainably.</p>
                        </div>
                    </div>

                    <div className="p-5 bg-white">
                        <div className="mb-4 text-center">
                            <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Order Tracking ID</p>
                            <h5 className="fw-bold text-dark mb-0">{order.id.split('-')[0].toUpperCase()}</h5>
                        </div>

                        <div className="bg-light rounded-4 p-4 mb-4 border">
                            <h6 className="fw-bold text-dark mb-3">Order Details</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Placed On</span>
                                <span className="fw-medium text-dark">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Amount</span>
                                <span className="fw-bold text-success">${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Payment Method</span>
                                <span className="fw-medium text-dark">Secure Payment</span>
                            </div>
                        </div>

                        <div className="mb-5">
                            <h6 className="fw-bold text-dark mb-3">Items Purchased</h6>
                            <ul className="list-group list-group-flush border rounded-3 overflow-hidden">
                                {order.items?.map(item => (
                                    <li key={item.id} className="list-group-item bg-white px-3 py-3 d-flex align-items-center">
                                        <img src={item.product?.imageUrl || 'https://via.placeholder.com/50'} alt={item.product?.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="me-3 border rounded-2" />
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{item.product?.title}</h6>
                                            <small className="text-muted">Qty: {item.quantity}</small>
                                        </div>
                                        <span className="fw-bold text-dark">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Live Tracking Map */}
                        {liveLocation && (
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-dark mb-0">Live Order Tracking</h6>
                                    <span className="badge bg-success shadow-sm px-3 py-2">
                                        <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true" style={{ width: '10px', height: '10px' }}></span>
                                        {liveLocation.mode} Dispatched
                                    </span>
                                </div>
                                <div className="card border shadow-sm rounded-4 overflow-hidden" style={{ height: '250px' }}>
                                    <MapContainer center={[liveLocation.lat, liveLocation.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                            attribution='&copy; CartoDB'
                                        />
                                        <Marker 
                                            position={[liveLocation.lat, liveLocation.lng]}
                                            icon={getEmojiIcon(liveLocation.mode, liveLocation.isPremium)}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <strong>{liveLocation.mode} {liveLocation.isPremium && '⭐'}</strong><br/>
                                                    On the way!
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        )}

                        <div className="d-flex gap-3">
                            <Link to="/settings" className="btn btn-outline-dark rounded-pill py-3 px-4 flex-grow-1 fw-bold">
                                View Order History
                            </Link>
                            <Link to="/home?store=true" className="btn btn-primary rounded-pill py-3 px-4 flex-grow-1 fw-bold shadow-sm">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <style>{`
                .tracking-wider { letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
};

export default OrderSuccess;
