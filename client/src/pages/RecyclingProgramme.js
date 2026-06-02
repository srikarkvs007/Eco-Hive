import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORIES = [
    { id: 'laptop', name: '💻 Laptop / Computer', basePoints: 500, co2Offset: 220, label: 'Electronics' },
    { id: 'phone', name: '📱 Smartphone / Cellphone', basePoints: 200, co2Offset: 85, label: 'Electronics' },
    { id: 'tablet', name: '📟 Tablet / iPad', basePoints: 250, co2Offset: 110, label: 'Electronics' },
    { id: 'plastic', name: '🧴 Ocean Plastics (per kg)', basePoints: 50, co2Offset: 3.5, label: 'Materials' },
    { id: 'textile', name: '👕 Textile/Clothing Waste (per kg)', basePoints: 30, co2Offset: 4.2, label: 'Materials' }
];

const RecyclingProgramme = () => {
    const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
    const [itemCondition, setItemCondition] = useState('functional');
    const [quantity, setQuantity] = useState(1);
    
    // Estimator calculation
    const getCalculatedPoints = () => {
        let multiplier = 1;
        if (itemCondition === 'cosmetic') multiplier = 0.6;
        else if (itemCondition === 'broken') multiplier = 0.25;
        
        return Math.round(selectedCat.basePoints * multiplier * quantity);
    };

    const getCalculatedCO2 = () => {
        return (selectedCat.co2Offset * quantity).toFixed(1);
    };

    // Shipping label state
    const [labelDetails, setLabelDetails] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // History logs state
    const [previousLabels, setPreviousLabels] = useState(() => {
        return JSON.parse(localStorage.getItem('recycling_labels') || '[]');
    });

    const handleIntakeSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        setTimeout(() => {
            const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
            const newLabel = {
                id: randomId,
                category: selectedCat.name,
                points: getCalculatedPoints(),
                co2: getCalculatedCO2(),
                carrier: 'Eco-Express Autonomous Courier',
                barCode: `EH-REC-${randomId}-2026`,
                createdAt: new Date().toISOString()
            };
            const existing = JSON.parse(localStorage.getItem('recycling_labels') || '[]');
            const updated = [newLabel, ...existing];
            localStorage.setItem('recycling_labels', JSON.stringify(updated));
            setPreviousLabels(updated);

            setLabelDetails(newLabel);
            toast.success("Recycling intake request registered! Print your shipping label.");
            setSubmitting(false);
        }, 1200);
    };

    const handleDeleteLabel = (e, labelId) => {
        e.stopPropagation();
        const updated = previousLabels.filter(l => l.id !== labelId);
        localStorage.setItem('recycling_labels', JSON.stringify(updated));
        setPreviousLabels(updated);
        toast.success("Recycling label record deleted.");
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Eco-Recycling Programme | Earn Eco-Points" 
                description="Trade in old electronics and plastic waste to earn points, offset your footprint, and join our zero-waste initiative." 
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
                        ♻️ Circular Trade-In Initiative
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.025em' }}
                    >
                        Recycle & Trade-In
                    </motion.h1>
                    <p className="text-muted fs-5">Turn unwanted items or waste materials into Eco-Points for discounts in our store.</p>
                </div>

                <div className="row g-5">
                    {/* Left: Estimator tool */}
                    <div className="col-12 col-md-6">
                        <h4 className="fw-bolder text-dark mb-4">1. Points Estimator</h4>
                        <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm mb-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                            <div className="d-flex flex-column gap-4">
                                <div>
                                    <label className="text-muted small fw-bold text-uppercase tracking-wider mb-3">Item Category</label>
                                    <div className="row g-3">
                                        {CATEGORIES.map(c => {
                                            const isSelected = selectedCat.id === c.id;
                                            return (
                                                <div className="col-6" key={c.id}>
                                                    <div 
                                                        className="p-3 rounded-4 border text-center h-100 d-flex flex-column justify-content-between select-card"
                                                        style={{
                                                            cursor: 'pointer',
                                                            backgroundColor: isSelected ? 'var(--surface-color)' : 'transparent',
                                                            borderColor: isSelected ? 'var(--accent-blue)' : 'rgba(0, 0, 0, 0.08)',
                                                            boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                                                            transition: 'all 0.2s ease-in-out'
                                                        }}
                                                        onClick={() => setSelectedCat(c)}
                                                    >
                                                        <div>
                                                            <div className="fs-3 mb-2">{c.name.split(' ')[0]}</div>
                                                            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '13px', lineHeight: '1.2' }}>
                                                                {c.name.split(' ').slice(1).join(' ')}
                                                            </h6>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 mb-1 d-inline-block" style={{ fontSize: '10px' }}>
                                                                +{c.basePoints} Pts
                                                            </span>
                                                            <div className="text-muted small" style={{ fontSize: '9px' }}>
                                                                Offset: {c.co2Offset} kg CO2
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Item Condition</label>
                                    <div className="d-flex flex-column gap-2">
                                        {[
                                            { id: 'functional', label: '✅ Fully Functional / Like New', desc: 'No cracks, powers on, holds full charge.' },
                                            { id: 'cosmetic', label: '🩹 Cosmetic Damage / Wear', desc: 'Minor dents, screen scratches, or worn texture.' },
                                            { id: 'broken', label: '🔌 Non-Functional / Scraps', desc: 'Broken circuit boards, water damage, raw plastic waste.' }
                                        ].map(cond => (
                                            <div
                                                key={cond.id}
                                                onClick={() => setItemCondition(cond.id)}
                                                className="p-3 rounded-4 cursor-pointer d-flex align-items-center gap-3 transition-all"
                                                style={{
                                                    border: itemCondition === cond.id ? '1px solid var(--accent-blue)' : '1px solid rgba(0,0,0,0.06)',
                                                    backgroundColor: itemCondition === cond.id ? 'var(--surface-color)' : 'transparent',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div>
                                                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>{cond.label}</h6>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>{cond.desc}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Quantity / Weight</label>
                                    <input 
                                        type="number"
                                        className="form-control rounded-pill px-3"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        min="1"
                                        style={{ height: '44px', fontSize: '14px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Estimated Stats summary */}
                        <div className="card border-0 shadow-lg rounded-5 p-4 text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="small text-uppercase fw-bold text-white opacity-75 tracking-wider mb-1">Estimated Eco-Points</h6>
                                    <h2 className="fw-bolder text-white mb-0" style={{ fontSize: '32px' }}>{getCalculatedPoints()} Pts</h2>
                                </div>
                                <div className="text-end">
                                    <h6 className="small text-uppercase fw-bold text-white opacity-75 tracking-wider mb-1">CO2 Offset Saved</h6>
                                    <h2 className="fw-bolder text-white mb-0" style={{ fontSize: '32px' }}>{getCalculatedCO2()} kg</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Intake / Shipping Label generator */}
                    <div className="col-12 col-md-6">
                        <h4 className="fw-bolder text-dark mb-4">2. Generate Shipping Label</h4>
                        <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                            <AnimatePresence mode="wait">
                                {!labelDetails ? (
                                    <form onSubmit={handleIntakeSubmit} className="d-flex flex-column gap-3">
                                        <p className="text-muted small mb-3">Register your trade-in item below to generate a pre-paid recycling label. Drop the box at any hub or shipping locker.</p>
                                        <div>
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Item Serial No. / Details</label>
                                            <input 
                                                type="text" 
                                                className="form-control rounded-pill px-3"
                                                placeholder="e.g. Serial #12345 or Ocean Plastic scrap description"
                                                required
                                                style={{ height: '42px', fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Address for Return Mailer</label>
                                            <textarea 
                                                className="form-control rounded-4 p-3"
                                                rows="3"
                                                placeholder="Enter pickup/return address"
                                                required
                                                style={{ fontSize: '13px', backgroundColor: 'var(--surface-color)', border: 'none' }}
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary rounded-pill px-4 py-3 mt-3 fw-medium hover-scale"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Generating Label...' : 'Generate Pre-Paid Label'}
                                        </button>
                                    </form>
                                ) : (
                                    /* Shipping Label display */
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white p-4 rounded-4 shadow-sm border border-dark border-3 d-flex flex-column gap-3 text-dark text-center"
                                        style={{ fontFamily: 'monospace' }}
                                    >
                                        <div className="fw-bold border-bottom pb-2 border-dark" style={{ fontSize: '20px', letterSpacing: '1px' }}>
                                            ECO-HIVE RECYCLING MAIL
                                        </div>
                                        
                                        <div className="text-start small flex-grow-1 d-flex flex-column gap-2 mt-2">
                                            <div><strong>FROM:</strong> CUSTOMER RETURN DEPT</div>
                                            <div><strong>TO:</strong> ECO-HIVE CENTRAL RECYCLING CENTER<br/>4 RUE DE RIVOLI, PARIS, FRANCE</div>
                                            <hr className="my-1 border-dark"/>
                                            <div><strong>CARRIER:</strong> {labelDetails.carrier}</div>
                                            <div><strong>CONTENTS:</strong> {labelDetails.category}</div>
                                            <div><strong>VALUATION:</strong> {labelDetails.points} ECO-POINTS</div>
                                        </div>
 
                                        {/* Mock Barcode */}
                                        <div className="my-4 border border-dark p-3 d-flex flex-column align-items-center bg-light">
                                            <div style={{ fontSize: '32px', letterSpacing: '8px', fontWeight: 'lighter' }}>
                                                ||| | |||| | || ||| ||
                                            </div>
                                            <div className="mt-1 small" style={{ fontSize: '12px' }}>{labelDetails.barCode}</div>
                                        </div>
 
                                        <div className="d-flex gap-2 justify-content-center pt-2">
                                            <button className="btn btn-dark rounded-pill px-4 py-2" onClick={() => window.print()}>
                                                Print Label
                                            </button>
                                            <button className="btn btn-outline-secondary rounded-pill px-4 py-2" onClick={() => setLabelDetails(null)}>
                                                Recycle New Item
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Section 3: Previous Labels History list */}
                <div className="mt-5 pt-4">
                    <h4 className="fw-bolder text-dark mb-4">Your Trade-In & Recycling History</h4>
                    {previousLabels.length === 0 ? (
                        <div className="card border-0 rounded-5 p-5 text-center shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                            <div className="fs-1 mb-3">📦</div>
                            <h6 className="fw-bold text-dark mb-1">No previous recycling labels</h6>
                            <p className="text-muted small mb-0">Your generated recycling shipping labels will appear here.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {previousLabels.map(label => (
                                <div className="col-12 col-md-6" key={label.id}>
                                    <div className="card border-0 rounded-5 p-4 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1" style={{ fontSize: '11px' }}>
                                                    {label.points} Eco-Points
                                                </span>
                                                <small className="text-muted">{new Date(label.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <h6 className="fw-bold text-dark mb-1">{label.category}</h6>
                                            <p className="text-muted small mb-3">CO2 Offset: {label.co2} kg</p>
                                            <div className="bg-light p-2 rounded-3 text-center border font-monospace small mb-3">
                                                <code>{label.barCode}</code>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-dark btn-sm rounded-pill px-3 flex-grow-1" onClick={() => setLabelDetails(label)}>
                                                🔍 View & Print Label
                                            </button>
                                            <button className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', padding: 0 }} onClick={(e) => handleDeleteLabel(e, label.id)} title="Delete Label Record">
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default RecyclingProgramme;
