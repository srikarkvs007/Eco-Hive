import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="w-100" style={{ backgroundColor: 'var(--bg-elevated)', fontSize: '12px', color: 'var(--text-secondary)', borderTop: 'var(--glass-border)' }}>
            <div className="container" style={{ maxWidth: '1000px', paddingTop: 'var(--spacing-premium)', paddingBottom: 'var(--spacing-premium)' }}>

                {/* Quick Links Section */}
                <div className="mb-5">
                    <h3 className="fw-bolder text-dark mb-4" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>Quick Links</h3>
                    <div className="d-flex flex-wrap gap-3 mb-4">
                        <Link to="/store-locator" className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Find a Store</Link>
                        <Link to="/order-status" className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Order Status</Link>
                        <Link to="/support" className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Shopping Help</Link>
                        <Link to="/saves" className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Your Saves</Link>
                    </div>
                </div>

                {/* Top Fine Print Section */}
                <div className="mb-4" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '24px' }}>
                    <p className="mb-2" style={{ lineHeight: '1.6' }}>
                        ‡ No Cost EMI is available with the purchase of an eligible product made using qualifying cards on 3- or 6-month tenures from most leading card issuers. Minimum order spend applies as per your card issuer's threshold. Terms apply.
                    </p>
                    <p className="mb-2" style={{ lineHeight: '1.6' }}>
                        Δ Instant cashback is available with the purchase of an eligible product with qualifying American Express, Axis Bank and ICICI Bank cards only. Minimum transaction value of $20.99 applies. Offer may be revised or withdrawn at any time without any prior notice. Additional terms apply.
                    </p>
                    <p className="mb-2" style={{ lineHeight: '1.6' }}>
                        ± Available to current and newly accepted college students, parents buying for college students, and teachers and staff at all levels. See <Link to="/legal/terms" className="text-decoration-none text-muted" style={{ textDecoration: 'underline' }}>Terms</Link> for more information.
                    </p>
                    <p className="mb-2">
                        * Listed pricing is Maximum Retail Price (inclusive of all taxes).
                    </p>
                    <p className="mb-0">
                        We use your location to show you delivery options faster. We found your location using your IP address or because you entered it during a previous visit to Eco-Hive.
                    </p>
                </div>

                {/* Breadcrumb */}
                <div className="d-flex align-items-center mb-4 py-3">
                    <img src="/images/logo.jpg" alt="Eco-Hive" style={{ height: '16px', filter: 'grayscale(100%) opacity(0.7)' }} className="me-2 d-none d-md-block" />
                    <span className="mx-2 fw-medium text-dark">Eco-Hive Store Online</span>
                </div>

                {/* Sitemap Columns */}
                <div className="row mb-5" style={{ lineHeight: '2.2' }}>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">Shop and Learn</div>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/home?store=true" className="text-decoration-none" style={{ color: '#6e6e73' }}>Store</Link></li>
                            <li><Link to="/home?store=true" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Products</Link></li>
                            <li><Link to={`/category/${encodeURIComponent('Tech & Lighting')}`} className="text-decoration-none" style={{ color: '#6e6e73' }}>Sustainable Tech</Link></li>
                            <li><Link to={`/category/${encodeURIComponent('Apparel')}`} className="text-decoration-none" style={{ color: '#6e6e73' }}>Apparel</Link></li>
                            <li><Link to={`/category/${encodeURIComponent('Accessories')}`} className="text-decoration-none" style={{ color: '#6e6e73' }}>Accessories</Link></li>
                            <li><Link to="/gift-cards" className="text-decoration-none" style={{ color: '#6e6e73' }}>Gift Cards</Link></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">Account</div>
                        <ul className="list-unstyled mb-4">
                            <li><Link to="/settings?tab=profile" className="text-decoration-none" style={{ color: '#6e6e73' }}>Manage Your Account</Link></li>
                            <li><Link to="/settings?tab=wallet" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Hive Store Account</Link></li>
                        </ul>
                        <div className="fw-semibold text-dark mb-1">Entertainment</div>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/eco-one" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco One</Link></li>
                            <li><Link to="/podcasts" className="text-decoration-none" style={{ color: '#6e6e73' }}>Podcasts</Link></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">Eco-Hive Store</div>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/store-locator" className="text-decoration-none" style={{ color: '#6e6e73' }}>Find a Store</Link></li>
                            <li><Link to="/genius-bar" className="text-decoration-none" style={{ color: '#6e6e73' }}>Genius Bar</Link></li>
                            <li><Link to="/today" className="text-decoration-none" style={{ color: '#6e6e73' }}>Today at Eco-Hive</Link></li>
                            <li><Link to="/legal/waystobuy" className="text-decoration-none" style={{ color: '#6e6e73' }}>Ways to Buy</Link></li>
                            <li><Link to="/recycling" className="text-decoration-none" style={{ color: '#6e6e73' }}>Recycling Programme</Link></li>
                            <li><Link to="/order-status" className="text-decoration-none" style={{ color: '#6e6e73' }}>Order Status</Link></li>
                            <li><Link to="/support" className="text-decoration-none" style={{ color: '#6e6e73' }}>Shopping Help</Link></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">For Business</div>
                        <ul className="list-unstyled mb-4">
                            <li><Link to="/legal/supplychain" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Hive and Business</Link></li>
                        </ul>
                        <div className="fw-semibold text-dark mb-1">For Education</div>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/legal/accessibility" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Hive and Education</Link></li>
                            <li><Link to="/home?store=true" className="text-decoration-none" style={{ color: '#6e6e73' }}>Shop for Education</Link></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="fw-semibold text-dark mb-1">Eco-Hive Values</div>
                        <ul className="list-unstyled mb-4">
                            <li><Link to="/legal/accessibility" className="text-decoration-none" style={{ color: '#6e6e73' }}>Accessibility</Link></li>
                            <li><Link to="/legal/environment" className="text-decoration-none" style={{ color: '#6e6e73' }}>Environment</Link></li>
                            <li><Link to="/legal/privacy" className="text-decoration-none" style={{ color: '#6e6e73' }}>Privacy</Link></li>
                            <li><Link to="/legal/supplychain" className="text-decoration-none" style={{ color: '#6e6e73' }}>Supply Chain</Link></li>
                        </ul>
                        <div className="fw-semibold text-dark mb-1">About Eco-Hive</div>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/legal/newsroom" className="text-decoration-none" style={{ color: '#6e6e73' }}>Newsroom</Link></li>
                            <li><Link to="/legal/leadership" className="text-decoration-none" style={{ color: '#6e6e73' }}>Leadership</Link></li>
                            <li><Link to="/legal/careers" className="text-decoration-none" style={{ color: '#6e6e73' }}>Career Opportunities</Link></li>
                            <li><Link to="/legal/investors" className="text-decoration-none" style={{ color: '#6e6e73' }}>Investors</Link></li>
                            <li><Link to="/legal/legal" className="text-decoration-none" style={{ color: '#6e6e73' }}>Ethics & Compliance</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Legal Section */}
                <div className="mb-3" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '16px' }}>
                    More ways to shop: <Link to="/store-locator" className="text-decoration-none" style={{ color: 'var(--accent-blue)' }}>Find an Eco-Hive Store</Link> or <Link to="/store-locator" className="text-decoration-none" style={{ color: 'var(--accent-blue)' }}>other retailer</Link> near you. Or call 000800 040 1966.
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3">
                    <div className="mb-3 mb-md-0 fw-medium">
                        Copyright © 2026 Eco-Hive Inc. All rights reserved.
                    </div>
                    <div className="d-flex flex-wrap gap-3">
                        <Link to="/legal/privacy" className="text-decoration-none border-end pe-3 text-muted">Privacy Policy</Link>
                        <Link to="/legal/terms" className="text-decoration-none border-end pe-3 text-muted">Terms of Use</Link>
                        <Link to="/legal/sales" className="text-decoration-none border-end pe-3 text-muted">Sales Policy</Link>
                        <Link to="/legal/legal" className="text-decoration-none border-end pe-3 text-muted">Legal</Link>
                        <Link to="/legal/sitemap" className="text-decoration-none text-muted">Site Map</Link>
                    </div>
                    <div className="mt-3 mt-md-0 text-dark fw-medium">
                        India
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
