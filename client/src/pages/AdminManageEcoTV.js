import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const AdminManageEcoTV = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Show',
        category: 'Nature',
        description: '',
        duration: '',
        rating: 'G',
        imageUrl: '',
        videoUrl: '',
        isFeatured: false,
        releaseYear: new Date().getFullYear()
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/entertainment/eco-one');
            setVideos(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching Eco-TV videos:", err);
            toast.error("Failed to load videos.");
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/entertainment/eco-one', formData);
            setVideos(prev => [res.data, ...prev]);
            toast.success("Eco-TV video content added successfully!");
            setFormData({
                title: '',
                type: 'Show',
                category: 'Nature',
                description: '',
                duration: '',
                rating: 'G',
                imageUrl: '',
                videoUrl: '',
                isFeatured: false,
                releaseYear: new Date().getFullYear()
            });
        } catch (err) {
            console.error("Error adding video:", err);
            toast.error("Failed to add video content.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Eco-TV video?")) {
            try {
                await axios.delete(`http://localhost:5001/api/entertainment/eco-one/${id}`);
                setVideos(prev => prev.filter(v => v.id !== id));
                toast.success("Video content removed.");
            } catch (err) {
                console.error("Error deleting video:", err);
                toast.error("Failed to delete video.");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bolder mb-1">Eco-TV Video Manager</h2>
                        <p className="text-muted small mb-0">Publish, manage, and feature environment documentaries and shows.</p>
                    </div>
                    <span className="badge bg-primary fs-6">{videos.length} Videos</span>
                </div>

                <div className="row g-4">
                    {/* Add Content Form */}
                    <div className="col-12 col-lg-4">
                        <div className="premium-card p-4">
                            <h4 className="fw-bold mb-3">Publish New Video</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        className="form-control" 
                                        value={formData.title} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="e.g. Earth Rescue"
                                    />
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Type</label>
                                        <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                                            <option value="Show">Show</option>
                                            <option value="Documentary">Documentary</option>
                                            <option value="Movie">Movie</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Category</label>
                                        <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                                            <option value="Nature">Nature</option>
                                            <option value="Technology">Technology</option>
                                            <option value="Climate">Climate</option>
                                            <option value="Recycling">Recycling</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        className="form-control" 
                                        rows="3" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        required
                                        placeholder="Short summary of the video content..."
                                    ></textarea>
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Duration</label>
                                        <input 
                                            type="text" 
                                            name="duration" 
                                            className="form-control" 
                                            value={formData.duration} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="e.g., 45 min, 1h 20m"
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Rating</label>
                                        <select name="rating" className="form-select" value={formData.rating} onChange={handleChange}>
                                            <option value="G">G</option>
                                            <option value="PG">PG</option>
                                            <option value="PG-13">PG-13</option>
                                            <option value="R">R</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Release Year</label>
                                    <input 
                                        type="number" 
                                        name="releaseYear" 
                                        className="form-control" 
                                        value={formData.releaseYear} 
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Thumbnail Image URL</label>
                                    <input 
                                        type="text" 
                                        name="imageUrl" 
                                        className="form-control" 
                                        value={formData.imageUrl} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="https://example.com/thumbnail.jpg"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Video Source URL (YouTube/Embed)</label>
                                    <input 
                                        type="text" 
                                        name="videoUrl" 
                                        className="form-control" 
                                        value={formData.videoUrl} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="e.g. https://www.youtube.com/watch?v=ymaQoEDn3uc"
                                    />
                                </div>
                                <div className="mb-4 form-check form-switch">
                                    <input 
                                        type="checkbox" 
                                        name="isFeatured" 
                                        className="form-check-input" 
                                        id="isFeatured" 
                                        checked={formData.isFeatured} 
                                        onChange={handleChange} 
                                    />
                                    <label className="form-check-label text-warning fw-semibold ms-2" htmlFor="isFeatured">
                                        ⭐ Feature on TV Homepage
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold">
                                    🚀 Publish to Eco-TV
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Content Directory Table */}
                    <div className="col-12 col-lg-8">
                        <div className="premium-card p-4">
                            <h4 className="fw-bold mb-3">Video Catalog</h4>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : videos.length === 0 ? (
                                <p className="text-muted text-center py-5">No videos available in the database.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="text-muted small">
                                            <tr>
                                                <th>Content</th>
                                                <th>Type</th>
                                                <th>Category</th>
                                                <th>Year</th>
                                                <th>Featured</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {videos.map(video => (
                                                <tr key={video.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <img 
                                                                src={video.imageUrl} 
                                                                alt={video.title} 
                                                                className="rounded border shadow-sm"
                                                                style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                                                                onError={(e) => { e.target.src = '/images/logo-circle.png' }}
                                                            />
                                                            <div>
                                                                <span className="fw-bold d-block text-truncate" style={{ maxWidth: '200px' }}>{video.title}</span>
                                                                <span className="small text-muted">{video.duration} • {video.rating}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${video.type === 'Documentary' ? 'bg-info text-dark' : video.type === 'Movie' ? 'bg-primary' : 'bg-secondary'}`}>
                                                            {video.type}
                                                        </span>
                                                    </td>
                                                    <td>{video.category}</td>
                                                    <td>{video.releaseYear}</td>
                                                    <td>{video.isFeatured ? <span className="text-warning">★ Yes</span> : 'No'}</td>
                                                    <td className="text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
                                                            onClick={() => handleDelete(video.id)}
                                                        >
                                                            🗑️ Delete
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
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminManageEcoTV;
