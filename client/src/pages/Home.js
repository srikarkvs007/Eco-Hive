import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useSearchParams } from 'react-router-dom';
import { getCachedData, setCachedData } from '../utils/apiCache';

// Framer Motion scroll animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const storeParam = searchParams.get('store');

    // Filter States
    const [sortBy, setSortBy] = useState('');
    const [ecoFriendlyOnly, setEcoFriendlyOnly] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Manage whether we are in "Landing" or "Store" mode
    const [showStore, setShowStore] = useState(!!searchQuery || storeParam === 'true');

    useEffect(() => {
        if (storeParam === 'true' || searchQuery) {
            setShowStore(true);
        } else if (!storeParam && !searchQuery) {
            setShowStore(false);
        }
    }, [storeParam, searchQuery]);

    // Community Forest stats state & effect
    const [forestStats, setForestStats] = useState(null);

    useEffect(() => {
        const fetchForestStats = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/products/community-forest/stats');
                setForestStats(res.data);
            } catch (err) {
                console.error("Failed to fetch community forest stats:", err);
            }
        };
        if (!showStore) {
            fetchForestStats();
        }
    }, [showStore]);

    
    // Transition states
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [overlayFadingOut, setOverlayFadingOut] = useState(false);

    const handleGoToStore = (e) => {
        if (e) e.preventDefault();
        setIsTransitioning(true);
        setOverlayFadingOut(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            setShowStore(true);
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            // Let the user look at the loading screen for a bit to "take time"
            setTimeout(() => {
                setOverlayFadingOut(true); // Trigger CSS fade out
                setTimeout(() => {
                    setIsTransitioning(false);
                    setOverlayFadingOut(false);
                }, 800); // Wait for CSS opacity transition to finish
            }, 1200);
        }, 400);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            let url = `http://localhost:5001/api/products?search=${searchQuery || ''}`;
            if (sortBy) url += `&sortBy=${sortBy}`;
            if (ecoFriendlyOnly) url += `&ecoFriendlyOnly=true`;
            if (inStockOnly) url += `&inStockOnly=true`;
            if (minPrice) url += `&minPrice=${minPrice}`;
            if (maxPrice) url += `&maxPrice=${maxPrice}`;

            const cached = getCachedData(url);
            if (cached) {
                setProducts(cached);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await axios.get(url);
                setProducts(res.data);
                setCachedData(url, res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchQuery, sortBy, ecoFriendlyOnly, inStockOnly, minPrice, maxPrice]);

    const handleProductDeleted = (deletedId) => {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== deletedId));
    };

    const scrollToLearnMore = () => {
        const el = document.getElementById('learn-more-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // No BannerLogo needed since official logo is in the navbar

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.5 }}
            className="bg-light"
        >
            <SEO 
                title={showStore ? "Eco-Hive Store | Sustainable Products" : "Eco-Hive | Thoughtfully Made. Naturally Better."} 
                description="Discover our collection of premium, carbon-neutral, and plastic-free goods." 
            />
            
            {/* The Loading Transition Overlay */}
            {isTransitioning && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
                    style={{ 
                        backgroundColor: 'var(--bg-color)', 
                        zIndex: 9999,
                        opacity: overlayFadingOut ? 0 : 1,
                        transition: 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                >
                    <style>{`
                        @keyframes pulseLogo {
                            0% { transform: scale(0.95); opacity: 0.6; }
                            50% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(0.95); opacity: 0.6; }
                        }
                    `}</style>
                    <img 
                        src="/images/logo.jpg" 
                        alt="Eco-Hive" 
                        style={{ 
                            height: '100px', 
                            mixBlendMode: localStorage.getItem('theme') === 'dark' ? 'screen' : 'darken', 
                            filter: localStorage.getItem('theme') === 'dark' ? 'invert(1) contrast(1.2)' : 'contrast(1.2)', 
                            animation: 'pulseLogo 2s infinite ease-in-out' 
                        }} 
                    />
                    <div className="mt-4 fw-medium" style={{ color: 'var(--text-primary)', letterSpacing: '0.05em', fontSize: '18px', opacity: 0.8 }}>
                        Preparing your Store Experience...
                    </div>
                </div>
            )}

            <Navbar showSearch={showStore} onStoreClick={handleGoToStore} onLogoClick={() => setShowStore(false)} isHeroPage={!showStore} />



            {/* Vertically Stacked Hero Sections (Hide when in Store view) */}
            {!showStore && (
                <div className="d-flex flex-column bg-light">

                    {/* Hero Section 1 - White Marble (Banner 2) */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="w-100 d-flex flex-column align-items-center position-relative mt-4 ambient-radial-hero aspect-hero" 
                        style={{
                            maxWidth: '2400px',
                            margin: '0 auto var(--spacing-premium) auto',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="hero-image-container position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                            <picture>
                                <source srcSet="/images/eco_product_4k.webp" type="image/webp" />
                                <img 
                                    src="/images/eco_product_4k.jpg" 
                                    alt="Eco-Hive Banner" 
                                    fetchpriority="high" 
                                    decoding="sync" 
                                />
                            </picture>
                        </div>
                        {/* Content floats cleanly inside a glassmorphism card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="position-absolute d-flex flex-column align-items-center text-center p-4 rounded-5 shadow glass-panel" 
                            style={{ top: '15%', zIndex: 2, minWidth: '450px' }}
                        >
                            <h2 className="fw-bolder mb-2 text-dark" style={{ fontSize: '72px', letterSpacing: '-0.03em' }}>
                                Eco-Hive
                            </h2>
                            <p className="fw-medium mb-3 text-dark" style={{ fontSize: '32px', letterSpacing: '-0.01em' }}>
                                Thoughtfully Made. Naturally Better.
                            </p>
                            <p className="fs-5 fw-normal mb-5 text-muted" style={{ letterSpacing: '0.01em' }}>
                                Sustainable materials. Conscious choices.
                            </p>
                            <div className="d-flex gap-3">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-dark rounded-pill px-5 fw-medium shadow-sm" style={{ fontSize: '16px' }} onClick={handleGoToStore}>
                                    Buy
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-light rounded-pill px-4 fw-medium text-primary" style={{ fontSize: '16px' }} onClick={scrollToLearnMore}>
                                    Learn more &gt;
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Section 2 - Mountain (Banner 1) */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="w-100 d-flex flex-column align-items-center position-relative aspect-hero" 
                        style={{
                            backgroundColor: '#000',
                            maxWidth: '2400px',
                            margin: '0 auto var(--spacing-premium) auto',
                            borderRadius: 'var(--radius-xl)',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="hero-image-container position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
                            <img 
                                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=90&fit=crop" 
                                alt="Live Green Banner" 
                                loading="lazy" 
                                decoding="async" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {/* Gradient Overlay for Text Legibility */}
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 45%)', zIndex: 1 }}></div>
                        </div>
                        <div className="position-absolute d-flex flex-column align-items-center text-center" style={{ top: '8%', zIndex: 2 }}>
                            <h2 className="fw-bolder mb-1" style={{ fontSize: '56px', letterSpacing: '-0.015em', color: '#f5f5f7' }}>
                                Live Green.
                            </h2>
                            <p className="fw-normal mb-3" style={{ fontSize: '28px', letterSpacing: '0.01em', color: '#f5f5f7' }}>
                                Live Better.
                            </p>
                            <div className="d-flex gap-3">
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn rounded-pill px-4 fw-medium shadow-sm" style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f', fontSize: '15px', padding: '8px 16px' }} onClick={handleGoToStore}>
                                    Shop Now
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn rounded-pill px-4 fw-medium" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.4)', color: '#ffffff', fontSize: '15px', padding: '8px 16px' }} onClick={scrollToLearnMore}>
                                    Learn more &gt;
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Split View for Banner 3 and 4 */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="row g-4 mx-0 w-100 px-3" 
                        style={{ maxWidth: '2400px', margin: '0 auto var(--spacing-premium) auto' }}
                    >
                        {/* Hero Section 3 - Sprout */}
                        <motion.div variants={fadeInUp} className="col-12 col-md-6">
                            <div className="w-100 position-relative d-flex flex-column align-items-center rounded-5 overflow-hidden aspect-hero" style={{
                                backgroundColor: '#000'
                            }}>
                                <img 
                                    src="/images/banner3.png" 
                                    alt="Small Steps" 
                                    loading="lazy" 
                                    decoding="async" 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
                                />
                                <div className="d-flex flex-column justify-content-center align-items-center text-center position-relative w-100 h-100" style={{ zIndex: 2 }}>
                                    <h3 className="fw-bolder mb-1" style={{ fontSize: '56px', letterSpacing: '-0.02em', color: '#f5f5f7' }}>Small Steps.</h3>
                                    <p className="fs-4 mb-4" style={{ color: '#f5f5f7' }}>Big Impact.</p>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn rounded-pill px-4 fw-medium shadow-sm" style={{ backgroundColor: '#f5f5f7', color: '#1d1d1f', fontSize: '14px' }} onClick={scrollToLearnMore}>
                                        Learn more
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Section 4 - Ocean */}
                        <motion.div variants={fadeInUp} className="col-12 col-md-6">
                            <div className="w-100 position-relative d-flex flex-column align-items-center rounded-5 overflow-hidden aspect-hero" style={{
                                backgroundColor: '#000'
                            }}>
                                <img 
                                    src="/images/banner4.png" 
                                    alt="Better for Earth" 
                                    loading="lazy" 
                                    decoding="async" 
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
                                />
                                <div className="d-flex flex-column justify-content-center align-items-center text-center position-relative w-100 h-100" style={{ zIndex: 2 }}>
                                    <h3 className="fw-bolder mb-1" style={{ fontSize: '56px', letterSpacing: '-0.02em', color: '#f5f5f7' }}>Better for Earth.</h3>
                                    <p className="fs-4 mb-4" style={{ color: '#a1a1a6' }}>Cleaner future.</p>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn rounded-pill px-4 fw-medium shadow-sm" style={{ backgroundColor: '#2997ff', color: '#fff', fontSize: '14px' }} onClick={handleGoToStore}>
                                        Explore
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            )}

            {/* Store View (Products List) */}
            {showStore && (
                <div className="layout-container" style={{ paddingTop: '160px', paddingBottom: 'var(--spacing-premium)' }}>

                    {/* Search Results Header */}
                    {searchQuery ? (
                        <h2 className="fw-bolder mb-5 text-dark" style={{ fontSize: '32px', letterSpacing: '-0.02em' }}>Results for "{searchQuery}"</h2>
                    ) : (
                        <h2 className="fw-bolder mb-5 text-dark" style={{ fontSize: '32px', letterSpacing: '-0.02em' }}>Featured Products</h2>
                    )}

                    {/* Advanced Filtering UI */}
                    <div className="p-4 rounded-5 mb-5 d-flex flex-wrap gap-4 align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                        <div className="d-flex align-items-center">
                            <span className="fw-bold text-dark me-3 small text-uppercase" style={{ letterSpacing: '1px' }}>Sort By</span>
                            <select 
                                className="form-select form-select-sm border-0 rounded-pill px-4 py-2 fw-medium" 
                                style={{ width: 'auto', backgroundColor: '#fff', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="">Featured</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3 border-start ps-4">
                            <span className="fw-bold text-dark small text-uppercase tracking-wider">Filters</span>
                            
                            <div className="form-check form-switch d-flex align-items-center m-0 gap-2 p-0">
                                <label className="form-check-label fw-medium text-dark small m-0" style={{ cursor: 'pointer' }} htmlFor="ecoToggle">🌿 Eco-Certified</label>
                                <input className="form-check-input m-0 mt-1" type="checkbox" role="switch" id="ecoToggle" checked={ecoFriendlyOnly} onChange={(e) => setEcoFriendlyOnly(e.target.checked)} style={{ cursor: 'pointer' }} />
                            </div>

                            <div className="form-check form-switch d-flex align-items-center m-0 gap-2 p-0 ms-2">
                                <label className="form-check-label fw-medium text-dark small m-0" style={{ cursor: 'pointer' }} htmlFor="stockToggle">📦 In Stock</label>
                                <input className="form-check-input m-0 mt-1" type="checkbox" role="switch" id="stockToggle" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-3 border-start ps-4 ms-auto">
                            <span className="fw-bold text-dark small text-uppercase me-2" style={{ letterSpacing: '1px' }}>Price</span>
                            <div className="input-group input-group-sm" style={{ width: '110px' }}>
                                <span className="input-group-text bg-white border-0 fw-bold rounded-start-pill ps-3 shadow-sm">$</span>
                                <input type="number" className="form-control border-0 px-1 text-center fw-medium rounded-end-pill shadow-sm" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                            </div>
                            <span className="text-muted fw-bold">-</span>
                            <div className="input-group input-group-sm" style={{ width: '110px' }}>
                                <span className="input-group-text bg-white border-0 fw-bold rounded-start-pill ps-3 shadow-sm">$</span>
                                <input type="number" className="form-control border-0 px-1 text-center fw-medium rounded-end-pill shadow-sm" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                            {[...Array(8)].map((_, i) => (
                                <div className="col" key={`skeleton-${i}`}>
                                    <SkeletonProductCard />
                                </div>
                            ))}
                        </div>
                    ) : (!Array.isArray(products) || products.length === 0) ? (
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                            <h4 className="text-muted">No products found.</h4>
                            <p>Check back later or try a different search!</p>
                        </div>
                    ) : (
                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"
                        >
                            {Array.isArray(products) && products.map(product => (
                                <motion.div variants={fadeInUp} className="col" key={product.id}>
                                    <ProductCard product={product} onDelete={handleProductDeleted} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            )}

            {/* Community Forest Goal Section (Visible in Landing Mode) */}
            {!showStore && (
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeInUp}
                    className="w-100"
                    style={{ 
                        paddingTop: 'var(--spacing-premium)', 
                        paddingBottom: 'var(--spacing-premium)', 
                        background: 'linear-gradient(180deg, var(--bg-color) 0%, var(--bg-elevated) 100%)',
                        borderTop: 'var(--glass-border)'
                    }}
                >
                    <div className="layout-container py-4">
                        <div 
                            className="p-5 rounded-5 shadow-sm border position-relative overflow-hidden text-center text-md-start"
                            style={{ 
                                backgroundColor: 'var(--bg-elevated)', 
                                borderColor: 'var(--border-color)',
                                border: 'var(--glass-border)',
                                background: 'radial-gradient(circle at 90% 10%, rgba(40, 167, 69, 0.05) 0%, transparent 60%)'
                            }}
                        >
                            <div className="row align-items-center g-4">
                                <div className="col-12 col-md-7">
                                    <div className="d-flex align-items-center gap-3 justify-content-center justify-content-md-start mb-3">
                                        <div 
                                            className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{ 
                                                width: '50px', 
                                                height: '50px', 
                                                backgroundColor: 'rgba(46, 204, 113, 0.15)', 
                                                color: '#2ecc71'
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.664 3.328a.5.5 0 0 0 .447.722H13.5a.5.5 0 0 0 .447-.722L12.28 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5zM7.787 1.567l2.18 3.273h-.967a.5.5 0 0 0-.416.777l2.18 3.273h-.967a.5.5 0 0 0-.416.777l2.18 4.364H3.843l2.18-4.364a.5.5 0 0 0-.416-.777h-.967l2.18-3.273h-.967a.5.5 0 0 0-.416-.777l2.18-3.273z"/>
                                            </svg>
                                        </div>
                                        <span className="text-uppercase fw-bold tracking-wider text-success" style={{ fontSize: '14px', letterSpacing: '2px' }}>
                                            Community Milestone
                                        </span>
                                    </div>
                                    <h2 className="fw-bolder mb-3 text-dark" style={{ fontSize: '36px', letterSpacing: '-0.02em' }}>
                                        Eco-Hive Community Forest
                                    </h2>
                                    <p className="text-muted fs-6 mb-4 mb-md-0" style={{ maxWidth: '600px', lineHeight: '1.6' }}>
                                        Every order placed and every points reward redeemed directly funds global reforestation projects. Together as a community, we are planting a greener, healthier future.
                                    </p>
                                </div>
                                <div className="col-12 col-md-5">
                                    <div className="p-4 rounded-4 bg-white shadow-sm border border-light">
                                        <div className="d-flex justify-content-between align-items-end mb-2">
                                            <div>
                                                <span className="text-muted small fw-medium d-block text-uppercase">Total Trees Planted</span>
                                                <span className="fs-2 fw-bolder text-dark">
                                                    {forestStats?.totalPlanted?.toLocaleString() || '1,500'}
                                                </span>
                                            </div>
                                            <div className="text-end">
                                                <span className="text-muted small fw-medium d-block text-uppercase">Target Goal</span>
                                                <span className="fs-5 fw-bold text-muted">
                                                    {forestStats?.targetGoal?.toLocaleString() || '5,000'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className="progress rounded-pill mb-3" 
                                            style={{ height: '14px', backgroundColor: '#f1f2f6', overflow: 'hidden' }}
                                        >
                                            <div 
                                                className="progress-bar rounded-pill" 
                                                role="progressbar" 
                                                style={{ 
                                                    width: `${forestStats?.percentage || 30}%`, 
                                                    background: 'linear-gradient(90deg, #2ecc71 0%, #27ae60 100%)',
                                                    transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }} 
                                                aria-valuenow={forestStats?.percentage || 30} 
                                                aria-valuemin="0" 
                                                aria-valuemax="100"
                                            />
                                        </div>
                                        
                                        <div className="d-flex justify-content-between text-muted small fw-medium">
                                            <span>{forestStats?.percentage || 30}% Completed</span>
                                            <span>
                                                {((forestStats?.targetGoal || 5000) - (forestStats?.totalPlanted || 1500)).toLocaleString()} to go
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Learn More Section (Visible in Landing Mode) */}
            {!showStore && (

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeInUp}
                    id="learn-more-section" 
                    className="w-100 bg-white"
                    style={{ paddingTop: 'var(--spacing-premium)', paddingBottom: 'var(--spacing-premium)', borderTop: 'var(--glass-border)' }}
                >
                    <div className="layout-container text-center py-5" style={{ maxWidth: '800px' }}>
                        <h2 className="fw-bolder mb-4 text-dark" style={{ fontSize: '48px', letterSpacing: '-0.015em' }}>
                            Our Commitment to the Earth.
                        </h2>
                        <p className="fw-light mb-4" style={{ fontSize: '20px', lineHeight: '1.7', opacity: 0.8 }}>
                            At Eco-Hive, we believe that every purchase is a vote for the kind of world you want to live in. We meticulously source products made from sustainable, recycled, and highly renewable materials to ensure that your lifestyle doesn't compromise the planet's future.
                        </p>
                        <p className="fs-5 fw-normal mb-5 text-dark">
                            By choosing Eco-Hive, you are actively participating in reducing global carbon emissions and preventing plastic waste from entering our oceans. Together, we can make a massive impact through small, everyday choices.
                        </p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn rounded-pill px-4 fw-medium shadow-sm btn-dark" style={{ fontSize: '16px', padding: '12px 24px' }} onClick={handleGoToStore}>
                            Start Shopping Sustainably
                        </motion.button>
                    </div>
                </motion.div>
            )}

            <Footer />
        </motion.div>
    );
};

export default Home;
