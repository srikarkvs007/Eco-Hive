import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    Play, 
    Plus, 
    Check,
    Search, 
    X, 
    ChevronDown
} from 'lucide-react';

// Fallback media catalog

export const FALLBACK_MEDIA = [
    {
        id: "our-fragile-blue-planet",
        title: "Our Fragile Blue Planet",
        type: "Documentary",
        category: "Nature & Oceans",
        description: "An awe-inspiring cinematic journey documenting the delicate ecosystems of deep oceans and coral reefs under threat from warming climates.",
        duration: "1h 45m",
        rating: "G",
        imageUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1200&q=80&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=67P0zc8jZw8",
        isFeatured: true,
        releaseYear: 2025
    },
    {
        id: "eco-tech-building-tomorrow",
        title: "Eco-Tech: Building Tomorrow",
        type: "Show",
        category: "Technology",
        description: "Follow leading engineers and designers as they develop revolutionary solar systems, fusion battery cells, and autonomous carbon-negative logistics.",
        duration: "8 Episodes",
        rating: "PG",
        imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=9LoFTMlXQx8",
        isFeatured: true,
        releaseYear: 2026
    },
    {
        id: "zero-waste-frontiers",
        title: "Zero Waste Frontiers",
        type: "Documentary",
        category: "Lifestyle",
        description: "Explore the daily lives of urban pioneers living entirely waste-free, sharing techniques on composting, closed-loop recycling, and minimal carbon footprints.",
        duration: "52m",
        rating: "G",
        imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=CAHN5DmExzU",
        isFeatured: false,
        releaseYear: 2024
    },
    {
        id: "the-air-we-breathe",
        title: "The Air We Breathe",
        type: "Show",
        category: "Climate Science",
        description: "Scientists track global atmospheric currents using satellite imagery and particulate tracking to outline real-time effects of forestation programs.",
        duration: "6 Episodes",
        rating: "PG-13",
        imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80&fit=crop",
        videoUrl: "https://www.youtube.com/watch?v=WFDZkvi-cgs",
        isFeatured: false,
        releaseYear: 2025
    }
];

const AppleAccordionItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px 0' }}>
            <button 
                onClick={onToggle}
                className="w-100 d-flex justify-content-between align-items-center bg-transparent border-0 text-white text-start py-1"
                style={{ outline: 'none', transition: 'color 0.2s ease' }}
            >
                <span className="fs-5 fw-medium" style={{ letterSpacing: '-0.01em' }}>{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="text-muted"
                >
                    <ChevronDown size={20} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="mt-3 fs-6 lh-lg mb-0" style={{ color: 'rgba(255, 255, 255, 0.75)', maxWidth: '90%' }}>
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AppleCard = ({ item, onPlay, onInfo, isContinueWatching }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [inMyList, setInMyList] = useState(false);

    const handleAddList = (e) => {
        e.stopPropagation();
        setInMyList(!inMyList);
        toast.success(
            inMyList ? `Removed "${item.title}" from My List` : `Added "${item.title}" to My List!`, 
            { icon: inMyList ? '➖' : '➕' }
        );
    };

    return (
        <div 
            className="position-relative flex-shrink-0"
            style={{ 
                width: '320px', 
                marginRight: '20px', 
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#1c1c1e',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isHovered ? '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
                zIndex: isHovered ? 10 : 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onInfo(item)}
        >
            {/* Thumbnail */}
            <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-100 h-100" 
                    style={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                    }} 
                />
                
                {/* Play hover overlay */}
                <div 
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.4)', 
                        opacity: isHovered ? 1 : 0, 
                        transition: 'opacity 0.3s ease' 
                    }}
                >
                    <button 
                        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow"
                        style={{ width: '48px', height: '48px', border: 'none' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlay(item);
                        }}
                    >
                        <Play size={20} fill="#000" className="ms-1" />
                    </button>
                </div>

                {/* Badge */}
                <span 
                    className="position-absolute top-3 start-3 badge rounded-pill px-2.5 py-1"
                    style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.65)', 
                        backdropFilter: 'blur(8px)',
                        fontSize: '10px', 
                        fontWeight: '600',
                        letterSpacing: '0.5px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {item.type}
                </span>

                {/* Progress bar for Continue Watching */}
                {isContinueWatching && (
                    <div 
                        className="position-absolute bottom-0 start-0 w-100" 
                        style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                        <div 
                            style={{ 
                                height: '100%', 
                                width: `${item.progress}%`, 
                                backgroundColor: '#ffffff',
                                transition: 'width 0.4s ease'
                            }} 
                        />
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div className="p-3 d-flex flex-column justify-content-between" style={{ minHeight: '110px' }}>
                <div>
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                        <h6 className="text-white fw-bold mb-0 text-truncate" style={{ fontSize: '15px' }}>{item.title}</h6>
                        <span className="flex-shrink-0" style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{item.match}% Match</span>
                    </div>
                    <p className="mb-0 text-truncate-2" style={{ fontSize: '12px', lineHeight: '1.4', color: 'rgba(255,255,255,0.65)' }}>
                        {item.description}
                    </p>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        {item.category} • {item.releaseYear}
                    </span>
                    
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center bg-transparent text-white"
                            style={{ width: '28px', height: '28px', border: '1px solid rgba(255,255,255,0.2)' }}
                            onClick={handleAddList}
                        >
                            {inMyList ? <Check size={12} /> : <Plus size={12} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EcoTV = () => {
    const navigate = useNavigate();
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredContent, setFeaturedContent] = useState(null);
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const [infoModalMedia, setInfoModalMedia] = useState(null); 

    // Profile selector screen state (bypassed)
    const [userProfile, setUserProfile] = useState({ name: 'User', avatar: '' });

    // Navbar states
    const [navFrosted, setNavFrosted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollY, setScrollY] = useState(0);
    
    // Accordion state
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchMedia();
        fetchUserProfile();
    }, [userId, navigate]);

    const fetchUserProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/v1/users/profile');
            setUserProfile({
                name: res.data.name || localStorage.getItem('name') || 'User',
                avatar: res.data.profilePicture || ''
            });
        } catch (err) {
            console.error("Failed to load user profile in Eco-TV:", err);
            const localName = localStorage.getItem('name') || 'User';
            setUserProfile({
                name: localName,
                avatar: ''
            });
        }
    };

    // Handle scroll for sub-navbar frost shift
    useEffect(() => {
        const handleScroll = () => {
            setNavFrosted(window.scrollY > 50);
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/entertainment/eco-one');
            const enriched = res.data.map((item, idx) => ({
                ...item,
                progress: idx === 0 ? 35 : idx === 1 ? 80 : 55, 
                match: 94 + (idx * 3) % 6,
                cast: "David Attenborough, Dr. Evelyn Vane, Marcus Thorne, Dr. Aarav Patel"
            }));
            setMediaList(enriched);
            const featuredList = enriched.filter(c => c.isFeatured) || [enriched[0]];
            setFeaturedContent(featuredList);
        } catch (err) {
            console.error("Error fetching Eco TV content from backend, loading fallback database:", err);
            const enrichedFallback = FALLBACK_MEDIA.map((item, idx) => ({
                ...item,
                progress: idx === 0 ? 35 : idx === 1 ? 80 : 55,
                match: 94 + (idx * 3) % 6,
                cast: "David Attenborough, Dr. Evelyn Vane, Marcus Thorne, Dr. Aarav Patel"
            }));
            setMediaList(enrichedFallback);
            setFeaturedContent(enrichedFallback.filter(c => c.isFeatured) || [enrichedFallback[0]]);
        } finally {
            setLoading(false);
        }
    };

    // Auto rotate featured carousel
    useEffect(() => {
        if (!featuredContent || featuredContent.length <= 1) return;
        const interval = setInterval(() => {
            setFeaturedIndex((prevIndex) => (prevIndex + 1) % featuredContent.length);
        }, 8000); // rotate every 8s
        return () => clearInterval(interval);
    }, [featuredContent]);

    const openPlayer = (content) => {
        if (content && content.id) {
            navigate(`/watch/${content.id}`);
        } else {
            toast.error("Invalid video content.");
        }
    };

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleAddListGlobal = (title) => {
        toast.success(`Added "${title}" to your Up Next queue.`, { icon: '➕' });
    };

    // Filter media items based on nav search input
    const filteredMedia = searchQuery.trim() === ''
        ? mediaList
        : mediaList.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const featuredItems = featuredContent || [];
    const currentHero = featuredItems[featuredIndex];

    const upNextEpisodes = mediaList.filter(m => m.progress !== undefined);
    const documentSeries = mediaList.filter(m => m.type === 'Documentary');
    const showsSeries = mediaList.filter(m => m.type === 'Show');

    if (loading) {
        return (
            <div className="eco-tv-page min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                <style>{`
                    .eco-tv-page {
                        background-color: #000000 !important;
                        color: #ffffff !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }
                `}</style>
                <div className="spinner-border text-light animate-pulse" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="mt-4 text-muted" style={{ letterSpacing: '1px', fontSize: '15px' }}>Eco-TV</h5>
            </div>
        );
    }

    // Profile selector screen layout bypassed

    return (
        <div className="eco-tv-page min-vh-100 d-flex flex-column">
            <SEO 
                title="Eco-TV | Premium Apple-Style Environmental Streaming" 
                description="Experience sustainable movies, original series, and climate documentaries on Eco-TV. Pure content-first premium design." 
            />

            {/* Apple TV+ styling sheet */}
            <style>{`
                .eco-tv-page {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                .apple-subnav {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1000;
                    transition: background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease;
                    border-bottom: 1px solid transparent;
                }
                .apple-subnav.frosted {
                    background-color: rgba(22, 22, 23, 0.8);
                    backdrop-filter: blur(20px);
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .apple-nav-link {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .apple-nav-link:hover, .apple-nav-link.active {
                    color: #ffffff;
                }
                .apple-search-input {
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    border-radius: 20px;
                    padding: 6px 14px 6px 36px;
                    font-size: 13px;
                    width: 180px;
                    transition: width 0.3s ease, border-color 0.3s ease;
                    outline: none;
                }
                .apple-search-input:focus {
                    width: 250px;
                    border-color: rgba(255, 255, 255, 0.35);
                    background: rgba(255, 255, 255, 0.12);
                }
                .apple-stream-btn {
                    background: #ffffff;
                    color: #000000;
                    font-weight: 600;
                    border-radius: 20px;
                    padding: 8px 18px;
                    font-size: 12px;
                    border: none;
                    transition: transform 0.2s ease, background-color 0.2s ease;
                }
                .apple-stream-btn:hover {
                    background: #f5f5f7;
                    transform: scale(1.03);
                }
                .apple-glass-btn {
                    background: rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(10px);
                    color: #ffffff;
                    font-weight: 600;
                    border-radius: 20px;
                    padding: 8px 18px;
                    font-size: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
                }
                .apple-glass-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.3);
                    transform: scale(1.03);
                }
                .hero-carousel-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    transition: background-color 0.3s ease, width 0.3s ease;
                }
                .hero-carousel-indicator.active {
                    background-color: #ffffff;
                    width: 24px;
                    border-radius: 4px;
                }
                .shelf-row::-webkit-scrollbar {
                    display: none;
                }
                .shelf-row {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .shelf-arrow-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(22, 22, 23, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 5;
                    opacity: 0;
                    transition: opacity 0.3s ease, background-color 0.2s ease;
                }
                .shelf-container:hover .shelf-arrow-btn {
                    opacity: 1;
                }
                .shelf-arrow-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                .apple-detail-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(15px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .apple-detail-panel {
                    width: 100%;
                    max-width: 900px;
                    height: 85vh;
                    background: #161617;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.8);
                }
                @media (min-width: 768px) {
                    .apple-detail-sidebar {
                        border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
                    }
                }
            `}</style>

            {/* 1. Apple TV Sub-Navbar */}
            <nav className={`apple-subnav px-4 py-3 d-flex align-items-center justify-content-between ${navFrosted ? 'frosted' : ''}`}>
                <div className="d-flex align-items-center gap-4">
                    <span 
                        className="fw-bold fs-4 text-white d-flex align-items-center" 
                        style={{ cursor: 'pointer', letterSpacing: '-0.5px' }}
                        onClick={() => navigate('/home')}
                    >
                        <span style={{ fontWeight: '800' }}>Eco-TV</span>
                    </span>
                    <div className="d-none d-md-flex align-items-center gap-3">
                        <a href="#showcase" className="apple-nav-link">Catalog</a>
                        <a href="#originals" className="apple-nav-link">Originals</a>
                        <a href="#documentaries" className="apple-nav-link">Documentaries</a>
                        <a href="#support" className="apple-nav-link">FAQ</a>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    {/* Search bar */}
                    <div className="position-relative">
                        <Search size={14} className="position-absolute text-muted" style={{ left: '12px', top: '10px' }} />
                        <input 
                            type="text" 
                            className="apple-search-input" 
                            placeholder="Search originals..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="btn p-0 position-absolute text-muted bg-transparent border-0" 
                                style={{ right: '12px', top: '7px' }}
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* User Profile Avatar */}
                    <div className="rounded-circle border d-flex align-items-center justify-content-center text-white font-monospace fw-bold" style={{ width: '32px', height: '32px', overflow: 'hidden', borderColor: 'rgba(255,255,255,0.2)', fontSize: '13px', background: 'linear-gradient(135deg, #1d1d1f, #434345)' }} title={userProfile.name}>
                        {userProfile.avatar ? (
                            <img src={userProfile.avatar} alt={userProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'
                        )}
                    </div>
                    
                    {/* Exit Link */}
                    <button 
                        className="apple-stream-btn"
                        onClick={() => navigate('/home')}
                    >
                        Back to Store
                    </button>
                </div>
            </nav>

            {/* 2. Hero Billboard Carousel */}
            {currentHero ? (
                <div className="position-relative w-100" style={{ height: '85vh', overflow: 'hidden' }}>
                    {/* Sliding background container */}
                    <div className="w-100 h-100 position-relative">
                        <img 
                            src={currentHero.imageUrl} 
                            alt={currentHero.title} 
                            className="w-100 h-100 position-absolute top-0 start-0"
                            style={{ 
                                objectFit: 'cover',
                                transition: 'opacity 0.8s ease-in-out',
                                transform: `translateY(${scrollY * 0.15}px)` 
                            }} 
                        />
                        {/* Apple-style gradient overlays */}
                        <div 
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ 
                                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%)' 
                            }}
                        />
                        <div 
                            className="position-absolute bottom-0 start-0 w-100"
                            style={{ 
                                height: '350px', 
                                background: 'linear-gradient(to top, #000000 0%, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0) 100%)' 
                            }}
                        />
                    </div>

                    {/* Title and details Overlay */}
                    <div 
                        className="position-absolute start-0 bottom-0 w-100 px-4 px-md-5 pb-5 d-flex flex-column gap-3"
                        style={{ zIndex: 10 }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <span 
                                className="badge rounded-pill px-2.5 py-1"
                                style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.16)', 
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    fontSize: '11px',
                                    letterSpacing: '1.2px',
                                    textTransform: 'uppercase',
                                    fontWeight: '700',
                                    color: '#ffffff'
                                }}
                            >
                                ECO Original
                            </span>
                            <span className="text-light text-opacity-70 small fw-medium">• {currentHero.category}</span>
                        </div>

                        <h1 
                            className="text-white fw-bolder mb-1" 
                            style={{ fontSize: '56px', letterSpacing: '-0.035em', lineHeight: '1.1', maxWidth: '800px', textShadow: '0 2px 16px rgba(0,0,0,0.95)' }}
                        >
                            {currentHero.title}
                        </h1>

                        <p className="text-light fs-5 mb-3" style={{ maxWidth: '650px', fontWeight: '400', lineHeight: '1.4', textShadow: '0 2px 12px rgba(0,0,0,0.95)' }}>
                            {currentHero.description}
                        </p>

                        <div className="d-flex align-items-center gap-3">
                            <button 
                                className="apple-stream-btn px-4 py-2.5 fs-6 d-flex align-items-center gap-2"
                                onClick={() => openPlayer(currentHero)}
                            >
                                <Play size={16} fill="#000" /> Stream Now
                            </button>
                            <button 
                                className="apple-glass-btn px-4 py-2.5 fs-6 d-flex align-items-center gap-2"
                                onClick={() => handleAddListGlobal(currentHero.title)}
                            >
                                <Plus size={16} /> Add to Up Next
                            </button>
                        </div>

                        {/* Carousel Indicators */}
                        {featuredItems.length > 1 && (
                            <div className="d-flex gap-2 mt-4">
                                {featuredItems.map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`hero-carousel-indicator ${idx === featuredIndex ? 'active' : ''}`}
                                        onClick={() => setFeaturedIndex(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {/* 3. Main Catalog Section */}
            <div id="showcase" className="px-4 px-md-5 py-5 bg-black">
                
                {/* Search Results */}
                {searchQuery && (
                    <div className="mb-5">
                        <h4 className="text-white fw-bold mb-4" style={{ letterSpacing: '-0.02em' }}>Search results for "{searchQuery}"</h4>
                        {filteredMedia.length === 0 ? (
                            <p className="text-light text-opacity-70">No Eco-TV content found matching "{searchQuery}".</p>
                        ) : (
                            <div className="d-flex flex-wrap gap-4">
                                {filteredMedia.map(item => (
                                    <AppleCard key={item.id} item={item} onPlay={openPlayer} onInfo={setInfoModalMedia} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* A. Up Next Shelf */}
                {upNextEpisodes.length > 0 && !searchQuery && (
                    <div className="mb-5 shelf-container position-relative">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <h4 className="text-white fw-bold m-0" style={{ letterSpacing: '-0.02em' }}>Up Next</h4>
                            <span className="text-light text-opacity-50 small font-monospace">Progress saved</span>
                        </div>
                        
                        <div 
                            className="d-flex overflow-auto shelf-row py-2"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {upNextEpisodes.map(item => (
                                <AppleCard 
                                    key={item.id} 
                                    item={item} 
                                    onPlay={openPlayer} 
                                    onInfo={setInfoModalMedia} 
                                    isContinueWatching={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* B. Original Docuseries Shelf */}
                {documentSeries.length > 0 && !searchQuery && (
                    <div id="documentaries" className="mb-5 shelf-container position-relative">
                        <h4 className="text-white fw-bold mb-3" style={{ letterSpacing: '-0.02em' }}>Feature Documentaries</h4>
                        <div className="d-flex overflow-auto shelf-row py-2" style={{ scrollBehavior: 'smooth' }}>
                            {documentSeries.map(item => (
                                <AppleCard 
                                    key={item.id} 
                                    item={item} 
                                    onPlay={openPlayer} 
                                    onInfo={setInfoModalMedia} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* C. Eco-TV Shows Shelf */}
                {showsSeries.length > 0 && !searchQuery && (
                    <div id="originals" className="mb-5 shelf-container position-relative">
                        <h4 className="text-white fw-bold mb-3" style={{ letterSpacing: '-0.02em' }}>Exclusive Eco-TV Shows</h4>
                        <div className="d-flex overflow-auto shelf-row py-2" style={{ scrollBehavior: 'smooth' }}>
                            {showsSeries.map(item => (
                                <AppleCard 
                                    key={item.id} 
                                    item={item} 
                                    onPlay={openPlayer} 
                                    onInfo={setInfoModalMedia} 
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Apple TV Style FAQ Accordion */}
                <div id="support" className="my-5 py-5" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div className="mx-auto" style={{ maxWidth: '800px' }}>
                        <div className="text-center mb-5">
                            <span className="badge rounded-pill bg-light bg-opacity-10 text-light text-opacity-70 px-3 py-1.5 mb-2 fw-semibold" style={{ fontSize: '12px' }}>SUPPORT & FAQ</span>
                            <h2 className="text-white fw-bold" style={{ fontSize: '38px', letterSpacing: '-0.025em' }}>Questions? Answers.</h2>
                            <p className="text-light text-opacity-60">Everything you need to know about streaming on Eco-TV.</p>
                        </div>

                        <div className="d-flex flex-column">
                            <AppleAccordionItem 
                                question="What is Eco-TV?"
                                answer="Eco-TV is a premium, carbon-neutral streaming network built directly into Eco-Hive. We offer exclusive award-winning environmental documentaries, climate science shows, and nature blockbusters, focusing on education, preservation, and green technologies."
                                isOpen={openFaqIndex === 0}
                                onToggle={() => toggleFaq(0)}
                            />
                            <AppleAccordionItem 
                                question="How do I watch?"
                                answer="You can stream Eco-TV from any web browser by opening the portal. Selecting a title gives you two options: click 'Stream Now' to instantly launch the high-speed external player, or click 'Add to Up Next' to bookmark the show inside your account queue."
                                isOpen={openFaqIndex === 1}
                                onToggle={() => toggleFaq(1)}
                            />
                            <AppleAccordionItem 
                                question="Can I share Eco-TV with my family?"
                                answer="Absolutely. Eco-TV supports four independent account profiles. Up to four friends or family members can manage their own continue-watching records, queues, and personalization details for free."
                                isOpen={openFaqIndex === 2}
                                onToggle={() => toggleFaq(2)}
                            />
                            <AppleAccordionItem 
                                question="Are the shows really carbon-neutral?"
                                answer="Yes. Beyond producing and curating certified climate-neutral footage, we offset the carbon footprint generated by servers and browser video playback through certified solar and reforestation programs."
                                isOpen={openFaqIndex === 3}
                                onToggle={() => toggleFaq(3)}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* 5. Apple-Style Frosted Detail Drawer Panel */}
            <AnimatePresence>
                {infoModalMedia && (
                    <div className="apple-detail-overlay" onClick={() => setInfoModalMedia(null)}>
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
                            className="apple-detail-panel"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Artwork Banner */}
                            <div className="position-relative w-100" style={{ height: '350px', flexShrink: 0, overflow: 'hidden' }}>
                                <img src={infoModalMedia.imageUrl} alt={infoModalMedia.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, #161617 0%, rgba(22, 22, 23, 0.4) 60%, rgba(0,0,0,0.7) 100%)' }} />
                                
                                <button 
                                    className="btn d-flex align-items-center justify-content-center position-absolute shadow-sm" 
                                    style={{ 
                                        right: '20px', 
                                        top: '20px', 
                                        zIndex: 10, 
                                        backgroundColor: '#ffffff', 
                                        border: '2px solid #1d9e75', 
                                        borderRadius: '20px', 
                                        padding: '6px 14px',
                                        color: '#1d9e75',
                                        fontWeight: '600',
                                        fontSize: '12px',
                                        transition: 'all 0.2s ease'
                                    }} 
                                    onClick={() => setInfoModalMedia(null)}
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
                                    Back to Catalog
                                </button>

                                <div className="position-absolute px-4 pb-3 w-100" style={{ left: 0, bottom: 0, zIndex: 2 }}>
                                    <span 
                                        className="badge rounded-pill px-2.5 py-1 mb-2 fw-semibold" 
                                        style={{ 
                                            fontSize: '10px', 
                                            backgroundColor: '#1d9e75', 
                                            color: '#ffffff',
                                            letterSpacing: '1.2px',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        ECO ORIGINAL
                                    </span>
                                    <h3 className="text-white fw-bold mb-1" style={{ fontSize: '32px', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>{infoModalMedia.title}</h3>
                                    <p className="small mb-0" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>{infoModalMedia.type} • {infoModalMedia.duration} • {infoModalMedia.rating} • {infoModalMedia.releaseYear}</p>
                                </div>
                            </div>

                            {/* Info Details Section */}
                            <div className="p-4 overflow-auto flex-grow-1" style={{ backgroundColor: '#161617' }}>
                                <div className="row g-4">
                                    <div className="col-12 col-md-8">
                                        <h6 className="text-white fw-bold mb-2">Description</h6>
                                        <p className="fs-6 lh-base mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{infoModalMedia.description}</p>
                                        
                                        <div className="d-flex align-items-center gap-3">
                                            <button 
                                                className="apple-stream-btn px-4 py-2.5 fs-6 d-flex align-items-center gap-2"
                                                onClick={() => {
                                                    setInfoModalMedia(null);
                                                    openPlayer(infoModalMedia);
                                                }}
                                            >
                                                <Play size={16} fill="#000" /> Play Show
                                            </button>
                                            <button 
                                                className="apple-glass-btn px-3 py-2 fs-6 d-flex align-items-center gap-1.5"
                                                onClick={() => handleAddListGlobal(infoModalMedia.title)}
                                            >
                                                <Plus size={16} /> Up Next
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4 apple-detail-sidebar" style={{ borderLeft: 'none' }}>
                                        <div className="ps-0 ps-md-3">
                                            <h6 className="text-white fw-bold mb-1">Cast</h6>
                                            <p className="small mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{infoModalMedia.cast}</p>
                                            
                                            <h6 className="text-white fw-bold mb-1">Category</h6>
                                            <p className="small mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{infoModalMedia.category}</p>

                                            <h6 className="text-white fw-bold mb-1">Maturity Rating</h6>
                                            <p className="small mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{infoModalMedia.rating} (Suitable for general audiences)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default EcoTV;
