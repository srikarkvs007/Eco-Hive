import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddOrder from './pages/AddOrder';
import ViewOrders from './pages/ViewOrders';
import AddVehicle from './pages/AddVehicle';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import LiveTracking from './pages/LiveTracking';
import AdminLogin from './pages/AdminLogin';
import ProductDetail from './pages/ProductDetail';
import Legal from './pages/Legal';
import LegalPage from './pages/LegalPage';
import Checkout from './pages/Checkout';
import PaymentGateway from './pages/PaymentGateway';
import AdminCustomerOrders from './pages/AdminCustomerOrders';
import ManageProducts from './pages/ManageProducts';
import AdminUsers from './pages/AdminUsers';
import EcoProductsCategory from './pages/EcoProductsCategory';
import FAQ from './pages/FAQ';
import StoreLocator from './pages/StoreLocator';
import OrderStatus from './pages/OrderStatus';
import SupportCenter from './pages/SupportCenter';
import WishlistPage from './pages/WishlistPage';
import GeniusBar from './pages/GeniusBar';
import RecyclingProgramme from './pages/RecyclingProgramme';
import TodayAtEcoHive from './pages/TodayAtEcoHive';
import Settings from './pages/Settings';
import OrderSuccess from './pages/OrderSuccess';
import GiftCards from './pages/GiftCards';
import EcoTV from './pages/EcoTV';
import Watch from './pages/Watch';
import AdminManageEcoTV from './pages/AdminManageEcoTV';
import AdminManagePodcasts from './pages/AdminManagePodcasts';
import AdminManageGiftCards from './pages/AdminManageGiftCards';
import AdminManageReviews from './pages/AdminManageReviews';
import Podcasts from './pages/Podcasts';
import About from './pages/About';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import CursorAura from './components/CursorAura';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles) {
        if (!allowedRoles.includes(role)) {
            return <Navigate to={role === 'Admin' ? '/dashboard' : '/home'} replace />;
        }
    } else if (role !== allowedRole) {
        return <Navigate to={role === 'Admin' ? '/dashboard' : '/home'} replace />;
    }

    return children;
};

// Page Transition Wrapper
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
        >
            {children}
        </motion.div>
    );
};

