import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Checkout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        // Pre-fill address if available
        const savedAddress = localStorage.getItem('shipping_address');
        if (savedAddress) {
            setAddress(savedAddress);
        }

        // Fetch cart items
        const fetchCart = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`http://localhost:5001/api/cart/${userId}`);
                setCartItems(res.data);
                const subtotal = res.data.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
                const tax = subtotal * 0.08;
                setTotalAmount(subtotal + tax);
            } catch (err) {
                console.error("Error fetching cart for checkout:", err);
            }
        };

        fetchCart();
    }, [userId]);

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        if (!address.trim()) {
            toast.error('Please enter a shipping address.');
            return;
        }

        setLoading(true);
        // Save address in localStorage to be read by gateway
        localStorage.setItem('shipping_address', address.trim());
        
        toast.success('Address saved. Directing to payment gateway...');
        setTimeout(() => {
            navigate('/gateway');
        }, 800);
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <Navbar />

            <div className="layout-container flex-grow-1" style={{ paddingTop: '160px', paddingBottom: 'var(--spacing-premium)' }}>
                <h1 className="fw-bolder mb-5 text-dark" style={{ fontSize: '56px', letterSpacing: '-0.03em' }}>Checkout</h1>

                <div className="row g-5">
                    {/* Shipping Form */}
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm rounded-5 p-5" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <span className="fs-3">📍</span>
                                <h4 className="fw-bolder mb-0 text-dark" style={{ fontSize: '28px' }}>Shipping Information</h4>
                            </div>
                            
                            <form onSubmit={handleProceedToPayment}>
                                <div className="mb-4">
                                    <label className="form-label text-muted fw-medium mb-2" style={{ fontSize: '15px' }}>Full Shipping Address</label>
                                    <textarea 
                                        className="form-control rounded-4 p-4 shadow-none bg-light" 
                                        rows="4" 
                                        placeholder="Enter your street address, apartment, city, state, zip code..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                        style={{ border: 'none', fontSize: '15px' }}
                                    ></textarea>
                                </div>

                                {/* Green Delivery Impact Info */}
                                <div className="rounded-4 p-4 mb-4 text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <div className="d-flex align-items-center gap-2 justify-content-center mb-2">
                                        <span style={{ fontSize: '20px' }}>🌿</span>
                                        <h6 className="fw-bold text-success mb-0">Green Delivery Impact</h6>
                                    </div>
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0) > 3 ? (
                                        <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                                            Your order requires consolidated delivery via <strong>Electric Van</strong>. Estimated offset: <strong>1.5kg CO2</strong>.
                                        </p>
                                    ) : (
                                        <p className="text-muted small mb-0" style={{ lineHeight: '1.4' }}>
                                            Your order is optimized for <strong>Eco-Drone Dispatch</strong>! Drone delivery saves approximately <strong>1.45kg CO2</strong> compared to standard road transit.
                                        </p>
                                    )}
                                </div>

                                <div className="d-flex gap-3">
                                    <Link to="/cart" className="btn btn-outline-secondary rounded-pill px-5 py-3 fw-medium">
                                        Back to Bag
                                    </Link>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary flex-grow-1 rounded-pill py-3 fw-medium d-flex justify-content-center align-items-center"
                                        disabled={loading || cartItems.length === 0}
                                    >
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> Proceeding...</>
                                        ) : 'Proceed to Payment Gateway'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary (Side Card) */}
                    <div className="col-lg-5">
                        <div className="premium-card sticky-top" style={{ top: '120px' }}>
                            <div className="card-body p-5">
                                <h4 className="fw-bolder mb-5 text-dark" style={{ fontSize: '28px' }}>Order Summary</h4>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span className="fw-medium text-dark">
                                        ${(cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)).toFixed(2)}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted">Estimated Tax (8%)</span>
                                    <span className="fw-medium text-dark">
                                        ${(cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * 0.08).toFixed(2)}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted">Eco-Delivery</span>
                                    <span className="fw-medium text-dark">Free</span>
                                </div>
                                <hr className="my-4" style={{ opacity: 0.1 }} />
                                <div className="d-flex justify-content-between mb-5">
                                    <span className="fw-bolder text-dark" style={{ fontSize: '24px' }}>Total</span>
                                    <span className="fw-bolder text-dark" style={{ fontSize: '24px' }}>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Checkout;
