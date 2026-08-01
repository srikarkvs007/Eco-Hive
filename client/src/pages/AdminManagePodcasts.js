import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const AdminManagePodcasts = () => {
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        podcastName: 'Eco-Hive Talks',
        description: '',
        duration: '',
        audioUrl: '',
        imageUrl: '',
        host: ''
    });

    useEffect(() => {
        fetchEpisodes();
    }, []);

    const fetchEpisodes = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/entertainment/podcasts');
            setEpisodes(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching podcasts:", err);
            toast.error("Failed to load podcast episodes.");
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/entertainment/podcasts', formData);
            setEpisodes(prev => [res.data, ...prev]);
            toast.success("Podcast episode published successfully!");
            setFormData({
                title: '',
                podcastName: 'Eco-Hive Talks',
                description: '',
                duration: '',
                audioUrl: '',
                imageUrl: '',
                host: ''
            });
        } catch (err) {
            console.error("Error adding podcast episode:", err);
            toast.error("Failed to publish podcast episode.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this podcast episode?")) {
            try {
                await axios.delete(`http://localhost:5001/api/entertainment/podcasts/${id}`);
                setEpisodes(prev => prev.filter(ep => ep.id !== id));
                toast.success("Podcast episode deleted.");
            } catch (err) {
                console.error("Error deleting podcast episode:", err);
                toast.error("Failed to delete episode.");
            }
        }
    };

    return (
        <AdminLayout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bolder mb-1">Eco-Podcast Manager</h2>
                        <p className="text-muted small mb-0">Publish audio episodes, adjust show info, and edit episode directories.</p>
                    </div>
                    <span className="badge bg-primary fs-6">{episodes.length} Episodes</span>
                </div>

                <div className="row g-4">
                    {/* Add Episode Form */}
                    <div className="col-12 col-lg-4">
                        <div className="premium-card p-4">
                            <h4 className="fw-bold mb-3">Publish Podcast Episode</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Episode Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        className="form-control" 
                                        value={formData.title} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="e.g. Sustainable Packaging"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Podcast Show Name</label>
                                    <input 
                                        type="text" 
                                        name="podcastName" 
                                        className="form-control" 
                                        value={formData.podcastName} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Episode Host(s)</label>
                                    <input 
                                        type="text" 
                                        name="host" 
                                        className="form-control" 
                                        value={formData.host} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="e.g. Dr. Green & Sarah Smith"
                                    />
                                </div>
                                <div className="row g-2 mb-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase mb-1">Duration</label>
                                        <input 
                                            type="text" 
                                            name="duration" 
                                            className="form-control" 
                                            value={formData.duration} 
                                            onChange={handleChange} 
                                            required 
                                            placeholder="e.g., 28 min, 45 min"
                                        />
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
                                        placeholder="Detailed show notes and episode summary..."
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Cover Art URL</label>
                                    <input 
                                        type="text" 
                                        name="imageUrl" 
                                        className="form-control" 
                                        value={formData.imageUrl} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="https://example.com/cover.jpg"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Audio Source URL (MP3/Stream)</label>
                                    <input 
                                        type="text" 
                                        name="audioUrl" 
                                        className="form-control" 
                                        value={formData.audioUrl} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="https://example.com/episode.mp3"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold">
                                    🎙️ Publish Episode
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Podcast List Table */}
                    <div className="col-12 col-lg-8">
                        <div className="premium-card p-4">
                            <h4 className="fw-bold mb-3">Episode Directory</h4>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : episodes.length === 0 ? (
                                <p className="text-muted text-center py-5">No podcast episodes found in the database.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="text-muted small">
                                            <tr>
                                                <th>Episode Details</th>
                                                <th>Podcast Show</th>
                                                <th>Duration</th>
                                                <th>Host</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {episodes.map(ep => (
                                                <tr key={ep.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <img 
                                                                src={ep.imageUrl} 
                                                                alt={ep.title} 
                                                                className="rounded border shadow-sm"
                                                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                                                onError={(e) => { e.target.src = process.env.PUBLIC_URL + '/images/logo-circle.png' }}
                                                            />
                                                            <div>
                                                                <span className="fw-bold d-block text-truncate" style={{ maxWidth: '240px' }}>{ep.title}</span>
                                                                <span className="small text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>{ep.description}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium">{ep.podcastName}</span>
                                                    </td>
                                                    <td>{ep.duration}</td>
                                                    <td>{ep.host}</td>
                                                    <td className="text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1"
                                                            onClick={() => handleDelete(ep.id)}
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

export default AdminManagePodcasts;
