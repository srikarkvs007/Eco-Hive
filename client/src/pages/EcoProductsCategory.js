import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EcoProductsCategory = () => {
    const { categoryName } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            setLoading(true);
            try {
                // Fetch products specifically for this category name
                const res = await axios.get(`http://localhost:5001/api/products?categoryName=${encodeURIComponent(categoryName)}`);
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching category products:", err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryName) {
            fetchCategoryProducts();
        }
    }, [categoryName]);

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <Navbar />
            
            {/* Category Header Banner */}
            <div className="w-100 d-flex align-items-center justify-content-center" style={{
                height: '300px',
                backgroundColor: '#1d1d1f',
                backgroundImage: 'url(/images/banner1_hd.png)', // fallback subtle background
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                position: 'relative'
            }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
                <div className="text-center position-relative z-3">
                    <p className="text-uppercase text-white-50 fw-bold tracking-widest mb-2" style={{ letterSpacing: '0.1em' }}>
                        Eco-Products
                    </p>
                    <h1 className="display-4 fw-bolder text-white mb-0" style={{ letterSpacing: '-0.02em' }}>
                        {categoryName}
                    </h1>
                </div>
            </div>

            <div className="container py-5 flex-grow-1" style={{ paddingTop: '160px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0 text-dark">Showing all {products.length} products</h4>
                    
                    {/* Optional Breadcrumb or Filter dropdown could go here */}
                    <Link to="/home" className="text-decoration-none text-muted small fw-medium hover-primary">
                        &larr; Back to all products
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="text-muted mt-3">Loading sustainable goods...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-5">
                        <div className="fs-1 mb-3">🌱</div>
                        <h4 className="fw-bold text-dark">No products found in this category.</h4>
                        <p className="text-muted">We are actively sourcing new sustainable options. Check back soon!</p>
                        <Link to="/home" className="btn btn-primary rounded-pill px-4 mt-3">
                            View All Products
                        </Link>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {products.map(product => (
                            <div className="col" key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
            <style>{`
                .tracking-widest { letter-spacing: 0.25em; }
                .hover-primary:hover { color: #0071e3 !important; }
            `}</style>
        </div>
    );
};

export default EcoProductsCategory;
