import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FAQ_ITEMS = [
    {
        category: 'delivery',
        question: 'How do drone deliveries work?',
        answer: 'For orders with less than 4 items (weight under 5kg), our smart routing algorithm assigns an autonomous electric drone flight. Deliveries are dispatched from regional hubs and land in designated coordinates (safe open areas). You can track the flight live on our Order Status page.'
    },
    {
        category: 'delivery',
        question: 'What happens in bad weather conditions?',
        answer: 'In the event of heavy rain, high winds, or airspace restrictions, our drone fleet is temporarily grounded. In such cases, orders are automatically routed to our backup fleet of Eco-Electric Vans to ensure carbon-neutral, safe delivery.'
    },
    {
        category: 'returns',
        question: 'What is your return and carbon-impact policy?',
        answer: 'We offer a 14-day defect/damage return window. In line with our sustainability mission to minimize carbon footprint from transport logistics, we encourage thoughtful shopping. If you must return an item, you can drop it off at one of our 5 Store Hubs to eliminate shipping carbon.'
    },
    {
        category: 'payments',
        question: 'What payment options do you support?',
        answer: 'We accept major Credit & Debit cards, EMI credit programs from leading card issuers, and secure BHIM UPI QR scanning (PhonePe, Google Pay, Paytm) via our encrypted secure payment gateway.'
    },
    {
        category: 'points',
        question: 'How do I earn and redeem Eco-Points?',
        answer: 'You earn 1 Eco-Point for every $10 spent on sustainable products. Additionally, you earn points by trading in old electronics or plastic waste at our hubs via our Recycling Programme. Points can be used at checkout for discounts on future orders.'
    },
    {
        category: 'points',
        question: 'What certifications do Eco-Friendly products carry?',
        answer: 'All items marked with the "Eco-Certified" leaf logo are guaranteed to be plastic-free, made from recycled or highly renewable raw materials, and sourced from suppliers verified for zero-waste production streams.'
    }
];

const SupportCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    
    // Ticket Form State
    const [ticketForm, setTicketForm] = useState({
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
        category: 'Delivery',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredFAQs = FAQ_ITEMS.filter(faq => {
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!ticketForm.message.trim()) {
            toast.error("Please describe your issue or question.");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Help request submitted! Our eco-agents will contact you in 2-4 hours.");
            setTicketForm({
                ...ticketForm,
                message: ''
            });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Help and Support Center | Eco-Hive Customer Care" 
                description="Get answers to orders, drone deliveries, UPI payments, and recycling program initiatives." 
            />
            <Navbar />

            <div className="container flex-grow-1" style={{ maxWidth: '1000px', paddingTop: '150px', paddingBottom: 'var(--spacing-premium)' }}>
                
                {/* Support Hub Header & Search */}
                <div className="text-center mb-5">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.02em' }}
                    >
                        Eco-Hive Support Center
                    </motion.h1>
                    <p className="text-muted fs-5 mb-4">Search our knowledge base or open a ticket with our zero-waste customer team.</p>
                    
                    <div className="mx-auto" style={{ maxWidth: '600px' }}>
                        <input 
                            type="text" 
                            className="form-control rounded-pill px-4 py-3 border-0 shadow-sm"
                            placeholder="Type keywords (e.g. drone, return, eco-points)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ height: '52px', fontSize: '15px', backgroundColor: 'var(--bg-elevated)', boxShadow: 'var(--shadow-md)' }}
                        />
                    </div>
                </div>

                {/* Popular Topics Cards */}
                <div className="row g-4 mb-5">
                    {[
                        { id: 'All', title: '📁 All Topics', desc: 'Browse all customer support guides.' },
                        { id: 'delivery', title: '🚁 Smart Delivery', desc: 'Drone logistics and EV dispatch routing.' },
                        { id: 'returns', title: '🔄 Return & Refund', desc: 'Mindful return processes and hub drop-offs.' },
                        { id: 'points', title: '🌿 Eco-Points & Certs', desc: 'Earning guides and certification standards.' }
                    ].map(cat => (
                        <div className="col-6 col-md-3" key={cat.id}>
                            <div 
                                onClick={() => setActiveCategory(cat.id)}
                                className="premium-card p-4 rounded-5 text-center cursor-pointer h-100 transition-all"
                                style={{ 
                                    border: activeCategory === cat.id ? '2px solid var(--accent-blue)' : 'var(--glass-border)',
                                    backgroundColor: activeCategory === cat.id ? 'var(--surface-elevated)' : 'var(--bg-elevated)',
                                    cursor: 'pointer'
                                }}
                            >
                                <h6 className="fw-bolder text-dark mb-2">{cat.title}</h6>
                                <p className="text-muted small mb-0" style={{ fontSize: '11px', lineHeight: '1.4' }}>{cat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-5">
                    {/* Left: FAQs list */}
                    <div className="col-12 col-md-7">
                        <h4 className="fw-bolder text-dark mb-4">Frequently Asked Questions</h4>
                        <div className="d-flex flex-column gap-3">
                            <AnimatePresence mode="popLayout">
                                {filteredFAQs.map((faq, idx) => (
                                    <motion.div
                                        key={faq.question}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="card border-0 rounded-4 p-4 shadow-sm"
                                        style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                                    >
                                        <h6 className="fw-bolder text-dark mb-2" style={{ fontSize: '15px' }}>{faq.question}</h6>
                                        <p className="text-muted mb-0 small" style={{ fontSize: '13px', lineHeight: '1.6' }}>{faq.answer}</p>
                                    </motion.div>
                                ))}
                                {filteredFAQs.length === 0 && (
                                    <div className="text-center py-5 rounded-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <span style={{ fontSize: '40px' }}>❓</span>
                                        <h6 className="fw-bold mt-3">No matching FAQs found</h6>
                                        <p className="text-muted small">Try searching other keywords or submit a contact ticket below.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Support Ticket & Live Info */}
                    <div className="col-12 col-md-5">
                        <div className="d-flex flex-column gap-4">
                            
                            {/* Live Contact Info */}
                            <div className="card border-0 rounded-5 p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <h5 className="fw-bolder text-dark mb-3">Instant Channels</h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="d-flex align-items-center gap-2">
                                            <span style={{ fontSize: '20px' }}>💬</span>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Live Web Chat</h6>
                                                <small className="text-muted">Eco-agents active</small>
                                            </div>
                                        </div>
                                        <span className="badge bg-success rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '10px' }}>Online</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-light bg-opacity-50">
                                        <div className="d-flex align-items-center gap-2">
                                            <span style={{ fontSize: '20px' }}>📞</span>
                                            <div>
                                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Customer Hotline</h6>
                                                <small className="text-muted">Toll-free helpline</small>
                                            </div>
                                        </div>
                                        <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>000800 040 1966</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form Ticket */}
                            <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <h5 className="fw-bolder text-dark mb-4">Open Support Ticket</h5>
                                <form onSubmit={handleFormSubmit} className="d-flex flex-column gap-3">
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Your Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control rounded-pill px-3"
                                            value={ticketForm.name}
                                            onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                                            placeholder="Enter your name"
                                            required
                                            style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-control rounded-pill px-3"
                                            value={ticketForm.email}
                                            onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                                            placeholder="Enter your email"
                                            required
                                            style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Issue Category</label>
                                        <select 
                                            className="form-select rounded-pill px-3"
                                            value={ticketForm.category}
                                            onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                            style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="Delivery">Delivery & Logistics</option>
                                            <option value="Payments">Payments & Wallet</option>
                                            <option value="Returns">Returns & Refunds</option>
                                            <option value="Eco-Points">Eco-Points & Recycles</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Describe Your Issue</label>
                                        <textarea 
                                            className="form-control rounded-4 p-3"
                                            value={ticketForm.message}
                                            onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                                            rows="4"
                                            placeholder="Type details about order id, drone flight issues, refund status..."
                                            style={{ fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary rounded-pill px-4 py-2 mt-2 fw-medium hover-scale"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span> Submitting...
                                            </>
                                        ) : 'Send Request'}
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default SupportCenter;
