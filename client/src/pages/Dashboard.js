import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

function Dashboard()
{
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingDeliveries: 0,
        inTransit: 0,
        activeDrones: 0,
        activeVans: 0,
        lowStockAlerts: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, trendRes] = await Promise.all([
                    axios.get('http://localhost:5001/api/dashboard/stats'),
                    axios.get('http://localhost:5001/api/dashboard/sales-trend')
                ]);
                setStats(statsRes.data);
                setSalesData(trendRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    return(
        <div className="bg-light min-vh-100">
            <Navbar/>
            <div className='container py-5'>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold">Logistics Dashboard</h2>
                    <div className="d-flex gap-2 flex-wrap justify-content-end">
                        <Link to="/livetracking" className="btn btn-dark rounded-pill px-4 fw-bold">
                            🛰️ Live Tracking Map
                        </Link>
                        <Link to="/addorder" className="btn premium-btn rounded-pill px-4">
                            + Smart Dispatch (Add Order)
                        </Link>
                        <Link to="/orders" className="btn btn-outline-dark rounded-pill px-4">
                            View Orders
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, staggerChildren: 0.1 }}
                        className='row g-4'
                    >
                        {/* Revenue Card */}
                        <motion.div className='col-md-4' whileHover={{ y: -5 }}>
                            <div className='card border-0 p-4 shadow-sm rounded-4 h-100 glass-panel'>
                                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-3">Total Sales Revenue</h6>
                                <h1 className="fw-bolder display-5 text-primary mb-4">${stats.totalRevenue.toFixed(2)}</h1>
                                <div className="mt-auto">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small fw-medium text-muted">Monthly Target</span>
                                        <span className="small fw-bold text-dark">75%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', backgroundColor: '#e5e5e5' }}>
                                        <div className="progress-bar bg-primary rounded-pill" role="progressbar" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Active Logistics Card */}
                        <motion.div className='col-md-4' whileHover={{ y: -5 }}>
                            <div className='card border-0 p-4 shadow-sm rounded-4 h-100 glass-panel'>
                                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-3">Active Logistics</h6>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="text-center w-50">
                                        <h2 className="fw-bolder text-dark mb-0">{stats.activeVans}</h2>
                                        <span className="small text-muted fw-medium">Vans 🚚</span>
                                    </div>
                                    <div style={{ width: '1px', height: '40px', backgroundColor: '#e5e5e5' }}></div>
                                    <div className="text-center w-50">
                                        <h2 className="fw-bolder text-success mb-0">{stats.activeDrones}</h2>
                                        <span className="small text-muted fw-medium">Drones 🚁</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small fw-medium text-muted">Fleet Capacity</span>
                                        <span className="small fw-bold text-dark">Active</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', backgroundColor: '#e5e5e5' }}>
                                        <div className="progress-bar bg-success rounded-pill" role="progressbar" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* System Alerts Card */}
                        <motion.div className='col-md-4' whileHover={{ y: -5 }}>
                            <div className='card border-0 p-4 shadow-sm rounded-4 h-100 glass-panel'>
                                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-3">System Health</h6>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div className="text-center w-50">
                                        <h2 className="fw-bolder text-warning mb-0">{stats.pendingDeliveries}</h2>
                                        <span className="small text-muted fw-medium">Pending Orders</span>
                                    </div>
                                    <div style={{ width: '1px', height: '40px', backgroundColor: '#e5e5e5' }}></div>
                                    <div className="text-center w-50">
                                        <h2 className={`fw-bolder mb-0 ${stats.lowStockAlerts > 0 ? 'text-danger' : 'text-dark'}`}>{stats.lowStockAlerts}</h2>
                                        <span className="small text-muted fw-medium">Low Stock Alerts</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small fw-medium text-muted">Fulfillment Rate</span>
                                        <span className="small fw-bold text-dark">92%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', backgroundColor: '#e5e5e5' }}>
                                        <div className="progress-bar bg-info rounded-pill" role="progressbar" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recharts Analytics Section */}
                        <div className="col-12 mt-5">
                            <h4 className="fw-bold mb-4">Financial Overview</h4>
                        </div>

                        <motion.div className='col-lg-8' whileHover={{ y: -3 }}>
                            <div className='card border-0 p-4 shadow-sm rounded-4 glass-panel'>
                                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-4">7-Day Revenue Trend</h6>
                                <div style={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#86868b'}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868b'}} tickFormatter={(value) => `$${value}`} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                labelStyle={{ fontWeight: 'bold', color: '#1d1d1f' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div className='col-lg-4' whileHover={{ y: -3 }}>
                            <div className='card border-0 p-4 shadow-sm rounded-4 glass-panel h-100'>
                                <h6 className="text-muted fw-bold text-uppercase tracking-wider mb-4">Orders by Day</h6>
                                <div style={{ width: '100%', height: 350 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#86868b'}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868b'}} />
                                            <Tooltip 
                                                cursor={{fill: 'rgba(0,0,0,0.05)'}}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Dashboard;