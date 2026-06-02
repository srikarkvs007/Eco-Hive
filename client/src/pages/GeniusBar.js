import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SERVICES = [
    {
        id: 'energy',
        title: '☀️ Green Home Energy Audit',
        desc: 'Review transitioning your house to solar grids, smart energy walls, heat pumps, and zero-carbon battery setups.',
        duration: '45 mins'
    },
    {
        id: 'upcycle',
        title: '🌱 Circular Upcycling Consult',
        desc: 'Learn how to repair, donate, or responsibly trade in household waste and old electronics for maximum Eco-Points.',
        duration: '30 mins'
    },
    {
        id: 'materials',
        title: '👚 Sustainable Fabric & Design',
        desc: 'Meet with textile experts to verify materials, circular certifications, and source zero-waste organic apparel.',
        duration: '30 mins'
    },
    {
        id: 'tech',
        title: '🔌 Smart Eco-Tech Installation',
        desc: 'Get setup guidance for smart irrigation systems, EV charging nodes, or home composting device operations.',
        duration: '60 mins'
    }
];

const ADVISORS = [
    { name: 'Dr. Jane Goodall', role: 'Chief Materials Advisor', emoji: '👩‍🔬' },
    { name: 'Alex Honnold', role: 'Renewables Grid Engineer', emoji: '👨‍🔧' },
    { name: 'Sylvia Earle', role: 'Circular Economy Analyst', emoji: '👩‍💼' }
];

const GeniusBar = () => {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Slots generator
    const timeSlots = ['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:00 PM'];

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        if (!selectedService || !selectedDate || !selectedTime || !selectedAdvisor) {
            toast.error("Please fill in all booking fields.");
            return;
        }

        const newBooking = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            service: selectedService.title,
            date: selectedDate,
            time: selectedTime,
            advisor: selectedAdvisor.name,
            bookedAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('genius_bookings') || '[]');
        localStorage.setItem('genius_bookings', JSON.stringify([newBooking, ...existing]));

        setBookingSuccess(true);
        toast.success("Eco-Consultation Booked Successfully!");
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Genius Bar & Eco Consultations | Eco-Hive Help" 
                description="Book a session at our Genius Bar to plan solar setups, green home energy upgrades, or trade-in trade audits." 
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
                        🍃 Genius Bar | Sustainability Consultation
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.025em' }}
                    >
                        Meet an Eco-Advisor
                    </motion.h1>
                    <p className="text-muted fs-5">Plan energy audits, trade-in certifications, or zero-waste setups with our experts.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!bookingSuccess ? (
                        <motion.div 
                            key="booking-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="row g-5"
                        >
                            {/* Left Side: Services List */}
                            <div className="col-12 col-md-6">
                                <h4 className="fw-bolder text-dark mb-4">1. Choose a Service</h4>
                                <div className="d-flex flex-column gap-3">
                                    {SERVICES.map(service => {
                                        const isSelected = selectedService?.id === service.id;
                                        return (
                                            <div
                                                key={service.id}
                                                onClick={() => setSelectedService(service)}
                                                className="premium-card p-4 rounded-5 cursor-pointer transition-all"
                                                style={{
                                                    border: isSelected ? '2px solid var(--accent-blue)' : 'var(--glass-border)',
                                                    backgroundColor: isSelected ? 'var(--surface-elevated)' : 'var(--bg-elevated)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className="fw-bolder text-dark mb-0" style={{ fontSize: '16px' }}>{service.title}</h6>
                                                    <span className="badge bg-light text-muted rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>{service.duration}</span>
                                                </div>
                                                <p className="text-muted small mb-0" style={{ fontSize: '13px', lineHeight: '1.5' }}>{service.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Side: Date, Time & Advisor selection */}
                            <div className="col-12 col-md-6">
                                <h4 className="fw-bolder text-dark mb-4">2. Schedule Details</h4>
                                <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    <form onSubmit={handleBookingSubmit} className="d-flex flex-column gap-4">
                                        
                                        {/* Date input */}
                                        <div>
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Select Date</label>
                                            <input 
                                                type="date"
                                                className="form-control rounded-pill px-3"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                                style={{ height: '44px', fontSize: '14px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>

                                        {/* Time Slots grid */}
                                        <div>
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Select Time</label>
                                            <div className="row row-cols-3 g-2">
                                                {timeSlots.map(slot => (
                                                    <div className="col" key={slot}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTime(slot)}
                                                            className={`btn rounded-pill w-100 py-2 btn-sm fw-medium transition-all ${selectedTime === slot ? 'btn-primary' : 'btn-light text-muted'}`}
                                                            style={{ fontSize: '12px' }}
                                                        >
                                                            {slot}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Advisor picker */}
                                        <div>
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Select Advisor</label>
                                            <div className="d-flex flex-column gap-2">
                                                {ADVISORS.map(adv => {
                                                    const isSelected = selectedAdvisor?.name === adv.name;
                                                    return (
                                                        <div
                                                            key={adv.name}
                                                            onClick={() => setSelectedAdvisor(adv)}
                                                            className="p-3 rounded-4 cursor-pointer d-flex align-items-center gap-3 transition-all"
                                                            style={{
                                                                border: isSelected ? '1px solid var(--accent-blue)' : '1px solid rgba(0,0,0,0.06)',
                                                                backgroundColor: isSelected ? 'var(--surface-color)' : 'transparent',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '24px' }}>{adv.emoji}</span>
                                                            <div>
                                                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>{adv.name}</h6>
                                                                <small className="text-muted" style={{ fontSize: '11px' }}>{adv.role}</small>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary rounded-pill px-4 py-3 mt-2 fw-medium hover-scale"
                                        >
                                            Book Appointment Slot
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Booking Confirmation Screen */
                        <motion.div 
                            key="booking-success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card border-0 rounded-5 p-5 text-center shadow-lg max-w-600 mx-auto"
                            style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)', maxWidth: '600px' }}
                        >
                            <span style={{ fontSize: '72px' }}>📅</span>
                            <h3 className="fw-bolder text-success mt-4">Appointment Confirmed!</h3>
                            <p className="text-muted px-4 mb-5">Your sustainable consultation session is registered. We have sent a confirmation email with calendar invites.</p>
                            
                            {/* Summary Card */}
                            <div className="p-4 rounded-4 bg-light bg-opacity-50 text-start mb-5 d-flex flex-column gap-3">
                                <div>
                                    <span className="small text-muted text-uppercase fw-bold">Selected Service</span>
                                    <h6 className="fw-bolder text-dark mb-0 mt-1">{selectedService?.title}</h6>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <span className="small text-muted text-uppercase fw-bold">Date & Time</span>
                                        <h6 className="fw-bolder text-dark mb-0 mt-1">{selectedDate} at {selectedTime}</h6>
                                    </div>
                                    <div className="col-6">
                                        <span className="small text-muted text-uppercase fw-bold">Eco-Advisor</span>
                                        <h6 className="fw-bolder text-dark mb-0 mt-1">{selectedAdvisor?.name}</h6>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 justify-content-center">
                                <button className="btn btn-dark rounded-pill px-4 py-2" onClick={() => setBookingSuccess(false)}>
                                    Book Another Slot
                                </button>
                                <button className="btn btn-outline-secondary rounded-pill px-4 py-2" onClick={() => navigate('/home')}>
                                    Return to Store
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <Footer />
        </div>
    );
};

export default GeniusBar;
