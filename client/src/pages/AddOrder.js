import Navbar from '../components/Navbar';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function AddOrder() {
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropLocation, setDropLocation] = useState('');
    const [packageType, setPackageType] = useState('');
    const [weight, setWeight] = useState('');
    const [sensitivity, setSensitivity] = useState('Standard');
    const [isPremium, setIsPremium] = useState(false);
    
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState('');
    const [scanMethod, setScanMethod] = useState('ocr'); // 'ocr', 'camera', or 'qr'
    const [pendingStoreOrders, setPendingStoreOrders] = useState([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Method 1: File Upload OCR (Using Gemini LLM)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await axios.post('http://localhost:5001/api/orders/scan', {
                    imageBase64: reader.result
                });
                
                const data = res.data;
                if (data.pickupLocation) setPickupLocation(data.pickupLocation);
                if (data.dropLocation) setDropLocation(data.dropLocation);
                if (data.packageType) setPackageType(data.packageType);
                if (data.weight !== undefined) setWeight(data.weight);
                if (data.sensitivity) setSensitivity(data.sensitivity);
                
                setScanResult(JSON.stringify(data, null, 2));
                alert('Scan Complete! Fields have been auto-filled.');
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || 'Failed to scan image using AI.');
            } finally {
                setIsScanning(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Method 2: Live Camera OCR (Using Gemini LLM)
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please ensure you have granted permission.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const captureAndScan = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setIsScanning(true);
        
        try {
            const res = await axios.post('http://localhost:5001/api/orders/scan', {
                imageBase64: imageDataUrl
            });
            
            const data = res.data;
            if (data.pickupLocation) setPickupLocation(data.pickupLocation);
            if (data.dropLocation) setDropLocation(data.dropLocation);
            if (data.packageType) setPackageType(data.packageType);
            if (data.weight !== undefined) setWeight(data.weight);
            if (data.sensitivity) setSensitivity(data.sensitivity);
            
            setScanResult(JSON.stringify(data, null, 2));
            alert('Scan Complete! Fields have been auto-filled.');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to scan camera frame using AI.');
        } finally {
            setIsScanning(false);
        }
    };

    // Legacy Parser for QR Code text
    const parseQRText = (rawText) => {
        setScanResult(rawText);
        let text = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        
        const pickupKeys = ['pickup', 'pckup', 'pick up'];
        const dropKeys = ['drop', 'prop', 'dest', 'to '];
        const pkgKeys = ['package', 'vackage', 'type', 'item'];
        const weightKeys = ['weight', 'weigh', 'wt'];
        const sensKeys = ['sens', 'sthvity', 'fragile', 'hazard', 'stando'];

        const findIdx = (keys) => {
            let minIdx = -1;
            keys.forEach(k => {
                const idx = text.toLowerCase().indexOf(k);
                if (idx !== -1 && (minIdx === -1 || idx < minIdx)) minIdx = idx;
            });
            return minIdx;
        };

        const indices = [
            { name: 'pickup', idx: findIdx(pickupKeys) },
            { name: 'drop', idx: findIdx(dropKeys) },
            { name: 'pkg', idx: findIdx(pkgKeys) },
            { name: 'weight', idx: findIdx(weightKeys) },
            { name: 'sens', idx: findIdx(sensKeys) }
        ].filter(x => x.idx !== -1).sort((a, b) => a.idx - b.idx);

        if (indices.length === 0) return;

        indices.forEach((item, i) => {
            const start = item.idx;
            const end = i < indices.length - 1 ? indices[i+1].idx : text.length;
            let val = text.substring(start, end).replace(/^[|;:!\-\s]+|[|;:!\-\s]+$/g, '').trim();
            const separatorMatch = val.match(/^.{0,15}?([:;\-])/);
            if (separatorMatch) val = val.substring(separatorMatch.index + 1).trim();
            else val = val.replace(/^(location|loc|lo\s*tion|lo\s*[a-z0-9]+|type|typ)\s*/i, '').trim();

            if (item.name === 'pickup' && val) setPickupLocation(val);
            if (item.name === 'drop' && val) setDropLocation(val);
            if (item.name === 'pkg' && val) setPackageType(val);
            if (item.name === 'weight') {
                const match = val.match(/\d+(\.\d+)?/);
                if (match) setWeight(parseFloat(match[0]).toFixed(1));
            }
            if (item.name === 'sens') {
                if (val.toLowerCase().includes('frag')) setSensitivity('Fragile');
                else if (val.toLowerCase().includes('haz')) setSensitivity('Hazardous');
                else setSensitivity('Standard');
            }
        });
        alert('QR Scan Complete!');
    };

    // Method 3: QR Scanner Setup
    useEffect(() => {
        let scanner = null;
        if (scanMethod === 'qr') {
            scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    setScanMethod('none');
                    parseQRText(decodedText);
                },
                (error) => {}
            );
        } else if (scanMethod === 'camera') {
            startCamera();
        }

        return () => {
            if (scanner) scanner.clear().catch(e => console.error(e));
            stopCamera();
        };
    }, [scanMethod]);

    useEffect(() => {
        // Fetch Pending Store Orders
        const fetchStoreOrders = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/customer-orders/all');
                const pending = res.data.filter(o => o.status === 'Paid');
                setPendingStoreOrders(pending);
            } catch (err) {
                console.error('Failed to fetch store orders', err);
            }
        };
        fetchStoreOrders();
    }, []);

    const handleAutoFillStoreOrder = (order) => {
        setPickupLocation('Eco-Hive Main Warehouse');
        setDropLocation(order.shippingAddress || 'Customer Address');
        setPackageType('Eco-Friendly Box');
        
        // Estimate weight based on items
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        setWeight(totalItems * 1.5);
        
        setSensitivity('Standard');
        setIsPremium(true);
        alert(`Auto-filled details for Store Order #${order.id.slice(0,8).toUpperCase()}`);
    };

    const addOrder = async () => {
        try {
            const res = await axios.post(
                'http://localhost:5001/api/orders/add',
                {
                    pickupLocation, dropLocation, packageType,
                    weight: parseFloat(weight) || 0,
                    sensitivity, isPremium
                }
            );

            const assignedMode = res.data.order.deliveryMode;
            const extraFee = res.data.order.extraFee;
            alert(`Order Added! Assigned Delivery: ${assignedMode} ${extraFee > 0 ? `(Extra Fee: $${extraFee})` : ''}`);
            
            // Reset form
            setPickupLocation(''); setDropLocation(''); setPackageType('');
            setWeight(''); setSensitivity('Standard'); setIsPremium(false); setScanResult('');
        } catch (err) {
            console.error(err);
            alert('Failed to add order');
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className='container mt-5'>
                <div className='card border-0 shadow-sm rounded-4 p-5 max-w-2xl mx-auto mb-5'>
                    <h2 className="fw-bold mb-4">Smart Dispatch: Add Order</h2>
                    
                    {/* Store Orders Integration */}
                    {pendingStoreOrders.length > 0 && (
                        <div className="mb-4 p-4 bg-light border border-primary rounded-3">
                            <h6 className="fw-bold text-primary mb-3">🛒 Pending Store Orders (Click to Dispatch)</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {pendingStoreOrders.map(order => (
                                    <button 
                                        key={order.id} 
                                        className="btn btn-outline-primary rounded-pill btn-sm fw-medium"
                                        onClick={() => handleAutoFillStoreOrder(order)}
                                    >
                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-4 p-4 bg-white border rounded-3 shadow-sm">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                            <h5 className="fw-bold text-primary mb-3 mb-md-0">📸 Smart Scanner</h5>
                            <div className="btn-group" role="group">
                                <button type="button" className={`btn btn-sm ${scanMethod === 'ocr' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setScanMethod('ocr')}>File Upload</button>
                                <button type="button" className={`btn btn-sm ${scanMethod === 'camera' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setScanMethod('camera')}>Live Camera</button>
                                <button type="button" className={`btn btn-sm ${scanMethod === 'qr' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setScanMethod('qr')}>QR Code</button>
                            </div>
                        </div>

                        {scanMethod === 'ocr' && (
                            <div>
                                <p className="text-muted small">Upload a picture of a shipping label to auto-fill the details.</p>
                                <input type="file" accept="image/*" className="form-control" onChange={handleImageUpload} />
                                {isScanning && <div className="mt-3 text-primary spinner-border spinner-border-sm" role="status"></div>}
                            </div>
                        )}

                        {scanMethod === 'camera' && (
                            <div className="d-flex flex-column align-items-center">
                                <p className="text-muted small">Point your camera at the shipping label to scan the details.</p>
                                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#000' }}></video>
                                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                <button className="btn btn-success mt-3 px-4 rounded-pill" onClick={captureAndScan} disabled={isScanning}>
                                    {isScanning ? 'Scanning...' : '📸 Capture & Scan Label'}
                                </button>
                            </div>
                        )}

                        {scanMethod === 'qr' && (
                            <div id="reader" className="w-100 mt-2"></div>
                        )}
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Pickup Location</label>
                            <input type='text' className='form-control' value={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Drop Location</label>
                            <input type='text' className='form-control' value={dropLocation} onChange={(e)=>setDropLocation(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Package Type (Description)</label>
                            <input type='text' className='form-control' value={packageType} onChange={(e)=>setPackageType(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Weight (kg)</label>
                            <input type='number' step="0.1" className='form-control' value={weight} onChange={(e)=>setWeight(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Sensitivity</label>
                            <select className='form-select' value={sensitivity} onChange={(e)=>setSensitivity(e.target.value)}>
                                <option value="Standard">Standard</option>
                                <option value="Fragile">Fragile</option>
                                <option value="Hazardous">Hazardous</option>
                            </select>
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                            <div className="form-check form-switch fs-5 mb-2">
                                <input className="form-check-input" type="checkbox" role="switch" id="premiumSwitch" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
                                <label className="form-check-label ms-2 fw-medium text-warning" htmlFor="premiumSwitch">
                                    ⭐ Premium (Force Drone Swarm)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 alert alert-info border-0">
                        <strong>Smart Routing Engine:</strong> 
                        <ul className="mb-0 mt-2 small">
                            <li>Packages under 5kg route to <strong>Drone</strong>.</li>
                            <li>Packages over 5kg route to <strong>Van</strong>.</li>
                            <li>Fragile/Hazardous strictly route to <strong>Van</strong>.</li>
                            <li>If Premium is selected on heavy items, system dispatches a <strong>Multi-Drone Swarm</strong> ($10/extra drone).</li>
                        </ul>
                    </div>

                    <button className='btn premium-btn w-100 py-3 fs-5 mt-3' onClick={addOrder}>
                        Calculate Route & Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddOrder;