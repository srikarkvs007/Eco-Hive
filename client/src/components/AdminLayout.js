import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        
        await new Promise(resolve => setTimeout(resolve, 1500));

        localStorage.clear();
        document.body.removeAttribute('data-theme');
        setShowLogoutModal(false);
        setIsLoggingOut(false);
        navigate('/', { replace: true });
    };

    const isActive = (path) => location.pathname === path;

    // We use a responsive approach where sidebar is fixed left, content has margin-left.
    return (
        <div className="d-flex" style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark" 
                    style={{ opacity: 0.5, zIndex: 1040 }}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar (240px wide) */}
            <div 
                className={`position-fixed top-0 start-0 h-100 glass-panel d-flex flex-column transition-transform ${isSidebarOpen ? 'translate-middle-x-0' : 'd-none d-md-flex'}`}
                style={{ 
                    width: '240px', 
                    borderRight: 'var(--glass-border)', 
                    zIndex: 1050,
                    transform: isSidebarOpen ? 'translateX(0)' : ''
                }}
            >
                {/* Logo Area */}
                <div className="d-flex align-items-center px-4" style={{ height: '64px', borderBottom: 'var(--glass-border)' }}>
                    <div className="d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fff' }}>
                        <img src="/images/logo.jpg" alt="Eco-Hive Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    </div>
                    <span className="ms-3 fw-bolder fs-5" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>EcoHive</span>
                    <span className="badge ms-2 shadow-sm border" style={{ backgroundColor: 'var(--accent-color, #1D9E75)', color: '#fff', fontSize: '10px', borderColor: 'rgba(255,255,255,0.1)' }}>Admin</span>
                    
                    {/* Mobile Close Button */}
                    <button className="btn btn-sm d-md-none ms-auto p-0" onClick={() => setIsSidebarOpen(false)}>
                        <i className="bi bi-x fs-4" style={{ color: 'var(--text-primary)' }}></i>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-grow-1 overflow-y-auto py-3 px-3">
                    <div className="text-muted small fw-bold text-uppercase mb-2 px-3" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>Operations</div>
                    <ul className="nav flex-column mb-4 gap-1">
                        <li className="nav-item">
                            <Link 
                                to="/dashboard" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/dashboard') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/dashboard') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/dashboard') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-grid-1x2-fill me-3" style={{ opacity: isActive('/dashboard') ? 1 : 0.6 }}></i>
                                Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/store-orders" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/store-orders') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/store-orders') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/store-orders') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-cart-check-fill me-3" style={{ opacity: isActive('/store-orders') ? 1 : 0.6 }}></i>
                                E-Commerce Orders
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/users" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/users') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/users') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/users') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-people-fill me-3" style={{ opacity: isActive('/users') ? 1 : 0.6 }}></i>
                                User Management
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/manage-products" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/manage-products') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/manage-products') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/manage-products') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-box-seam-fill me-3" style={{ opacity: isActive('/manage-products') ? 1 : 0.6 }}></i>
                                Manage Products
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/add-product" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/add-product') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/add-product') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/add-product') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-plus-circle-fill me-3" style={{ opacity: isActive('/add-product') ? 1 : 0.6 }}></i>
                                Add Product
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/settings" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/settings') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/settings') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/settings') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-person-fill-gear me-3" style={{ opacity: isActive('/settings') ? 1 : 0.6 }}></i>
                                Admin Account
                            </Link>
                        </li>
                    </ul>

                    <div className="text-muted small fw-bold text-uppercase mb-2 px-3" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>Logistics (Smart Dispatch)</div>
                    <ul className="nav flex-column gap-1">
                        <li className="nav-item">
                            <Link 
                                to="/orders" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/orders') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/orders') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/orders') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-truck me-3" style={{ opacity: isActive('/orders') ? 1 : 0.6 }}></i>
                                Dispatch Console
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/livetracking" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/livetracking') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/livetracking') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/livetracking') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-radar me-3" style={{ opacity: isActive('/livetracking') ? 1 : 0.6 }}></i>
                                Live Tracking
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/addorder" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/addorder') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/addorder') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/addorder') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-plus-square-fill me-3" style={{ opacity: isActive('/addorder') ? 1 : 0.6 }}></i>
                                Add Dispatch Order
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                to="/vehicle" 
                                className={`nav-link rounded-3 fw-medium d-flex align-items-center px-3 py-2 ${isActive('/vehicle') ? 'text-white' : 'hover-bg-light'}`}
                                style={{ 
                                    backgroundColor: isActive('/vehicle') ? 'var(--accent-color, #1D9E75)' : 'transparent',
                                    color: isActive('/vehicle') ? '#fff' : 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            >
                                <i className="bi bi-car-front-fill me-3" style={{ opacity: isActive('/vehicle') ? 1 : 0.6 }}></i>
                                Add Vehicle
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column w-100 admin-main-content">
                
                {/* Top Header (64px) */}
                <header 
                    className="glass-nav d-flex align-items-center justify-content-between px-4 sticky-top w-100" 
                    style={{ height: '64px', zIndex: 900 }}
                >
                    {/* Mobile Hamburger */}
                    <div className="d-flex align-items-center flex-grow-1">
                        <button className="btn btn-light d-md-none me-3" onClick={() => setIsSidebarOpen(true)}>
                            <i className="bi bi-list fs-5"></i>
                        </button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/add-product" className="btn rounded-pill px-4 fw-medium text-white d-none d-md-block shadow-sm" style={{ backgroundColor: 'var(--accent-color, #1D9E75)', fontSize: '14px' }}>
                            + Add Product
                        </Link>
                        <Link to="/add-product" className="btn btn-sm text-white rounded-circle d-md-none d-flex align-items-center justify-content-center shadow-sm" style={{ backgroundColor: 'var(--accent-color, #1D9E75)', width: '36px', height: '36px' }}>
                            <i className="bi bi-plus fs-5"></i>
                        </Link>

                        <div className="dropdown">
                            <div 
                                className="d-flex align-items-center gap-2 cursor-pointer dropdown-toggle" 
                                data-bs-toggle="dropdown" 
                                aria-expanded="false"
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                                    A
                                </div>
                            </div>
                            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm rounded-3 mt-2">
                                <li><Link className="dropdown-item fw-medium" to="/settings"><i className="bi bi-person me-2"></i>My Account</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><span className="dropdown-item-text small" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>Admin Actions</span></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger" onClick={() => setShowLogoutModal(true)}>Log out</button></li>
                            </ul>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 p-md-5 flex-grow-1 overflow-auto">
                    {children}
                </main>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1060 }}>
                    <div className="position-absolute w-100 h-100 bg-dark" style={{ opacity: 0.4 }} onClick={() => setShowLogoutModal(false)}></div>
                    <div className="glass-panel rounded-4 p-4 position-relative text-center" style={{ width: '90%', maxWidth: '400px' }}>
                        <div className="mb-3">
                            <div className="mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                                <i className="bi bi-box-arrow-right fs-1 text-dark"></i>
                            </div>
                            <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Logout</h5>
                            <p className="text-muted small">Are you sure you want to logout?</p>
                        </div>
                        <div className="d-flex gap-2 w-100 mt-4">
                            <button type="button" className="btn btn-light rounded-pill px-4 fw-medium flex-grow-1" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button type="button" className="btn text-white rounded-pill px-4 fw-medium flex-grow-1 shadow-sm" style={{ backgroundColor: 'var(--accent-color, #1D9E75)' }} onClick={confirmLogout} disabled={isLoggingOut}>
                                {isLoggingOut ? <span className="spinner-border spinner-border-sm"></span> : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Inject Global Styles for Sidebar Layout */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 768px) {
                    .admin-main-content {
                        margin-left: 240px;
                    }
                }
                .hover-bg-light:hover {
                    background-color: var(--bg-elevated, #f3f4f6) !important;
                }
                .dropdown-toggle::after {
                    display: none;
                }
            `}} />
        </div>
    );
};

export default AdminLayout;
