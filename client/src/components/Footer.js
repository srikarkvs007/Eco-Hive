import React from 'react';

const Footer = () => {
    return (
        <footer className="w-100" style={{ backgroundColor: 'var(--bg-elevated)', fontSize: '12px', color: 'var(--text-secondary)', borderTop: 'var(--glass-border)' }}>
            <div className="container" style={{ maxWidth: '1000px', paddingTop: 'var(--spacing-premium)', paddingBottom: 'var(--spacing-premium)' }}>

                {/* Quick Links Section */}
                <div className="mb-5">
                    <h3 className="fw-bolder text-dark mb-4" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>Quick Links</h3>
                    <div className="d-flex flex-wrap gap-3 mb-4">
                        <button className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Find a Store</button>
                        <a href="/my-orders" className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Order Status</a>
                        <button className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Shopping Help</button>
                        <button className="btn btn-light rounded-pill px-4 fw-medium shadow-sm" style={{ fontSize: '14px' }}>Your Saves</button>
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
                        ± Available to current and newly accepted college students, parents buying for college students, and teachers and staff at all levels. See <a href="#" className="text-decoration-none text-muted" style={{ textDecoration: 'underline' }}>Terms</a> for more information.
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
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Store</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Products</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Sustainable Tech</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Apparel</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Accessories</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Gift Cards</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">Account</div>
                        <ul className="list-unstyled mb-4">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Manage Your Account</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Hive Store Account</a></li>
                        </ul>
                        <div className="fw-semibold text-dark mb-1">Entertainment</div>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco One</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Podcasts</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">Eco-Hive Store</div>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Find a Store</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Genius Bar</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Today at Eco-Hive</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Ways to Buy</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Recycling Programme</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Order Status</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Shopping Help</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-2 mb-3 mb-md-0">
                        <div className="fw-semibold text-dark mb-1">For Business</div>
                        <ul className="list-unstyled mb-4">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Hive and Business</a></li>
                        </ul>
                        <div className="fw-semibold text-dark mb-1">For Education</div>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Eco-Hive and Education</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Shop for Education</a></li>
                        </ul>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="fw-semibold text-dark mb-1">Eco-Hive Values</div>
                        <ul className="list-unstyled mb-4">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Accessibility</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Environment</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Privacy</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Supply Chain</a></li>
                        </ul>
                        <div className="fw-semibold text-dark mb-1">About Eco-Hive</div>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Newsroom</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Leadership</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Career Opportunities</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Investors</a></li>
                            <li><a href="#" className="text-decoration-none" style={{ color: '#6e6e73' }}>Ethics & Compliance</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Legal Section */}
                <div className="mb-3" style={{ borderBottom: 'var(--glass-border)', paddingBottom: '16px' }}>
                    More ways to shop: <a href="#" className="text-decoration-none" style={{ color: 'var(--accent-blue)' }}>Find an Eco-Hive Store</a> or <a href="#" className="text-decoration-none" style={{ color: 'var(--accent-blue)' }}>other retailer</a> near you. Or call 000800 040 1966.
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3">
                    <div className="mb-3 mb-md-0 fw-medium">
                        Copyright © 2026 Eco-Hive Inc. All rights reserved.
                    </div>
                    <div className="d-flex flex-wrap gap-3">
                        <a href="#" className="text-decoration-none border-end pe-3 text-muted">Privacy Policy</a>
                        <a href="#" className="text-decoration-none border-end pe-3 text-muted">Terms of Use</a>
                        <a href="#" className="text-decoration-none border-end pe-3 text-muted">Sales Policy</a>
                        <a href="#" className="text-decoration-none border-end pe-3 text-muted">Legal</a>
                        <a href="#" className="text-decoration-none text-muted">Site Map</a>
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
