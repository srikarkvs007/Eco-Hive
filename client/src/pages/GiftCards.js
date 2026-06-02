import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const THEMES = [
    { id: 'gold', name: '✨ Classic Gold', background: 'linear-gradient(135deg, #1d1d1f 0%, #3a3d40 100%)', textColor: '#f5f5f7', accentColor: '#d4af37', icon: '✨' },
    { id: 'emerald', name: '🌿 Emerald Eco', background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', textColor: '#f0fdf4', accentColor: '#34d399', icon: '🌿' },
    { id: 'birthday', name: '🎈 Birthday Bloom', background: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)', textColor: '#fff0f6', accentColor: '#fbcfe8', icon: '🎈' },
    { id: 'thanks', name: '🌸 Thank You Leaf', background: 'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)', textColor: '#f0f9ff', accentColor: '#bae6fd', icon: '🌸' }
];

const PRESETS = [25, 50, 100, 200];

const GiftCards = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('purchase');
    const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
    const [amount, setAmount] = useState(50);
    const [customAmount, setCustomAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [senderName, setSenderName] = useState(localStorage.getItem('name') || '');
    const [senderEmail, setSenderEmail] = useState(localStorage.getItem('email') || '');
    const [message, setMessage] = useState('');
    
    // Redeem State
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);
    
    // Balance State
    const [walletBalance, setWalletBalance] = useState(0.0);
    const [history, setHistory] = useState([]);
    
    // Checkout State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    
    // Success State
    const [purchasedCard, setPurchasedCard] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchWalletData();
    }, [userId]);

    const fetchWalletData = async () => {
        try {
            const balanceRes = await axios.get('http://localhost:5001/api/gift-cards/balance');
            setWalletBalance(balanceRes.data.giftCardBalance);
            
            const historyRes = await axios.get('http://localhost:5001/api/gift-cards/my-activity');
            setHistory(historyRes.data);
        } catch (err) {
            console.error("Error loading wallet details:", err);
        }
    };

    const handlePresetClick = (val) => {
        setAmount(val);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const val = e.target.value;
        setCustomAmount(val);
        setAmount(parseFloat(val) || 0);
    };

    const handleInitPurchase = (e) => {
        e.preventDefault();
        if (amount < 10 || amount > 2000) {
            toast.error("Gift card amount must be between $10 and $2,000.");
            return;
        }
        setShowPaymentModal(true);
    };

    const executePurchase = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);

        try {
            const res = await axios.post('http://localhost:5001/api/gift-cards/purchase', {
                amount,
                recipientName,
                recipientEmail,
                senderName,
                senderEmail,
                message,
                design: selectedTheme.name
            });

            if (res.data.giftCard) {
                setPurchasedCard(res.data.giftCard);
                toast.success("Gift Card Purchased Successfully!");
                setShowPaymentModal(false);
                fetchWalletData(); // refresh history
                
                // Clear fields
                setRecipientName('');
                setRecipientEmail('');
                setMessage('');
                setCustomAmount('');
                setAmount(50);
            }
        } catch (err) {
            console.error("Purchase error:", err);
            toast.error(err.response?.data?.message || "Failed to complete purchase.");
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!redeemCode.trim()) return;
        setRedeemLoading(true);

        try {
            const res = await axios.post('http://localhost:5001/api/gift-cards/redeem', {
                code: redeemCode
            });

            toast.success(res.data.message || `Redeemed $${res.data.amountRedeemed} successfully!`);
            setRedeemCode('');
            fetchWalletData(); // Refresh balance & list
        } catch (err) {
            console.error("Redemption error:", err);
            toast.error(err.response?.data?.message || "Invalid or expired Gift Card code.");
        } finally {
            setRedeemLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Eco-Hive Gift Cards | Give the Gift of Sustainability" 
                description="Purchase customizable digital gift cards for friends and family. Eco-friendly, instant delivery, and fully functional." 
            />
            <Navbar />

            <div className="container flex-grow-1" style={{ maxWidth: '1000px', paddingTop: '150px', paddingBottom: 'var(--spacing-premium)' }}>
                
                {/* Header */}
                <div className="text-center mb-5">
                    <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 mb-3 fw-bold border border-success border-opacity-25"
                    >
                        🎁 Digital Gift Voucher Store
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.025em' }}
                    >
                        Eco-Hive Gift Cards
                    </motion.h1>
                    <p className="text-muted fs-5">Share the gift of choosing green. Instant email delivery, customizable designs, and premium digital cards.</p>

                    {/* Navigation Tabs */}
                    <div className="d-flex justify-content-center gap-2 mt-4">
                        {['purchase', 'redeem', 'balance'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setPurchasedCard(null);
                                }}
                                className={`btn rounded-pill px-4 py-2 btn-sm fw-medium transition-all ${activeTab === tab ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                style={{ fontSize: '13px', textTransform: 'capitalize' }}
                            >
                                {tab === 'purchase' ? '🛒 Buy a Gift Card' : tab === 'redeem' ? '🎫 Redeem Card' : '💳 Wallet Balance'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="row g-5">
                    {activeTab === 'purchase' && (
                        <>
                            {/* Left Column: Customizer Form */}
                            <div className="col-12 col-md-6 order-2 order-md-1">
                                <h4 className="fw-bolder text-dark mb-4">1. Gift Card Details</h4>
                                
                                <form onSubmit={handleInitPurchase} className="card border-0 rounded-5 p-4 p-md-5 shadow-sm d-flex flex-column gap-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    
                                    {/* Design Theme Selector */}
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Select Theme Design</label>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {THEMES.map(theme => (
                                                <button
                                                    key={theme.id}
                                                    type="button"
                                                    className="btn rounded-pill btn-sm px-3 py-2 fw-medium border text-nowrap"
                                                    style={{
                                                        backgroundColor: selectedTheme.id === theme.id ? 'var(--surface-color)' : 'transparent',
                                                        borderColor: selectedTheme.id === theme.id ? 'var(--accent-blue)' : 'rgba(0,0,0,0.1)',
                                                        color: 'var(--text-primary)',
                                                        fontSize: '12px'
                                                    }}
                                                    onClick={() => setSelectedTheme(theme)}
                                                >
                                                    {theme.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount Selector */}
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Select Amount</label>
                                        <div className="d-flex gap-2 mb-3">
                                            {PRESETS.map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    className={`btn rounded-pill flex-grow-1 py-2 fw-bold ${amount === val && !customAmount ? 'btn-dark' : 'btn-light border'}`}
                                                    onClick={() => handlePresetClick(val)}
                                                >
                                                    ${val}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="input-group">
                                            <span className="input-group-text bg-transparent border-0 pe-2 fw-bold text-muted">$</span>
                                            <input
                                                type="number"
                                                className="form-control rounded-pill px-3"
                                                placeholder="Or Enter Custom Amount (Min $10)"
                                                value={customAmount}
                                                onChange={handleCustomAmountChange}
                                                min="10"
                                                max="2000"
                                                style={{ height: '44px', fontSize: '14px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Recipient details */}
                                    <div className="row g-3">
                                        <div className="col-12 col-sm-6">
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Recipient Name</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-pill px-3"
                                                placeholder="Recipient Name"
                                                value={recipientName}
                                                onChange={(e) => setRecipientName(e.target.value)}
                                                required
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Recipient Email</label>
                                            <input
                                                type="email"
                                                className="form-control rounded-pill px-3"
                                                placeholder="recipient@email.com"
                                                value={recipientEmail}
                                                onChange={(e) => setRecipientEmail(e.target.value)}
                                                required
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Sender details */}
                                    <div className="row g-3">
                                        <div className="col-12 col-sm-6">
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Your Name</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-pill px-3"
                                                value={senderName}
                                                onChange={(e) => setSenderName(e.target.value)}
                                                required
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                        <div className="col-12 col-sm-6">
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Your Email</label>
                                            <input
                                                type="email"
                                                className="form-control rounded-pill px-3"
                                                value={senderEmail}
                                                onChange={(e) => setSenderEmail(e.target.value)}
                                                required
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Personal Message</label>
                                        <textarea
                                            className="form-control rounded-4 p-3"
                                            rows="3"
                                            placeholder="Write a warm note to the recipient..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            style={{ fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-primary rounded-pill py-3 fw-bold mt-2 shadow-sm">
                                        Proceed to Purchase
                                    </button>
                                </form>
                            </div>

                            {/* Right Column: Live Dynamic Preview */}
                            <div className="col-12 col-md-6 order-1 order-md-2 d-flex flex-column align-items-center">
                                <h4 className="fw-bolder text-dark mb-4 align-self-start">2. Live Card Preview</h4>
                                
                                <AnimatePresence mode="wait">
                                    {!purchasedCard ? (
                                        <motion.div
                                            key="card-preview"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="card border-0 rounded-5 p-5 shadow-lg d-flex flex-column justify-content-between position-sticky"
                                            style={{
                                                top: '120px',
                                                width: '100%',
                                                maxWidth: '420px',
                                                height: '250px',
                                                background: selectedTheme.background,
                                                color: selectedTheme.textColor,
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            {/* Glow overlay */}
                                            <div className="position-absolute" style={{ top: '-40%', left: '-20%', width: '150%', height: '150%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />

                                            <div className="d-flex justify-content-between align-items-start position-relative z-1">
                                                <div>
                                                    <span className="fs-5 me-1">{selectedTheme.icon}</span>
                                                    <span className="fw-bolder small text-uppercase tracking-widest" style={{ color: selectedTheme.accentColor }}>Eco-Hive Gift Card</span>
                                                </div>
                                                <h4 className="fw-black mb-0">${amount || 0}</h4>
                                            </div>

                                            <div className="my-3 position-relative z-1">
                                                <p className="small text-truncate mb-1 opacity-90" style={{ fontStyle: 'italic', fontSize: '13px' }}>
                                                    {message ? `"${message}"` : '"Wishing you an amazing green future!"'}
                                                </p>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-end position-relative z-1">
                                                <div className="small">
                                                    <span className="text-uppercase opacity-75 d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>For</span>
                                                    <strong className="text-uppercase" style={{ fontSize: '12px' }}>{recipientName || 'Name'}</strong>
                                                </div>
                                                <div className="small text-end">
                                                    <span className="text-uppercase opacity-75 d-block text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>From</span>
                                                    <strong className="text-uppercase" style={{ fontSize: '12px' }}>{senderName || 'Name'}</strong>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="success-card"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="card border-0 rounded-5 p-5 text-center shadow-lg border border-success"
                                            style={{ maxWidth: '420px', backgroundColor: 'var(--surface-color)' }}
                                        >
                                            <div className="fs-1 mb-3">🎉</div>
                                            <h4 className="fw-bolder text-dark mb-2">Purchase Completed!</h4>
                                            <p className="text-muted small mb-4">Your digital gift card has been registered and emailed to <strong>{purchasedCard.recipientEmail}</strong>.</p>
                                            
                                            {/* Digital Card Voucher representation */}
                                            <div className="rounded-4 p-4 mb-4 text-white text-start d-flex flex-column justify-content-between position-relative overflow-hidden" style={{ background: selectedTheme.background, height: '180px' }}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <span className="fw-bold small text-uppercase">Eco-Hive digital voucher</span>
                                                    <h5 className="fw-black mb-0">${purchasedCard.amount}</h5>
                                                </div>
                                                <div className="text-center font-monospace bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 py-2 px-3 my-3">
                                                    <code className="text-white fs-6 font-bold" style={{ letterSpacing: '2px' }}>{purchasedCard.code}</code>
                                                </div>
                                                <div className="small d-flex justify-content-between text-uppercase" style={{ fontSize: '10px' }}>
                                                    <span>Code: Active</span>
                                                    <span>Theme: {purchasedCard.design}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button className="btn btn-dark rounded-pill px-4 flex-grow-1" onClick={() => navigator.clipboard.writeText(purchasedCard.code).then(() => toast.success("Code copied!"))}>
                                                    📋 Copy Voucher Code
                                                </button>
                                                <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setPurchasedCard(null)}>
                                                    Buy Another
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}

                    {activeTab === 'redeem' && (
                        <div className="col-12">
                            <h4 className="fw-bolder text-dark mb-4">Redeem Gift Card</h4>
                            
                            <div className="row g-4 justify-content-center">
                                <div className="col-12 col-md-7">
                                    <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div className="fs-1 mb-3">🎫</div>
                                        <h5 className="fw-bold text-dark mb-2">Claim Gift Voucher</h5>
                                        <p className="text-muted small mb-4">Paste your unique 16-character code (ECO-XXXX-XXXX-XXXX) below to redeem the face value directly into your account's cash wallet.</p>
                                        
                                        <form onSubmit={handleRedeem} className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                            <input 
                                                type="text"
                                                className="form-control rounded-pill px-4 text-center font-monospace"
                                                placeholder="ECO-XXXX-XXXX-XXXX"
                                                value={redeemCode}
                                                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                                required
                                                disabled={redeemLoading}
                                                style={{ height: '48px', fontSize: '16px', letterSpacing: '2px', backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)', textTransform: 'uppercase' }}
                                            />
                                            <button 
                                                type="submit"
                                                className="btn btn-dark rounded-pill px-5 fw-bold"
                                                style={{ height: '48px' }}
                                                disabled={redeemLoading}
                                            >
                                                {redeemLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Redeem to Wallet'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'balance' && (
                        <div className="col-12">
                            <h4 className="fw-bolder text-dark mb-4">Wallet Balance & History</h4>
                            
                            <div className="row g-4 mb-5">
                                {/* Wallet Visual card */}
                                <div className="col-12 col-md-5">
                                    <div className="card border-0 rounded-5 p-5 text-white shadow-lg position-relative overflow-hidden h-100 d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #434345 100%)', minHeight: '220px' }}>
                                        <div className="position-absolute" style={{ top: '-10%', right: '-5%', opacity: 0.15, fontSize: '140px' }}>💳</div>
                                        <div>
                                            <h6 className="small text-uppercase fw-bold text-white opacity-75 tracking-wider mb-1">Eco-Hive Store Wallet</h6>
                                            <span className="small text-muted" style={{ color: 'rgba(255,255,255,0.4) !important', fontSize: '11px' }}>Cash Balance</span>
                                        </div>
                                        <div>
                                            <h1 className="fw-black text-white mb-2" style={{ fontSize: '48px' }}>${walletBalance.toFixed(2)}</h1>
                                            <span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-1 fw-bold border border-success border-opacity-25" style={{ fontSize: '11px' }}>
                                                🟢 Wallet Active
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick instructions */}
                                <div className="col-12 col-md-7">
                                    <div className="card border-0 rounded-5 p-5 shadow-sm h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <h5 className="fw-bold text-dark mb-3">How to use your wallet</h5>
                                        <ul className="text-muted small ps-3 mb-0 d-flex flex-column gap-2" style={{ lineHeight: '1.6' }}>
                                            <li>Your wallet balance acts as digital cash in your Eco-Hive account.</li>
                                            <li>When you proceed to checkout, you can toggle "Apply Gift Card Balance" in the payments panel.</li>
                                            <li>If the wallet covers the total, the order is fulfilled instantly without Stripe credit card verification.</li>
                                            <li>Redeemed funds have no expiry date and are non-transferable.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Transaction logs */}
                            <div>
                                <h5 className="fw-bold text-dark mb-4">📜 Gift Card Transactions Log</h5>
                                {history.length === 0 ? (
                                    <div className="card border-0 rounded-5 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <p className="text-muted small mb-0">No gift card purchases or redemptions found for this account.</p>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {history.map(item => {
                                            const isPurchasedByUser = item.senderEmail === senderEmail;
                                            const isRedeemedByUser = item.redeemedById === userId;
                                            
                                            let badgeText = 'Active';
                                            let badgeBg = 'bg-success';
                                            let descriptionText = '';
                                            let amountSign = '';
                                            let amountColor = '';

                                            if (isRedeemedByUser) {
                                                badgeText = 'Redeemed';
                                                badgeBg = 'bg-secondary';
                                                descriptionText = `Redeemed card sent by ${item.senderName}`;
                                                amountSign = '+';
                                                amountColor = 'text-success';
                                            } else if (isPurchasedByUser) {
                                                badgeText = item.status;
                                                badgeBg = item.status === 'Active' ? 'bg-primary' : 'bg-secondary';
                                                descriptionText = `Purchased for ${item.recipientName} (${item.recipientEmail})`;
                                                amountSign = '-';
                                                amountColor = 'text-danger';
                                            } else {
                                                descriptionText = `Received from ${item.senderEmail}`;
                                                amountSign = '+';
                                                amountColor = 'text-success';
                                            }

                                            return (
                                                <div key={item.id} className="p-4 rounded-4 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <h6 className="fw-bolder text-dark mb-0">{item.code}</h6>
                                                            <span className={`badge rounded-pill ${badgeBg}`} style={{ fontSize: '10px' }}>{badgeText}</span>
                                                        </div>
                                                        <span className="small text-muted d-block">{descriptionText}</span>
                                                        <small className="text-muted">Transaction Date: {new Date(item.createdAt).toLocaleDateString()}</small>
                                                    </div>
                                                    <div className="text-end">
                                                        <h5 className={`fw-bolder mb-0 ${amountColor}`}>{amountSign}${item.amount.toFixed(2)}</h5>
                                                        <span className="small text-muted">{item.design} Theme</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Custom Payment Modal for purchasing */}
            {showPaymentModal && (
                <div 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                        zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                >
                    <div className="bg-white shadow-lg overflow-hidden border animate-fade-in" style={{ width: '90%', maxWidth: '400px', borderRadius: '28px' }}>
                        <div className="p-4 border-bottom text-center bg-light">
                            <h5 className="fw-bold text-dark mb-0">🔑 Mock Credit Card Payment</h5>
                        </div>
                        <form onSubmit={executePurchase} className="p-4 d-flex flex-column gap-3">
                            <div className="text-center rounded-4 p-3 bg-light border mb-2">
                                <span className="small text-muted d-block text-uppercase">Payment Amount</span>
                                <h4 className="fw-black text-dark mb-0">${amount.toFixed(2)}</h4>
                            </div>

                            {paymentLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                                    <h6 className="fw-bold text-dark">Processing Payment...</h6>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-pill px-3"
                                            placeholder="4111 2222 3333 4444"
                                            maxLength="19"
                                            required
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                                            style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                        />
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-7">
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Expiry Date</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-pill px-3 text-center"
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                required
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                        <div className="col-5">
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">CVV</label>
                                            <input
                                                type="password"
                                                className="form-control rounded-pill px-3 text-center"
                                                placeholder="***"
                                                maxLength="3"
                                                required
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Cardholder Name</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-pill px-3"
                                            placeholder="John Doe"
                                            required
                                            value={cardDetails.name}
                                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                            style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                        />
                                    </div>
                                    <div className="d-flex gap-2 pt-3">
                                        <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" style={{ border: '1px solid rgba(0,0,0,0.1)', fontSize: '14px' }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-success text-white rounded-pill px-4 flex-grow-1 fw-bold" style={{ fontSize: '14px' }}>Confirm Pay</button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default GiftCards;
