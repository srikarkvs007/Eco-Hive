import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EcoOne = () => {
    const navigate = useNavigate();
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredContent, setFeaturedContent] = useState(null);
    const [activeMedia, setActiveMedia] = useState(null); // active content in play modal
    
    // Player controls state
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const videoRef = useRef(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchMedia();
    }, [userId]);

    const fetchMedia = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/entertainment/eco-one');
            setMediaList(res.data);
            const featured = res.data.find(c => c.isFeatured) || res.data[0];
            setFeaturedContent(featured);
        } catch (err) {
            console.error("Error fetching Eco One content:", err);
            toast.error("Failed to load entertainment catalog.");
        } finally {
            setLoading(false);
        }
    };

    // Video Player Interactions
    const openPlayer = (content) => {
        setActiveMedia(content);
        setIsPlaying(true);
        setProgress(0);
    };

    const closePlayer = () => {
        setActiveMedia(null);
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(e => console.log("Play failed", e));
            }
            setIsPlaying(!isPlaying);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }
        }
    };

    const handleScrubChange = (e) => {
        const val = parseFloat(e.target.value);
        setProgress(val);
        if (videoRef.current && videoRef.current.duration) {
            videoRef.current.currentTime = (videoRef.current.duration * val) / 100;
        }
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        } else {
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#0f0f11', color: '#f5f5f7' }}>
            <SEO 
                title="Eco One | Premium Environmental Documentaries & Shows" 
                description="Stream exclusive carbon-neutral cinematic originals, ecological shows, and climate documentaries on Eco One." 
            />
            {/* Dark themed customized navbar override */}
            <style>{`
                .glass-nav {
                    background: rgba(15, 15, 17, 0.75) !important;
                    border: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                .nav-link, .navbar-brand {
                    color: #f5f5f7 !important;
                }
                .form-control {
                    color: #fff !important;
                    border-color: rgba(255,255,255,0.15) !important;
                }
                .form-control::placeholder {
                    color: rgba(255,255,255,0.4) !important;
                }
                .logout-btn {
                    background-color: rgba(255,255,255,0.05) !important;
                    color: #fff !important;
                    border-color: rgba(255,255,255,0.1) !important;
                }
                .logout-btn:hover {
                    background-color: #ff3b30 !important;
                }
                .media-card:hover .play-overlay {
                    opacity: 1;
                }
                .media-card:hover img {
                    transform: scale(1.05);
                }
            `}</style>
            
            <Navbar showSearch={false} />

            <div className="flex-grow-1" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
                {loading ? (
                    <div className="container text-center py-5 mt-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5 className="mt-3 text-muted">Loading Eco One cinematic experience...</h5>
                    </div>
                ) : (
                    <>
                        {/* 1. Hero Feature Banner */}
                        {featuredContent && (
                            <div 
                                className="w-100 position-relative d-flex align-items-end"
                                style={{
                                    height: '65vh',
                                    backgroundImage: `linear-gradient(to top, #0f0f11 0%, rgba(15,15,17,0.7) 40%, transparent 100%), url(${featuredContent.imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    marginTop: '-20px'
                                }}
                            >
                                <div className="container" style={{ maxWidth: '1100px', paddingBottom: '40px' }}>
                                    <div className="row">
                                        <div className="col-12 col-md-8 col-lg-6">
                                            <span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-2 mb-3 fw-bold border border-success border-opacity-25" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                                                🟢 ECO-ONE ORIGINAL
                                            </span>
                                            <h1 className="fw-black mb-2 text-white" style={{ fontSize: '48px', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                                                {featuredContent.title}
                                            </h1>
                                            <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
                                                <span className="badge bg-secondary text-light px-2" style={{ fontSize: '10px' }}>{featuredContent.rating}</span>
                                                <span>{featuredContent.duration}</span>
                                                <span>{featuredContent.releaseYear}</span>
                                                <span style={{ color: 'var(--accent-color, #1D9E75)' }}>★ {featuredContent.category}</span>
                                            </div>
                                            <p className="lead fs-6 text-light opacity-90 mb-4" style={{ lineHeight: '1.6' }}>
                                                {featuredContent.description}
                                            </p>
                                            <div className="d-flex gap-3">
                                                <button className="btn btn-success text-white rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2 shadow-sm" onClick={() => openPlayer(featuredContent)}>
                                                    <span>▶</span> Play Trailer
                                                </button>
                                                <button className="btn rounded-pill px-4 py-2.5 fw-bold" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff' }} onClick={() => toast.success("Added to My List!")}>
                                                    ＋ My List
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Media Horizontal Row Sections */}
                        <div className="container mt-5" style={{ maxWidth: '1100px' }}>
                            {/* Documentaries Row */}
                            <div className="mb-5">
                                <h4 className="fw-bolder mb-4 text-white d-flex align-items-center gap-2">
                                    <span>🎬</span> Award-Winning Climate Documentaries
                                </h4>
                                <div className="row g-4">
                                    {mediaList.filter(m => m.type === 'Documentary').map(item => (
                                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                                            <div className="card bg-transparent border-0 media-card" style={{ cursor: 'pointer' }} onClick={() => openPlayer(item)}>
                                                <div className="position-relative rounded-4 overflow-hidden mb-3 shadow-sm" style={{ height: '160px' }}>
                                                    <img 
                                                        src={item.imageUrl} 
                                                        alt={item.title} 
                                                        className="w-100 h-100 transition-all" 
                                                        style={{ objectFit: 'cover' }} 
                                                    />
                                                    {/* Hover Overlay */}
                                                    <div className="play-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-60 d-flex justify-content-center align-items-center opacity-0 transition-all">
                                                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                                                            ▶
                                                        </div>
                                                    </div>
                                                </div>
                                                <h6 className="fw-bold text-white mb-1">{item.title}</h6>
                                                <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '11px' }}>
                                                    <span>{item.duration}</span>
                                                    <span>{item.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Original Series Row */}
                            <div>
                                <h4 className="fw-bolder mb-4 text-white d-flex align-items-center gap-2">
                                    <span>📺</span> original Environmental Series
                                </h4>
                                <div className="row g-4">
                                    {mediaList.filter(m => m.type === 'Show').map(item => (
                                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                                            <div className="card bg-transparent border-0 media-card" style={{ cursor: 'pointer' }} onClick={() => openPlayer(item)}>
                                                <div className="position-relative rounded-4 overflow-hidden mb-3 shadow-sm" style={{ height: '160px' }}>
                                                    <img 
                                                        src={item.imageUrl} 
                                                        alt={item.title} 
                                                        className="w-100 h-100 transition-all" 
                                                        style={{ objectFit: 'cover' }} 
                                                    />
                                                    {/* Hover Overlay */}
                                                    <div className="play-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-60 d-flex justify-content-center align-items-center opacity-0 transition-all">
                                                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                                                            ▶
                                                        </div>
                                                    </div>
                                                </div>
                                                <h6 className="fw-bold text-white mb-1">{item.title}</h6>
                                                <div className="d-flex justify-content-between align-items-center text-muted" style={{ fontSize: '11px' }}>
                                                    <span>{item.duration}</span>
                                                    <span>{item.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Cinematic Overlay Video Player Modal */}
            <AnimatePresence>
                {activeMedia && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                            backgroundColor: 'rgba(0,0,0,0.95)', 
                            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}
                    >
                        <div className="w-100 h-100 d-flex flex-column">
                            {/* Player Header */}
                            <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
                                <div>
                                    <h5 className="fw-bold text-white mb-0">{activeMedia.title}</h5>
                                    <span className="text-muted small">{activeMedia.type} • {activeMedia.category}</span>
                                </div>
                                <button className="btn rounded-circle bg-white bg-opacity-10 text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', border: 'none' }} onClick={closePlayer}>
                                    ✕
                                </button>
                            </div>

                            {/* Player Video Area */}
                            <div className="flex-grow-1 d-flex align-items-center justify-content-center position-relative">
                                {activeMedia.videoUrl ? (
                                    <video 
                                        ref={videoRef}
                                        src={activeMedia.videoUrl}
                                        className="w-100 h-100"
                                        style={{ objectFit: 'contain', maxHeight: '75vh' }}
                                        autoPlay={isPlaying}
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <div className="spinner-grow text-success" role="status"></div>
                                        <h5 className="mt-3">Loading video stream...</h5>
                                    </div>
                                )}
                            </div>

                            {/* Player Controls Bar */}
                            <div className="px-5 py-4 d-flex flex-column gap-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                                {/* Progress scrub bar */}
                                <div className="d-flex align-items-center gap-3">
                                    <input 
                                        type="range" 
                                        className="form-range flex-grow-1" 
                                        min="0" 
                                        max="100" 
                                        step="0.1"
                                        value={progress}
                                        onChange={handleScrubChange}
                                        style={{ height: '6px', cursor: 'pointer' }}
                                    />
                                </div>

                                {/* Controls buttons */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-4">
                                        {/* Play/Pause */}
                                        <button className="btn text-white p-0 fs-4" onClick={handlePlayPause} style={{ border: 'none', background: 'transparent' }}>
                                            {isPlaying ? '⏸' : '▶'}
                                        </button>

                                        {/* Mute/Volume */}
                                        <div className="d-flex align-items-center gap-2">
                                            <button className="btn text-white p-0 fs-5" onClick={toggleMute} style={{ border: 'none', background: 'transparent' }}>
                                                {isMuted ? '🔇' : '🔊'}
                                            </button>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="1" 
                                                step="0.05"
                                                value={volume}
                                                onChange={handleVolumeChange}
                                                style={{ width: '80px', height: '4px', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-light small">
                                        {activeMedia.duration} • {activeMedia.rating} • {activeMedia.releaseYear}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default EcoOne;
