import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const Checkout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Processing Payment...');
    const [address, setAddress] = useState('');
    
    // Timer states (5 minutes = 300 seconds)
    const [timeLeft, setTimeLeft] = useState(300);

    // Cart states for Stripe payload
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // OTP MFA States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const [resendCountdown, setResendCountdown] = useState(0);

    // Dialog & Redirect States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRedirectModal, setShowRedirectModal] = useState(false);

    // Gift Card States
    const [giftCardBalance, setGiftCardBalance] = useState(0.0);
    const [applyGiftCard, setApplyGiftCard] = useState(false);

    const userId = localStorage.getItem('userId');

    // popstate listener to block browser Back button
    useEffect(() => {
        // Push a dummy state to history to capture back action
        window.history.pushState(null, null, window.location.href);

        const handlePopState = (e) => {
            // Re-push dummy state to stay on checkout page while modal is active
            window.history.pushState(null, null, window.location.href);
            setShowCancelModal(true);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
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

        // Fetch User Phone & Wallet details from V1 Profile endpoint
        const fetchUserPhone = async () => {
            if (!userId) return;
            try {
                const userRes = await axios.get(`http://localhost:5001/api/v1/users/profile`);
                if (userRes.data) {
                    if (userRes.data.phone) setUserPhone(userRes.data.phone);
                    if (userRes.data.giftCardBalance !== undefined) setGiftCardBalance(userRes.data.giftCardBalance);
                }
            } catch (err) {
                console.error("Error fetching user profile via v1:", err);
            }
        };

        fetchCart();
        fetchUserPhone();

        // Warn before tab unload/close
        const handleBeforeUnload = (e) => {
            if (!loading && !otpVerified) {
                e.preventDefault();
                e.returnValue = ''; // Standard way to trigger browser warning
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [userId, loading, otpVerified]);

    useEffect(() => {
        // Countdown timer logic
        if (timeLeft <= 0) {
            toast.error('Payment session expired. Redirecting to cart.');
            navigate('/cart');
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [timeLeft, navigate]);

    // Resend OTP countdown timer effect
    useEffect(() => {
        if (resendCountdown <= 0) return;
        const intervalId = setInterval(() => {
            setResendCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [resendCountdown]);

    // Format time remaining as MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Step A: Initiate Payment & Show OTP
    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        
        if (!address) {
            toast.error('Please provide a shipping address.');
            return;
        }

        setLoading(true);
        setLoadingText('Requesting verification code...');

        try {
            const res = await axios.post('http://localhost:5001/api/v1/auth/otp/send', { userId });
            const code = res.data.code;
            setOtpError('');
            setOtp(['', '', '', '', '', '']);
            setShowOtpModal(true);
            setResendCountdown(60); // 60s countdown timer

            // Display toast notification simulating SMS delivery
            toast.success(`🔑 [Eco-Hive Secure] Verification code sent: ${code}`, {
                duration: 12000,
                icon: '🔒'
            });
        } catch (err) {
            console.error("Error generating OTP:", err);
            toast.error(err.response?.data?.error || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP action
    const handleResendOtp = async () => {
        setLoading(true);
        setLoadingText('Resending verification code...');
        try {
            const res = await axios.post('http://localhost:5001/api/v1/auth/otp/send', { userId });
            const code = res.data.code;
            setOtpError('');
            setOtp(['', '', '', '', '', '']);
            setResendCountdown(60);
            toast.success(`🔑 [Eco-Hive Secure] Verification code resent: ${code}`, {
                duration: 12000,
                icon: '🔒'
            });
        } catch (err) {
            console.error("Error resending OTP:", err);
            toast.error('Failed to resend verification code.');
        } finally {
            setLoading(false);
        }
    };

    // OTP input changes
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next character box
        if (element.value !== '' && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    // Step B: Verify OTP & Call Backend Checkout
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const enteredCode = otp.join('');
        
        if (enteredCode.length < 6) {
            setOtpError('Please enter all 6 digits.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/v1/auth/otp/verify', { userId, code: enteredCode });
            if (res.data.success) {
                setOtpError('');
                setShowOtpModal(false);
                setOtpVerified(true);
                // Proceed to stripe redirection
                await executeCheckoutPayment();
            } else {
                setOtpError(res.data.message || 'Invalid verification code.');
            }
        } catch (err) {
            console.error("OTP Verification failed:", err);
            setOtpError(err.response?.data?.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    const appliedGiftCardDeduction = applyGiftCard ? Math.min(giftCardBalance, totalAmount) : 0;
    const remainingTotal = totalAmount - appliedGiftCardDeduction;

    const executeCheckoutPayment = async () => {
        setShowRedirectModal(true);
        setLoading(true);
        setLoadingText(remainingTotal <= 0.01 ? 'Verifying payment and placing order...' : 'Redirecting to Stripe Secure Checkout...');

        try {
            const res = await axios.post('http://localhost:5001/api/v1/orders/checkout', {
                userId,
                items: cartItems,
                totalAmount: totalAmount,
                shippingAddress: address,
                useGiftCardBalance: applyGiftCard
            });

            // Redirect to Stripe Checkout URL
            if (res.data.url) {
                // Since checkout is finalized, redirect window directly
                window.location.href = res.data.url;
            } else {
                toast.error('Failed to initialize payment session.');
                setShowRedirectModal(false);
                setLoading(false);
            }
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to place order.');
            setShowRedirectModal(false);
            setLoading(false);
        }
    };

    const handleSecureExit = () => {
        setShowCancelModal(true);
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            {/* Distraction-Free Secure Checkout Header */}
            <div className="fixed-top d-flex justify-content-center w-100" style={{ zIndex: 1050, padding: '16px 0' }}>
                <nav className='navbar navbar-expand-lg glass-nav rounded-5 shadow-lg px-4 py-2' style={{ width: '95%', maxWidth: '1200px' }}>
                    <div className='container d-flex justify-content-between align-items-center'>
                        <div className='navbar-brand fw-bold fs-4 text-dark d-flex align-items-center' style={{ cursor: 'pointer' }} onClick={handleSecureExit}>
                            <div className="d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ height: '44px', width: '44px', borderRadius: '12px' }}>
                                <img 
                                    src="/images/logo.jpg" 
                                    alt="Eco-Hive Logo" 
                                    className="logo-img"
                                    style={{ height: '32px', width: '32px', objectFit: 'contain' }} 
                                />
                            </div>
                            <span className="ms-2 fw-bold text-dark fs-5">EcoHive</span>
                        </div>
                        <span className="fw-bold text-success small text-uppercase tracking-wider" style={{ letterSpacing: '1px' }}>🔒 SECURE CHECKOUT</span>
                    </div>
                </nav>
            </div>

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

                        <form onSubmit={handleInitiatePayment}>
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
                                <div className="col-12 col-md-6 d-flex flex-column">
                                    <h5 className="fw-bolder mb-4 border-bottom pb-3 text-dark">Payment Details</h5>
                                                     {/* Order Summary Breakdown */}
                                    <div className="rounded-4 p-4 mb-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)', fontSize: '14px' }}>
                                        <h6 className="fw-bold text-dark mb-3">Order Summary</h6>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Subtotal</span>
                                            <span className="fw-medium text-dark">${(totalAmount / 1.08).toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Estimated Tax (8%)</span>
                                            <span className="fw-medium text-dark">${(totalAmount - (totalAmount / 1.08)).toFixed(2)}</span>
                                        </div>
                                        {applyGiftCard && appliedGiftCardDeduction > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-success fw-semibold">
                                                <span>Gift Card Applied</span>
                                                <span>-${appliedGiftCardDeduction.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <hr className="my-2" style={{ opacity: 0.1 }} />
                                        <div className="d-flex justify-content-between fw-bold text-dark fs-6">
                                            <span>Total</span>
                                            <span>${remainingTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Apply Gift Card Switch */}
                                    {giftCardBalance > 0 && (
                                        <div className="form-check form-switch rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)', paddingLeft: '3rem' }}>
                                            <div className="flex-grow-1">
                                                <label className="form-check-label fw-bold text-dark d-block mb-0" htmlFor="giftCardToggle" style={{ cursor: 'pointer', fontSize: '14px' }}>Apply Gift Card Balance</label>
                                                <small className="text-muted" style={{ fontSize: '12px' }}>Available Balance: ${giftCardBalance.toFixed(2)}</small>
                                            </div>
                                            <input 
                                                className="form-check-input m-0" 
                                                type="checkbox" 
                                                role="switch" 
                                                id="giftCardToggle" 
                                                checked={applyGiftCard} 
                                                onChange={(e) => setApplyGiftCard(e.target.checked)} 
                                                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                            />
                                        </div>
                                    )}

                                    {remainingTotal <= 0.01 ? (
                                        <div className="rounded-4 p-4 text-center d-flex flex-column justify-content-center flex-grow-1" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                            <div className="mb-3" style={{ fontSize: '40px' }}>🎫</div>
                                            <h6 className="fw-bolder text-success mb-2">Paid via Gift Card Wallet</h6>
                                            <p className="text-muted small mb-0">
                                                Your order is fully covered by your gift card balance. No credit card is required.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-4 p-4 text-center d-flex flex-column justify-content-center flex-grow-1" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                            <div className="mb-3" style={{ fontSize: '40px' }}>💳</div>
                                            <h6 className="fw-bolder text-dark mb-2">Stripe Secure Checkout</h6>
                                            <p className="text-muted small mb-0">
                                                You will be redirected to Stripe to securely enter your card details or pay with Apple Pay / Google Pay.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-3">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary py-3 rounded-pill fw-medium px-4"
                                    onClick={handleSecureExit}
                                    style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary flex-grow-1 py-3 rounded-pill fw-medium d-flex justify-content-center align-items-center" 
                                    disabled={loading || timeLeft <= 0}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> {loadingText}</>
                                    ) : 'Pay Now & Place Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Premium Glassmorphic OTP Verification Modal */}
            {showOtpModal && (
                <div 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                >
                    <div className="glass-panel p-5 rounded-5 overflow-hidden text-center shadow-lg border" style={{ width: '90%', maxWidth: '420px', backgroundColor: 'var(--surface-color)' }}>
                        <div className="mb-4">
                            <div className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <span className="fs-3">🔑</span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-2">Two-Factor Authentication</h4>
                            <p className="text-muted small px-3">
                                We've sent a 6-digit confirmation code to your registered email.
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp}>
                            <div className="d-flex justify-content-center gap-2 mb-4">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="form-control text-center fs-4 fw-bold shadow-sm"
                                        style={{ width: '45px', height: '52px', border: 'var(--glass-border)' }}
                                        value={data}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                        onFocus={(e) => e.target.select()}
                                    />
                                ))}
                            </div>

                            {otpError && (
                                <div className="text-danger small mb-4 fw-medium">
                                    ⚠️ {otpError}
                                </div>
                            )}

                            {/* Resend OTP countdown timer and button */}
                            <div className="mb-4 text-center">
                                {resendCountdown > 0 ? (
                                    <span className="text-muted small">Resend code in {resendCountdown}s</span>
                                ) : (
                                    <button 
                                        type="button" 
                                        className="btn btn-link p-0 text-success fw-medium small"
                                        style={{ fontSize: '14px', textDecoration: 'none' }}
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                    >
                                        Resend Verification Code
                                    </button>
                                )}
                            </div>

                            <div className="d-flex gap-3">
                                <button 
                                    type="button" 
                                    className="btn btn-light rounded-pill px-4 flex-grow-1 fw-medium"
                                    onClick={() => setShowOtpModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary rounded-pill px-4 flex-grow-1 fw-medium text-white shadow-sm"
                                    style={{ backgroundColor: 'var(--accent-color, #1D9E75)' }}
                                >
                                    Verify Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Step 2: Redirection State Modal */}
            {showRedirectModal && (
                <div 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', 
                        zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                >
                    <div className="glass-panel p-5 rounded-5 text-center shadow-lg border" style={{ width: '90%', maxWidth: '440px', backgroundColor: 'var(--surface-color)' }}>
                        <div className="mb-4">
                            <div className="spinner-border text-success mb-4" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-2">Secure Payment Gateway</h4>
                            <p className="text-muted px-2">
                                You are being redirected to our secure payment partner. Please do not refresh this page or click the Back button.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Custom Cancellation Warning Dialogue Modal */}
            {showCancelModal && (
                <div 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                >
                    <div className="glass-panel p-5 rounded-5 text-center shadow-lg border" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)' }}>
                        <div className="mb-4">
                            <div className="mx-auto bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <span className="fs-3">⚠️</span>
                            </div>
                            <h4 className="fw-bolder text-dark mb-2">Cancel Transaction</h4>
                            <p className="text-muted px-2">
                                Are you sure you want to cancel this transaction?
                            </p>
                        </div>
                        <div className="d-flex gap-3">
                            <button 
                                type="button" 
                                className="btn btn-light rounded-pill px-4 flex-grow-1 fw-medium"
                                style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                                onClick={() => setShowCancelModal(false)}
                            >
                                Resume
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger text-white rounded-pill px-4 flex-grow-1 fw-medium shadow-sm"
                                style={{ backgroundColor: '#ff3b30' }}
                                onClick={() => {
                                    setShowCancelModal(false);
                                    navigate('/cart');
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Checkout;
