import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import toast from 'react-hot-toast';

const AdminManageGiftCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        amount: 25,
        recipientName: 'Valued Customer',
        recipientEmail: 'customer@example.com',
        senderName: 'Eco-Hive Admin',
        senderEmail: 'admin@ecohive.in',
        message: 'Complimentary Promo / Refund Gift Card from Administration.',
        design: 'Premium Gold'
    });

    useEffect(() => {
        fetchGiftCards();
    }, []);

    const fetchGiftCards = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/gift-cards/all');
            setCards(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching gift cards:", err);
            toast.error("Failed to load gift cards.");
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
            const res = await axios.post('http://localhost:5001/api/gift-cards/purchase', formData);
            setCards(prev => [res.data.giftCard, ...prev]);
            toast.success(`Promo Gift Card Issued! Code: ${res.data.giftCard.code}`);
            setFormData({
                amount: 25,
                recipientName: 'Valued Customer',
                recipientEmail: 'customer@example.com',
                senderName: 'Eco-Hive Admin',
                senderEmail: 'admin@ecohive.in',
                message: 'Complimentary Promo / Refund Gift Card from Administration.',
                design: 'Premium Gold'
            });
        } catch (err) {
            console.error("Error issuing gift card:", err);
            toast.error("Failed to issue promotional gift card.");
        }
    };

    const filteredCards = cards.filter(card => 
        card.code.toLowerCase().includes(search.toLowerCase()) ||
        card.recipientEmail.toLowerCase().includes(search.toLowerCase()) ||
        card.senderEmail.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bolder mb-1">Gift Card Administrator</h2>
                        <p className="text-muted small mb-0">Track wallet cards, verify redeems, and issue direct promotional credits.</p>
                    </div>
                    <span className="badge bg-primary fs-6">{cards.length} Gift Cards Issued</span>
                </div>

                <div className="row g-4">
                    {/* Issue Promo Card Form */}
                    <div className="col-12 col-lg-4">
                        <div className="premium-card p-4">
                            <h4 className="fw-bold mb-3">Issue Promo Gift Card</h4>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Gift Card Value ($)</label>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        className="form-control" 
                                        value={formData.amount} 
                                        onChange={handleChange} 
                                        required 
                                        min="1"
                                        placeholder="e.g. 50"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Recipient Name</label>
                                    <input 
                                        type="text" 
                                        name="recipientName" 
                                        className="form-control" 
                                        value={formData.recipientName} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Recipient Email</label>
                                    <input 
                                        type="email" 
                                        name="recipientEmail" 
                                        className="form-control" 
                                        value={formData.recipientEmail} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Design Preference</label>
                                    <select name="design" className="form-select" value={formData.design} onChange={handleChange}>
                                        <option value="Premium Gold">Premium Gold</option>
                                        <option value="Classic Emerald">Classic Emerald</option>
                                        <option value="Ocean Blue">Ocean Blue</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-1">Message</label>
                                    <textarea 
                                        name="message" 
                                        className="form-control" 
                                        rows="2" 
                                        value={formData.message} 
                                        onChange={handleChange} 
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold">
                                    🎫 Generate & Issue Code
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Directory of Gift Cards */}
                    <div className="col-12 col-lg-8">
                        <div className="premium-card p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="fw-bold mb-0">Gift Card Registry</h4>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm w-50 rounded-pill px-3" 
                                    placeholder="🔍 Search by code or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                </div>
                            ) : filteredCards.length === 0 ? (
                                <p className="text-muted text-center py-5">No matching gift cards found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="text-muted small">
                                            <tr>
                                                <th>Card Code</th>
                                                <th>Original / Balance</th>
                                                <th>Recipient</th>
                                                <th>Status</th>
                                                <th>Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCards.map(card => (
                                                <tr key={card.id}>
                                                    <td>
                                                        <span className="font-monospace fw-bold text-primary">{card.code}</span>
                                                        <span className="small text-muted d-block">{card.design}</span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium">${card.amount.toFixed(2)}</span>
                                                        <span className="small text-muted d-block">Bal: ${card.balance.toFixed(2)}</span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold d-block text-truncate" style={{ maxWidth: '160px' }}>{card.recipientName}</span>
                                                        <span className="small text-muted d-block text-truncate" style={{ maxWidth: '160px' }}>{card.recipientEmail}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${card.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                                            {card.status}
                                                        </span>
                                                        {card.status === 'Redeemed' && card.redeemedBy && (
                                                            <span className="small text-muted d-block mt-1 text-truncate" style={{ maxWidth: '140px' }}>
                                                                by: {card.redeemedBy.name}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{new Date(card.createdAt).toLocaleDateString()}</td>
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

export default AdminManageGiftCards;
