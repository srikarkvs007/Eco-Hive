import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onDelete }) => {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(() => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        return wishlist.includes(product.id);
    });
    const navigate = useNavigate();
    
    // Placeholder image if none provided
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x300?text=Eco-Hive+Product';

    const handleAddToCart = async (e) => {
        if(e) e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login first to add items.');
            return;
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
            setTimeout(() => {
                setIsAdded(false);
                navigate('/cart');
            }, 500); // Small delay to show animation before redirecting
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error('Failed to add to cart.');
            setIsAdding(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5001/api/products/${product.id}`);
                if (onDelete) {
                    onDelete(product.id);
                }
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product.');
            }
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const userId = localStorage.getItem('userId');
        if (!userId) {
            toast.error('Please login to use wishlist.');
            return;
        }

        const newStatus = !isWishlisted;
        setIsWishlisted(newStatus); // Optimistic UI update
        
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (newStatus) {
            if (!wishlist.includes(product.id)) wishlist.push(product.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            toast.success('Added to Wishlist ❤️');
            try {
                await axios.post('http://localhost:5001/api/wishlist', { userId, productId: product.id });
            } catch (err) {
                console.error(err);
            }
        } else {
            wishlist = wishlist.filter(id => id !== product.id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            toast.success('Removed from Wishlist');
            try {
                await axios.delete(`http://localhost:5001/api/wishlist/${userId}/${product.id}`);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const role = localStorage.getItem('role');

    return (
        <motion.div 
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="glass-card-premium position-relative d-flex flex-column text-decoration-none"
            style={{ height: '100%', padding: 0 }}
        >
            
            {/* Delete Button (Top Right) - ADMIN ONLY */}
            {role === 'Admin' && (
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDelete}
                    className="btn btn-sm btn-danger position-absolute shadow-sm" 
                    style={{ top: '10px', right: '10px', zIndex: 10, borderRadius: '50%' }}
                    title="Delete Product"
                >
                    ✕
                </motion.button>
            )}
            
            {/* Wishlist Button (Top Left) */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
                className="btn position-absolute" 
                style={{ top: '16px', left: '16px', zIndex: 10, borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isWishlisted ? '#ffeff1' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: 'none', color: isWishlisted ? '#ff2d55' : '#86868b', fontSize: '18px' }}
                title="Toggle Wishlist"
            >
                {isWishlisted ? '♥' : '♡'}
            </motion.button>

            <Link to={`/product/${product.id}`} className="text-decoration-none text-dark d-flex flex-column w-100 h-100" style={{ filter: product.stockQuantity <= 0 ? 'grayscale(1)' : 'none' }}>
                <div className="position-relative w-100 aspect-portrait" style={{ backgroundColor: 'var(--surface-color)' }}>
                    {product.stockQuantity <= 0 && (
                        <div className="position-absolute top-50 start-50 translate-middle text-white fw-bold px-4 py-2 rounded-pill shadow-lg" style={{ zIndex: 5, letterSpacing: '1px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
                            SOLD OUT
                        </div>
                    )}
                    <img 
                        src={imageUrl} 
                        srcSet={`${imageUrl}?w=400&dpr=1 1x, ${imageUrl}?w=800&dpr=2 2x`}
                        alt={product.title} 
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x300?text=Eco-Hive+Product';
                        }}
                    />
                </div>
                
                <div className="card-body d-flex flex-column p-4 w-100 flex-grow-1">
                    {product.isEcoFriendly && (
                        <div className="mb-2">
                            <span className="badge rounded-pill" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontSize: '11px', fontWeight: '600' }}>🌿 Eco-Certified</span>
                        </div>
                    )}
                    <h5 className="fw-bold mb-1 text-primary text-truncate" style={{ letterSpacing: '-0.02em', fontSize: '20px' }}>{product.title}</h5>
                    <p className="text-muted mb-3" style={{ fontSize: '14px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.features}
                    </p>
                    
                    <div className="mt-auto d-flex justify-content-between align-items-end" style={{ borderTop: 'var(--glass-border)', paddingTop: '16px' }}>
                        <div className="d-flex flex-column">
                            <span className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Price</span>
                            <span className="fs-4 lh-1" style={{ letterSpacing: '-0.02em', fontWeight: '600', color: 'var(--accent-color)' }}>${product.price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Slide-up CTA */}
            <div className="cta-slide-up">
                <button 
                    onClick={handleAddToCart} 
                    className="btn btn-primary w-100 rounded-pill py-3 fw-medium shadow-lg"
                    disabled={isAdding || product.stockQuantity <= 0}
                    style={{ fontSize: '15px', letterSpacing: '-0.01em', backdropFilter: 'blur(10px)' }}
                >
                    {isAdding ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span> Adding</>
                    ) : isAdded ? (
                        'Added ✓'
                    ) : product.stockQuantity <= 0 ? (
                        'Out of Stock'
                    ) : (
                        'Add to Cart'
                    )}
                </button>
            </div>
            
            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                <div 
                    className="position-absolute text-center w-100"
                    style={{ bottom: '-24px', color: '#d9534f', fontSize: '12px', fontWeight: '600', pointerEvents: 'none' }}
                >
                    Only {product.stockQuantity} left!
                </div>
            )}
        </motion.div>
    );
};

export default ProductCard;
