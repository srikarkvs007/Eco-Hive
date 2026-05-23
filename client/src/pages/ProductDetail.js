import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    
    // Badge Hover State
    const [hoveredBadge, setHoveredBadge] = useState(null);

    // Reviews State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState([]);
    
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/products/${id}`);
                setProduct(res.data);
                setReviews(res.data.reviews || []);
                
                // Fetch recommendations
                const allProductsRes = await axios.get('http://localhost:5001/api/products');
                const allProducts = allProductsRes.data;
                const others = allProducts.filter(p => p.id !== id);
                // Shuffle and pick 3
                const shuffled = others.sort(() => 0.5 - Math.random());
                setRecommendations(shuffled.slice(0, 3));
                
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

    const addToCart = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login first to add items.');
            return false;
        }

        setIsAdding(true);
        try {
            await axios.post('http://localhost:5001/api/cart', {
                userId,
                productId: product.id,
                quantity: parseInt(quantity)
            });
            setIsAdding(false);
            setIsAdded(true);
            toast.success('Added to cart!');
            setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
            return true;
        } catch (err) {
            console.error('Error adding to cart:', err);
            const errMsg = err.response?.data?.message || 'Failed to add to cart.';
            toast.error(errMsg);
            setIsAdding(false);
            return false;
        }
    };

    const handleAddToCart = async () => {
        const success = await addToCart();
        if (success) {
            setTimeout(() => {
                navigate('/cart');
            }, 500);
        }
    };

    const handleBuyNow = async () => {
        const success = await addToCart();
        if (success) {
            navigate('/cart');
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to submit a review');
            return;
        }
        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }
        if (!reviewText.trim()) {
            toast.error('Please write a review');
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5001/api/products/${id}/reviews`, {
                userId,
                rating,
                comment: reviewText
            });
            
            setReviews([res.data, ...reviews]);
            setRating(0);
            setHoverRating(0);
            setReviewText('');
            toast.success('Review submitted! Thank you.');
        } catch (err) {
            console.error('Failed to submit review:', err);
            toast.error('Failed to submit review.');
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    if (loading) {
        return (
            <div style={{ backgroundColor: '#f5f5f7', minHeight: '100vh' }}>
                <Navbar showSearch={false} />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ backgroundColor: '#f5f5f7', minHeight: '100vh' }}>
                <Navbar showSearch={false} />
                <div className="container text-center py-5">
                    <h2>Product not found.</h2>
                </div>
            </div>
        );
    }

    const imageUrl = product.imageUrl || 'https://via.placeholder.com/600x600?text=Eco-Hive+Product';

    return (
        <div style={{ backgroundColor: '#f5f5f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <SEO 
                title={`${product.title} - Eco-Hive`} 
                description={product.description || product.features || 'Premium eco-friendly product from Eco-Hive.'} 
                image={imageUrl} 
            />
            <Navbar showSearch={true} />
            
            <div className="layout-container" style={{ flexGrow: 1, paddingTop: '160px', paddingBottom: 'var(--spacing-premium)' }}>
                <div className="row g-5">
                    {/* Left Side - Image with Premium Sticky Hover Zoom */}
                    <div className="col-12 col-md-6 position-relative">
                        <div 
                            className="position-sticky rounded-5 overflow-hidden d-flex align-items-center justify-content-center aspect-square" 
                            style={{ top: '120px', backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                        >
                        <img 
                            src={imageUrl} 
                            srcSet={`${imageUrl}?w=800&dpr=1 1x, ${imageUrl}?w=1600&dpr=2 2x`}
                            alt={product.title} 
                            fetchpriority="high"
                            decoding="sync"
                            className="product-detail-img" 
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = 'https://via.placeholder.com/600x600?text=Eco-Hive+Product';
                            }}
                        />
                        </div>
                    </div>
                    
                    {/* Right Side - Details */}
                    <div className="col-12 col-md-6 py-5 pe-lg-5 d-flex flex-column justify-content-start">
                        {/* Interactive Eco-Impact Badges */}
                        <div className="d-flex flex-wrap gap-2 mb-4">
                            {product.isEcoFriendly && (
                                <div className="position-relative d-inline-block" onMouseEnter={() => setHoveredBadge('eco')} onMouseLeave={() => setHoveredBadge(null)}>
                                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill shadow-sm" style={{ cursor: 'pointer', border: '1px solid #c3e6cb' }}>🌿 Eco-Certified</span>
                                    {hoveredBadge === 'eco' && (
                                        <div className="position-absolute bg-dark text-white p-2 rounded-3 shadow animate-fade-in" style={{ top: '-45px', left: '50%', transform: 'translateX(-50%)', width: '200px', fontSize: '12px', zIndex: 10, textAlign: 'center' }}>
                                            Meets strict environmental standards for sustainability.
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="position-relative d-inline-block" onMouseEnter={() => setHoveredBadge('carbon')} onMouseLeave={() => setHoveredBadge(null)}>
                                <span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill shadow-sm" style={{ cursor: 'pointer', border: '1px solid #bee5eb' }}>☁️ Carbon Neutral</span>
                                {hoveredBadge === 'carbon' && (
                                    <div className="position-absolute bg-dark text-white p-2 rounded-3 shadow animate-fade-in" style={{ top: '-45px', left: '50%', transform: 'translateX(-50%)', width: '200px', fontSize: '12px', zIndex: 10, textAlign: 'center' }}>
                                        Emissions from manufacturing and shipping are 100% offset.
                                    </div>
                                )}
                            </div>
                            <div className="position-relative d-inline-block" onMouseEnter={() => setHoveredBadge('plastic')} onMouseLeave={() => setHoveredBadge(null)}>
                                <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill shadow-sm" style={{ cursor: 'pointer', border: '1px solid #ffeeba' }}>♻️ Plastic-Free</span>
                                {hoveredBadge === 'plastic' && (
                                    <div className="position-absolute bg-dark text-white p-2 rounded-3 shadow animate-fade-in" style={{ top: '-45px', left: '50%', transform: 'translateX(-50%)', width: '200px', fontSize: '12px', zIndex: 10, textAlign: 'center' }}>
                                        Packaging and product contain zero single-use plastic.
                                    </div>
                                )}
                            </div>
                        </div>

                        <h1 className="fw-bolder mb-2 text-dark" style={{ fontSize: '56px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                            {product.title}
                        </h1>
                        <p className="fw-medium mb-5 text-dark" style={{ fontSize: '32px', letterSpacing: '-0.01em' }}>
                            ${product.price.toFixed(2)}
                        </p>

                        {product.description && (
                            <div className="mb-4">
                                <p className="text-muted" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <h5 className="fw-bold mb-2 text-dark">Product Features</h5>
                            <p className="text-muted" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                                {product.features || "No specific features listed."}
                            </p>
                        </div>

                        <div className="mb-4">
                            <h5 className="fw-bold mb-2 text-dark">Specifications</h5>
                            <p className="text-muted" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                                {product.specifications || "No specifications available."}
                            </p>
                        </div>

                        <div className="mb-5 pb-4 border-bottom">
                            <h5 className="fw-bold mb-3 text-dark" style={{ fontSize: '20px' }}>Perfect For</h5>
                            <p className="text-muted" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                                {product.perfectFor || "Anyone looking to reduce their carbon footprint."}
                            </p>
                        </div>

                        <div className="d-flex align-items-center mb-4 p-4 rounded-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                            <span className="fw-bolder me-4 text-dark text-uppercase small" style={{ letterSpacing: '1px' }}>Quantity</span>
                            <div className="d-flex align-items-center bg-white rounded-pill shadow-sm" style={{ padding: '4px', border: 'var(--glass-border)' }}>
                                <button className="btn btn-sm btn-light rounded-circle" style={{ width: '36px', height: '36px' }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input 
                                    type="number" 
                                    className="form-control border-0 text-center bg-transparent" 
                                    value={quantity} 
                                    min="1" 
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ fontWeight: '600', width: '50px', WebkitAppearance: 'none' }}
                                />
                                <button className="btn btn-sm btn-light rounded-circle" style={{ width: '36px', height: '36px' }} onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <span className="ms-auto text-muted fw-medium small">
                                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                            </span>
                        </div>

                        <div className="d-flex gap-3 mt-4">
                            <button 
                                onClick={handleAddToCart} 
                                className={`btn rounded-pill fw-medium px-4 py-3 flex-grow-1 ${isAdded ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                disabled={product.stockQuantity <= 0 || isAdding}
                            >
                                {isAdding ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span> Adding...</>
                                ) : isAdded ? (
                                    'Added ✓'
                                ) : product.stockQuantity <= 0 ? (
                                    'Out of Stock'
                                ) : (
                                    'Add to Cart'
                                )}
                            </button>
                            <button 
                                onClick={handleBuyNow} 
                                className="btn btn-primary rounded-pill fw-medium px-4 py-3 flex-grow-1" 
                                disabled={product.stockQuantity <= 0}
                            >
                                Buy Now
                            </button>
                        </div>
                        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                            <div className="mt-3 text-center text-danger fw-bold fs-5">
                                🔥 Hurry! Only {product.stockQuantity} left in stock.
                            </div>
                        )}
                    </div>
                </div>
                {/* 5-Star Rating & Reviews Section */}
                <div className="row mt-5 pt-5">
                    <div className="col-12">
                        <div className="card border-0 rounded-5 p-5" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                            <h3 className="fw-bolder mb-5" style={{ fontSize: '32px', letterSpacing: '-0.02em' }}>Customer Reviews</h3>
                            <div className="row g-5">
                                <div className="col-md-5 mb-4 mb-md-0">
                                    <h5 className="fw-bold mb-4">Write a Review</h5>
                                    <form onSubmit={submitReview}>
                                        <div className="mb-3 d-flex align-items-center">
                                            <div className="me-3 text-muted">Your Rating:</div>
                                            <div style={{ fontSize: '24px', cursor: 'pointer' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span 
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        style={{ color: star <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9' }}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <textarea 
                                                className="form-control bg-light rounded-3" 
                                                rows="4" 
                                                placeholder="Share your thoughts on this eco-product..."
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-dark rounded-pill px-4">Submit Review</button>
                                    </form>
                                </div>
                                <div className="col-md-7 ps-md-5 border-start">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="fs-1 fw-bold me-3 text-dark">{averageRating}</div>
                                        <div>
                                            <div style={{ color: '#ffc107', fontSize: '20px' }}>
                                                {'★'.repeat(Math.round(parseFloat(averageRating)))}{'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
                                            </div>
                                            <div className="text-muted small">Based on {reviews.length} reviews</div>
                                        </div>
                                    </div>
                                    <div className="reviews-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {reviews.length === 0 ? (
                                            <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                                        ) : reviews.map(rev => (
                                            <div key={rev.id} className="mb-4 pb-4 border-bottom">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="fw-bold text-dark">{rev.user?.name || rev.user || 'Eco-Hive User'}</div>
                                                    <div className="text-muted small">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : rev.date}</div>
                                                </div>
                                                <div style={{ color: '#ffc107', fontSize: '14px', marginBottom: '8px' }}>
                                                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                </div>
                                                <p className="text-muted mb-0">{rev.comment || rev.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="row mt-5">
                        <div className="col-12">
                            <h3 className="fw-bold mb-4">You May Also Like</h3>
                            <div className="row g-4">
                                {recommendations.map(rec => (
                                    <div key={rec.id} className="col-12 col-md-4">
                                        <div 
                                            className="card border-0 shadow-sm rounded-4 overflow-hidden h-100" 
                                            style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                                            onClick={() => navigate(`/product/${rec.id}`)}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div className="bg-light p-4 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                                                <img 
                                                    src={rec.imageUrl || 'https://via.placeholder.com/300x300?text=Eco-Product'} 
                                                    alt={rec.title}
                                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x300?text=Eco-Product'; }}
                                                />
                                            </div>
                                            <div className="card-body p-4 text-center">
                                                <h5 className="fw-bolder text-dark mb-2">{rec.title}</h5>
                                                <p className="text-muted mb-0 fw-medium">${rec.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
            
            <Footer />
            <style>{`
                .animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(5px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
            `}</style>
        </div>
    );
};

export default ProductDetail;
