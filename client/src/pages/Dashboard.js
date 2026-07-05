import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingDeliveries: 0,
        totalProducts: 42,
        ordersToday: 15,
        lowStockAlerts: 0,
        totalVehicles: 0,
        totalUsers: 0,
        totalReviews: 0,
        activeGiftCards: 0
    });
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    setIsDarkMode(document.body.getAttribute('data-theme') === 'dark');
                }
            });
        });
        observer.observe(document.body, { attributes: true });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/dashboard/stats');
                setStats({
                    totalRevenue: res.data.totalRevenue || 0,
                    pendingDeliveries: res.data.pendingDeliveries || 0,
                    totalProducts: res.data.totalProducts || 0,
                    ordersToday: res.data.ordersToday || 0,
                    lowStockAlerts: res.data.lowStockAlerts || 0,
                    totalVehicles: res.data.totalVehicles || 0,
                    totalUsers: res.data.totalUsers || 0,
                    totalReviews: res.data.totalReviews || 0,
                    activeGiftCards: res.data.activeGiftCards || 0
                });
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <AdminLayout>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 border-bottom pb-4" style={{ borderColor: 'var(--glass-border)' }}>
                <div>
                    <h1 className="fw-bolder mb-1" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Admin Dashboard</h1>
                    <p className="mb-0" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>Welcome back! Here's the performance summary for your store.</p>
                </div>
                <div className="mt-3 mt-md-0 d-flex align-items-center bg-white px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: 'var(--surface-color) !important', border: 'var(--glass-border)' }}>
                    <i className="bi bi-clock-history me-2 text-primary"></i>
                    <span className="small fw-medium" style={{ color: 'var(--text-primary)' }}>Updated: Just now</span>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <>
                {/* Row 1: Main E-Commerce Stats */}
                <div className="row g-4 mb-4">
                    {/* Card 1: Total Products */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Total Products</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(29, 158, 117, 0.1)', color: 'var(--accent-color, #1D9E75)' }}>
                                    <i className="bi bi-box-seam fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.totalProducts}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="badge rounded-pill bg-light text-success border border-success border-opacity-25 px-2 py-1 small">
                                    <i className="bi bi-arrow-up-right"></i> 12%
                                </span>
                                <span className="small ms-2" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>vs last month</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Orders Today */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Orders Today</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                                    <i className="bi bi-cart-check fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.ordersToday}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="badge rounded-pill bg-light text-success border border-success border-opacity-25 px-2 py-1 small">
                                    <i className="bi bi-arrow-up-right"></i> 5%
                                </span>
                                <span className="small ms-2" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>vs yesterday</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Pending Shipments */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Pending Shipments</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(234, 88, 12, 0.1)', color: '#ea580c' }}>
                                    <i className="bi bi-truck fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.pendingDeliveries}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="badge rounded-pill bg-light text-danger border border-danger border-opacity-25 px-2 py-1 small">
                                    <i className="bi bi-arrow-down-right"></i> 2%
                                </span>
                                <span className="small ms-2" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>vs yesterday</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Revenue This Month */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Revenue This Month</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                                    <i className="bi bi-currency-dollar fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="badge rounded-pill bg-light text-success border border-success border-opacity-25 px-2 py-1 small">
                                    <i className="bi bi-arrow-up-right"></i> 18%
                                </span>
                                <span className="small ms-2" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>vs last month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Fleet, Users & Moderation KPIs */}
                <div className="row g-4 mb-4">
                    {/* Card 5: Registered Users */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Total Users</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <i className="bi bi-people fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.totalUsers}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="small" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>Registered customer accounts</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 6: Active Fleet Vehicles */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Fleet Vehicles</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    <i className="bi bi-car-front fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.totalVehicles}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="small" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>Vans & trucks in logistics</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 7: Active Gift Cards */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Active Gift Cards</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(217, 70, 239, 0.1)', color: '#d946ef' }}>
                                    <i className="bi bi-ticket-perforated fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.activeGiftCards}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="small" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>Unredeemed promo codes</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 8: Customer Reviews */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="premium-card p-4 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Customer Reviews</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                    <i className="bi bi-star fs-5"></i>
                                </div>
                            </div>
                            <h2 className="fw-bolder mb-2" style={{ color: 'var(--text-primary)' }}>{stats.totalReviews}</h2>
                            <div className="d-flex align-items-center mt-auto">
                                <span className="small" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>Product reviews published</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Third Row: Low Stock Alerts and System Indicators */}
                <div className="row g-4 mb-4">
                    {/* Card 9: Low Stock Alerts */}
                    <div className="col-12">
                        <div className="premium-card p-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="fw-medium small text-uppercase" style={{ letterSpacing: '0.5px', color: 'var(--text-primary)', opacity: 0.85 }}>Inventory Health Indicators</div>
                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <i className="bi bi-exclamation-triangle fs-5"></i>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <h2 className="fw-bolder m-0" style={{ color: 'var(--text-primary)' }}>{stats.lowStockAlerts}</h2>
                                <span className={`badge rounded-pill px-3 py-2 small ${stats.lowStockAlerts > 0 ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                                    {stats.lowStockAlerts > 0 ? '⚠️ Low Stock Restock Required' : '✓ All Products Well-Stocked'}
                                </span>
                                <span className="small text-muted">
                                    Catalog items under 10 stock quantity threshold
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Revenue Chart Section */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="premium-card p-4">
                            <h5 className="fw-bolder mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Overview</h5>
                            <div style={{ height: '350px' }}>
                                <Line 
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                                        datasets: [
                                            {
                                                label: 'Revenue ($)',
                                                data: [1200, 1900, 3000, 5000, 4200, 6000, 7500],
                                                borderColor: '#1D9E75',
                                                backgroundColor: 'rgba(29, 158, 117, 0.1)',
                                                fill: true,
                                                tension: 0.4
                                            }
                                        ]
                                    }} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: { 
                                                beginAtZero: true, 
                                                grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
                                                ticks: { color: isDarkMode ? '#B0B0B0' : '#86868b' }
                                            },
                                            x: { 
                                                grid: { display: false },
                                                ticks: { color: isDarkMode ? '#B0B0B0' : '#86868b' }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </AdminLayout>
    );
}

export default Dashboard;