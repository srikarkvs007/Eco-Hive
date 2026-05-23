import React from 'react';
import { Link } from 'react-router-dom';

function Legal() {
    return (
        <div className="d-flex flex-column align-items-center bg-white min-vh-100 pt-5">
            <div className="mb-4 text-center">
                <Link to="/">
                    <img src="/images/logo-circle.png" alt="Eco-Hive" style={{ width: '150px' }} />
                </Link>
            </div>
            <div className="container py-4" style={{ maxWidth: '800px' }}>
                <h1 className="fw-bolder mb-4 text-center" style={{ fontSize: '42px', color: '#1d1d1f' }}>Legal & Privacy</h1>
                
                <div className="card border-0 shadow-sm rounded-4 p-5 mb-4" style={{ backgroundColor: '#f9f9f9' }}>
                    <h3 className="fw-bold mb-3" style={{ color: '#1d1d1f' }}>Conditions of Use</h3>
                    <p className="text-muted mb-4" style={{ lineHeight: '1.8', fontSize: '16px' }}>
                        Welcome to Eco-Hive. By using our website, you agree to these conditions. Please read them carefully. 
                        We offer a wide range of sustainable and eco-friendly products, and sometimes additional terms may apply. 
                        All purchases made on this platform are subject to our verified eco-sourcing guarantee. 
                        We reserve the right to refuse service, terminate accounts, or cancel orders in our sole discretion if we believe that customer conduct violates applicable law or is harmful to our interests.
                    </p>
                    
                    <h3 className="fw-bold mb-3" style={{ color: '#1d1d1f' }}>Privacy Notice</h3>
                    <p className="text-muted mb-4" style={{ lineHeight: '1.8', fontSize: '16px' }}>
                        We know that you care how information about you is used and shared, and we appreciate your trust that we will do so carefully and sensibly. 
                        Your privacy is our utmost priority. All personal and payment information is encrypted and securely stored. 
                        We do not sell, rent, or trade your personal information to third parties. 
                        The data we collect is solely used to process your orders, improve your shopping experience, and communicate with you regarding your transactions and our latest sustainable initiatives.
                    </p>
                </div>
                
                <div className="text-center">
                    <button className="btn rounded-pill px-5 fw-medium text-white shadow-sm" style={{ backgroundColor: '#0071e3', padding: '12px' }} onClick={() => window.history.back()}>
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Legal;
