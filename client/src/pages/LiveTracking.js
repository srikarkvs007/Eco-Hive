import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

// Custom CSS for emoji markers
const getEmojiIcon = (mode, isPremium) => {
    let emoji = '📦';
    if (mode === 'Van') emoji = '🚚';
    else if (mode === 'Drone') emoji = '🚁';
    else if (mode === 'Drone Swarm') emoji = '🚁🚁';

    return L.divIcon({
        className: 'custom-emoji-icon',
        html: `<div style="font-size: 24px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); ${isPremium ? 'color: gold;' : ''}">${emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};

function LiveTracking() {
    const [deliveries, setDeliveries] = useState([]);

    useEffect(() => {
        socket.on('live_locations', (activeDeliveries) => {
            setDeliveries(activeDeliveries);
        });

        return () => {
            socket.off('live_locations');
        };
    }, []);

    // Center map around Paris (Dispatch Hub)
    const center = [48.8566, 2.3522];

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <Navbar />
            <div className="container-fluid flex-grow-1 d-flex flex-column p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="fw-bold m-0">🛰️ Live Tracking Radar</h2>
                    <span className="badge bg-success p-2 fs-6">
                        <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>
                        {deliveries.length} Active Deliveries
                    </span>
                </div>
                
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden flex-grow-1" style={{ minHeight: '600px' }}>
                    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                        />
                        
                        {deliveries.map(d => (
                            <Marker 
                                key={d.id} 
                                position={[d.lat, d.lng]}
                                icon={getEmojiIcon(d.mode, d.isPremium)}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong className="fs-6">{d.mode} {d.isPremium && '⭐'}</strong><br/>
                                        <span className="text-muted small">ID: {d.id}</span><br/>
                                        <hr className="my-1"/>
                                        <span className="small">To: <strong>{d.drop}</strong></span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default LiveTracking;