const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path='/' element={<PageTransition><Login/></PageTransition>}/>
                <Route path='/register' element={<PageTransition><Register/></PageTransition>}/>
                <Route path='/admin-login' element={<PageTransition><AdminLogin/></PageTransition>}/>
                <Route path='/legal' element={<PageTransition><Legal/></PageTransition>}/>
                <Route path='/legal/:documentType' element={<PageTransition><LegalPage/></PageTransition>}/>
                <Route path='/faq' element={<PageTransition><FAQ/></PageTransition>}/>
                <Route path='/store-locator' element={<PageTransition><StoreLocator/></PageTransition>}/>
                <Route path='/order-status' element={<PageTransition><OrderStatus/></PageTransition>}/>
                <Route path='/support' element={<PageTransition><SupportCenter/></PageTransition>}/>
                <Route path='/genius-bar' element={<PageTransition><GeniusBar/></PageTransition>}/>
                <Route path='/recycling' element={<PageTransition><RecyclingProgramme/></PageTransition>}/>
                <Route path='/today' element={<PageTransition><TodayAtEcoHive/></PageTransition>}/>
                <Route path='/about' element={<PageTransition><About/></PageTransition>}/>
                <Route path='/eco-tv' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><EcoTV/></PageTransition></ProtectedRoute>}/>
                <Route path='/watch/:id' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><Watch/></PageTransition></ProtectedRoute>}/>
                <Route path='/podcasts' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><Podcasts/></PageTransition></ProtectedRoute>}/>
                <Route path='/gift-cards' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><GiftCards/></PageTransition></ProtectedRoute>}/>

                {/* User Only Routes (Store) */}
                <Route path='/home' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><Home/></PageTransition></ProtectedRoute>}/>
                <Route path='/category/:categoryName' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><EcoProductsCategory/></PageTransition></ProtectedRoute>}/>
                <Route path='/product/:id' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><ProductDetail/></PageTransition></ProtectedRoute>}/>
                <Route path='/cart' element={<ProtectedRoute allowedRole="User"><PageTransition><Cart/></PageTransition></ProtectedRoute>}/>
                <Route path='/saves' element={<ProtectedRoute allowedRole="User"><PageTransition><WishlistPage/></PageTransition></ProtectedRoute>}/>
                <Route path='/checkout' element={<ProtectedRoute allowedRole="User"><PageTransition><Checkout/></PageTransition></ProtectedRoute>}/>
                <Route path='/gateway' element={<ProtectedRoute allowedRole="User"><PageTransition><PaymentGateway/></PageTransition></ProtectedRoute>}/>
                <Route path='/order-success' element={<ProtectedRoute allowedRole="User"><PageTransition><OrderSuccess/></PageTransition></ProtectedRoute>}/>
                <Route path='/settings' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><Settings/></PageTransition></ProtectedRoute>}/>

                {/* Admin Only Routes (Logistics) */}
                <Route path='/dashboard' element={<ProtectedRoute allowedRole="Admin"><PageTransition><Dashboard/></PageTransition></ProtectedRoute>}/>
                <Route path='/store-orders' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminCustomerOrders/></PageTransition></ProtectedRoute>}/>
                <Route path='/manage-products' element={<ProtectedRoute allowedRole="Admin"><PageTransition><ManageProducts/></PageTransition></ProtectedRoute>}/>
                <Route path='/users' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminUsers/></PageTransition></ProtectedRoute>}/>
                <Route path='/add-product' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AddProduct/></PageTransition></ProtectedRoute>}/>
                <Route path='/addorder' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AddOrder/></PageTransition></ProtectedRoute>}/>
                <Route path='/orders' element={<ProtectedRoute allowedRole="Admin"><PageTransition><ViewOrders/></PageTransition></ProtectedRoute>}/>
                <Route path='/vehicle' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AddVehicle/></PageTransition></ProtectedRoute>}/>
                <Route path='/livetracking' element={<ProtectedRoute allowedRole="Admin"><PageTransition><LiveTracking/></PageTransition></ProtectedRoute>}/>
                <Route path='/manage-tv' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminManageEcoTV/></PageTransition></ProtectedRoute>}/>
                <Route path='/manage-podcasts' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminManagePodcasts/></PageTransition></ProtectedRoute>}/>
                <Route path='/manage-giftcards' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminManageGiftCards/></PageTransition></ProtectedRoute>}/>
                <Route path='/manage-reviews' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminManageReviews/></PageTransition></ProtectedRoute>}/>
            </Routes>
        </AnimatePresence>
    );
};

function App()
{
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Intercept Ctrl+D on Windows/Linux/Mac or Cmd+D on Mac
            const isCtrlD = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd';
            if (isCtrlD) {
                e.preventDefault();
                
                const currentTheme = localStorage.getItem('theme') || 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                if (newTheme === 'dark') {
                    document.body.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.body.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                }
                
                // Sync with backend if logged in
                const userId = localStorage.getItem('userId');
                if (userId) {
                    axios.put(`http://localhost:5001/api/users/${userId}/theme`, { themePreference: newTheme })
                        .catch(err => console.error("Failed to sync theme preference", err));
                }
                
                // Dispatch event to sync other loaded components
                window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
                
                toast.success(`Switched to ${newTheme} mode!`, {
                    id: 'theme-toggle-shortcut-toast',
                    duration: 1500
                });
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return(
        <ErrorBoundary>
            <BrowserRouter basename={process.env.PUBLIC_URL}>
                <ScrollToTop />
                <CursorAura />
                <AnimatedRoutes />
                <Chatbot />
                <Toaster position="top-center" reverseOrder={false} />
            </BrowserRouter>
        </ErrorBoundary>
    )
}

export default App;