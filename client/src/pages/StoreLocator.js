import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// Leaflet custom icon generator for stores
const getStoreIcon = (isActive) => {
    return L.divIcon({
        className: 'custom-store-icon',
        html: `<div style="font-size: 32px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35)); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform: ${isActive ? 'scale(1.25) translateY(-6px)' : 'scale(1.0)'};">🏪</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

// Component to dynamically pan/zoom map on selection
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 14, {
                animate: true,
                duration: 1.2
            });
        }
    }, [center, zoom, map]);
    return null;
};

const STORES = [
    {
        id: 'Region-Central',
        name: 'Central Paris Hub',
        region: 'Central',
        address: '4 Rue de Rivoli, 75001 Paris, France',
        phone: '+33 1 42 77 34 56',
        email: 'central-hub@ecohive.com',
        hours: '8:00 AM - 10:00 PM',
        lat: 48.8566,
        lng: 2.3522,
        features: ['Solar-Powered charging station', 'Drone delivery dispatch center', 'Packaging recycling deposit point', 'Community sustainable library']
    },
    {
        id: 'Region-North',
        name: 'Montmartre North Hub',
        region: 'North',
        address: '12 Rue de Clignancourt, 75018 Paris, France',
        phone: '+33 1 42 55 12 34',
        email: 'north-hub@ecohive.com',
        hours: '9:00 AM - 8:00 PM',
        lat: 48.8890,
        lng: 2.3475,
        features: ['100% Zero-Waste operations', 'Electric vehicle logistics depot', 'Organic fertilizer pickup point']
    },
    {
        id: 'Region-South',
        name: 'Montparnasse South Hub',
        region: 'South',
        address: '84 Avenue du Maine, 75014 Paris, France',
        phone: '+33 1 45 42 56 78',
        email: 'south-hub@ecohive.com',
        hours: '9:00 AM - 8:00 PM',
        lat: 48.8290,
        lng: 2.3275,
        features: ['Rainwater harvesting system', 'Eco-apparel tailoring & repair shop', 'Refillable cosmetics station']
    },
    {
        id: 'Region-East',
        name: 'Nation East Hub',
        region: 'East',
        address: '250 Rue du Faubourg Saint-Antoine, 75012 Paris, France',
        phone: '+33 1 43 72 89 01',
        email: 'east-hub@ecohive.com',
        hours: '9:00 AM - 8:00 PM',
        lat: 48.8530,
        lng: 2.3980,
        features: ['Vertical indoor community farm', 'Upcycled plastic workstation', 'Biodegradable packaging supply depot']
    },
    {
        id: 'Region-West',
        name: 'Ternes West Hub',
        region: 'West',
        address: '47 Avenue des Ternes, 75017 Paris, France',
        phone: '+33 1 40 55 23 45',
        email: 'west-hub@ecohive.com',
        hours: '9:00 AM - 8:00 PM',
        lat: 48.8785,
        lng: 2.2900,
        features: ['Cinematic eco-education theatre', 'Smart-grid integration', 'FSC certified wooden furniture showroom']
    }
];

const StoreLocator = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedStore, setSelectedStore] = useState(STORES[0]);
    const [mapCenter, setMapCenter] = useState([STORES[0].lat, STORES[0].lng]);
    const [mapZoom, setMapZoom] = useState(13);

    const filteredStores = STORES.filter(store => {
        const matchesRegion = selectedRegion === 'All' || store.region === selectedRegion;
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              store.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesRegion && matchesSearch;
    });

    const handleSelectStore = (store) => {
        setSelectedStore(store);
        setMapCenter([store.lat, store.lng]);
        setMapZoom(14);
    };

    return (
        <div className="bg-light min-vh-100 d-flex flex-column" style={{ transition: 'background-color 0.4s ease' }}>
            <SEO 
                title="Find an Eco-Hive Store | Store Locator" 
                description="Locate nearby sustainable Eco-Hive hubs and experience eco-friendly products in person." 
            />
            <Navbar />
            
            <div className="container flex-grow-1" style={{ maxWidth: '1200px', paddingTop: '150px', paddingBottom: 'var(--spacing-premium)' }}>
                {/* Header */}
                <div className="text-center mb-5">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6 }}
                        className="fw-bolder text-dark mb-2" 
                        style={{ fontSize: '42px', letterSpacing: '-0.025em' }}
                    >
                        Find an Eco-Hive Store
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-muted fs-5"
                    >
                        Visit our eco-hubs to shop conscious products, drop off recycling, or get support.
                    </motion.p>
                </div>

                {/* Main Content Layout */}
                <div className="row g-4">
                    {/* Left Sidebar: Filters and Store Cards */}
                    <div className="col-12 col-lg-5 d-flex flex-column" style={{ maxHeight: '720px' }}>
                        {/* Search and Filters */}
                        <div className="card border-0 rounded-5 p-4 mb-4 shadow-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                            <div className="mb-3">
                                <input 
                                    type="text" 
                                    className="form-control rounded-pill px-4 py-2 border-0 shadow-sm"
                                    placeholder="Search stores or eco-features..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ height: '44px', fontSize: '14px', backgroundColor: 'var(--surface-color)' }}
                                />
                            </div>
                            <div className="d-flex gap-2 flex-wrap">
                                {['All', 'Central', 'North', 'South', 'East', 'West'].map(region => (
                                    <button
                                        key={region}
                                        onClick={() => setSelectedRegion(region)}
                                        className={`btn rounded-pill px-3 py-1 btn-sm fw-medium transition-all ${selectedRegion === region ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                        style={{ fontSize: '12px' }}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Store List */}
                        <div className="flex-grow-1 overflow-auto pe-2" style={{ scrollbarWidth: 'thin' }}>
                            <div className="d-flex flex-column gap-3">
                                <AnimatePresence mode="popLayout">
                                    {filteredStores.map((store, index) => {
                                        const isActive = selectedStore?.id === store.id;
                                        return (
                                            <motion.div
                                                key={store.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                                onClick={() => handleSelectStore(store)}
                                                className="premium-card p-4 rounded-5 cursor-pointer position-relative overflow-hidden"
                                                style={{ 
                                                    border: isActive ? '2px solid var(--accent-blue)' : 'var(--glass-border)',
                                                    backgroundColor: isActive ? 'var(--surface-elevated)' : 'var(--bg-elevated)',
                                                    transition: 'all 0.3s ease',
                                                    transform: isActive ? 'scale(1.01)' : 'scale(1.0)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {isActive && (
                                                    <span className="position-absolute badge bg-success text-white rounded-pill" style={{ top: '24px', right: '24px', fontSize: '11px', padding: '6px 12px' }}>
                                                        Selected
                                                    </span>
                                                )}
                                                <h5 className="fw-bolder text-dark mb-2" style={{ fontSize: '18px' }}>
                                                    {store.name}
                                                </h5>
                                                <p className="text-muted mb-3 small" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                    📍 {store.address}
                                                </p>
                                                <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                                                    <span className="small text-muted me-3" style={{ fontSize: '12px' }}>
                                                        🕒 {store.hours}
                                                    </span>
                                                    <span className="small text-muted" style={{ fontSize: '12px' }}>
                                                        📞 {store.phone}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    {filteredStores.length === 0 && (
                                        <div className="text-center py-5 rounded-5" style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}>
                                            <span style={{ fontSize: '48px' }}>🔍</span>
                                            <h5 className="fw-bold mt-3">No Hubs Found</h5>
                                            <p className="text-muted small">Try refining your search terms or selecting another region.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Map & Detailed selected store card */}
                    <div className="col-12 col-lg-7">
                        <div className="d-flex flex-column gap-4 h-100">
                            {/* Map Container */}
                            <div className="premium-card rounded-5 overflow-hidden shadow-sm shadow-hover" style={{ height: '400px', border: 'var(--glass-border)' }}>
                                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                                    />
                                    <MapController center={mapCenter} zoom={mapZoom} />
                                    {STORES.map(store => (
                                        <Marker 
                                            key={store.id} 
                                            position={[store.lat, store.lng]}
                                            icon={getStoreIcon(selectedStore?.id === store.id)}
                                            eventHandlers={{
                                                click: () => handleSelectStore(store)
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-center p-1">
                                                    <strong style={{ fontSize: '14px' }}>{store.name}</strong><br/>
                                                    <span className="text-muted small">{store.address.split(',')[0]}</span><br/>
                                                    <span className="badge bg-success mt-2" style={{ fontSize: '10px' }}>{store.region} Region</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>

                            {/* Detailed Info Card */}
                            {selectedStore && (
                                <motion.div 
                                    key={selectedStore.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card border-0 rounded-5 p-4 p-md-5 shadow-sm flex-grow-1"
                                    style={{ backgroundColor: 'var(--bg-elevated)', border: 'var(--glass-border)' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div>
                                            <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2 fw-medium" style={{ fontSize: '11px' }}>
                                                {selectedStore.region} Hub
                                            </span>
                                            <h3 className="fw-bolder text-dark m-0" style={{ letterSpacing: '-0.02em', fontSize: '24px' }}>
                                                {selectedStore.name}
                                            </h3>
                                        </div>
                                        <div className="text-end text-muted small" style={{ fontSize: '13px' }}>
                                            <span className="fw-bold text-dark">Timings</span><br/>
                                            {selectedStore.hours}
                                        </div>
                                    </div>

                                    <div className="row g-4 mb-4">
                                        <div className="col-12 col-md-6">
                                            <h6 className="fw-bold text-muted small text-uppercase tracking-wider mb-2">Location Address</h6>
                                            <p className="text-dark fw-medium mb-0" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                                📍 {selectedStore.address}
                                            </p>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <h6 className="fw-bold text-muted small text-uppercase tracking-wider mb-2">Contact Details</h6>
                                            <p className="text-dark fw-medium mb-1" style={{ fontSize: '14px' }}>
                                                📞 {selectedStore.phone}
                                            </p>
                                            <p className="text-dark fw-medium mb-0" style={{ fontSize: '14px' }}>
                                                ✉️ {selectedStore.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h6 className="fw-bold text-muted small text-uppercase tracking-wider mb-3">Green & Sustainable Features</h6>
                                        <div className="row row-cols-1 row-cols-md-2 g-2">
                                            {selectedStore.features.map((feature, i) => (
                                                <div key={i} className="col d-flex align-items-center gap-2">
                                                    <span className="text-success" style={{ fontSize: '18px' }}>🍃</span>
                                                    <span className="text-dark fw-medium" style={{ fontSize: '13px' }}>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default StoreLocator;
