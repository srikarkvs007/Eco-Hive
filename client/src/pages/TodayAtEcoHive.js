import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const WORKSHOPS = [
    {
        id: 'upcycle-art',
        title: '🎨 Upcycled Plastic Art Masterclass',
        category: 'Crafts',
        desc: 'Bring raw plastic scrap and learn how to run upcycling shredders and 3D printing injectors to mold household items.',
        host: 'Jane Goodall',
        time: 'Saturday, 10:00 AM - 12:00 PM',
        seats: 8,
        image: '/images/workshop_upcycle.png'
    },
    {
        id: 'solar-grid',
        title: '☀️ Solar Grid & Smart Home Energy Clinic',
        category: 'Technology',
        desc: 'Understand smart power grids, battery wall integration, net-metering schemes, and solar estimation parameters.',
        host: 'Alex Honnold',
        time: 'Saturday, 02:00 PM - 03:30 PM',
        seats: 15,
        image: '/images/workshop_solar.png'
    },
    {
        id: 'zero-waste',
        title: '🍎 Zero-Waste Organic Kitchen Class',
        category: 'Food',
        desc: 'Learn zero-waste cooking techniques, indoor worm composting systems, and how to recycle organic waste streams.',
        host: 'Alice Waters',
        time: 'Sunday, 11:00 AM - 12:30 PM',
        seats: 12,
        image: '/images/workshop_kitchen.png'
    },
    {
        id: 'tailoring',
        title: '🧵 Sustainable Stitch & Repair Workshop',
        category: 'Crafts',
        desc: 'Darn worn fabrics, learn zero-waste stitching, replace zippers, and print patterns with waterless organic dye blocks.',
        host: 'Stella McCartney',
        time: 'Sunday, 03:00 PM - 05:00 PM',
        seats: 6,
        image: '/images/workshop_stitching.png'
    }
];

const TodayAtEcoHive = () => {
    const [selectedCat, setSelectedCat] = useState('All');
    const [bookingSession, setBookingSession] = useState(null);
    const [seatsState, setSeatsState] = useState(
        WORKSHOPS.reduce((acc, w) => ({ ...acc, [w.id]: w.seats }), {})
    );
    const [bookingForm, setBookingForm] = useState({
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || ''
    });

    const filteredWorkshops = WORKSHOPS.filter(w => {
        return selectedCat === 'All' || w.category === selectedCat;
    });

    const handleBookingClick = (e, workshop) => {
        e.stopPropagation();
        if (seatsState[workshop.id] <= 0) {
            toast.error("Sorry, this session is fully booked!");
            return;
        }
        setBookingSession(workshop);
    };

    const handleConfirmBooking = (e) => {
        e.preventDefault();
        
        // Decrement seats state
        setSeatsState({
            ...seatsState,
            [bookingSession.id]: seatsState[bookingSession.id] - 1
        });

        const newWorkshopReg = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            title: bookingSession.title,
            time: bookingSession.time,
            host: bookingSession.host,
            registeredAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('workshop_registrations') || '[]');
        localStorage.setItem('workshop_registrations', JSON.stringify([newWorkshopReg, ...existing]));
        
        toast.success(`Registered for ${bookingSession.title}! Check your email for ticket confirmation.`);
        setBookingSession(null);
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Today at Eco-Hive | Hands-on Sustainability Classes" 
                description="Join workshops and masterclasses on solar setups, upcycling plastics, and zero-waste stitching at our eco-hubs." 
            />
            <Navbar />

            <div className="container flex-grow-1" style={{ maxWidth: '1000px', paddingTop: '150px', paddingBottom: 'var(--spacing-premium)' }}>
                
                {/* Header */}
                <div className="text-center mb-5">
                    <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 mb-3 fw-bold border border-success border-opacity-25"
                    >
                        📚 Learning & Community events
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.025em' }}
                    >
                        Today at Eco-Hive
                    </motion.h1>
                    <p className="text-muted fs-5">Interactive, hands-on workshops hosted daily at our community Store Hubs.</p>
                    
                    {/* Category tabs */}
                    <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
                        {['All', 'Technology', 'Crafts', 'Food'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCat(cat)}
                                className={`btn rounded-pill px-4 py-2 btn-sm fw-medium transition-all ${selectedCat === cat ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                style={{ fontSize: '13px' }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Workshops list */}
                <div className="row g-4 mb-5">
                    {filteredWorkshops.map((w, index) => {
                        const seatsLeft = seatsState[w.id];
                        return (
                            <div className="col-12 col-md-6" key={w.id}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="card border-0 rounded-5 overflow-hidden shadow-sm h-100 d-flex flex-column"
                                    style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                                >
                                    <div style={{ height: '200px', overflow: 'hidden' }}>
                                        <img src={w.image} alt={w.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="p-4 p-md-5 d-flex flex-column flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <span className="badge bg-primary text-white rounded-pill px-3 py-1" style={{ fontSize: '10px' }}>{w.category}</span>
                                            <span className={`fw-bold small ${seatsLeft > 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '12px' }}>
                                                {seatsLeft > 0 ? `🟢 ${seatsLeft} Seats Left` : '🔴 Fully Booked'}
                                            </span>
                                        </div>
                                        <h5 className="fw-bolder text-dark mb-3" style={{ fontSize: '19px', lineHeight: '1.4' }}>{w.title}</h5>
                                        <p className="text-muted small mb-4" style={{ fontSize: '13px', lineHeight: '1.5' }}>{w.desc}</p>
                                        
                                        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                            <div className="small text-muted">
                                                👨‍🏫 <strong>{w.host}</strong><br/>
                                                🕒 {w.time.split(',')[0]}
                                            </div>
                                            <button 
                                                onClick={(e) => handleBookingClick(e, w)}
                                                className={`btn rounded-pill px-4 py-2 btn-sm fw-medium shadow-sm transition-all ${seatsLeft > 0 ? 'btn-dark' : 'btn-light disabled text-muted'}`}
                                                style={{ fontSize: '12px' }}
                                                disabled={seatsLeft <= 0}
                                            >
                                                Book Session
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* Booking Overlay Modal */}
                {bookingSession && (
                    <div 
                        style={{ 
                            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', 
                            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white shadow-lg overflow-hidden" 
                            style={{ width: '90%', maxWidth: '420px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.08)' }}
                        >
                            <div className="p-4 border-bottom text-center bg-light">
                                <h5 className="fw-bold text-dark mb-0">Workshop Booking</h5>
                            </div>
                            <form onSubmit={handleConfirmBooking} className="p-4 d-flex flex-column gap-3">
                                <div className="p-3 rounded-3 bg-light mb-2">
                                    <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>{bookingSession.title}</h6>
                                    <small className="text-muted d-block mb-1">🕒 {bookingSession.time}</small>
                                    <small className="text-muted d-block">👨‍🏫 Instructor: {bookingSession.host}</small>
                                </div>
                                <div>
                                    <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Your Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-pill px-3"
                                        value={bookingForm.name}
                                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                                        required
                                        style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control rounded-pill px-3"
                                        value={bookingForm.email}
                                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                        required
                                        style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                    />
                                </div>
                                <div className="d-flex gap-2 pt-2">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-medium flex-grow-1" style={{ border: '1px solid rgba(0,0,0,0.1)', fontSize: '14px' }} onClick={() => setBookingSession(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-medium flex-grow-1" style={{ fontSize: '14px' }}>Confirm Spot</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
};

export default TodayAtEcoHive;
