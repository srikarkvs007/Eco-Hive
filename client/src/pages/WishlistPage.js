import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const WishlistPage = () => {
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendationsLoading, setRecommendationsLoading] = useState(true);
    const [isAddingAll, setIsAddingAll] = useState(false);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Fetch Wishlist Items
        const fetchWishlist = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/wishlist/${userId}`);
                setWishlistItems(res.data);
            } catch (err) {
                console.error("Error loading wishlist:", err);
                toast.error("Failed to load your saved items.");
            } finally {
                setLoading(false);
            }
        };

        // Fetch Recommendations
        const fetchRecommendations = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/products`);
                // Pick 4 random eco-friendly products
                const eco = res.data.filter(p => p.isEcoFriendly).slice(0, 4);
                setRecommendedProducts(eco);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
            } finally {
                setRecommendationsLoading(false);
            }
        };

        fetchWishlist();
        fetchRecommendations();
    }, [userId]);

    const handleRemoveItem = async (e, productId) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:5001/api/wishlist/${userId}/${productId}`);
            setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
            toast.success("Item removed from your Saves.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove item.");
        }
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        if (!userId) {
            navigate('/');
            return;
        }
        try {
            await axios.post('http://localhost:5001/api/cart', {
                userId,
                productId: product.id,
                quantity: 1
            });
            
            // Prefetch updated cart in background to keep navbar synced and speed up cart load
            axios.get(`http://localhost:5001/api/cart/${userId}`)
                .then(res => {
                    localStorage.setItem('cart_cache', JSON.stringify(res.data));
                    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: res.data }));
                })
                .catch(err => console.error("Error updating cart cache in background:", err));

            toast.success(`${product.title} added to your Cart!`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add item to Cart.");
        }
    };

    const handleAddAllToCart = async () => {
        if (wishlistItems.length === 0) return;
        setIsAddingAll(true);
        try {
            for (const item of wishlistItems) {
                await axios.post('http://localhost:5001/api/cart', {
                    userId,
                    productId: item.productId,
                    quantity: 1
                });
            }
            
            // Prefetch and sync
            const res = await axios.get(`http://localhost:5001/api/cart/${userId}`);
            localStorage.setItem('cart_cache', JSON.stringify(res.data));
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: res.data }));

            toast.success("All items added to your Cart!");
            navigate('/cart');
        } catch (err) {
            console.error("Error adding all to cart:", err);
            toast.error("Some items could not be added to Cart.");
        } finally {
            setIsAddingAll(false);
        }
    };

    const handleShareList = () => {
        const shareUrl = `${window.location.origin}/saves?user=${userId}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                toast.success("Saves list link copied to clipboard!");
            })
            .catch(() => {
                toast.error("Failed to copy link.");
            });
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Your Saves | Eco-Hive Wishlist" 
                description="View your saved eco-friendly items, share your wishlist, or move products directly to your cart." 
            />
            <Navbar />

            <div className="container flex-grow-1" style={{ maxWidth: '1000px', paddingTop: '150px', paddingBottom: 'var(--spacing-premium)' }}>
                
                {/* Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 pb-3 border-bottom">
                    <div>
                        <h1 className="fw-bolder text-dark mb-1" style={{ fontSize: '38px', letterSpacing: '-0.025em' }}>Your Saved Items</h1>
                        <p className="text-muted mb-0">Manage products you have saved for later purchases.</p>
                    </div>
                    {userId && wishlistItems.length > 0 && (
                        <div className="d-flex gap-2 mt-4 mt-md-0">
                            <button onClick={handleShareList} className="btn btn-outline-secondary rounded-pill px-4 fw-medium" style={{ fontSize: '14px' }}>
                                🔗 Share List
                            </button>
                            <button 
                                onClick={handleAddAllToCart} 
                                className="btn btn-primary rounded-pill px-4 fw-medium shadow-sm" 
                                style={{ fontSize: '14px' }}
                                disabled={isAddingAll}
                            >
                                {isAddingAll ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span> Adding...
                                    </>
                                ) : '🛒 Add All to Cart'}
                            </button>
                        </div>
                    )}
                </div>

                {!userId ? (
                    <div className="card border-0 rounded-5 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                        <span style={{ fontSize: '64px' }}>🤍</span>
                        <h4 className="fw-bold mt-4">Please Log In</h4>
                        <p className="text-muted mb-4">You need to have an active Eco-Hive account to view and save items.</p>
                        <button className="btn btn-dark rounded-pill px-5 py-3 fw-medium" onClick={() => navigate('/')}>Sign In / Register</button>
                    </div>
                ) : loading ? (
                    <div className="card border-0 rounded-5 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                        <div className="spinner-border text-primary mb-3"></div>
                        <h5 className="fw-bold">Loading your wishlist...</h5>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="card border-0 rounded-5 p-5 text-center shadow-sm mb-5" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                        <span style={{ fontSize: '64px' }}>🤍</span>
                        <h4 className="fw-bold mt-4">Your Saves is Empty</h4>
                        <p className="text-muted mb-4">Bookmark eco-friendly products during your search to see them in this space.</p>
                        <button className="btn btn-primary rounded-pill px-5 py-3 fw-medium" onClick={() => navigate('/home')}>Start Exploring</button>
                    </div>
                ) : (
                    /* Wishlist Items List */
                    <div className="d-flex flex-column gap-3 mb-5">
                        <AnimatePresence mode="popLayout">
                            {wishlistItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.04 }}
                                    onClick={() => navigate(`/product/${item.product.id}`)}
                                    className="premium-card p-4 rounded-5 cursor-pointer d-flex flex-column flex-md-row align-items-center justify-content-between gap-4"
                                    style={{ border: 'var(--glass-border)', backgroundColor: 'var(--bg-elevated)', cursor: 'pointer' }}
                                >
                                    <div className="d-flex align-items-center flex-grow-1 w-100 gap-4">
                                        <div className="bg-white rounded-4 p-2 shadow-sm d-flex justify-content-center align-items-center" style={{ width: '90px', height: '90px' }}>
                                            <img src={item.product.imageUrl || 'https://via.placeholder.com/90'} alt={item.product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div>
                                            {item.product.isEcoFriendly && (
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 mb-2 fw-bold border border-success border-opacity-25" style={{ fontSize: '10px' }}>
                                                    🌿 Eco-Certified
                                                </span>
                                            )}
                                            <h5 className="fw-bolder text-dark mb-1" style={{ fontSize: '18px' }}>{item.product.title}</h5>
                                            <p className="text-muted small mb-0">Added: {new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between justify-content-md-end w-100 gap-4">
                                        <div className="text-end">
                                            <span className="text-muted small">Price</span>
                                            <h4 className="fw-bolder text-primary mb-0">${item.product.price.toFixed(2)}</h4>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button 
                                                onClick={(e) => handleAddToCart(e, item.product)}
                                                className="btn btn-outline-primary rounded-pill px-4 fw-medium"
                                                style={{ fontSize: '13px', height: '42px' }}
                                            >
                                                Add to Cart
                                            </button>
                                            <button 
                                                onClick={(e) => handleRemoveItem(e, item.product.id)}
                                                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                style={{ width: '42px', height: '42px' }}
                                                title="Remove Item"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Recommendations Section */}
                <div className="mt-5 pt-4">
                    <h4 className="fw-bolder text-dark mb-4">Recommended For You</h4>
                    {recommendationsLoading ? (
                        <div className="spinner-border text-primary spinner-border-sm"></div>
                    ) : (
                        <div className="row g-4">
                            {recommendedProducts.map(p => (
                                <div className="col-12 col-md-3" key={p.id}>
                                    <div 
                                        onClick={() => navigate(`/product/${p.id}`)}
                                        className="premium-card p-3 rounded-5 h-100 cursor-pointer d-flex flex-column text-center transition-all"
                                        style={{ border: 'var(--glass-border)', backgroundColor: 'var(--bg-elevated)', cursor: 'pointer' }}
                                    >
                                        <div className="bg-white rounded-4 p-3 mb-3 d-flex justify-content-center align-items-center" style={{ height: '140px' }}>
                                            <img src={p.imageUrl || 'https://via.placeholder.com/120'} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <h6 className="fw-bolder text-dark mb-1 text-truncate">{p.title}</h6>
                                        <p className="text-primary fw-bolder mb-3">${p.price.toFixed(2)}</p>
                                        <button 
                                            onClick={(e) => handleAddToCart(e, p)}
                                            className="btn btn-dark rounded-pill px-3 py-1 btn-sm mt-auto fw-medium"
                                            style={{ fontSize: '12px' }}
                                        >
                                            Quick Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default WishlistPage;
