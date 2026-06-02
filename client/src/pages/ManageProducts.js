import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [adminRegion, setAdminRegion] = useState('');

    // Editing State
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        features: '',
        specifications: '',
        perfectFor: '',
        price: '',
        stockQuantity: '',
        imageUrl: '',
        isEcoFriendly: false,
        categoryId: '',
        sku: '',
        regionId: ''
    });

    useEffect(() => {
        fetchAdminProfileAndData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAdminProfileAndData = async () => {
        const adminId = localStorage.getItem('userId');
        try {
            // 1. Fetch Admin Profile to get RegionID
            if (adminId) {
                const adminRes = await axios.get(`http://localhost:5001/api/users/${adminId}`);
                if (adminRes.data && adminRes.data.regionId) {
                    setAdminRegion(adminRes.data.regionId);
                }
            }
            // 2. Fetch Categories
            const catRes = await axios.get('http://localhost:5001/api/products/categories');
            setCategories(catRes.data);

            // 3. Fetch Products
            fetchProducts();
        } catch (err) {
            console.error("Error initializing product management:", err);
            toast.error("Failed to load settings.");
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5001/api/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
            toast.error("Failed to fetch product catalog.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product? This will remove all associated order history and cart items.")) {
            try {
                await axios.delete(`http://localhost:5001/api/products/${productId}`);
                setProducts(prev => prev.filter(p => p.id !== productId));
                toast.success("Product deleted successfully.");
            } catch (err) {
                console.error("Error deleting product:", err);
                toast.error("Failed to delete product.");
            }
        }
    };

    const startEdit = (product) => {
        setEditingProduct(product);
        setEditForm({
            title: product.title || '',
            description: product.description || '',
            features: product.features || '',
            specifications: product.specifications || '',
            perfectFor: product.perfectFor || '',
            price: product.price || '',
            stockQuantity: product.stockQuantity || 0,
            imageUrl: product.imageUrl || '',
            isEcoFriendly: product.isEcoFriendly || false,
            categoryId: product.categoryId || '',
            sku: product.sku || '',
            regionId: product.regionId || ''
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5001/api/products/${editingProduct.id}`, {
                ...editForm,
                price: parseFloat(editForm.price),
                stockQuantity: parseInt(editForm.stockQuantity)
            });
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? res.data : p));
            setEditingProduct(null);
            toast.success("Product details updated successfully!");
        } catch (err) {
            console.error("Error updating product:", err);
            toast.error(err.response?.data?.message || "Failed to update product.");
        }
    };

    // Filter products: admins only manage products assigned to their operational region
    const filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) || 
                              (product.sku && product.sku.toLowerCase().includes(search.toLowerCase()));
        
        // Category filter
        const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
        
        // Regional availability mapping: admins manage their regional inventory
        const matchesRegion = adminRegion ? product.regionId === adminRegion : true;

        return matchesSearch && matchesCategory && matchesRegion;
    });

    return (
        <AdminLayout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bolder text-dark mb-1">Product Inventory</h2>
                        <p className="text-muted mb-0">
                            {adminRegion ? `Managing products geographically assigned to: ${adminRegion}` : 'Managing all catalog items'}
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/add-product'} 
                        className="btn btn-primary rounded-pill px-4 py-2 fw-medium text-white shadow-sm"
                    >
                        + Add New Product
                    </button>
                </div>

                {/* Filters Row */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <input 
                            type="text" 
                            className="form-control rounded-pill px-4" 
                            placeholder="Search by title or SKU..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="col-12 col-md-6">
                        <select 
                            className="form-select rounded-pill px-4"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Table/Grid */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="premium-card p-5 text-center text-muted">
                        No products found for this query in your operational region.
                    </div>
                ) : (
                    <div className="premium-card p-4">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-uppercase small text-muted">
                                    <tr>
                                        <th className="px-3 py-3 border-0 rounded-start">Product</th>
                                        <th className="px-3 py-3 border-0">SKU</th>
                                        <th className="px-3 py-3 border-0">Category</th>
                                        <th className="px-3 py-3 border-0">Price</th>
                                        <th className="px-3 py-3 border-0">Stock Level</th>
                                        <th className="px-3 py-3 border-0">Region</th>
                                        <th className="px-3 py-3 border-0 text-end rounded-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.id}>
                                            <td className="px-3 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-3 me-3 bg-white border d-flex justify-content-center align-items-center" style={{ width: '48px', height: '48px', overflow: 'hidden' }}>
                                                        <img 
                                                            src={product.imageUrl || 'https://via.placeholder.com/48'} 
                                                            alt={product.title} 
                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{product.title}</div>
                                                        <span className="small text-muted">{product.isEcoFriendly ? '🌿 Eco-Friendly' : 'Standard'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 fw-mono text-muted">{product.sku || 'N/A'}</td>
                                            <td className="px-3 py-3 text-muted">{categories.find(c => c.id === product.categoryId)?.name || 'General'}</td>
                                            <td className="px-3 py-3 fw-bold text-dark">${product.price.toFixed(2)}</td>
                                            <td className="px-3 py-3">
                                                <span className={`badge rounded-pill px-3 py-2 ${product.stockQuantity < 10 ? 'bg-danger text-white' : 'bg-success bg-opacity-25 text-success'}`}>
                                                    {product.stockQuantity} in stock
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-muted small">{product.regionId || 'Global'}</td>
                                            <td className="px-3 py-3 text-end">
                                                <button 
                                                    onClick={() => startEdit(product)} 
                                                    className="btn btn-sm btn-outline-dark rounded-pill px-3 me-2"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product.id)} 
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Edit Product Modal */}
            {editingProduct && (
                <div 
                    style={{ 
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}
                >
                    <div className="glass-panel p-5 rounded-5 overflow-auto shadow-lg border" style={{ width: '90%', maxWidth: '650px', maxHeight: '90vh', backgroundColor: 'var(--surface-color)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold text-dark mb-0">Edit Product Catalog Details</h4>
                            <button className="btn-close" onClick={() => setEditingProduct(null)}></button>
                        </div>

                        <form onSubmit={handleUpdateProduct}>
                            <div className="row g-3 mb-4">
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Product Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        className="form-control rounded-3" 
                                        value={editForm.title} 
                                        onChange={handleEditChange} 
                                        required 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">SKU</label>
                                    <input 
                                        type="text" 
                                        name="sku" 
                                        className="form-control rounded-3" 
                                        value={editForm.sku} 
                                        onChange={handleEditChange} 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Operational Region</label>
                                    <select 
                                        name="regionId" 
                                        className="form-select rounded-3" 
                                        value={editForm.regionId} 
                                        onChange={handleEditChange}
                                    >
                                        <option value="">Global (All Regions)</option>
                                        <option value="Region-North">Region-North (North Hub)</option>
                                        <option value="Region-South">Region-South (South Hub)</option>
                                        <option value="Region-East">Region-East (East Hub)</option>
                                        <option value="Region-West">Region-West (West Hub)</option>
                                        <option value="Region-Central">Region-Central (Central Hub)</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Price ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        name="price" 
                                        className="form-control rounded-3" 
                                        value={editForm.price} 
                                        onChange={handleEditChange} 
                                        required 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Stock Level (Inventory)</label>
                                    <input 
                                        type="number" 
                                        name="stockQuantity" 
                                        className="form-control rounded-3" 
                                        value={editForm.stockQuantity} 
                                        onChange={handleEditChange} 
                                        required 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        className="form-control rounded-3" 
                                        rows="3" 
                                        value={editForm.description} 
                                        onChange={handleEditChange} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Features (comma separated)</label>
                                    <input 
                                        type="text" 
                                        name="features" 
                                        className="form-control rounded-3" 
                                        value={editForm.features} 
                                        onChange={handleEditChange} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Specifications</label>
                                    <input 
                                        type="text" 
                                        name="specifications" 
                                        className="form-control rounded-3" 
                                        value={editForm.specifications} 
                                        onChange={handleEditChange} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Perfect For</label>
                                    <input 
                                        type="text" 
                                        name="perfectFor" 
                                        className="form-control rounded-3" 
                                        value={editForm.perfectFor} 
                                        onChange={handleEditChange} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Image URL</label>
                                    <input 
                                        type="text" 
                                        name="imageUrl" 
                                        className="form-control rounded-3" 
                                        value={editForm.imageUrl} 
                                        onChange={handleEditChange} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Category</label>
                                    <select 
                                        name="categoryId" 
                                        className="form-select rounded-3" 
                                        value={editForm.categoryId} 
                                        onChange={handleEditChange} 
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <div className="form-check form-switch mt-2">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            name="isEcoFriendly" 
                                            id="editEcoSwitch" 
                                            checked={editForm.isEcoFriendly} 
                                            onChange={handleEditChange} 
                                        />
                                        <label className="form-check-label fw-bold small text-muted text-uppercase" htmlFor="editEcoSwitch">Eco-Friendly Product 🌿</label>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-3 justify-content-end">
                                <button 
                                    type="button" 
                                    className="btn btn-light rounded-pill px-4 py-2" 
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary rounded-pill px-4 py-2 text-white shadow-sm"
                                >
                                    Save Catalog Updates
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ManageProducts;
