import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hi! I am the Eco-Hive Assistant. How can I help you today?' }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [awaitingFeedback, setAwaitingFeedback] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        setLoading(true);
        setAwaitingFeedback(false);

        try {
            const res = await axios.post('http://localhost:5001/api/chat', {
                message: userMsg.text,
                history: messages
            });
            
            setMessages([...newHistory, { sender: 'ai', text: res.data.reply }]);
            setAwaitingFeedback(true);
        } catch (err) {
            console.error(err);
            setMessages([...newHistory, { sender: 'ai', text: 'Sorry, I am having trouble connecting right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedback = (isPositive) => {
        setAwaitingFeedback(false);
        if (isPositive) {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Thank you for the feedback! Let me know if you need anything else.' }]);
        } else {
            setMessages(prev => [...prev, { sender: 'ai', text: 'I am sorry I could not provide a perfect answer. Please check our [FAQ Section](/faq) or contact support for detailed assistance.' }]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="card shadow-lg border-0 mb-3" style={{ width: '350px', height: '450px', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="card-header text-white d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: '#0071e3' }}>
                        <div className="d-flex align-items-center">
                            <span className="fs-4 me-2">🤖</span>
                            <h6 className="mb-0 fw-bold">Eco-Hive Support</h6>
                        </div>
                        <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
                    </div>
                    
                    <div className="card-body p-3 overflow-auto flex-grow-1" style={{ backgroundColor: '#f9f9f9' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div 
                                    className={`p-2 px-3 rounded-3 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white border text-dark'}`}
                                    style={{ maxWidth: '85%', fontSize: '14px', lineHeight: '1.4' }}
                                >
                                    {msg.text.includes('[FAQ Section]') ? (
                                        <span>
                                            I am sorry I could not provide a perfect answer. Please check our <a href="/faq">FAQ Section</a> or contact support for detailed assistance.
                                        </span>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="d-flex mb-3 justify-content-start">
                                <div className="p-2 px-3 rounded-3 bg-white border text-muted small">
                                    Typing...
                                </div>
                            </div>
                        )}
                        {awaitingFeedback && !loading && (
                            <div className="d-flex mb-3 justify-content-start">
                                <div className="p-2 px-3 rounded-3 bg-light border text-dark text-center" style={{ width: '100%' }}>
                                    <p className="small mb-2 fw-medium text-muted">Did this answer your question?</p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => handleFeedback(true)}>👍 Yes</button>
                                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleFeedback(false)}>👎 No</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="card-footer p-2 bg-white border-top-0">
                        <form onSubmit={handleSend} className="d-flex gap-2">
                            <input 
                                type="text" 
                                className="form-control rounded-pill bg-light border-0 px-3" 
                                placeholder="Type a message..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary rounded-circle" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}>
                                ↑
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button 
                    className="btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
                    style={{ width: '65px', height: '65px', backgroundColor: '#0071e3', border: 'none' }}
                    onClick={() => setIsOpen(true)}
                >
                    <span style={{ fontSize: '30px' }}>💬</span>
                </button>
            )}
        </div>
    );
};

export default Chatbot;
