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
            <style>{`
                @keyframes chatOpen {
                    0% { transform: scale(0.92) translateY(16px); opacity: 0; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes msgEnter {
                    0% { transform: translateY(8px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes pulseGreen {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(48, 209, 88, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(48, 209, 88, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(48, 209, 88, 0); }
                }
                @keyframes dotBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .chat-shell {
                    animation: chatOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .msg-bubble {
                    animation: msgEnter 0.25s ease forwards;
                }
                .chat-body::-webkit-scrollbar {
                    width: 3px;
                    background: transparent;
                }
                .chat-body::-webkit-scrollbar-thumb {
                    background: rgba(201,169,110,0.3);
                    border-radius: 2px;
                }
                .chat-close-btn {
                    background: none; border: none; color: white; font-size: 24px; line-height: 1;
                    opacity: 0.5; transition: opacity 0.2s; cursor: pointer;
                }
                .chat-close-btn:hover {
                    opacity: 1;
                }
                .premium-input:focus {
                    outline: none;
                    border-color: rgba(201,169,110,0.5) !important;
                    box-shadow: 0 0 0 3px rgba(201,169,110,0.1) !important;
                }
                .premium-fab {
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .premium-fab:hover {
                    transform: scale(1.08);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.3) !important;
                }
            `}</style>
            
            {/* Chat Window */}
            {isOpen && (
                <div className="chat-shell mb-4" style={{ 
                    width: '380px', 
                    height: '560px', 
                    maxHeight: 'calc(100vh - 100px)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    background: 'rgba(255, 255, 255, 0.82)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '24px 24px 16px 16px',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)',
                    overflow: 'hidden'
                }}>
                    <div className="d-flex justify-content-between align-items-center" style={{ 
                        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
                        borderRadius: '24px 24px 0 0',
                        padding: '18px 20px'
                    }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center justify-content-center" style={{
                                width: '36px', height: '36px', borderRadius: '50%', background: '#111',
                                border: '2px solid rgba(201,169,110,0.4)'
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                            </div>
                            <div>
                                <h6 className="mb-0" style={{ fontWeight: 400, fontSize: '16px', color: 'white', letterSpacing: '0.04em' }}>Eco-Hive Support</h6>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', animation: 'pulseGreen 2s infinite' }}></div>
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Online</span>
                                </div>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    
                    <div className="chat-body p-3 flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-3 msg-bubble ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                <div style={{ 
                                    maxWidth: '75%', 
                                    fontWeight: 400, 
                                    fontSize: '14px',
                                    padding: '10px 16px',
                                    ...(msg.sender === 'user' ? {
                                        background: '#0A0A0A',
                                        color: '#FFFFFF',
                                        borderRadius: '18px 18px 4px 18px'
                                    } : {
                                        background: 'rgba(245, 245, 247, 0.9)',
                                        color: '#0A0A0A',
                                        borderRadius: '18px 18px 18px 4px',
                                        border: '1px solid rgba(0,0,0,0.06)'
                                    })
                                }}>
                                    {msg.text.includes('[FAQ Section]') ? (
                                        <span>
                                            I am sorry I could not provide a perfect answer. Please check our <a href="/faq" style={{ color: msg.sender === 'user' ? '#C9A96E' : '#1A1A1A', fontWeight: 500 }}>FAQ Section</a> or contact support for detailed assistance.
                                        </span>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="d-flex mb-3 justify-content-start msg-bubble">
                                <div className="d-flex align-items-center gap-1" style={{ 
                                    background: 'rgba(245, 245, 247, 0.9)',
                                    borderRadius: '18px 18px 18px 4px',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    padding: '14px 16px'
                                }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', animation: 'dotBounce 1s infinite', animationDelay: '0ms' }}></div>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', animation: 'dotBounce 1s infinite', animationDelay: '150ms' }}></div>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', animation: 'dotBounce 1s infinite', animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        
                        {awaitingFeedback && !loading && (
                            <div className="d-flex mb-3 justify-content-start msg-bubble">
                                <div style={{ 
                                    background: 'rgba(245, 245, 247, 0.9)',
                                    borderRadius: '18px 18px 18px 4px',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    padding: '12px 16px',
                                    width: '100%',
                                }}>
                                    <p className="small mb-3 fw-medium text-center" style={{ color: '#0A0A0A' }}>Did this answer your question?</p>
                                    <div className="d-flex justify-content-center gap-2">
                                        <button className="btn rounded-pill px-3 py-1" style={{ fontSize: '13px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: '#0A0A0A' }} onClick={() => handleFeedback(true)}>👍 Yes</button>
                                        <button className="btn rounded-pill px-3 py-1" style={{ fontSize: '13px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: '#0A0A0A' }} onClick={() => handleFeedback(false)}>👎 No</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3" style={{ background: 'transparent' }}>
                        <form onSubmit={handleSend} className="position-relative">
                            <input 
                                type="text" 
                                className="premium-input w-100" 
                                placeholder="Type a message..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={{
                                    background: 'rgba(245, 245, 247, 0.8)',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: '100px',
                                    padding: '12px 50px 12px 20px',
                                    fontWeight: 400,
                                    fontSize: '14px',
                                    color: '#0A0A0A',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                            <button type="submit" disabled={loading} style={{ 
                                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                                width: '32px', height: '32px', borderRadius: '50%', background: '#1A1A1A', 
                                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button 
                    className="premium-fab position-relative"
                    style={{ 
                        width: '56px', height: '56px', borderRadius: '50%', border: 'none',
                        background: 'linear-gradient(135deg, #0A0A0A, #2A2A2A)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span style={{
                        position: 'absolute', top: '-2px', right: '-2px',
                        background: '#C9A96E', color: 'white', fontSize: '10px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', border: '2px solid white'
                    }}>1</span>
                </button>
            )}
        </div>
    );
};

export default Chatbot;
