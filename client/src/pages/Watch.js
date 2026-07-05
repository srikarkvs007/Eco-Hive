import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FALLBACK_MEDIA } from './EcoTV';

const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/entertainment/eco-one');
                const match = res.data.find(item => String(item.id) === String(id));
                if (match && match.videoUrl) {
                    setMedia(match);
                } else {
                    // Try fallback
                    const fallbackMatch = FALLBACK_MEDIA.find(item => String(item.id) === String(id));
                    if (fallbackMatch && fallbackMatch.videoUrl) {
                        setMedia(fallbackMatch);
                    } else {
                        toast.error("Video stream not found.");
                        setError(true);
                        setTimeout(() => navigate('/eco-tv'), 2500);
                    }
                }
            } catch (err) {
                console.error("Failed to load video stream, checking fallback:", err);
                const fallbackMatch = FALLBACK_MEDIA.find(item => String(item.id) === String(id));
                if (fallbackMatch && fallbackMatch.videoUrl) {
                    setMedia(fallbackMatch);
                } else {
                    toast.error("Failed to connect to video stream server.");
                    setError(true);
                    setTimeout(() => navigate('/eco-tv'), 2500);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMedia();
        } else {
            navigate('/eco-tv');
        }
    }, [id, navigate]);

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        let startSeconds = 0;
        
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v') || '';
                const timeParam = urlObj.searchParams.get('t') || '';
                if (timeParam) {
                    startSeconds = parseInt(timeParam.replace('s', ''), 10) || 0;
                }
            } else if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.substring(1);
                const timeParam = urlObj.searchParams.get('t') || '';
                if (timeParam) {
                    startSeconds = parseInt(timeParam.replace('s', ''), 10) || 0;
                }
            }
        } catch (e) {
            console.error("Failed to parse YouTube URL:", e);
        }
        
        if (videoId) {
            let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
            if (startSeconds > 0) {
                embedUrl += `&start=${startSeconds}`;
            }
            return embedUrl;
        }
        return '';
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center text-white" style={{ backgroundColor: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <div className="spinner-border text-light mb-4" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="fw-bold mb-2">Connecting to Stream Source</h5>
                <p className="text-muted small">Loading media server player...</p>
            </div>
        );
    }

    if (error || !media) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center text-white" style={{ backgroundColor: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <span className="fs-1 mb-3 d-block">⚠️</span>
                <h5 className="fw-bold">Unable to resolve video stream</h5>
                <p className="text-muted small">Returning to browse screen...</p>
            </div>
        );
    }

    const embedUrl = getYoutubeEmbedUrl(media.videoUrl);

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#000000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflow: 'hidden' }}>
            {/* Top Bar Navigation */}
            <header className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', height: '70px', zIndex: 10 }}>
                <button 
                    className="btn d-flex align-items-center justify-content-center shadow-sm" 
                    style={{ 
                        backgroundColor: '#ffffff', 
                        border: '2px solid #1d9e75', 
                        borderRadius: '20px', 
                        padding: '6px 16px',
                        color: '#1d9e75',
                        fontWeight: '600',
                        fontSize: '12px',
                        transition: 'all 0.2s ease'
                    }} 
                    onClick={() => navigate('/eco-tv')}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1d9e75';
                        e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#1d9e75';
                    }}
                >
                    <i className="bi bi-arrow-left me-1.5" style={{ fontSize: '13px', fontWeight: 'bold' }}></i>
                    <i className="bi bi-leaf-fill me-1.5" style={{ fontSize: '12px' }}></i>
                    Back to Eco-TV
                </button>

                <div className="text-center d-none d-md-block" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <h6 className="text-white fw-bold m-0" style={{ letterSpacing: '-0.01em', fontSize: '15px' }}>
                        Streaming: {media.title}
                    </h6>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        {media.category} • {media.type} • {media.duration}
                    </span>
                </div>

                <div style={{ width: '135px' }} className="d-none d-md-block" /> {/* Spacing placeholder to balance left button */}
            </header>

            {/* Video Player Container */}
            <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-4" style={{ height: 'calc(100vh - 70px)' }}>
                <div 
                    className="w-100 h-100 shadow-lg border" 
                    style={{ 
                        maxWidth: '1200px', 
                        maxHeight: '680px',
                        aspectRatio: '16/9',
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        backgroundColor: '#0d0d0d',
                        borderColor: 'rgba(255, 255, 255, 0.08)'
                    }}
                >
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            title={media.title}
                            className="w-100 h-100"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <video 
                            src={media.videoUrl} 
                            controls 
                            autoPlay 
                            className="w-100 h-100" 
                            style={{ objectFit: 'contain' }}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Watch;
