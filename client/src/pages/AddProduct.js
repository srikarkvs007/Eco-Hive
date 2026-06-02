import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        features: '',
        specifications: '',
        perfectFor: '',
        price: '',
        stockQuantity: '',
        imageUrl: '',
        isEcoFriendly: false,
        categoryId: ''
    });
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [overlayState, setOverlayState] = useState(null); // 'uploading' or 'success'

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/products/categories');
                setCategories(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOverlayState('uploading'); // Trigger the uploading animation

        try {
            await axios.post('http://localhost:5001/api/products', formData);
            
            // Add a slight artificial delay so the premium uploading animation is visible even on instant local connections
            setTimeout(() => {
                setOverlayState('success');
                setMessage('');
                setFormData({
                    title: '',
                    description: '',
                    features: '',
                    specifications: '',
                    perfectFor: '',
                    price: '',
                    stockQuantity: '',
                    imageUrl: '',
                    isEcoFriendly: false,
                    categoryId: categories.length > 0 ? categories[0].id : ''
                });
                setTimeout(() => setOverlayState(null), 2500); // Hide everything after success
            }, 1000);

        } catch (err) {
            console.error(err);
            setOverlayState(null);
            setMessage('Failed to add product. Please check console.');
        }
    };

    return (
        <AdminLayout>
            <div className="pb-5">
            {overlayState && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
                    style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                        backdropFilter: 'blur(12px)',
                        zIndex: 9999,
                        animation: 'fadeIn 0.3s ease-out'
                    }}
                >
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes popIn { 
                            0% { transform: scale(0.5); opacity: 0; } 
                            70% { transform: scale(1.1); opacity: 1; } 
                            100% { transform: scale(1); opacity: 1; } 
                        }
                        @keyframes spinFast { 100% { transform: rotate(360deg); } }
                    `}</style>
                    
                    {overlayState === 'uploading' ? (
                        <div className="text-center">
                            <div 
                                className="rounded-circle mx-auto mb-4"
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    border: '6px solid #e5e5e5',
                                    borderTopColor: '#0071e3',
                                    animation: 'spinFast 0.8s linear infinite' 
                                }}
                            ></div>
                            <h2 className="fw-bolder text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>Publishing Product...</h2>
                            <p className="text-muted fs-5">Securing inventory and updating store layout</p>
                        </div>
                    ) : (
                        <div className="text-center" style={{ animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-sm"
                                style={{ width: '120px', height: '120px', backgroundColor: '#34c759', color: 'white', fontSize: '60px' }}
                            >
                                ✓
                            </div>
                            <h1 className="fw-bolder text-dark mb-2" style={{ letterSpacing: '-0.02em', fontSize: '42px' }}>Published!</h1>
                            <p className="text-muted fs-4">Your product is now live on the store.</p>
                        </div>
                    )}
                </div>
            )}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="premium-card">
                            <div className="card-body p-5">
                                <h2 className="fw-bold mb-4">Add New Product</h2>
                                {message && (
                                    <div className="alert alert-danger">
                                        {message}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Product Title</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-light" 
                                            name="title"
                                            value={formData.title} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="e.g. Bamboo Toothbrush"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Description</label>
                                        <textarea 
                                            className="form-control bg-light" 
                                            name="description"
                                            value={formData.description} 
                                            onChange={handleChange} 
                                            rows="3"
                                            placeholder="A brief description of the product..."
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Product Features</label>
                                        <textarea 
                                            className="form-control bg-light" 
                                            name="features"
                                            value={formData.features} 
                                            onChange={handleChange} 
                                            rows="2"
                                            placeholder="e.g., 100% Biodegradable, BPA-Free, Vegan"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Product Specifications</label>
                                        <textarea 
                                            className="form-control bg-light" 
                                            name="specifications"
                                            value={formData.specifications} 
                                            onChange={handleChange} 
                                            rows="2"
                                            placeholder="e.g., Dimensions: 5x5x10 cm, Weight: 50g, Material: Bamboo"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Perfect For</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-light" 
                                            name="perfectFor"
                                            value={formData.perfectFor} 
                                            onChange={handleChange} 
                                            placeholder="e.g., Everyday use, Travel, Zero-waste lifestyle"
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Price ($)</label>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="form-control bg-light" 
                                                name="price"
                                                value={formData.price} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Initial Stock</label>
                                            <input 
                                                type="number" 
                                                className="form-control bg-light" 
                                                name="stockQuantity"
                                                value={formData.stockQuantity} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Image URL</label>
                                        <input 
                                            type="url" 
                                            className="form-control bg-light" 
                                            name="imageUrl"
                                            value={formData.imageUrl} 
                                            onChange={handleChange} 
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Category</label>
                                        <select 
                                            className="form-select bg-light" 
                                            name="categoryId"
                                            value={formData.categoryId} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="" disabled>Select a Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-check form-switch mb-4">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            name="isEcoFriendly"
                                            id="ecoSwitch"
                                            checked={formData.isEcoFriendly}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label fw-bold" htmlFor="ecoSwitch">
                                            Is this an Eco-Friendly product? 🌿
                                        </label>
                                    </div>
                                    <button type="submit" className="premium-btn w-100 py-2">Publish Product</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </AdminLayout>
    );
};

export default AddProduct;
