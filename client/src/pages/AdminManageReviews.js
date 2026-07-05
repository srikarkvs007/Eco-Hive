import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const AdminManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/products/reviews/all');
            setReviews(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            toast.error("Failed to load reviews.");
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this customer review? This cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:5001/api/products/reviews/${id}`);
                setReviews(prev => prev.filter(rev => rev.id !== id));
                toast.success("Review deleted and moderated successfully.");
            } catch (err) {
                console.error("Error deleting review:", err);
                toast.error("Failed to delete review.");
            }
        }
    };

    const filteredReviews = reviews.filter(rev => 
        (rev.comment && rev.comment.toLowerCase().includes(search.toLowerCase())) ||
        (rev.product && rev.product.title.toLowerCase().includes(search.toLowerCase())) ||
        (rev.user && rev.user.name.toLowerCase().includes(search.toLowerCase())) ||
        (rev.user && rev.user.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bolder mb-1">Feedback Moderation Panel</h2>
                        <p className="text-muted small mb-0">Monitor customer comments, evaluate rating metrics, and moderate inappropriate feedback.</p>
                    </div>
                    <span className="badge bg-primary fs-6">{reviews.length} Reviews</span>
                </div>

                <div className="premium-card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">All Product Reviews</h4>
                        <input 
                            type="text" 
                            className="form-control form-control-sm w-25 rounded-pill px-3" 
                            placeholder="🔍 Filter reviews..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <p className="text-muted text-center py-5">No customer reviews found.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="text-muted small">
                                    <tr>
                                        <th>Product</th>
                                        <th>Customer</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Date</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReviews.map(rev => (
                                        <tr key={rev.id}>
                                            <td>
                                                <span className="fw-bold d-block text-truncate" style={{ maxWidth: '180px' }}>
                                                    {rev.product?.title || 'Unknown Product'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="fw-medium d-block text-truncate" style={{ maxWidth: '150px' }}>
                                                    {rev.user?.name || 'Anonymous'}
                                                </span>
                                                <span className="small text-muted d-block text-truncate" style={{ maxWidth: '150px' }}>
                                                    {rev.user?.email || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-warning fw-bold">
                                                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                                                </span>
                                                <span className="small text-muted d-block">({rev.rating}/5)</span>
                                            </td>
                                            <td>
                                                <p className="mb-0 text-muted small" style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                                    {rev.comment}
                                                </p>
                                            </td>
                                            <td>
                                                <span className="small text-muted">
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button 
                                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
                                                    onClick={() => handleDelete(rev.id)}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminManageReviews;
