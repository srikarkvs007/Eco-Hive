import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkeletonRow from '../components/SkeletonRow';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Parse initial tab from search params
    const [activeTab, setActiveTab] = useState(() => {
        const queryParams = new URLSearchParams(location.search);
        const tabParam = queryParams.get('tab');
        const allowedTabs = ['profile', 'orders', 'wishlist', 'appearance', 'greenbookings', 'wallet'];
        return allowedTabs.includes(tabParam) ? tabParam : 'profile';
    });

    // Update activeTab when URL search params change
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tabParam = queryParams.get('tab');
        const allowedTabs = ['profile', 'orders', 'wishlist', 'appearance', 'greenbookings', 'wallet'];
        if (tabParam && allowedTabs.includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [location.search]);
    
    // Listen for real-time order status updates via WebSockets
    useEffect(() => {
        const socket = io(API_BASE_URL);

        socket.on('order_status_updated', (data) => {
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.id === data.orderId) {
                    return { ...order, status: data.status };
                }
                return order;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);
    
    // Profile State
    const [user, setUser] = useState(null);
    const [, setActivities] = useState([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '', address: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    
    // Orders State
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Wishlist State
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(true);

    // Gift Card State
    const [giftCardActivity, setGiftCardActivity] = useState([]);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(false);
    
    // Appearance State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }

        // Load Profile Data
        const fetchProfile = async () => {
            const name = localStorage.getItem('name');
            const email = localStorage.getItem('email');
            const role = localStorage.getItem('role');
            
            try {
                // Fetch the full user details to get profilePicture
                const userRes = await axios.get(`http://localhost:5001/api/v1/users/profile`);
                setUser({ 
                    name: userRes.data.name || name, 
                    email: userRes.data.email || email, 
                    role: userRes.data.role || role, 
                    profilePicture: userRes.data.profilePicture,
                    phone: userRes.data.phone || '',
                    address: userRes.data.address || '',
                    regionId: userRes.data.regionId || '',
                    contactInfo: userRes.data.contactInfo || ''
                });
                setEditProfileForm({
                    name: userRes.data.name || name,
                    phone: userRes.data.phone || '',
                    address: userRes.data.address || '',
                    regionId: userRes.data.regionId || '',
                    contactInfo: userRes.data.contactInfo || ''
                });

                // We still fetch activity data to be saved in backend state but won't display it
                const res = await axios.get(`http://localhost:5001/api/users/activity/${userId}`);
                setActivities(res.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setUser({ name, email, role }); // Fallback
            } finally {
                setProfileLoading(false);
            }
        };

        // Load Orders Data
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/customer-orders/user/${userId}`);
                setOrders(res.data);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setOrdersLoading(false);
            }
        };

        // Load Wishlist
        const fetchWishlist = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/wishlist/${userId}`);
                setWishlistItems(res.data);
            } catch (err) {
                console.error("Error fetching wishlist:", err);
            } finally {
                setWishlistLoading(false);
            }
        };

        const fetchGiftCardActivity = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/gift-cards/my-activity`);
                setGiftCardActivity(res.data);
            } catch (err) {
                console.error("Error fetching gift card activity:", err);
            }
        };

        fetchProfile();
        fetchOrders();
        fetchWishlist();
        if (userId) {
            fetchGiftCardActivity();
        }
    }, [userId, navigate]);

    // Handle Theme Change
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        if (isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
        
        // Sync with backend
        if (userId) {
            axios.put(`http://localhost:5001/api/users/${userId}/theme`, { themePreference: theme })
                .catch(err => console.error("Failed to sync theme preference", err));
        }
    }, [isDarkMode, userId]);

    const handleRedeemSubmit = async (e) => {
        e.preventDefault();
        setRedeemLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/gift-cards/redeem', { code: redeemCode });
            toast.success(res.data.message || 'Gift Card redeemed successfully!');
            setRedeemCode('');
            
            // Reload user profile to get updated balance
            const userRes = await axios.get(`http://localhost:5001/api/v1/users/profile`);
            setUser(prev => ({ ...prev, giftCardBalance: userRes.data.giftCardBalance }));
            
            // Reload activity history
            const activityRes = await axios.get(`http://localhost:5001/api/gift-cards/my-activity`);
            setGiftCardActivity(activityRes.data);
        } catch (err) {
            console.error('Error redeeming gift card:', err);
            toast.error(err.response?.data?.message || 'Failed to redeem gift card. Please check the code.');
        } finally {
            setRedeemLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            const res = await axios.put(`http://localhost:5001/api/users/${userId}`, editProfileForm);
            setUser(prev => ({
                ...prev,
                name: res.data.user.name,
                phone: res.data.user.phone || '',
                address: res.data.user.address || '',
                regionId: res.data.user.regionId || '',
                contactInfo: res.data.user.contactInfo || ''
            }));
            localStorage.setItem('name', res.data.user.name);
            setIsEditingProfile(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const removeFromWishlist = async (e, productId) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:5001/api/wishlist/${userId}/${productId}`);
            setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
            toast.success("Removed from wishlist");
        } catch (err) {
            console.error(err);
            toast.error("Failed to remove item from wishlist");
        }
    };

    const handleReorder = async (orderItems) => {
        try {
            for (const item of orderItems) {
                await axios.post('http://localhost:5001/api/cart', {
                    userId: userId,
                    productId: item.productId,
                    quantity: item.quantity
                });
            }
            navigate('/cart');
        } catch (err) {
            console.error("Error during reorder:", err);
            alert("Failed to add items to cart.");
        }
    };

    const getStatusProgress = (status) => {
        const statuses = ['Pending', 'Paid', 'Processing', 'Dispatched', 'Delivered'];
        const currentIndex = statuses.indexOf(status);
        const percentage = currentIndex === -1 ? 0 : (currentIndex / (statuses.length - 1)) * 100;
        return { currentIndex, percentage, statuses };
    };

    // Removed unused calculateEstimatedTime

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be less than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const res = await axios.post(`http://localhost:5001/api/users/${userId}/profile-picture`, {
                    profilePicture: base64String
                });
                setUser(prev => ({ ...prev, profilePicture: res.data.user.profilePicture }));
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                alert('Failed to upload profile picture.');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-vh-100 d-flex flex-column bg-light" style={{ transition: 'background-color 0.4s ease' }}>
            <Navbar />
            <div className="container flex-grow-1" style={{ maxWidth: '1200px', paddingTop: '160px', paddingBottom: 'var(--spacing-premium)' }}>
                <div className="row g-4 g-lg-5">
                    {/* Sidebar */}
                    <div className="col-12 col-md-4 col-lg-3">
                        <div className="card border-0 rounded-5 p-4 sticky-top shadow-sm" style={{ top: '120px', backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                            <div className="d-flex align-items-center mb-4 px-2 pt-2">
                                <label className="position-relative me-3 mb-0" style={{ cursor: 'pointer' }}>
                                    <input type="file" className="d-none" accept="image/*" onChange={handleProfilePictureUpload} />
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden position-relative avatar-container" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                                        {user?.profilePicture ? (
                                            <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                                        )}
                                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center avatar-overlay opacity-0 transition-all">
                                            <span style={{ fontSize: '14px' }}>📷</span>
                                        </div>
                                    </div>
                                </label>
                                <div>
                                    <h6 className="fw-bolder mb-0 text-dark">{user?.name || 'User'}</h6>
                                    <span className="text-muted small">Personal Account</span>
                                </div>
                            </div>
                            
                            <ul className="nav flex-column gap-2">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link text-start w-100 rounded-pill fw-medium px-4 py-3 transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        👤 Profile Details
                                    </button>
                                </li>
                                {role !== 'Admin' && (
                                    <>
                                        <li className="nav-item">
                                            <button 
                                                className={`nav-link text-start w-100 rounded-pill fw-medium px-4 py-3 transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                                onClick={() => setActiveTab('orders')}
                                            >
                                                📦 Order History
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button 
                                                className={`nav-link text-start w-100 rounded-pill fw-medium px-4 py-3 transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                                onClick={() => setActiveTab('wishlist')}
                                            >
                                                ❤️ Saved Items
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button 
                                                className={`nav-link text-start w-100 rounded-pill fw-medium px-4 py-3 transition-all ${activeTab === 'wallet' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                                onClick={() => setActiveTab('wallet')}
                                            >
                                                💳 Eco-Wallet & Gift Cards
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button 
                                                className={`nav-link text-start w-100 rounded-pill fw-medium px-4 py-3 transition-all ${activeTab === 'greenbookings' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                                onClick={() => setActiveTab('greenbookings')}
                                            >
                                                📅 Green Bookings & Labels
                                            </button>
                                        </li>
                                    </>
                                )}
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link text-start w-100 rounded-pill fw-medium px-4 py-3 transition-all ${activeTab === 'appearance' ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}`}
                                        onClick={() => setActiveTab('appearance')}
                                    >
                                        ✨ Appearance
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="col-12 col-md-8 col-lg-9">
                        <div className="card border-0 rounded-5 p-4 p-md-5 min-vh-50 shadow-sm" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                            
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="animate-fade-in">
                                    <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                                        <h3 className="fw-bolder text-dark mb-0" style={{ letterSpacing: '-0.02em', fontSize: '32px' }}>Public Profile</h3>
                                        {!isEditingProfile ? (
                                            <button className="btn btn-dark rounded-pill px-4" onClick={() => setIsEditingProfile(true)}>
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setIsEditingProfile(false)} disabled={isSavingProfile}>
                                                    Cancel
                                                </button>
                                                <button className="btn btn-primary rounded-pill px-4" onClick={handleSaveProfile} disabled={isSavingProfile}>
                                                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {profileLoading ? (
                                        <div className="d-flex flex-column gap-3 w-100">
                                            <SkeletonRow />
                                            <SkeletonRow />
                                            <SkeletonRow />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="row mb-5 g-4">
                                                <div className="col-md-6">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Display Name</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        value={isEditingProfile ? editProfileForm.name : user?.name} 
                                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                                                        readOnly={!isEditingProfile} 
                                                        style={{ backgroundColor: !isEditingProfile ? 'var(--bg-elevated)' : 'var(--surface-color)', border: !isEditingProfile ? 'none' : '' }} 
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Email Address</label>
                                                    <input type="email" className="form-control" value={user?.email} readOnly style={{ backgroundColor: 'var(--bg-elevated)', border: 'none', cursor: 'not-allowed' }} title="Email cannot be changed" />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Phone Number</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder={isEditingProfile ? "Enter phone number" : "Not provided"}
                                                        value={isEditingProfile ? editProfileForm.phone : (user?.phone || '')} 
                                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                                                        readOnly={!isEditingProfile} 
                                                        style={{ backgroundColor: !isEditingProfile ? 'var(--bg-elevated)' : 'var(--surface-color)', border: !isEditingProfile ? 'none' : '' }} 
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Account Role</label>
                                                    <input type="text" className="form-control" value={user?.role} readOnly style={{ backgroundColor: 'var(--bg-elevated)', border: 'none', cursor: 'not-allowed' }} />
                                                </div>
                                                <div className="col-12">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Shipping Address</label>
                                                    <textarea 
                                                        className="form-control" 
                                                        placeholder={isEditingProfile ? "Enter your full shipping address" : "Not provided"}
                                                        value={isEditingProfile ? editProfileForm.address : (user?.address || '')} 
                                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                                                        readOnly={!isEditingProfile} 
                                                        rows="3"
                                                        style={{ backgroundColor: !isEditingProfile ? 'var(--bg-elevated)' : 'var(--surface-color)', border: !isEditingProfile ? 'none' : '' }} 
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Operational Region</label>
                                                    {isEditingProfile ? (
                                                        <select 
                                                            className="form-select" 
                                                            value={editProfileForm.regionId} 
                                                            onChange={(e) => setEditProfileForm({ ...editProfileForm, regionId: e.target.value })}
                                                        >
                                                            <option value="">Select a Region</option>
                                                            <option value="Region-North">Region-North (North Hub)</option>
                                                            <option value="Region-South">Region-South (South Hub)</option>
                                                            <option value="Region-East">Region-East (East Hub)</option>
                                                            <option value="Region-West">Region-West (West Hub)</option>
                                                            <option value="Region-Central">Region-Central (Central Hub)</option>
                                                        </select>
                                                    ) : (
                                                        <input 
                                                            type="text" 
                                                            className="form-control" 
                                                            value={user?.regionId || 'Not set'} 
                                                            readOnly 
                                                            style={{ backgroundColor: 'var(--bg-elevated)', border: 'none' }} 
                                                        />
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="text-muted small fw-bolder text-uppercase mb-2 tracking-wider">Contact Info for OTP</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        placeholder={isEditingProfile ? "Enter email/phone for OTP" : "Not provided"}
                                                        value={isEditingProfile ? editProfileForm.contactInfo : (user?.contactInfo || '')} 
                                                        onChange={(e) => setEditProfileForm({ ...editProfileForm, contactInfo: e.target.value })}
                                                        readOnly={!isEditingProfile} 
                                                        style={{ backgroundColor: !isEditingProfile ? 'var(--bg-elevated)' : 'var(--surface-color)', border: !isEditingProfile ? 'none' : '' }} 
                                                    />
                                                </div>
                                            </div>

                                            {/* Carbon Footprint Widget - Premium Dark Redesign */}
                                            <div className="card border-0 shadow-lg rounded-5 mb-5 p-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
                                                <div className="position-absolute" style={{ top: '-10%', right: '-5%', opacity: 0.1, fontSize: '200px' }}>🌍</div>
                                                <div className="d-flex flex-column flex-lg-row align-items-center justify-content-between position-relative z-1">
                                                    <div className="mb-4 mb-lg-0 text-center text-lg-start">
                                                        <h4 className="fw-bolder mb-2" style={{ letterSpacing: '-0.01em', fontSize: '28px' }}>Eco-Impact Summary</h4>
                                                        <p className="mb-0 text-white opacity-75" style={{ fontSize: '16px' }}>Estimated CO2 offset based on your {orders.length} sustainable orders.</p>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-4 bg-white bg-opacity-10 rounded-5 p-3 px-4 shadow-sm backdrop-blur">
                                                        <div className="text-end">
                                                            <h2 className="fw-bolder mb-0" style={{ fontSize: '36px' }}>{(orders.length * 2.5).toFixed(1)} <span className="fs-5 fw-medium">kg</span></h2>
                                                            <span className="small text-white opacity-75 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>CO2 Saved</span>
                                                        </div>
                                                        <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                                            <svg width="80" height="80" viewBox="0 0 100 100" className="circular-chart" style={{ transform: 'rotate(-90deg)' }}>
                                                              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                                                              <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" 
                                                                strokeDasharray="251.2" 
                                                                strokeDashoffset={251.2 - (251.2 * Math.min((orders.length * 2.5) * 5, 100)) / 100} 
                                                                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                                                              />
                                                            </svg>
                                                            <div className="position-absolute fs-3" style={{ transform: 'rotate(0deg)' }}>🌱</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="animate-fade-in">
                                    <h3 className="fw-bolder mb-5 pb-3 border-bottom text-dark" style={{ letterSpacing: '-0.02em', fontSize: '32px' }}>Order History</h3>
                                    {ordersLoading ? (
                                        <div className="d-flex flex-column rounded-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                            {[...Array(3)].map((_, i) => <SkeletonRow key={`order-skel-${i}`} />)}
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-5 rounded-5" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                            <div className="mb-4" style={{ fontSize: '64px' }}>📦</div>
                                            <h4 className="fw-bold mb-3">No orders yet</h4>
                                            <p className="text-muted mb-4">When you buy something, it will appear here.</p>
                                            <button className="btn btn-primary rounded-pill px-5 py-3 shadow-sm fw-medium" onClick={() => navigate('/home')}>Start Shopping</button>
                                        </div>
                                    ) : (
                                        <div className="accordion accordion-flush bg-transparent d-flex flex-column gap-3" id="ordersAccordion">
                                            {orders.map((order, index) => {
                                                const { currentIndex, percentage, statuses } = getStatusProgress(order.status);
                                                
                                                return (
                                                    <div key={order.id} className="accordion-item bg-transparent border-0">
                                                        <h2 className="accordion-header" id={`heading${index}`}>
                                                            <button 
                                                                className="accordion-button collapsed card shadow-sm rounded-4 d-flex justify-content-between align-items-center px-4 py-4" 
                                                                style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                                                                type="button" 
                                                                data-bs-toggle="collapse" 
                                                                data-bs-target={`#collapse${index}`} 
                                                            >
                                                                <div className="d-flex w-100 justify-content-between align-items-center pe-3">
                                                                    <div>
                                                                        <p className="text-muted small mb-1 fw-bold text-uppercase tracking-wider">Placed On</p>
                                                                        <h6 className="fw-bolder mb-0 text-dark" style={{ fontSize: '16px' }}>{new Date(order.createdAt).toLocaleDateString()}</h6>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="text-muted small mb-1 fw-bold text-uppercase tracking-wider">Status</p>
                                                                        <span className={`badge rounded-pill px-3 py-2 fw-medium shadow-sm ${order.status === 'Delivered' ? 'bg-success' : 'bg-primary text-white'}`}>{order.status}</span>
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <p className="text-muted small mb-1 fw-bold text-uppercase tracking-wider">Total</p>
                                                                        <h6 className="fw-bolder mb-0 text-dark" style={{ fontSize: '18px' }}>${order.totalAmount.toFixed(2)}</h6>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        </h2>
                                                        <div id={`collapse${index}`} className="accordion-collapse collapse mt-3" data-bs-parent="#ordersAccordion">
                                                            <div className="accordion-body rounded-4 p-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                                                
                                                                {/* Linear Order Tracking Bar */}
                                                                <div className="px-2 pb-5 mb-5 border-bottom">
                                                                    <h6 className="fw-bolder mb-5" style={{ fontSize: '18px' }}>Shipment Progress</h6>
                                                                    <div className="position-relative mt-4 mb-2 px-3">
                                                                        <div className="progress overflow-visible" style={{ height: '6px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                                                                            <div className="progress-bar rounded-pill" role="progressbar" style={{ width: `${percentage}%`, backgroundColor: 'var(--accent-blue)' }}></div>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between position-absolute w-100" style={{ top: '-10px', left: '0' }}>
                                                                            {statuses.map((s, idx) => (
                                                                                <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '40px' }}>
                                                                                    <div 
                                                                                        className={`rounded-circle shadow-sm d-flex align-items-center justify-content-center transition-all ${idx <= currentIndex ? 'bg-primary text-white' : 'bg-white text-muted'}`}
                                                                                        style={{ width: '26px', height: '26px', fontSize: '12px', border: idx <= currentIndex ? 'none' : '2px solid rgba(0,0,0,0.1)' }}
                                                                                    >
                                                                                        {idx <= currentIndex ? '✓' : ''}
                                                                                    </div>
                                                                                    <span className={`small mt-2 ${idx <= currentIndex ? 'fw-bold text-dark' : 'text-muted'}`} style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{s}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <h6 className="fw-bolder mb-4" style={{ fontSize: '18px' }}>Order Items</h6>
                                                                <div className="d-flex flex-column gap-3 mb-5">
                                                                    {order.items.map(item => (
                                                                        <div key={item.id} className="d-flex align-items-center p-3 rounded-4" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                                                                            <div className="bg-white rounded-3 p-2 me-4 shadow-sm" style={{ width: '60px', height: '60px' }}>
                                                                                <img src={item.product.imageUrl || 'https://via.placeholder.com/60'} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                                            </div>
                                                                            <div className="flex-grow-1">
                                                                                <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '16px' }}>{item.product.title}</h6>
                                                                                <span className="text-muted fw-medium small">Qty: {item.quantity}</span>
                                                                            </div>
                                                                            <div className="fw-bold text-dark fs-5">
                                                                                ${item.priceAtPurchase.toFixed(2)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-end">
                                                                    <button className="btn btn-dark rounded-pill px-5 py-3 fw-medium shadow-sm hover-scale" onClick={() => handleReorder(order.items)}>↻ Reorder Items</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Wishlist Tab */}
                            {activeTab === 'wishlist' && (
                                <div className="animate-fade-in">
                                    <h3 className="fw-bolder mb-5 pb-3 border-bottom text-dark" style={{ letterSpacing: '-0.02em', fontSize: '32px' }}>Saved Items</h3>
                                    {wishlistLoading ? (
                                        <div className="row g-4">
                                            {[...Array(3)].map((_, i) => (
                                                <div className="col-12 col-md-6 col-lg-4" key={`wishlist-skel-${i}`}>
                                                    <SkeletonProductCard />
                                                </div>
                                            ))}
                                        </div>
                                    ) : wishlistItems.length === 0 ? (
                                        <div className="text-center py-5 rounded-5" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                            <div className="mb-4" style={{ fontSize: '64px' }}>🤍</div>
                                            <h4 className="fw-bold mb-3">Your wishlist is empty</h4>
                                            <p className="text-muted mb-4">Save items you love to view them later.</p>
                                            <button className="btn btn-dark rounded-pill px-5 py-3 shadow-sm fw-medium hover-scale" onClick={() => navigate('/home')}>Explore Store</button>
                                        </div>
                                    ) : (
                                        <div className="row g-4">
                                            {wishlistItems.map(item => (
                                                <div key={item.id} className="col-12 col-xl-6">
                                                    <div className="premium-card d-flex flex-row overflow-hidden position-relative" style={{ height: '160px', cursor: 'pointer' }} onClick={() => navigate(`/product/${item.product.id}`)}>
                                                        <div className="bg-white p-3 d-flex justify-content-center align-items-center" style={{ width: '160px' }}>
                                                            <img 
                                                                src={item.product.imageUrl || 'https://via.placeholder.com/150'} 
                                                                alt={item.product.title}
                                                                className="product-image"
                                                            />
                                                        </div>
                                                        <div className="p-4 d-flex flex-column justify-content-center flex-grow-1" style={{ backgroundColor: 'var(--surface-color)' }}>
                                                            <h6 className="fw-bolder text-dark mb-1 lh-sm" style={{ fontSize: '16px' }}>{item.product.title}</h6>
                                                            <p className="text-primary fw-bolder mb-0 mt-2" style={{ fontSize: '18px' }}>${item.product.price.toFixed(2)}</p>
                                                            <div className="mt-auto pt-2 text-muted small fw-medium">
                                                                Saved {new Date(item.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="btn btn-sm position-absolute top-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center remove-btn-premium" 
                                                            style={{ width: '36px', height: '36px', zIndex: 5 }}
                                                            onClick={(e) => removeFromWishlist(e, item.productId)}
                                                            title="Remove from Saved Items"
                                                        >
                                                            <span style={{ fontSize: '18px', lineHeight: '1', marginTop: '-2px' }}>✕</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div className="animate-fade-in">
                                    <h3 className="fw-bolder mb-5 pb-3 border-bottom text-dark" style={{ letterSpacing: '-0.02em', fontSize: '32px' }}>Appearance</h3>
                                    <div className="d-flex justify-content-between align-items-center p-4 p-md-5 rounded-5 mb-4 shadow-sm transition-all" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div>
                                            <h5 className="fw-bolder mb-2 text-dark" style={{ fontSize: '20px' }}>Dark Mode</h5>
                                            <p className="text-muted fw-medium mb-0" style={{ fontSize: '15px' }}>Switch between a light and cinematic dark theme for the platform.</p>
                                        </div>
                                        <div className="form-check form-switch fs-3 ms-4">
                                            <input 
                                                className="form-check-input shadow-sm" 
                                                type="checkbox" 
                                                role="switch" 
                                                checked={isDarkMode}
                                                onChange={() => setIsDarkMode(!isDarkMode)}
                                                style={{ cursor: 'pointer', height: '30px', width: '56px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex gap-4 flex-column flex-md-row">
                                        <div 
                                            className={`rounded-5 p-5 flex-grow-1 text-center transition-all ${!isDarkMode ? 'shadow-md scale-105' : 'opacity-75'}`}
                                            onClick={() => setIsDarkMode(false)}
                                            style={{ cursor: 'pointer', backgroundColor: '#ffffff', border: !isDarkMode ? '2px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)' }}
                                        >
                                            <div className="mb-3" style={{ fontSize: '48px' }}>☀️</div>
                                            <h5 className="fw-bolder text-dark mb-0">Light Theme</h5>
                                        </div>
                                        <div 
                                            className={`rounded-5 p-5 flex-grow-1 text-center transition-all ${isDarkMode ? 'shadow-md scale-105' : 'opacity-75'}`}
                                            onClick={() => setIsDarkMode(true)}
                                            style={{ cursor: 'pointer', backgroundColor: '#0a0a0a', border: isDarkMode ? '2px solid var(--accent-blue)' : '2px solid rgba(0,0,0,0.1)' }}
                                        >
                                            <div className="mb-3" style={{ fontSize: '48px' }}>🌙</div>
                                            <h5 className="fw-bolder text-white mb-0">Dark Theme</h5>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Green Bookings & Labels Tab */}
                            {activeTab === 'greenbookings' && (
                                <div className="animate-fade-in">
                                    <h3 className="fw-bolder mb-5 pb-3 border-bottom text-dark" style={{ letterSpacing: '-0.02em', fontSize: '32px' }}>Green Bookings & Labels</h3>
                                    
                                    {/* Section 1: Genius Bar Bookings */}
                                    <div className="mb-5">
                                        <h5 className="fw-bold text-dark mb-3">📅 Genius Bar Appointments</h5>
                                        {(() => {
                                            const bookings = JSON.parse(localStorage.getItem('genius_bookings') || '[]');
                                            if (bookings.length === 0) {
                                                return <p className="text-muted small">No scheduled advisor consultations.</p>;
                                            }
                                            return (
                                                <div className="d-flex flex-column gap-3">
                                                    {bookings.map(b => (
                                                        <div key={b.id} className="p-4 rounded-4 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                                            <div>
                                                                <h6 className="fw-bolder text-dark mb-1">{b.service}</h6>
                                                                <span className="small text-muted d-block">Scheduled with: <strong>{b.advisor}</strong></span>
                                                                <small className="text-muted">Appointment Reference: #{b.id}</small>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="badge bg-success text-white rounded-pill px-3 py-1 mb-2 d-inline-block" style={{ fontSize: '11px' }}>Active</span>
                                                                <h6 className="fw-bolder text-dark mb-0">{b.date} at {b.time}</h6>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Section 2: Today at Eco-Hive Workshop Registrations */}
                                    <div className="mb-5">
                                        <h5 className="fw-bold text-dark mb-3">🏫 Workshop Registrations</h5>
                                        {(() => {
                                            const regs = JSON.parse(localStorage.getItem('workshop_registrations') || '[]');
                                            if (regs.length === 0) {
                                                return <p className="text-muted small">No registered workshop events.</p>;
                                            }
                                            return (
                                                <div className="d-flex flex-column gap-3">
                                                    {regs.map(r => (
                                                        <div key={r.id} className="p-4 rounded-4 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                                            <div>
                                                                <h6 className="fw-bolder text-dark mb-1">{r.title}</h6>
                                                                <span className="small text-muted d-block">Instructor: <strong>{r.host}</strong></span>
                                                                <small className="text-muted">Ticket Reference: #{r.id}</small>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2 d-inline-block" style={{ fontSize: '11px' }}>Registered</span>
                                                                <h6 className="fw-bolder text-dark mb-0">{r.time}</h6>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Section 3: Recycling Labels */}
                                    <div className="mb-4">
                                        <h5 className="fw-bold text-dark mb-3">♻️ Recycling Shipping Labels</h5>
                                        {(() => {
                                            const labels = JSON.parse(localStorage.getItem('recycling_labels') || '[]');
                                            if (labels.length === 0) {
                                                return <p className="text-muted small">No generated recycling labels.</p>;
                                            }
                                            return (
                                                <div className="d-flex flex-column gap-3">
                                                    {labels.map(l => (
                                                        <div key={l.id} className="p-4 rounded-4 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                                            <div>
                                                                <h6 className="fw-bolder text-dark mb-1">{l.category} Recycling Label</h6>
                                                                <span className="small text-muted d-block">Valuation: <strong>{l.points} Eco-Points</strong></span>
                                                                <small className="text-muted">Tracking ID: {l.id} ({l.carrier})</small>
                                                            </div>
                                                            <div className="text-end">
                                                                <span className="badge bg-info text-dark rounded-pill px-3 py-1 mb-2 d-inline-block" style={{ fontSize: '11px', fontWeight: '600' }}>Pre-Paid</span>
                                                                <h6 className="fw-bolder text-success mb-0">🌱 {l.co2} kg CO2 saved</h6>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Eco-Wallet & Gift Cards Tab */}
                            {activeTab === 'wallet' && (
                                <div className="animate-fade-in">
                                    <h3 className="fw-bolder mb-5 pb-3 border-bottom text-dark" style={{ letterSpacing: '-0.02em', fontSize: '32px' }}>Eco-Wallet & Gift Cards</h3>
                                    
                                    <div className="row g-4 mb-5">
                                        {/* Eco Points Card */}
                                        <div className="col-12 col-md-6">
                                            <div className="card border-0 rounded-5 p-4 text-white shadow-sm h-100 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                                <div className="position-absolute" style={{ top: '-10%', right: '-5%', opacity: 0.15, fontSize: '100px' }}>🌱</div>
                                                <h6 className="small text-uppercase fw-bold text-white opacity-75 tracking-wider mb-2">Available Eco-Points</h6>
                                                <h2 className="fw-bolder text-white mb-2" style={{ fontSize: '36px' }}>{user?.ecoPoints || 0} Pts</h2>
                                                <p className="small mb-0 text-white opacity-90">Earned from sustainable purchases & recycling intakes.</p>
                                            </div>
                                        </div>

                                        {/* Gift Card Balance Card */}
                                        <div className="col-12 col-md-6">
                                            <div className="card border-0 rounded-5 p-4 text-white shadow-sm h-100 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #434345 0%, #1d1d1f 100%)' }}>
                                                <div className="position-absolute" style={{ top: '-10%', right: '-5%', opacity: 0.15, fontSize: '100px' }}>💳</div>
                                                <h6 className="small text-uppercase fw-bold text-white opacity-75 tracking-wider mb-2">Gift Card Wallet Balance</h6>
                                                <h2 className="fw-bolder text-white mb-2" style={{ fontSize: '36px' }}>${(user?.giftCardBalance || 0.0).toFixed(2)}</h2>
                                                <p className="small mb-0 text-white opacity-90">Deducted automatically at checkout when applied.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Redeem Gift Card Form */}
                                    <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm mb-5" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <h5 className="fw-bold text-dark mb-3">🎫 Redeem an Eco-Hive Gift Card</h5>
                                        <p className="text-muted small mb-4">Enter your 16-character gift card code (e.g. ECO-XXXX-XXXX-XXXX) to add the funds to your wallet.</p>
                                        
                                        <form onSubmit={handleRedeemSubmit} className="d-flex flex-column flex-sm-row gap-3">
                                            <input 
                                                type="text"
                                                className="form-control rounded-pill px-4"
                                                placeholder="ECO-XXXX-XXXX-XXXX"
                                                value={redeemCode}
                                                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                                required
                                                disabled={redeemLoading}
                                                style={{ height: '48px', fontSize: '15px', backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)', letterSpacing: '1px', textTransform: 'uppercase' }}
                                            />
                                            <button 
                                                type="submit"
                                                className="btn btn-dark rounded-pill px-5 fw-bold"
                                                style={{ height: '48px', whiteSpace: 'nowrap' }}
                                                disabled={redeemLoading}
                                            >
                                                {redeemLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Redeem Now'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Gift Card Activity History */}
                                    <div>
                                        <h5 className="fw-bold text-dark mb-4">📜 Gift Card Transaction History</h5>
                                        {giftCardActivity.length === 0 ? (
                                            <p className="text-muted small">No gift card transactions recorded.</p>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {giftCardActivity.map(item => {
                                                    const isPurchasedByUser = item.senderEmail === user?.email;
                                                    const isRedeemedByUser = item.redeemedById === userId;
                                                    
                                                    let badgeText = 'Active';
                                                    let badgeBg = 'bg-success';
                                                    let descriptionText = '';
                                                    let amountSign = '';
                                                    let amountColor = '';

                                                    if (isRedeemedByUser) {
                                                        badgeText = 'Redeemed';
                                                        badgeBg = 'bg-secondary';
                                                        descriptionText = `Redeemed card from ${item.senderName}`;
                                                        amountSign = '+';
                                                        amountColor = 'text-success';
                                                    } else if (isPurchasedByUser) {
                                                        badgeText = item.status;
                                                        badgeBg = item.status === 'Active' ? 'bg-primary' : 'bg-secondary';
                                                        descriptionText = `Sent to ${item.recipientEmail}`;
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
                </div>
            </div>
            <Footer />
            <style>{`
                .hover-bg-light:hover { background-color: rgba(0,0,0,0.05); }
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                
                [data-theme='dark'] .hover-bg-light:hover { background-color: rgba(255,255,255,0.1) !important; color: white !important; }
                [data-theme='dark'] .text-dark { color: #f5f5f7 !important; }
                [data-theme='dark'] .bg-light { background-color: #2c2c2e !important; }
                
                .avatar-container:hover .avatar-overlay { opacity: 1 !important; }
            `}</style>
        </div>
    );
};

export default Settings;
