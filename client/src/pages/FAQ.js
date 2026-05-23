import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <Navbar />
            <div className="container py-5 flex-grow-1" style={{ maxWidth: '800px' }}>
                <h2 className="fw-bolder mb-4 text-center">Frequently Asked Questions</h2>
                <p className="text-center text-muted mb-5">Find answers to the most common questions about Eco-Hive.</p>
                
                <div className="accordion" id="faqAccordion">
                    <div className="accordion-item border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                        <h2 className="accordion-header" id="headingOne">
                            <button className="accordion-button bg-white fw-bold py-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                How do I track my order?
                            </button>
                        </h2>
                        <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                            <div className="accordion-body bg-white text-muted pb-4">
                                You can track the real-time status of your shipments by visiting the <strong>My Orders</strong> section in the top menu. We provide an Apple-style linear tracking bar for every purchase!
                            </div>
                        </div>
                    </div>

                    <div className="accordion-item border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                        <h2 className="accordion-header" id="headingTwo">
                            <button className="accordion-button collapsed bg-white fw-bold py-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                What payment methods do you accept?
                            </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                            <div className="accordion-body bg-white text-muted pb-4">
                                We currently accept all major Credit and Debit cards, as well as <strong>BHIM UPI</strong> scanning (PhonePe, Google Pay, Paytm) via our secure checkout gateway.
                            </div>
                        </div>
                    </div>

                    <div className="accordion-item border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                        <h2 className="accordion-header" id="headingThree">
                            <button className="accordion-button collapsed bg-white fw-bold py-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                What does it mean if a product is "Eco-Friendly Certified"?
                            </button>
                        </h2>
                        <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                            <div className="accordion-body bg-white text-muted pb-4">
                                Our Eco-Friendly certification guarantees that the product is manufactured using sustainable materials, utilizes a zero-waste supply chain, and significantly reduces carbon footprint compared to standard alternatives.
                            </div>
                        </div>
                    </div>

                    <div className="accordion-item border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                        <h2 className="accordion-header" id="headingFour">
                            <button className="accordion-button collapsed bg-white fw-bold py-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                                How does the Reorder function work?
                            </button>
                        </h2>
                        <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
                            <div className="accordion-body bg-white text-muted pb-4">
                                Loved your last purchase? You can go to your <strong>My Orders</strong> page and click the "↻ Reorder Items" button. This automatically places all the items from your past order directly into your current shopping cart.
                            </div>
                        </div>
                    </div>
                    
                    <div className="accordion-item border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                        <h2 className="accordion-header" id="headingFive">
                            <button className="accordion-button collapsed bg-white fw-bold py-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                What is your return and refund policy?
                            </button>
                        </h2>
                        <div id="collapseFive" className="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#faqAccordion">
                            <div className="accordion-body bg-white text-muted pb-4">
                                We offer a 30-day hassle-free return policy. If you are not satisfied with your purchase, you can return it within 30 days of delivery for a full refund. Please review our Legal terms for complete details.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FAQ;
