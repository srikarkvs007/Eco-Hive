import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const About = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="About Us | Eco-Hive Sustainability & Mission" 
                description="Learn about Eco-Hive, our dedication to carbon-neutral production, zero-waste products, and reforestation." 
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
                        🌿 Thoughtfully Made. Naturally Better.
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '48px', letterSpacing: '-0.03em' }}
                    >
                        Our Story
                    </motion.h1>
                    <p className="text-muted fs-5">A community driven by ecological responsibility and visual excellence.</p>
                </div>

                {/* Main Content Sections */}
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="d-flex flex-column gap-5"
                >
                    {/* Mission Card */}
                    <motion.div 
                        variants={fadeInUp}
                        className="card border-0 rounded-5 p-4 p-md-5 shadow-sm"
                        style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                    >
                        <div className="row align-items-center g-4">
                            <div className="col-12 col-md-7">
                                <h3 className="fw-bolder text-dark mb-3" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
                                    The Eco-Hive Mission
                                </h3>
                                <p className="text-muted" style={{ lineHeight: '1.7' }}>
                                    At Eco-Hive, we believe that sustainable living shouldn't feel like a compromise. We curate premium, carbon-neutral, and plastic-free goods designed to blend seamlessly into your daily life. Every design choice is made to minimize environmental impact while maximizing quality and aesthetic appeal.
                                </p>
                            </div>
                            <div className="col-12 col-md-5">
                                <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: '220px' }}>
                                    <img 
                                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80&fit=crop" 
                                        alt="Eco-friendly forest planting" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Three Pillars Section */}
                    <motion.div variants={fadeInUp} className="row g-4">
                        <div className="col-12 col-md-4">
                            <div className="card border-0 rounded-4 p-4 shadow-sm h-100" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <div className="fs-1 mb-3">🌱</div>
                                <h5 className="fw-bolder text-dark mb-2">Plastic Free</h5>
                                <p className="text-muted small mb-0">
                                    We packaging and deliver products in entirely compostable or infinitely recyclable materials, avoiding plastic usage at every single touchpoint.
                                </p>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card border-0 rounded-4 p-4 shadow-sm h-100" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <div className="fs-1 mb-3">⚡</div>
                                <h5 className="fw-bolder text-dark mb-2">Carbon Neutral</h5>
                                <p className="text-muted small mb-0">
                                    From manufacturing coordinates to cargo transportation, we fully offset all greenhouse emissions to leave zero carbon footprint behind.
                                </p>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card border-0 rounded-4 p-4 shadow-sm h-100" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <div className="fs-1 mb-3">🍂</div>
                                <h5 className="fw-bolder text-dark mb-2">100% Bio-based</h5>
                                <p className="text-muted small mb-0">
                                    Our materials are ethically harvested from renewable organic farms, utilizing natural fibers and biodegradable active composites.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Reforestation Stats */}
                    <motion.div 
                        variants={fadeInUp}
                        className="card border-0 rounded-5 p-4 p-md-5 shadow-sm text-center"
                        style={{ 
                            backgroundColor: 'var(--bg-elevated)', 
                            border: 'var(--glass-border)',
                            background: 'radial-gradient(circle at 50% 50%, rgba(46, 204, 113, 0.04) 0%, transparent 80%)'
                        }}
                    >
                        <h3 className="fw-bolder text-dark mb-3" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
                            Restoring the Planet Together
                        </h3>
                        <p className="text-muted mx-auto mb-4" style={{ maxWidth: '700px', lineHeight: '1.7' }}>
                            Every single transaction on Eco-Hive funds our community forest initiative. In partnership with global reforestation organizations, we plant native trees in areas affected by severe deforestation, fostering biodiversity and restoring local economies.
                        </p>
                        <div className="row g-4 justify-content-center">
                            <div className="col-6 col-md-3">
                                <h4 className="fw-extrabold text-success mb-1" style={{ fontSize: '36px' }}>15k+</h4>
                                <span className="text-muted small fw-medium text-uppercase">Tons of CO2 Saved</span>
                            </div>
                            <div className="col-6 col-md-3">
                                <h4 className="fw-extrabold text-success mb-1" style={{ fontSize: '36px' }}>24/7</h4>
                                <span className="text-muted small fw-medium text-uppercase">Active Monitoring</span>
                            </div>
                            <div className="col-6 col-md-3">
                                <h4 className="fw-extrabold text-success mb-1" style={{ fontSize: '36px' }}>100%</h4>
                                <span className="text-muted small fw-medium text-uppercase">Traceable Roots</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default About;
