import {Link, useNavigate} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Navbar({ showSearch = true, onStoreClick, onLogoClick })
{
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'User';
    const userEmail = localStorage.getItem('email');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDropdownHovered, setIsDropdownHovered] = useState(false);
    
    // Real-time search state
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    const ecoPoints = localStorage.getItem('ecoPoints') || 0;

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

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
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
        `}</style>
        <div className="fixed-top d-flex justify-content-center w-100" style={{ zIndex: 1050, padding: '16px 0', pointerEvents: 'none' }}>
            <nav className='navbar navbar-expand-lg glass-nav rounded-5 shadow-lg px-4 py-2' style={{ pointerEvents: 'auto', width: '95%', maxWidth: '1200px', transition: 'all 0.4s ease' }}>
            <div className='container'>
                <Link className='navbar-brand fw-bold fs-4 text-dark d-flex align-items-center' to={role === 'Admin' ? '/dashboard' : '/home'} onClick={() => onLogoClick && onLogoClick()}>
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="d-flex align-items-center justify-content-center bg-white shadow-sm"
                        style={{ height: '44px', width: '44px', borderRadius: '12px' }}
                    >
                        <img 
                            src="/images/logo.jpg" 
                            alt="Eco-Hive Logo" 
                            className="logo-img"
                            style={{ height: '32px', width: '32px', objectFit: 'contain' }} 
                        />
                    </motion.div>
                    {role === 'Admin' && <span className="badge bg-success fs-6 ms-2">Admin</span>}
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    
                    {/* Categories List (Beside Logo) */}
                    {role === 'Admin' ? (
                        <ul className="navbar-nav me-auto align-items-center gap-3 ms-lg-4 mt-3 mt-lg-0">
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-bold' to='/dashboard' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Dispatch Dashboard</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/orders' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Dispatch Console</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/livetracking' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Live Tracking</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/manage-products' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Manage Products</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to='/users' style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>User Management</Link>
                            </motion.li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav me-auto align-items-center gap-3 ms-lg-4 mt-3 mt-lg-0">
                            <li 
                                className="nav-item dropdown"
                                onMouseEnter={() => setIsDropdownHovered(true)}
                                onMouseLeave={() => setIsDropdownHovered(false)}
                            >
                                <a className='nav-link dropdown-toggle text-dark fw-medium' href="#!" role="button" data-bs-toggle="dropdown" style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>
                                    Eco-Products
                                </a>
                                <ul className="dropdown-menu border-0 shadow-sm rounded-3 mt-2">
                                    <li><Link className="dropdown-item py-2" to={`/category/${encodeURIComponent('Personal Care')}`}>Personal Care</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/category/${encodeURIComponent('Home & Kitchen')}`}>Home & Kitchen</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/category/${encodeURIComponent('Reusable Essentials')}`}>Reusable Essentials</Link></li>
                                    <li><Link className="dropdown-item py-2" to={`/category/${encodeURIComponent('Tech & Lighting')}`}>Tech & Lighting</Link></li>
                                </ul>
                            </li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to={`/category/${encodeURIComponent('Tech')}`} style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Tech</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to={`/category/${encodeURIComponent('Apparel')}`} style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Apparel</Link>
                            </motion.li>
                            <motion.li whileHover={{ y: -2 }} className="nav-item">
                                <Link className='nav-link text-dark fw-medium' to={`/category/${encodeURIComponent('Accessories')}`} style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Accessories</Link>
                            </motion.li>
                        </ul>
                    )}

                    {/* Central Search Bar */}
                    {showSearch && role !== 'Admin' && (
                        <form ref={searchRef} className="d-flex mx-auto w-100 px-3 mt-3 mt-lg-0 position-relative" style={{ maxWidth: '400px' }} onSubmit={handleSearchSubmit}>
                            <div className="input-group input-group-sm">
                                <input 
                                    type="text" 
                                    className="form-control rounded-pill rounded-end-0 border-end-0 bg-transparent" 
                                    placeholder="Search products..." 
                                    value={searchQuery}
                                    style={{ paddingLeft: '20px', height: '42px', boxShadow: 'none' }}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchDropdown(true);
                                    }}
                                    onFocus={() => {
                                        if (searchQuery.trim()) setShowSearchDropdown(true);
                                    }}
                                />
                                <button className="btn rounded-pill rounded-start-0 border border-start-0 text-muted px-3 d-flex align-items-center justify-content-center" type="submit" style={{ backgroundColor: 'transparent', height: '42px' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Real-Time Search Dropdown */}
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
                        </form>
                    )}

                    <ul className="navbar-nav ms-auto align-items-center gap-3 mt-3 mt-lg-0">
                        
                        {role === 'User' && (
                            <>
                                <motion.li whileHover={{ y: -2 }} className="nav-item">
                                    <Link className='nav-link text-dark fw-medium' to='/home' onClick={() => onStoreClick && onStoreClick()} style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>Store</Link>
                                </motion.li>
                                <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="nav-item ms-2">
                                    <Link className='btn btn-dark rounded-pill px-4' to='/cart' style={{ fontSize: '14px' }}>Cart</Link>
                                </motion.li>
                                <motion.li whileHover={{ y: -2 }} className="nav-item ms-3 d-flex align-items-center">
                                    <div className="d-flex align-items-center bg-success bg-opacity-10 text-success rounded-pill px-3 py-1 fw-bold border border-success border-opacity-25" style={{ fontSize: '13px' }}>
                                        <i className="bi bi-leaf-fill me-2"></i>
                                        {ecoPoints} Pts
                                    </div>
                                </motion.li>
                            </>
                        )}


                        {userEmail && (
                            <motion.li whileHover={{ scale: 1.02 }} className="nav-item ms-lg-2 mt-3 mt-lg-0 d-flex align-items-center">
                                <Link 
                                    className='nav-link d-flex align-items-center gap-2 px-2 py-1 rounded-pill' 
                                    to='/settings' 
                                    style={{ transition: 'all 0.2s ease' }}
                                >
                                    <div className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-sm" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #1d1d1f, #434345)', fontSize: '14px', fontWeight: '600' }}>
                                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="fw-medium text-dark pe-1" style={{ fontSize: '14px', letterSpacing: '-0.01em' }}>
                                        {role === 'Admin' ? 'Admin Account' : 'Account'}
                                    </span>
                                </Link>
                            </motion.li>
                        )}
                        <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="nav-item ms-lg-1 mt-3 mt-lg-0 d-flex align-items-center">
                            <button className='btn btn-outline-secondary rounded-pill px-4 logout-btn fw-medium w-100' style={{ fontSize: '14px', height: '42px', whiteSpace: 'nowrap' }} onClick={() => setShowLogoutModal(true)}>Log out</button>
                        </motion.li>
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