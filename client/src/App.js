import {BrowserRouter,Routes,Route,Navigate,useLocation} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

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
import Checkout from './pages/Checkout';
import AdminCustomerOrders from './pages/AdminCustomerOrders';
import EcoProductsCategory from './pages/EcoProductsCategory';
import FAQ from './pages/FAQ';
import Settings from './pages/Settings';
import OrderSuccess from './pages/OrderSuccess';
import Chatbot from './components/Chatbot';
import CursorAura from './components/CursorAura';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/" replace />;
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
                <Route path='/faq' element={<PageTransition><FAQ/></PageTransition>}/>

                {/* User Only Routes (Store) */}
                <Route path='/home' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><Home/></PageTransition></ProtectedRoute>}/>
                <Route path='/category/:categoryName' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><EcoProductsCategory/></PageTransition></ProtectedRoute>}/>
                <Route path='/product/:id' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><ProductDetail/></PageTransition></ProtectedRoute>}/>
                <Route path='/cart' element={<ProtectedRoute allowedRole="User"><PageTransition><Cart/></PageTransition></ProtectedRoute>}/>
                <Route path='/checkout' element={<ProtectedRoute allowedRole="User"><PageTransition><Checkout/></PageTransition></ProtectedRoute>}/>
                <Route path='/order-success/:orderId' element={<ProtectedRoute allowedRole="User"><PageTransition><OrderSuccess/></PageTransition></ProtectedRoute>}/>
                <Route path='/settings' element={<ProtectedRoute allowedRoles={['User', 'Admin']}><PageTransition><Settings/></PageTransition></ProtectedRoute>}/>

                {/* Admin Only Routes (Logistics) */}
                <Route path='/dashboard' element={<ProtectedRoute allowedRole="Admin"><PageTransition><Dashboard/></PageTransition></ProtectedRoute>}/>
                <Route path='/store-orders' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AdminCustomerOrders/></PageTransition></ProtectedRoute>}/>
                <Route path='/add-product' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AddProduct/></PageTransition></ProtectedRoute>}/>
                <Route path='/addorder' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AddOrder/></PageTransition></ProtectedRoute>}/>
                <Route path='/orders' element={<ProtectedRoute allowedRole="Admin"><PageTransition><ViewOrders/></PageTransition></ProtectedRoute>}/>
                <Route path='/vehicle' element={<ProtectedRoute allowedRole="Admin"><PageTransition><AddVehicle/></PageTransition></ProtectedRoute>}/>
                <Route path='/livetracking' element={<ProtectedRoute allowedRole="Admin"><PageTransition><LiveTracking/></PageTransition></ProtectedRoute>}/>
            </Routes>
        </AnimatePresence>
    );
};

function App()
{
    return(
        <ErrorBoundary>
            <BrowserRouter>
                <CursorAura />
                <AnimatedRoutes />
                <Chatbot />
                <Toaster position="top-center" reverseOrder={false} />
            </BrowserRouter>
        </ErrorBoundary>
    )
}

export default App;