import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LegalPage = () => {
    const { documentType } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [documentType]);

    const getContent = () => {
        switch (documentType) {
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    content: (
                        <>
                            <p className="lead">At Eco-Hive, we are committed to protecting your privacy while ensuring a seamless and sustainable shopping experience. This Privacy Policy details how we collect, use, and safeguard your information.</p>
                            
                            <h4 className="mt-5 mb-3">1. Information We Collect</h4>
                            <p>We collect personal information that you provide to us, including your name, email address, phone number, and shipping address when you register or make a purchase. Additionally, we automatically collect device information, IP addresses, and browsing behavior to optimize our platform and delivery routing.</p>
                            
                            <h4 className="mt-5 mb-3">2. How We Use Your Information</h4>
                            <p>Your data is strictly used to:</p>
                            <ul>
                                <li>Process transactions and deliver eco-friendly products to you.</li>
                                <li>Calculate your estimated carbon offset based on your purchases and our optimized delivery routes.</li>
                                <li>Communicate with you regarding order status, sustainable initiatives, and customer support.</li>
                                <li>Improve our platform's user experience and personalize product recommendations.</li>
                            </ul>
                            
                            <h4 className="mt-5 mb-3">3. Data Sharing and Logistics</h4>
                            <p>We do not sell your personal information. We only share necessary details (such as shipping address and contact number) with our trusted logistics partners and drone delivery network exclusively for the purpose of fulfilling your orders efficiently and securely.</p>
                            
                            <h4 className="mt-5 mb-3">4. Security Measures</h4>
                            <p>Eco-Hive employs state-of-the-art encryption and secure server infrastructure to protect your personal and financial data. All payment processing is handled through secure, PCI-compliant gateways.</p>
                            
                            <h4 className="mt-5 mb-3">5. Your Rights</h4>
                            <p>You have the right to access, modify, or delete your personal information at any time through your Account Settings. For further assistance regarding your privacy rights, please contact our support team.</p>
                            
                            <p className="text-muted mt-5 mb-0">Last Updated: May 2026</p>
                        </>
                    )
                };
            case 'terms':
                return {
                    title: 'Terms of Use',
                    content: (
                        <>
                            <p className="lead">Welcome to Eco-Hive. By accessing or using our platform, you agree to be bound by these Terms of Use and our commitment to sustainable commerce.</p>
                            
                            <h4 className="mt-5 mb-3">1. Acceptance of Terms</h4>
                            <p>By registering an account or making a purchase on Eco-Hive, you acknowledge that you have read, understood, and agree to these Terms. If you do not agree, please do not use our services.</p>
                            
                            <h4 className="mt-5 mb-3">2. User Accounts</h4>
                            <p>You are responsible for maintaining the confidentiality of your account credentials. Eco-Hive reserves the right to suspend or terminate accounts that violate our policies or engage in fraudulent activities.</p>
                            
                            <h4 className="mt-5 mb-3">3. Product Information and Sustainability Claims</h4>
                            <p>We strive to provide accurate descriptions of all products. All "Eco-Friendly" tags and carbon offset calculations are based on certified supplier data and our internal algorithms. However, we do not warrant that all product descriptions are entirely error-free.</p>
                            
                            <h4 className="mt-5 mb-3">4. Drone Delivery and Logistics</h4>
                            <p>Our drone delivery service is subject to weather conditions, airspace regulations, and location feasibility. Delivery times are estimates and not guaranteed. Eco-Hive is not liable for delays caused by unforeseen circumstances or regulatory restrictions.</p>
                            
                            <h4 className="mt-5 mb-3">5. Intellectual Property</h4>
                            <p>All content on the Eco-Hive platform, including logos, text, graphics, and software, is the property of Eco-Hive Inc. and is protected by international copyright laws. Unauthorized reproduction is strictly prohibited.</p>
                            
                            <p className="text-muted mt-5 mb-0">Last Updated: May 2026</p>
                        </>
                    )
                };
            case 'sales':
                return {
                    title: 'Sales Policy',
                    content: (
                        <>
                            <p className="lead">Our Sales Policy ensures transparency and fairness for all transactions made on the Eco-Hive platform.</p>
                            
                            <h4 className="mt-5 mb-3">1. Pricing and Payment</h4>
                            <p>All prices are listed in local currency and include applicable taxes unless otherwise stated. We reserve the right to modify prices at any time. We accept major credit cards, debit cards, and secure online payment methods.</p>
                            
                            <h4 className="mt-5 mb-3">2. Order Acceptance</h4>
                            <p>Your receipt of an electronic order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order for any reason, including inventory shortages or payment verification issues.</p>
                            
                            <h4 className="mt-5 mb-3">3. Returns and Refunds</h4>
                            <p>In line with our sustainability goals to reduce reverse-logistics carbon footprints, we encourage mindful purchasing. However, if a product is defective or damaged upon arrival, you may request a return within 14 days of delivery. Refunds will be processed to the original payment method upon verification.</p>
                            
                            <p className="text-muted mt-5 mb-0">Last Updated: May 2026</p>
                        </>
                    )
                };
            case 'legal':
                return {
                    title: 'Legal Information',
                    content: (
                        <>
                            <p className="lead">Corporate and legal compliance information for Eco-Hive Inc.</p>
                            
                            <h4 className="mt-5 mb-3">Corporate Headquarters</h4>
                            <p>Eco-Hive Inc.<br/>Sustainable Tech Park, Sector 4<br/>Green City, Earth</p>
                            
                            <h4 className="mt-5 mb-3">Compliance</h4>
                            <p>Eco-Hive operates in strict compliance with environmental protection regulations and consumer rights laws. Our drone operations are licensed under local aviation authorities for commercial delivery.</p>
                            
                            <h4 className="mt-5 mb-3">Dispute Resolution</h4>
                            <p>Any disputes arising from the use of Eco-Hive services shall be governed by the laws of the jurisdiction in which our headquarters are located, and shall be resolved through binding arbitration.</p>
                        </>
                    )
                };
            case 'sitemap':
                return {
                    title: 'Site Map',
                    content: (
                        <div className="row g-4 mt-2">
                            <div className="col-md-4">
                                <h5 className="fw-bold mb-3">Shop</h5>
                                <ul className="list-unstyled" style={{ lineHeight: '2' }}>
                                    <li><Link to="/home" className="text-decoration-none text-muted">Eco-Products Store</Link></li>
                                    <li><Link to="/category/Personal%20Care" className="text-decoration-none text-muted">Personal Care</Link></li>
                                    <li><Link to="/category/Home%20&%20Kitchen" className="text-decoration-none text-muted">Home & Kitchen</Link></li>
                                    <li><Link to="/cart" className="text-decoration-none text-muted">Shopping Cart</Link></li>
                                </ul>
                            </div>
                            <div className="col-md-4">
                                <h5 className="fw-bold mb-3">Account</h5>
                                <ul className="list-unstyled" style={{ lineHeight: '2' }}>
                                    <li><Link to="/settings" className="text-decoration-none text-muted">Manage Profile</Link></li>
                                    <li><Link to="/settings?tab=orders" className="text-decoration-none text-muted">Order History</Link></li>
                                    <li><Link to="/settings" className="text-decoration-none text-muted">Saved Items</Link></li>
                                </ul>
                            </div>
                            <div className="col-md-4">
                                <h5 className="fw-bold mb-3">Legal</h5>
                                <ul className="list-unstyled" style={{ lineHeight: '2' }}>
                                    <li><Link to="/legal/privacy" className="text-decoration-none text-muted">Privacy Policy</Link></li>
                                    <li><Link to="/legal/terms" className="text-decoration-none text-muted">Terms of Use</Link></li>
                                    <li><Link to="/legal/sales" className="text-decoration-none text-muted">Sales Policy</Link></li>
                                </ul>
                            </div>
                        </div>
                    )
                };
            case 'waystobuy':
                return {
                    title: 'Ways to Buy',
                    content: (
                        <>
                            <p className="lead">At Eco-Hive, we believe purchasing sustainable products should be as smooth and flexible as possible. We offer a variety of convenient, secure, and green payment options tailored to your lifestyle.</p>
                            
                            <h4 className="mt-5 mb-3">🌱 Eco-EMI Credit Programs</h4>
                            <p>To make eco-friendly living affordable for everyone, we partner with leading financial institutions to offer <strong>No Cost EMI</strong> options for 3- or 6-month tenures. In addition, using eco-conscious credit cards or digital banks that invest in reforestation earns you an additional 5% discount on all purchases.</p>
                            
                            <h4 className="mt-5 mb-3">📱 Instant UPI & QR Code Payments</h4>
                            <p>We support all major Unified Payments Interface (UPI) applications. Enjoy secure, single-click checkout via Google Pay, PhonePe, Paytm, or Apple Pay. If you are receiving a drone delivery, you can scan the dynamic QR code displayed on the drone's delivery screen upon arrival to complete instant, contact-free payment.</p>
                            
                            <h4 className="mt-5 mb-3">♻️ Trade-In Recycle Credits</h4>
                            <p>Turn your old devices, kitchenware, or reusable gear into purchase power. Through our Trade-In program, we assess the recyclable value of your old items and issue instant Eco-Credits directly to your Eco-Hive Wallet. We handle 100% of the recycling process, guaranteeing zero landfill waste.</p>
                            
                            <h4 className="mt-5 mb-3">💳 Traditional Cards & Netbanking</h4>
                            <p>We accept all major international credit and debit cards, including Visa, Mastercard, American Express, and Discover, along with secure netbanking options from over 50 major banks.</p>
                            
                            <p className="text-muted mt-5 mb-0">Last Updated: June 2026</p>
                        </>
                    )
                };
            case 'newsroom':
                return {
                    title: 'Eco-Hive Newsroom',
                    content: (
                        <>
                            <p className="lead">Stay updated with the latest announcements, technological breakthroughs, and ecological milestones from Eco-Hive.</p>
                            
                            <div className="mb-5 mt-4 p-4 rounded-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <span className="badge bg-success text-white mb-2">June 1, 2026</span>
                                <h5 className="fw-bold text-dark">Eco-Hive Achieves 100% Zero-Waste Certification Across All Fulfillment Centers</h5>
                                <p className="mb-0 text-muted small mt-2">We are proud to announce that our logistics network has officially achieved a zero-waste-to-landfill status. Through meticulous sorting, composting, and partner recycling, 100% of incoming and outgoing packaging is now fully circular and biodegradable.</p>
                            </div>
                            
                            <div className="mb-5 p-4 rounded-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <span className="badge bg-primary text-white mb-2">May 15, 2026</span>
                                <h5 className="fw-bold text-dark">Rooftop Solar Micro-Grids Now Live in Regional Hubs</h5>
                                <p className="mb-0 text-muted small mt-2">As part of our Net-Zero 2030 commitment, all our major regional fulfillment warehouses have been upgraded with high-efficiency solar micro-grids. These setups generate 120% of the power required for our daily operations, feeding excess clean energy back into the local community grids.</p>
                            </div>
                            
                            <div className="mb-5 p-4 rounded-4" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                <span className="badge bg-info text-dark mb-2">April 28, 2026</span>
                                <h5 className="fw-bold text-dark">Next-Gen Autonomous Drone Delivery Fleet Receives Green Clearance</h5>
                                <p className="mb-0 text-muted small mt-2">Eco-Hive has received regulatory approval to deploy our new electric cargo drone fleet. Powered entirely by solar-charged battery banks, these drones utilize AI pathfinding to deliver items safely, reducing traffic congestion and shipping emissions by up to 92%.</p>
                            </div>
                        </>
                    )
                };
            case 'leadership':
                return {
                    title: 'Executive Leadership',
                    content: (
                        <>
                            <p className="lead">Meet the team driving Eco-Hive's mission to harmonize advanced technology with sustainable, circular commerce.</p>
                            
                            <div className="row g-4 mt-4">
                                <div className="col-12 col-md-4">
                                    <div className="p-4 rounded-4 h-100 text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div className="fs-1 mb-3">👩‍🔬</div>
                                        <h5 className="fw-bold text-dark mb-1">Dr. Evelyn Vane</h5>
                                        <span className="small text-primary fw-medium d-block mb-3">Chief Executive Officer</span>
                                        <p className="small text-muted mb-0">A veteran environmental scientist and entrepreneur, Dr. Vane co-founded Eco-Hive to prove that global commerce can thrive without exhausting our planet's resources.</p>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="p-4 rounded-4 h-100 text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div className="fs-1 mb-3">⚙️</div>
                                        <h5 className="fw-bold text-dark mb-1">Marcus Thorne</h5>
                                        <span className="small text-primary fw-medium d-block mb-3">Chief Operating Officer</span>
                                        <p className="small text-muted mb-0">Marcus manages our drone networks and supply routes. His algorithmic route optimization systems have reduced carbon output across deliveries by over 42%.</p>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="p-4 rounded-4 h-100 text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                        <div className="fs-1 mb-3">🧬</div>
                                        <h5 className="fw-bold text-dark mb-1">Dr. Aarav Patel</h5>
                                        <span className="small text-primary fw-medium d-block mb-3">Chief Materials Officer</span>
                                        <p className="small text-muted mb-0">Dr. Patel oversees product lifecycle compliance. He ensures that every partner brand and product listed meets strict chemical safety and organic certification standards.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                };
            case 'careers':
                return {
                    title: 'Careers at Eco-Hive',
                    content: (
                        <>
                            <p className="lead">Join our mission to shape the future of clean technology and retail. At Eco-Hive, we offer remote-first cultures, sustainability stipends, and the chance to make a tangible impact on the environment.</p>
                            
                            <h4 className="mt-5 mb-4 text-dark">Current Openings</h4>
                            
                            <div className="d-flex flex-column gap-3">
                                <div className="p-4 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">🤖 Autonomous Drone Fleet Operator</h6>
                                        <span className="small text-muted">Engineering & Logistics • Remote / Field</span>
                                    </div>
                                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => alert("Application submitted successfully under test mode!")}>Apply</button>
                                </div>
                                
                                <div className="p-4 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">🧪 Recycling & Materials Lifecycle Manager</h6>
                                        <span className="small text-muted">Sustainability Science • Green City Hub</span>
                                    </div>
                                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => alert("Application submitted successfully under test mode!")}>Apply</button>
                                </div>
                                
                                <div className="p-4 rounded-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">🎨 Sustainable Product UX Designer</h6>
                                        <span className="small text-muted">Product & Design • Remote</span>
                                    </div>
                                    <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={() => alert("Application submitted successfully under test mode!")}>Apply</button>
                                </div>
                            </div>
                        </>
                    )
                };
            case 'investors':
                return {
                    title: 'Investor Relations',
                    content: (
                        <>
                            <p className="lead">Eco-Hive combines robust financial performance with measurable ESG (Environmental, Social, and Governance) impact, offering unique value to shareholders who prioritize long-term sustainability.</p>
                            
                            <h4 className="mt-5 mb-3">📈 Q1 2026 Financial Highlights</h4>
                            <ul>
                                <li><strong>Revenue Growth:</strong> +28% YoY growth, driven by expansion of our sustainable home goods category.</li>
                                <li><strong>Carbon Dividends:</strong> Saved over 14,000 metric tons of CO2 through drone deliveries and product life extension.</li>
                                <li><strong>Operational Efficiency:</strong> Reinvested 15% of profits into expansion of regional micro-fulfillment solar centers, reducing grid reliance.</li>
                            </ul>
                            
                            <h4 className="mt-5 mb-3">📄 Reports & Disclosures</h4>
                            <div className="list-group list-group-flush rounded-4 overflow-hidden border">
                                <a href="#!" className="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center bg-transparent" onClick={(e) => { e.preventDefault(); alert("Downloading Q1 2026 Earnings Report (Simulation)"); }}>
                                    <span>Download Q1 2026 Earnings Release (PDF)</span>
                                    <span>📥</span>
                                </a>
                                <a href="#!" className="list-group-item list-group-item-action p-3 d-flex justify-content-between align-items-center bg-transparent" onClick={(e) => { e.preventDefault(); alert("Downloading Annual Sustainability Impact Report (Simulation)"); }}>
                                    <span>Download 2025 Sustainability & ESG Impact Report (PDF)</span>
                                    <span>📥</span>
                                </a>
                            </div>
                        </>
                    )
                };
            default:
                return {
                    title: 'Document Not Found',
                    content: <p>The requested legal document could not be found.</p>
                };
        }
    };

    const doc = getContent();

    return (
        <div className="min-vh-100 d-flex flex-column bg-light" style={{ transition: 'background-color 0.4s ease' }}>
            <Navbar />
            
            <div className="container flex-grow-1" style={{ maxWidth: '800px', paddingTop: '160px', paddingBottom: '100px' }}>
                <div className="card border-0 rounded-5 p-4 p-md-5 shadow-sm" style={{ backgroundColor: 'var(--surface-color)', border: 'var(--glass-border)' }}>
                    <h1 className="fw-bolder mb-5 pb-4 border-bottom text-dark" style={{ letterSpacing: '-0.02em', fontSize: '42px' }}>
                        {doc.title}
                    </h1>
                    <div className="text-dark" style={{ lineHeight: '1.8', fontSize: '16px' }}>
                        {doc.content}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LegalPage;
