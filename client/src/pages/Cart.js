import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`http://localhost:5001/api/cart/${userId}`);
            setCartItems(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching cart:", err);
            setLoading(false);
        }
    };

    const handleRemove = async (cartItemId) => {
        try {
            await axios.delete(`http://localhost:5001/api/cart/${cartItemId}`);
            setCartItems(prev => prev.filter(item => item.id !== cartItemId));
            toast.success('Item removed.');
        } catch (err) {
            console.error("Error removing item:", err);
            toast.error("Failed to remove item.");
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2);
    };

    const userId = localStorage.getItem('userId');

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <Navbar />
            <div className="layout-container flex-grow-1" style={{ paddingTop: '160px', paddingBottom: 'var(--spacing-premium)' }}>
                <h1 className="fw-bolder mb-5 text-dark" style={{ fontSize: '56px', letterSpacing: '-0.03em' }}>Your Bag</h1>

                {!userId ? (
                    <div className="alert alert-warning">
                        Please log in to view your cart.
                    </div>
                ) : loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="card border-0 shadow-sm rounded-5 p-5 text-center mt-4" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                        <div className="mb-4 text-muted" style={{ fontSize: '80px' }}>🛍️</div>
                        <h3 className="fw-bolder text-dark mb-3" style={{ fontSize: '32px' }}>Your bag is empty.</h3>
                        <p className="text-muted mb-5">Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/home" className="btn btn-primary rounded-pill px-5 py-3 fw-medium">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="row g-5">
                        {/* Cart Items List */}
                        <div className="col-lg-7 mb-4">
                            <div className="d-flex flex-column gap-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="d-flex align-items-center p-4 rounded-5 shadow-sm" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                                        <Link to={`/product/${item.product.id}`} className="d-flex align-items-center text-decoration-none text-dark flex-grow-1">
                                            <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--bg-elevated)' }} className="rounded-4 flex-shrink-0 d-flex justify-content-center align-items-center me-4 p-2">
                                                <img 
                                                    src={item.product.imageUrl || 'https://via.placeholder.com/100'} 
                                                    alt={item.product.title} 
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div>
                                                <h5 className="fw-bolder mb-1" style={{ fontSize: '20px', letterSpacing: '-0.01em' }}>{item.product.title}</h5>
                                                <p className="text-muted mb-0">Qty: {item.quantity}</p>
                                            </div>
                                        </Link>
                                        <div className="text-end ms-3">
                                            <div className="fs-5 fw-bolder mb-3 text-dark">${(item.product.price * item.quantity).toFixed(2)}</div>
                                            <button onClick={() => handleRemove(item.id)} className="btn text-muted p-0 text-decoration-underline" style={{ fontSize: '15px' }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="col-lg-5">
                            <div className="premium-card sticky-top" style={{top: '120px'}}>
                                <div className="card-body p-5">
                                    <h4 className="fw-bolder mb-5 text-dark" style={{ fontSize: '28px' }}>Order Summary</h4>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="text-muted">Subtotal ({cartItems.length} items)</span>
                                        <span className="fw-medium text-dark">${calculateTotal()}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="text-muted">Eco-Delivery</span>
                                        <span className="fw-medium text-dark">Free</span>
                                    </div>
                                    <hr className="my-4" style={{ opacity: 0.1 }} />
                                    <div className="d-flex justify-content-between mb-5">
                                        <span className="fw-bolder text-dark" style={{ fontSize: '24px' }}>Total</span>
                                        <span className="fw-bolder text-dark" style={{ fontSize: '24px' }}>${calculateTotal()}</span>
                                    </div>
                                    <div className="d-flex flex-column gap-3">
                                        <Link to="/checkout" className="btn btn-primary w-100 py-3 rounded-pill fw-medium text-white">
                                            Proceed to Checkout
                                        </Link>
                                        <Link to="/home" className="btn btn-outline-secondary w-100 py-3 rounded-pill fw-medium">
                                            Continue Shopping
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Cart;
