import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Checkout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Processing Payment...');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    
    // Card states
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    // Timer states (5 minutes = 300 seconds)
    const [timeLeft, setTimeLeft] = useState(300);

    // Cart states for Stripe payload
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        // Fetch cart items
        const fetchCart = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            try {
                const res = await axios.get(`http://localhost:5001/api/cart/${userId}`);
                setCartItems(res.data);
                const total = res.data.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
                setTotalAmount(total);
            } catch (err) {
                console.error("Error fetching cart for checkout:", err);
            }
        };
        fetchCart();
        // Countdown timer logic
        if (timeLeft <= 0) {
            toast.error('Payment session expired. Redirecting to cart.');
            navigate('/cart');
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        // Warn before leaving the page
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Standard way to trigger browser warning
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(timerId);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [timeLeft, navigate]);

    // Format time remaining as MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const handleCheckout = async (e) => {
        e.preventDefault();
        
        if (!address) {
            toast.error('Please provide a shipping address.');
            return;
        }

        setLoading(true);
        const userId = localStorage.getItem('userId');

        setLoadingText('Redirecting to Stripe Secure Checkout...');

        try {
            const res = await axios.post('http://localhost:5001/api/payments/create-checkout-session', {
                userId,
                items: cartItems,
                totalAmount: totalAmount,
                shippingAddress: address
            });

            // Redirect to Stripe Checkout URL
            if (res.data.url) {
                window.location.href = res.data.url;
            } else {
                toast.error('Failed to initialize payment session.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to place order.');
            setLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <Navbar />
            <div className="layout-container flex-grow-1 d-flex justify-content-center align-items-center" style={{ paddingTop: '160px', paddingBottom: 'var(--spacing-premium)' }}>
                <div className="premium-card overflow-hidden w-100" style={{ maxWidth: '800px' }}>
                    
                    <div className="p-3 text-center d-flex justify-content-center align-items-center gap-2" style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: 'var(--glass-border)' }}>
                        <span className="fs-5">⏱</span>
                        <span className="text-muted">Complete payment in: </span>
                        <span className="fw-bolder text-dark fs-5">{timeDisplay}</span>
                    </div>

                    <div className="p-5">
                        <div className="text-center mb-5">
                            <div className="mb-4" style={{ fontSize: '48px' }}>🔒</div>
                            <h2 className="fw-bolder mb-3" style={{ fontSize: '32px', letterSpacing: '-0.02em' }}>Secure Checkout</h2>
                            <p className="text-muted">Enter your shipping and payment details below.</p>
                        </div>

                        <form onSubmit={handleCheckout}>
                            <div className="row g-5 mb-5">
                                {/* Shipping Section */}
                                <div className="col-12 col-md-6">
                                    <h5 className="fw-bolder mb-4 border-bottom pb-3 text-dark">Shipping Information</h5>
                                    <div>
                                        <label className="form-label text-muted mb-2">Full Address</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="4" 
                                            placeholder="123 Eco Street, Green City..."
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Payment Section */}
                                <div className="col-12 col-md-6">
                                    <h5 className="fw-bolder mb-4 border-bottom pb-3 text-dark">Payment Details</h5>
                                    <div className="rounded-4 p-4 text-center d-flex flex-column justify-content-center h-100" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div className="mb-3" style={{ fontSize: '40px' }}>💳</div>
                                        <h6 className="fw-bolder text-dark mb-2">Stripe Secure Checkout</h6>
                                        <p className="text-muted small mb-0">
                                            You will be redirected to Stripe to securely enter your card details or pay with Apple Pay / Google Pay.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 py-3 rounded-pill fw-medium d-flex justify-content-center align-items-center" 
                                disabled={loading || timeLeft <= 0}
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span> {loadingText}</>
                                ) : 'Pay Now & Place Order'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;
