import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const PaymentGateway = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Processing Payment...');
    
    // Timer states (5 minutes = 300 seconds)
    const [timeLeft, setTimeLeft] = useState(300);

    // Cart and address details
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [address, setAddress] = useState('');

    // OTP MFA States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    // New verification UI states
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const otpInputsRef = useRef([]);

    // Auto focus the first box on modal open
    useEffect(() => {
        if (showOtpModal) {
            setTimeout(() => {
                if (otpInputsRef.current[0]) {
                    otpInputsRef.current[0].focus();
                }
            }, 150);
        }
    }, [showOtpModal]);

    // Dialog & Redirect States
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRedirectModal, setShowRedirectModal] = useState(false);

    // Gift Card States
    const [giftCardBalance, setGiftCardBalance] = useState(0.0);
    const [applyGiftCard, setApplyGiftCard] = useState(false);

    // Promo Code States
    const [promoCode, setPromoCode] = useState('');
    const [isPromoApplied, setIsPromoApplied] = useState(false);

    const userId = localStorage.getItem('userId');

    // Parse query params for cancel state
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('canceled') === 'true') {
            toast.error('Transaction was cancelled by user.', { id: 'payment-cancelled-toast' });
            // Clean URL query parameter
            navigate('/gateway', { replace: true });
            // Immediately send back to shop home
            navigate('/home?store=true', { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        // Prevent back action
        window.history.pushState(null, null, window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, null, window.location.href);
            setShowCancelModal(true);
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        // Retrieve shipping address
        const savedAddress = localStorage.getItem('shipping_address');
        if (!savedAddress) {
            toast.error('Shipping address is missing. Redirecting to checkout.');
            navigate('/checkout');
            return;
        }
        setAddress(savedAddress);

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
                console.error("Error fetching cart for gateway:", err);
            }
        };

        // Fetch User details
        const fetchUserPhone = async () => {
            if (!userId) return;
            try {
                const userRes = await axios.get(`http://localhost:5001/api/v1/users/profile`);
                if (userRes.data && userRes.data.giftCardBalance !== undefined) {
                    setGiftCardBalance(userRes.data.giftCardBalance);
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        fetchCart();
        fetchUserPhone();

        const handleBeforeUnload = (e) => {
            if (!loading && !otpVerified) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [userId, loading, otpVerified, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            toast.error('Payment session expired. Returning to store.', { id: 'payment-expired-toast' });
            navigate('/home?store=true');
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, navigate]);

    useEffect(() => {
        if (resendCountdown <= 0) return;
        const intervalId = setInterval(() => {
            setResendCountdown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [resendCountdown]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLoadingText('Requesting verification code...');
        try {
            await axios.post('http://localhost:5001/api/auth/send-otp');
            setOtpError('');
            setOtp(['', '', '', '', '', '']);
            setShowOtpModal(true);
            setResendCountdown(60);
            toast.success(`🔑 [Eco-Hive Secure] Verification code sent to your registered email address.`, {
                duration: 6000,
                icon: '🔒'
            });
        } catch (err) {
            console.error("Error generating OTP:", err);
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setLoadingText('Resending verification code...');
        try {
            await axios.post('http://localhost:5001/api/auth/send-otp');
            setOtpError('');
            setOtp(['', '', '', '', '', '']);
            setResendCountdown(60);
            toast.success(`🔑 [Eco-Hive Secure] New verification code sent to your email.`, {
                duration: 6000,
                icon: '🔒'
            });
        } catch (err) {
            console.error("Error resending OTP:", err);
            toast.error('Failed to resend verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (element, index) => {
        const val = element.value;
        if (isNaN(val)) return false;

        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        // Auto-move to next input box
        if (val !== '' && index < 5 && otpInputsRef.current[index + 1]) {
            otpInputsRef.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];
            if (otp[index] !== '') {
                // Clear current box if filled
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // If empty, clear and focus previous box
                newOtp[index - 1] = '';
                setOtp(newOtp);
                if (otpInputsRef.current[index - 1]) {
                    otpInputsRef.current[index - 1].focus();
                }
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasteData)) {
            const newOtp = pasteData.split('');
            setOtp(newOtp);
            if (otpInputsRef.current[5]) {
                otpInputsRef.current[5].focus();
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const enteredCode = otp.join('');
        if (enteredCode.length < 6) {
            setOtpError('Please enter all 6 digits.');
            return;
        }

        setIsVerifying(true);
        setOtpError('');
        try {
            const res = await axios.post('http://localhost:5001/api/auth/verify-otp', { otp: enteredCode });
            if (res.data.success) {
                setIsSuccess(true);
                setTimeout(async () => {
                    setShowOtpModal(false);
                    setOtpVerified(true);
                    setIsVerifying(false);
                    setIsSuccess(false);
                    await executeCheckoutPayment();
                }, 1200);
            } else {
                setIsVerifying(false);
                setOtpError(res.data.message || 'Invalid or expired verification code.');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            }
        } catch (err) {
            console.error("OTP Verification failed:", err);
            setIsVerifying(false);
            setOtpError(err.response?.data?.message || 'Invalid or expired verification code.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
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
            if (res.data.url) {
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

    const handleApplyPromo = (e) => {
        if (e) e.preventDefault();
        if (promoCode.trim().toUpperCase() === 'ECOWARRIOR10') {
            if (isPromoApplied) {
                toast.error('Promo code already applied!');
                return;
            }
            setIsPromoApplied(true);
            const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
            const discount = subtotal * 0.10;
            const newTotal = (subtotal - discount) * 1.08;
            setTotalAmount(newTotal);
            toast.success('Promo code applied! 10% off your purchase.');
        } else {
            toast.error('Invalid promo code.');
        }
    };

    const handleApplyPromoCard = () => {
        navigator.clipboard.writeText('ECOWARRIOR10');
        setPromoCode('ECOWARRIOR10');
        if (isPromoApplied) {
            toast.success('Code ECOWARRIOR10 copied!');
            return;
        }
        setIsPromoApplied(true);
        const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const discount = subtotal * 0.10;
        const newTotal = (subtotal - discount) * 1.08;
        setTotalAmount(newTotal);
        toast.success('Promo code copied & applied! 10% off.', { icon: '🎉' });
    };

    const handleSecureExit = () => {
        setShowCancelModal(true);
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            {/* Distraction-Free Header */}
            <div className="fixed-top d-flex justify-content-center w-100" style={{ zIndex: 1050, padding: '16px 0' }}>
                <nav className='navbar navbar-expand-lg glass-nav rounded-5 shadow-lg px-4 py-2' style={{ width: '95%', maxWidth: '1200px' }}>
                    <div className='container d-flex justify-content-between align-items-center'>
                        <div className='navbar-brand fw-bold fs-4 text-dark d-flex align-items-center' style={{ cursor: 'pointer' }} onClick={handleSecureExit}>
                            <div className="d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ height: '44px', width: '44px', borderRadius: '12px' }}>
                                <img 
                                    src={process.env.PUBLIC_URL + "/images/logo.jpg"} 
                                    alt="Eco-Hive Logo" 
                                    style={{ height: '32px', width: '32px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
                                />
                            </div>
                            <span className="ms-2 fw-bold text-dark fs-5">EcoHive Gateway</span>
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
                            <div className="mb-4" style={{ fontSize: '48px' }}>💳</div>
                            <h2 className="fw-bolder mb-3" style={{ fontSize: '32px', letterSpacing: '-0.02em' }}>Secure Payment Gateway</h2>
                            <p className="text-muted">Review shipping summary and authorize transaction.</p>
                        </div>

                        <form onSubmit={handleInitiatePayment}>
                            <div className="row g-5 mb-5">
                                {/* Shipping Summary */}
                                <div className="col-12 col-md-6">
                                    <h5 className="fw-bolder mb-4 border-bottom pb-3 text-dark">Delivery Address</h5>
                                    <div className="p-4 rounded-4 bg-white shadow-sm border text-muted" style={{ minHeight: '120px', fontSize: '15px', lineHeight: '1.6' }}>
                                        {address || 'Loading shipping address...'}
                                    </div>
                                    <div className="mt-3">
                                        <button type="button" onClick={() => navigate('/checkout')} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                            ✏️ Edit Address
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="col-12 col-md-6 d-flex flex-column">
                                    <h5 className="fw-bolder mb-4 border-bottom pb-3 text-dark">Payment Breakdown</h5>

                                    <div 
                                        className="card border-dashed rounded-4 p-3 mb-4 text-center cursor-pointer transition-all"
                                        onClick={handleApplyPromoCard}
                                        style={{ 
                                            backgroundColor: 'rgba(29, 158, 117, 0.05)', 
                                            border: '2px dashed rgba(29, 158, 117, 0.3)', 
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(29, 158, 117, 0.1)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(29, 158, 117, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between px-2">
                                            <div className="text-start">
                                                <span className="badge bg-success-subtle text-success mb-1" style={{ fontSize: '10px' }}>PROMO OFFERS</span>
                                                <h6 className="fw-bold text-dark mb-0">Use code: <code className="text-primary fs-6">ECOWARRIOR10</code></h6>
                                                <small className="text-muted" style={{ fontSize: '11px' }}>Click to copy & apply 10% discount instantly.</small>
                                            </div>
                                            <span className="fs-3">🎟️</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 mb-4">
                                        <input 
                                            type="text" 
                                            className="form-control rounded-pill px-3 shadow-none" 
                                            placeholder="Enter discount code" 
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            style={{ fontSize: '13px' }}
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-dark rounded-pill px-4 fw-medium"
                                            onClick={handleApplyPromo}
                                            style={{ fontSize: '13px' }}
                                        >
                                            Apply
                                        </button>
                                    </div>

                                    <div className="rounded-4 p-4 mb-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)', fontSize: '14px' }}>
                                        <h6 className="fw-bold text-dark mb-3">Order Summary</h6>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Subtotal</span>
                                            <span className="fw-medium text-dark">
                                                ${(cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)).toFixed(2)}
                                            </span>
                                        </div>
                                        {isPromoApplied && (
                                            <div className="d-flex justify-content-between mb-2 text-success fw-semibold">
                                                <span>Promo Discount (10%)</span>
                                                <span>
                                                    -${(cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * 0.10).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Estimated Tax (8%)</span>
                                            <span className="fw-medium text-dark">
                                                ${((cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) - (isPromoApplied ? cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * 0.10 : 0)) * 0.08).toFixed(2)}
                                            </span>
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
                                                You will be redirected to Stripe to securely enter your card details.
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

            {/* OTP Modal */}
            {showOtpModal && (
                <div 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <div className="glass-panel p-5 rounded-5 overflow-hidden text-center shadow-lg border" style={{ width: '90%', maxWidth: '420px', backgroundColor: 'var(--surface-color)' }}>
                        {isSuccess ? (
                            <div className="success-checkmark py-4">
                                <div className="mx-auto bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                    <span className="fs-1">✅</span>
                                </div>
                                <h4 className="fw-bolder text-success mb-2">Verified!</h4>
                                <p className="text-muted small">Redirecting to checkout payment...</p>
                            </div>
                        ) : (
                            <>
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
                                    <div className={`d-flex justify-content-center gap-2 mb-4 ${isShaking ? 'shake' : ''}`}>
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
                                                onPaste={handleOtpPaste}
                                                onFocus={(e) => e.target.select()}
                                                ref={(el) => (otpInputsRef.current[index] = el)}
                                                disabled={isVerifying}
                                                pattern="\d*"
                                                inputMode="numeric"
                                            />
                                        ))}
                                    </div>

                                    {otpError && (
                                        <div className="text-danger small mb-4 fw-medium">
                                            ⚠️ {otpError}
                                        </div>
                                    )}

                                    <div className="mb-4 text-center">
                                        {resendCountdown > 0 ? (
                                            <span className="text-muted small">Resend code in {resendCountdown}s</span>
                                        ) : (
                                            <button 
                                                type="button" 
                                                className="btn btn-link p-0 text-success fw-medium small"
                                                style={{ fontSize: '14px', textDecoration: 'none' }}
                                                onClick={handleResendOtp}
                                                disabled={isVerifying}
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
                                            disabled={isVerifying}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary rounded-pill px-4 flex-grow-1 fw-medium text-white shadow-sm d-flex justify-content-center align-items-center"
                                            style={{ backgroundColor: 'var(--accent-color, #1D9E75)' }}
                                            disabled={isVerifying || otp.some(d => d === '')}
                                        >
                                            {isVerifying ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                'Verify Code'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Redirection Modal */}
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
                                You are being redirected to our secure payment partner. Please do not refresh this page.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Transaction warning Modal */}
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
                                    navigate('/home?store=true');
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

export default PaymentGateway;
