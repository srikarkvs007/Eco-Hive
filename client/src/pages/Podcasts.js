import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Podcasts = () => {
    const navigate = useNavigate();
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPodcast, setSelectedPodcast] = useState('All');
    
    // Audio Player State
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    
    const audioRef = useRef(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchPodcasts();
    }, [userId]);

    useEffect(() => {
        // Sync HTML5 Audio element parameters
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const fetchPodcasts = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/entertainment/podcasts');
            setEpisodes(res.data);
        } catch (err) {
            console.error("Error loading podcasts:", err);
            toast.error("Failed to load podcasts directory.");
        } finally {
            setLoading(false);
        }
    };

    const podcastNames = ['All', ...new Set(episodes.map(e => e.podcastName))];
    const filteredEpisodes = selectedPodcast === 'All' 
        ? episodes 
        : episodes.filter(e => e.podcastName === selectedPodcast);

    // Audio Playback Handlers
    const handleEpisodePlay = (episode) => {
        if (currentEpisode?.id === episode.id) {
            // Toggle play
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
                setIsPlaying(true);
            }
        } else {
            setCurrentEpisode(episode);
            setIsPlaying(true);
            setCurrentTime(0);
            setDuration(0);
            
            // Set source and play
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.src = episode.audioUrl;
                    audioRef.current.volume = volume;
                    audioRef.current.play().catch(e => console.log("Audio play error:", e));
                }
            }, 100);
        }
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log("Audio play error:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const handleScrubChange = (e) => {
        const val = parseFloat(e.target.value);
        setCurrentTime(val);
        if (audioRef.current) {
            audioRef.current.currentTime = val;
        }
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
            audioRef.current.muted = val === 0;
            setIsMuted(val === 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        } else {
            setIsMuted(!isMuted);
        }
    };

    const changeSpeed = () => {
        const speeds = [1, 1.25, 1.5, 2];
        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIdx]);
    };

    // Formatter for audio player elapsed/total time MM:SS
    const formatTime = (secs) => {
        if (isNaN(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Eco-Hive Podcasts | Climate, Tech & Green Living Podcasts" 
                description="Listen to the latest audio episodes on sustainability, environmental science, green tech, and waste-free lifestyles." 
            />
            <Navbar />

            <div className="container flex-grow-1" style={{ maxWidth: '1000px', paddingTop: '150px', paddingBottom: '160px' }}>
                
                {/* Header */}
                <div className="text-center mb-5">
                    <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 mb-3 fw-bold border border-success border-opacity-25"
                    >
                        🎙️ Sustainability Audio Network
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.025em' }}
                    >
                        Eco-Hive Podcasts
                    </motion.h1>
                    <p className="text-muted fs-5">Stream insightful conversations with leading climate experts, green tech developers, and organic farmers.</p>

                    {/* Filter categories */}
                    <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
                        {podcastNames.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedPodcast(name)}
                                className={`btn rounded-pill px-4 py-2 btn-sm fw-medium transition-all ${selectedPodcast === name ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                style={{ fontSize: '13px' }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status"></div>
                        <h6 className="mt-3 text-muted">Loading podcasts...</h6>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredEpisodes.map((ep, idx) => {
                            const isCurrent = currentEpisode?.id === ep.id;
                            return (
                                <div className="col-12 col-md-6" key={ep.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className="card border-0 rounded-5 p-4 shadow-sm h-100 d-flex flex-row gap-4"
                                        style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                                    >
                                        <div className="flex-shrink-0" style={{ width: '90px', height: '90px' }}>
                                            <img src={ep.imageUrl} alt={ep.podcastName} className="rounded-4 w-100 h-100 shadow-sm" style={{ objectFit: 'cover' }} />
                                        </div>

                                        <div className="flex-grow-1 d-flex flex-column justify-content-center">
                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1 mb-2 align-self-start fw-bold" style={{ fontSize: '10px' }}>
                                                {ep.podcastName}
                                            </span>
                                            <h6 className="fw-bolder text-dark mb-1" style={{ fontSize: '15px', lineHeight: '1.4' }}>{ep.title}</h6>
                                            <p className="text-muted small mb-3 text-truncate-2" style={{ fontSize: '12px', lineHeight: '1.4' }}>{ep.description}</p>
                                            
                                            <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                                                <div className="small text-muted" style={{ fontSize: '11px' }}>
                                                    👤 {ep.host} • ⏱ {ep.duration}
                                                </div>
                                                <button 
                                                    className={`btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 ${isCurrent && isPlaying ? 'btn-success' : 'btn-dark'}`}
                                                    style={{ width: '32px', height: '32px' }}
                                                    onClick={() => handleEpisodePlay(ep)}
                                                >
                                                    {isCurrent && isPlaying ? '⏸' : '▶'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Hidden HTML5 Audio Element */}
            <audio 
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
            />

            {/* Persistent bottom audio player dock */}
            <AnimatePresence>
                {currentEpisode && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed-bottom w-100 p-3 px-md-5 d-flex flex-column flex-md-row align-items-center gap-3 justify-content-between shadow-lg"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(20px)',
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                            zIndex: 1060
                        }}
                    >
                        {/* Artwork & details */}
                        <div className="d-flex align-items-center gap-3 w-100 flex-grow-1" style={{ maxWidth: '320px' }}>
                            <img src={currentEpisode.imageUrl} alt={currentEpisode.title} className="rounded shadow-sm" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                            <div className="overflow-hidden">
                                <h6 className="fw-bolder text-dark mb-0 text-truncate" style={{ fontSize: '14px' }}>{currentEpisode.title}</h6>
                                <span className="small text-muted text-truncate d-block" style={{ fontSize: '11px' }}>{currentEpisode.podcastName} • {currentEpisode.host}</span>
                            </div>
                        </div>

                        {/* Middle Controls (Play, Scrub progress) */}
                        <div className="d-flex flex-column align-items-center gap-1 w-100 flex-grow-1" style={{ maxWidth: '500px' }}>
                            <div className="d-flex align-items-center gap-3">
                                <button className="btn btn-sm text-dark fs-5 p-0" onClick={handlePlayPause} style={{ border: 'none', background: 'transparent' }}>
                                    {isPlaying ? '⏸' : '▶'}
                                </button>
                            </div>
                            <div className="d-flex align-items-center gap-2 w-100 text-muted small" style={{ fontSize: '11px' }}>
                                <span>{formatTime(currentTime)}</span>
                                <input 
                                    type="range" 
                                    className="form-range flex-grow-1"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime}
                                    onChange={handleScrubChange}
                                    style={{ height: '4px', cursor: 'pointer' }}
                                />
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Right side Controls (Volume, Speed) */}
                        <div className="d-flex align-items-center justify-content-end gap-3 w-100 flex-grow-1" style={{ maxWidth: '280px' }}>
                            {/* Speed button */}
                            <button 
                                className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 fw-bold" 
                                style={{ fontSize: '10px', height: '24px', lineHeight: '1' }}
                                onClick={changeSpeed}
                            >
                                {playbackSpeed}x
                            </button>

                            {/* Volume bar */}
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-sm text-dark p-0 fs-6" onClick={toggleMute} style={{ border: 'none', background: 'transparent' }}>
                                    {isMuted ? '🔇' : '🔊'}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    style={{ width: '70px', height: '3px', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Podcasts;
