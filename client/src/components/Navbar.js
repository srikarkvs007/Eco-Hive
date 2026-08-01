import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar({ showSearch = true, onStoreClick, onLogoClick, isHeroPage = false, className = "" })
{
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'User';
    const userEmail = localStorage.getItem('email');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDropdownHovered, setIsDropdownHovered] = useState(false);
    const wrapperRef = useRef(null);

    // Refs for damped scroll-linked calculations (zero React re-renders)
    const targetScrollY = useRef(0);
    const currentScrollY = useRef(0);
    const isAnimating = useRef(false);

    // React states & refs for dropdowns
    const [showShopMega, setShowShopMega] = useState(false);
    const shopMegaRef = useRef(null);

    // Mini-Cart Dropdown States & API helper
    const [miniCartItems, setMiniCartItems] = useState([]);
    const [miniCartLoading, setMiniCartLoading] = useState(false);
    const [showMiniCart, setShowMiniCart] = useState(false);

    const fetchMiniCart = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        setMiniCartLoading(true);
        try {
            const res = await axios.get(`http://localhost:5001/api/cart/${userId}`);
            setMiniCartItems(res.data);
            localStorage.setItem('cart_cache', JSON.stringify(res.data));
        } catch (err) {
            console.error("Failed to fetch mini cart:", err);
        } finally {
            setMiniCartLoading(false);
        }
    };

    // Damped smooth scroll animation loop (lerp) for proportional layout transformation
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        if (!isHeroPage) {
            wrapper.style.setProperty('--scroll-progress', 0);
            return;
        }

        const animationLoop = () => {
            const target = targetScrollY.current;
            const current = currentScrollY.current;

            const diff = target - current;
            if (Math.abs(diff) > 0.05) {
                currentScrollY.current = current + diff * 0.085; // Damped interpolation factor
                
                const scrollDelay = 80; // Only start shrinking after 80px scroll
                const maxScrollRange = 220; // Slower shrinking rate (over 220px of scroll)
                const progress = Math.min(Math.max((currentScrollY.current - scrollDelay) / maxScrollRange, 0), 1);
                wrapper.style.setProperty('--scroll-progress', progress);

                requestAnimationFrame(animationLoop);
            } else {
                currentScrollY.current = target;
                const scrollDelay = 80;
                const maxScrollRange = 220;
                const progress = Math.min(Math.max((currentScrollY.current - scrollDelay) / maxScrollRange, 0), 1);
                wrapper.style.setProperty('--scroll-progress', progress);
                isAnimating.current = false;
            }
        };

        const handleScroll = () => {
            targetScrollY.current = window.scrollY;
            if (!isAnimating.current) {
                isAnimating.current = true;
                requestAnimationFrame(animationLoop);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial run to sync state

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isHeroPage]);
    
    // Real-time search state
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    const ecoPoints = localStorage.getItem('ecoPoints') || 0;

    // Programmatic helper to close dropdowns on click/navigate
    const closeDropdown = () => {
        setShowShopMega(false);
        setIsDropdownHovered(false);
    };

    // Debounced search effect
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            try {
                const res = await axios.get(`http://localhost:5001/api/products?search=${encodeURIComponent(searchQuery)}`);
                setSearchResults(res.data.slice(0, 5)); // show top 5
            } catch (err) {
                console.error("Error fetching search results", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timerId = setTimeout(() => {
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
            if (shopMegaRef.current && !shopMegaRef.current.contains(event.target)) {
                setShowShopMega(false);
                setIsDropdownHovered(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Initialize dark mode from storage on app load
    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }, []);

    // Sync cart with cache and global updates
    useEffect(() => {
        const handleCartUpdated = (e) => {
            if (e.detail) {
                setMiniCartItems(e.detail);
            } else {
                fetchMiniCart();
            }
        };
        window.addEventListener('cartUpdated', handleCartUpdated);
        
        const cached = localStorage.getItem('cart_cache');
        if (cached) {
            try {
                setMiniCartItems(JSON.parse(cached));
            } catch (e) {
                console.error("Failed to parse cached cart", e);
            }
        }
        
        // Background sync on mount if logged in
        const userId = localStorage.getItem('userId');
        if (userId) {
            fetchMiniCart();
        }
        
        return () => window.removeEventListener('cartUpdated', handleCartUpdated);
    }, []);


    const confirmLogout = async () => {
        setIsLoggingOut(true);
        const userId = localStorage.getItem('userId');
        if (userId) {
            try {
                await axios.post('http://localhost:5001/api/users/activity', {
                    userId,
                    action: 'Logged Out',
                    details: 'User signed out of their account'
                });
            } catch (err) {
                console.error("Failed to log logout activity", err);
            }
        }
        
        // Realistic loading delay before clearing session
        await new Promise(resolve => setTimeout(resolve, 1500));

        localStorage.clear();
        document.body.removeAttribute('data-theme'); // Revert to default light theme on logout
        setShowLogoutModal(false);
        setIsLoggingOut(false);
        navigate('/', { replace: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setShowSearchDropdown(false);
        navigate(`/home?search=${encodeURIComponent(searchQuery)}`);
    };

    const handleSearchItemClick = (productId) => {
        setSearchQuery('');
        setShowSearchDropdown(false);
        navigate(`/product/${productId}`);
    };

    return(
        <>
        <style>{`
            .logout-btn {
                background-color: #f5f5f7;
                color: #1d1d1f;
                border: 1px solid #e5e5e5;
                transition: all 0.3s ease;
            }
            .logout-btn:hover {
                background-color: #ff3b30;
                color: white;
                border-color: #ff3b30;
            }
            .glass-nav.compact-nav {
                max-width: 1080px !important;
                padding-top: 0.35rem !important;
                padding-bottom: 0.35rem !important;
                padding-left: 1.25rem !important;
                padding-right: 1.25rem !important;
            }
            .fixed-top-wrap.compact-wrap {
                padding-top: 10px !important;
                padding-bottom: 10px !important;
            }
            .glass-nav.compact-nav .logo-container {
                height: 38px !important;
                width: 38px !important;
            }
            .glass-nav.compact-nav .logo-img {
                height: 28px !important;
                width: 28px !important;
            }
            .mega-menu-dropdown {
                position: absolute !important;
                top: 100% !important;
                left: 50% !important;
                transform: translateX(-50%) translateY(12px) scale(0.96) !important;
                width: 680px !important;
                padding: 24px !important;
                border-radius: 20px !important;
                border: var(--glass-border) !important;
                background-color: var(--surface-color) !important;
                box-shadow: var(--shadow-lg) !important;
                display: flex !important;
                gap: 28px !important;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                            transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                            visibility 0s linear 0.25s !important;
                z-index: 1100;
                pointer-events: auto !important;
            }
            .mega-menu-dropdown.show {
                opacity: 1 !important;
                transform: translateX(-50%) translateY(4px) scale(1) !important;
                visibility: visible !important;
                transition: opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                            transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                            visibility 0s linear 0s !important;
            }
            .mega-menu-image-col {
                flex: 0 0 170px;
                height: 210px;
                overflow: hidden;
                border-radius: 12px;
                border: var(--glass-border);
            }
            .mega-menu-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease;
            }
            .mega-menu-image-col:hover .mega-menu-image {
                transform: scale(1.04);
            }
            .mega-menu-links-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .mega-menu-col-title {
                font-size: 11px !important;
                font-weight: 700 !important;
                color: var(--text-secondary) !important;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                margin-bottom: 8px;
                border-bottom: 1px solid rgba(0,0,0,0.06);
                padding-bottom: 4px;
            }
            [data-theme="dark"] .mega-menu-col-title {
                border-bottom-color: rgba(255,255,255,0.08);
            }
            .mega-menu-link {
                font-size: 14px !important;
                font-weight: 500 !important;
                color: var(--text-primary) !important;
                text-decoration: none !important;
                transition: color 0.2s ease, transform 0.2s ease;
                display: inline-block;
            }
            .mega-menu-link:hover {
                color: var(--accent-blue) !important;
                transform: translateX(3px);
            }
            .hover-dropdown .dropdown-toggle::after {
                display: none !important;
            }
            @media (max-width: 991px) {
                .mega-menu-dropdown {
                    position: static !important;
                    transform: none !important;
                    width: 100% !important;
                    display: none !important;
                    flex-direction: column !important;
                    gap: 20px !important;
                    box-shadow: none !important;
                    background-color: transparent !important;
                    border: none !important;
                    padding: 15px 0 !important;
                }
                .mega-menu-dropdown.show {
                    display: flex !important;
                }
                .mega-menu-image-col {
                    display: none !important;
                }
            }
        `}</style>
        <div ref={wrapperRef} className={`fixed-top fixed-top-wrap d-flex justify-content-center w-100 ${!isHeroPage ? 'compact-wrap' : ''}`} style={{ zIndex: 1050, pointerEvents: 'none' }}>
            <nav className={`navbar navbar-expand-lg glass-nav shadow-lg ${!isHeroPage ? 'compact-nav' : ''}`} style={{ pointerEvents: 'auto', width: '95%' }}>
            <div className='container'>
                <div className="nav-collapsible brand-collapsible">
                    <Link className='navbar-brand fw-bold fs-4 text-dark d-flex align-items-center' to={role === 'Admin' ? '/dashboard' : '/home'} onClick={() => onLogoClick && onLogoClick()}>
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="d-flex align-items-center justify-content-center bg-white shadow-sm logo-container"
                            style={{ borderRadius: '12px' }}
                        >
                            <img 
                                src={process.env.PUBLIC_URL + "/images/logo.jpg"} 
                                alt="Eco-Hive Logo" 
                                className="logo-img"
                                style={{ objectFit: 'contain' }} 
                            />
                        </motion.div>
                        {role === 'Admin' && <span className="badge bg-success fs-6 ms-2">Admin</span>}
                    </Link>
                </div>

                {/* Mobile Quick Actions (Cart & Avatar Dropdown) */}
                <div className="d-flex align-items-center gap-2 d-lg-none ms-auto me-2" style={{ pointerEvents: 'auto' }}>
                    {role === 'User' && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link className='btn btn-dark rounded-pill px-3 py-1' to='/cart' onMouseEnter={fetchMiniCart} onMouseDown={fetchMiniCart} style={{ fontSize: '13px' }}>Cart</Link>
                        </motion.div>
                    )}
                    {userEmail && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link 
                                className='d-flex align-items-center justify-content-center rounded-circle text-white shadow-sm' 
                                to="/settings"
                                style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #1d1d1f, #434345)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}
                            >
                                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                            </Link>
                        </motion.div>
                    )}
                </div>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    
                    {/* Categories List (Beside Logo) */}
                    {role === 'Admin' ? (
                        <ul className="navbar-nav me-auto align-items-center gap-3 ms-lg-4 mt-3 mt-lg-0">
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-bold text-nowrap' to='/dashboard' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Dashboard</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium text-nowrap' to='/orders' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Console</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium text-nowrap' to='/livetracking' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Live Map</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium text-nowrap' to='/manage-products' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Products</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium text-nowrap' to='/users' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Users</Link>
                            </motion.li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav me-auto align-items-center gap-3 ms-lg-4 mt-3 mt-lg-0">
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link 
                                    className='nav-link text-dark fw-medium' 
                                    to='/home' 
                                    onClick={() => {
                                        if (window.location.pathname === '/home' && onLogoClick) {
                                            onLogoClick();
                                        }
                                    }} 
                                    style={{ fontSize: '14px', letterSpacing: '-0.01em' }}
                                >
                                    Home
                                </Link>
                            </motion.li>
                            <li 
                                ref={shopMegaRef}
                                className="nav-item dropdown hover-dropdown"
                                onMouseEnter={() => {
                                    setIsDropdownHovered(true);
                                    setShowShopMega(true);
                                }}
                                onMouseLeave={() => {
                                    setIsDropdownHovered(false);
                                    setShowShopMega(false);
                                }}
                            >
                                <a 
                                    className='nav-link dropdown-toggle text-dark fw-medium' 
                                    href="#!" 
                                    role="button" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowShopMega(!showShopMega);
                                    }}
                                    aria-expanded={showShopMega}
                                    style={{ fontSize: '14px', letterSpacing: '-0.01em' }}
                                >
                                    Shop
                                </a>
                                <div className={`mega-menu-dropdown ${showShopMega ? 'show' : ''}`}>
                                    <div className="mega-menu-image-col">
                                        <img 
                                            src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&q=80&fit=crop" 
                                            alt="Shop Preview" 
                                            className="mega-menu-image"
                                        />
                                    </div>
                                    <div className="mega-menu-links-col">
                                        <div className="mega-menu-col-title">Shop</div>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={() => { closeDropdown(); if (onStoreClick) onStoreClick(); }}>All</Link>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={closeDropdown}>Final Sale</Link>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={closeDropdown}>Best Sellers</Link>
                                        <Link className="mega-menu-link" to="/home?store=true&sortBy=newest" onClick={closeDropdown}>New Arrivals</Link>
                                    </div>
                                    <div className="mega-menu-links-col">
                                        <div className="mega-menu-col-title">Collections</div>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={closeDropdown}>Fall Collection</Link>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={closeDropdown}>The Essentials</Link>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={closeDropdown}>After Dark</Link>
                                        <Link className="mega-menu-link" to="/home?store=true" onClick={closeDropdown}>Studio Edit</Link>
                                    </div>
                                </div>
                            </li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/about' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>About</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/support' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Support</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/today' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Blog</Link>
                            </motion.li>
                        </ul>
                    )}

                    {/* Central Search Bar */}
                    {showSearch && role !== 'Admin' && (
                        <form ref={searchRef} className="d-flex flex-column align-items-center mx-auto w-100 px-3 mt-3 mt-lg-0" style={{ maxWidth: '300px' }} onSubmit={handleSearchSubmit}>
                            <div className="position-relative w-100">
                                <div className="input-group input-group-sm w-100 rounded-pill overflow-hidden border">
                                    <input 
                                        type="text" 
                                        className="form-control border-0 bg-transparent px-3" 
                                        placeholder="Search products..." 
                                        value={searchQuery}
                                        style={{ height: '36px', boxShadow: 'none', fontSize: '13px' }}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowSearchDropdown(true);
                                        }}
                                        onFocus={() => {
                                            if (searchQuery.trim()) setShowSearchDropdown(true);
                                        }}
                                    />
                                    <button className="btn border-0 text-muted px-3 d-flex align-items-center justify-content-center" type="submit" style={{ backgroundColor: 'transparent', height: '36px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                        </svg>
                                    </button>
                                </div>

                                {showSearchDropdown && searchQuery.trim() !== '' && (
                                    <div className="position-absolute top-100 start-0 w-100 bg-white border rounded-3 shadow-lg mt-1 overflow-hidden" style={{ zIndex: 1055 }}>
                                        {isSearching ? (
                                            <div className="p-3 text-center text-muted small">
                                                <span className="spinner-border spinner-border-sm me-2"></span> Searching...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {searchResults.map(item => (
                                                    <li 
                                                        key={item.id} 
                                                        className="list-group-item list-group-item-action d-flex align-items-center p-2" 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleSearchItemClick(item.id)}
                                                    >
                                                        <img src={item.imageUrl} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} className="rounded me-3 border" />
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-0 text-dark fw-bold" style={{ fontSize: '13px' }}>{item.title}</h6>
                                                            <small className="text-muted" style={{ fontSize: '11px' }}>{item.category}</small>
                                                        </div>
                                                        <span className="fw-bold text-success" style={{ fontSize: '13px' }}>${item.price.toFixed(2)}</span>
                                                    </li>
                                                ))}
                                                <li className="list-group-item text-center p-2 bg-light text-primary" style={{ cursor: 'pointer', fontSize: '13px', fontWeight: '500' }} onClick={handleSearchSubmit}>
                                                    See all results for "{searchQuery}"
                                                </li>
                                            </ul>
                                        ) : (
                                            <div className="p-3 text-center text-muted small">
                                                No products found for "{searchQuery}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Search Tag Suggestions */}
                            {/* Quick Search Tag Suggestions */}
                            {isHeroPage && (
                                <div className="d-flex gap-1.5 mt-1.5 flex-wrap justify-content-center" style={{ fontSize: '10px', opacity: 0.8 }}>
                                    <span className="text-muted me-1">Try:</span>
                                    {['Bamboo', 'Bags', 'Accessories', 'Apparel'].map(tag => (
                                        <span 
                                            key={tag}
                                            onClick={() => {
                                                setSearchQuery(tag);
                                                setShowSearchDropdown(false);
                                                navigate(`/home?search=${encodeURIComponent(tag)}`);
                                            }}
                                            className="badge bg-light text-dark rounded-pill px-2 py-0.5 border hover-scale"
                                            style={{ cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s ease', border: '1px solid rgba(0,0,0,0.06)' }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </form>
                    )}

                    <ul className="navbar-nav ms-auto align-items-center gap-3 mt-3 mt-lg-0">
                        
                        {role === 'User' && (
                            <>
                                <motion.li 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }} 
                                    className="nav-item ms-2 d-none d-lg-block position-relative"
                                    onMouseEnter={() => { setShowMiniCart(true); fetchMiniCart(); }}
                                    onMouseLeave={() => setShowMiniCart(false)}
                                >
                                    <Link className='btn btn-dark rounded-pill px-4' to='/cart' onMouseEnter={fetchMiniCart} onMouseDown={fetchMiniCart} style={{ fontSize: '14px' }}>
                                        Cart {miniCartItems.length > 0 && `(${miniCartItems.length})`}
                                    </Link>
                                    
                                    <AnimatePresence>
                                        {showMiniCart && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 15 }}
                                                className="position-absolute rounded-4 shadow-lg p-3 border text-start mt-2"
                                                style={{ 
                                                    right: 0, 
                                                    width: '320px', 
                                                    zIndex: 1100, 
                                                    backgroundColor: 'var(--bg-elevated)',
                                                    borderColor: 'var(--border-color)',
                                                    border: 'var(--glass-border)',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                                    <h6 className="fw-bolder mb-0 text-dark" style={{ fontSize: '14px' }}>Shopping Cart</h6>
                                                    <Link to="/cart" className="small text-decoration-none text-success fw-medium">View All</Link>
                                                </div>

                                                {miniCartLoading ? (
                                                    <div className="text-center py-4 text-muted small">
                                                        <span className="spinner-border spinner-border-sm me-2"></span> Loading...
                                                    </div>
                                                ) : miniCartItems.length === 0 ? (
                                                    <div className="text-center py-4 text-muted small">
                                                        Your cart is empty.
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="d-flex flex-column gap-2 overflow-y-auto mb-3" style={{ maxHeight: '200px' }}>
                                                            {miniCartItems.slice(0, 3).map(item => (
                                                                <div key={item.id} className="d-flex align-items-center gap-3">
                                                                    <div className="bg-white rounded-3 p-1 border" style={{ width: '40px', height: '40px' }}>
                                                                        <img src={item.product.imageUrl || 'https://via.placeholder.com/40'} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                    </div>
                                                                    <div className="overflow-hidden flex-grow-1">
                                                                        <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: '12px' }}>{item.product.title}</h6>
                                                                        <span className="text-muted small d-block" style={{ fontSize: '11px' }}>{item.quantity} × ${item.product.price.toFixed(2)}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="d-flex justify-content-between align-items-center border-top pt-2 mb-3">
                                                            <span className="text-muted small fw-medium">Subtotal</span>
                                                            <span className="fw-bolder text-dark">${miniCartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                                                        </div>

                                                        <Link to="/checkout" className="btn btn-primary rounded-pill w-100 py-2.5 text-center text-decoration-none fw-bold" style={{ fontSize: '12px' }}>
                                                            Secure Checkout
                                                        </Link>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.li>

                                <motion.li whileHover={{ y: -2 }} className="nav-item ms-3 d-none d-lg-flex align-items-center nav-collapsible">
                                    <div className="d-flex align-items-center bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-bold border border-success border-opacity-25" style={{ fontSize: '13px' }}>
                                        <i className="bi bi-leaf-fill me-2"></i>
                                        {ecoPoints} Pts
                                    </div>
                                </motion.li>
                            </>
                        )}


                        {userEmail && (
                            <li className="nav-item ms-lg-2 mt-3 mt-lg-0 d-none d-lg-flex align-items-center">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link 
                                        className='nav-link d-flex align-items-center gap-2 px-2 py-1 rounded-pill' 
                                        to="/settings"
                                        style={{ transition: 'all 0.2s ease', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.6)' }}
                                    >
                                        <div className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-sm" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #1d1d1f, #434345)', fontSize: '14px', fontWeight: '600' }}>
                                            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="fw-medium text-dark pe-2 account-text" style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>
                                            {role === 'Admin' ? 'Admin Account' : 'Account'}
                                        </span>
                                    </Link>
                                </motion.div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            </nav>
        </div>

        {/* Logout Confirmation Modal - Custom Fixed Overlay to prevent stacking bugs */}
        {showLogoutModal && (
            <div 
                style={{ 
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                    backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
            >
                <div className="bg-white shadow-lg overflow-hidden" style={{ width: '90%', maxWidth: '360px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <div className="pt-4 pb-0 px-4 text-center">
                        <h5 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>Logout</h5>
                    </div>
                    <div className="text-muted px-4 pt-2 pb-4 text-center" style={{ fontSize: '15px', lineHeight: '1.5' }}>
                        {isLoggingOut ? (
                            <div className="py-2">
                                <div className="spinner-border spinner-border-sm text-dark mb-3" role="status"></div>
                                <h6 className="fw-medium text-dark">Logging out...</h6>
                            </div>
                        ) : (
                            "Are you sure you want to logout?"
                        )}
                    </div>
                    {!isLoggingOut && (
                        <div className="px-4 pb-4 d-flex justify-content-center gap-2">
                            <button type="button" className="btn btn-light rounded-pill px-4 fw-medium flex-grow-1" style={{ border: '1px solid rgba(0,0,0,0.1)', fontSize: '15px' }} onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-dark rounded-pill px-4 fw-medium flex-grow-1" style={{ fontSize: '15px' }} onClick={confirmLogout}>Logout</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Premium Focus Blur Backdrop for Eco-Products Dropdown */}
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                zIndex: 1040,
                opacity: isDropdownHovered ? 1 : 0,
                visibility: isDropdownHovered ? 'visible' : 'hidden',
                transition: 'all 0.3s ease',
                pointerEvents: 'none' // Allows clicking through the blur if needed
            }}
        ></div>
        </>
    )
}

export default Navbar;