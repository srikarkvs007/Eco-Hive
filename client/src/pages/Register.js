import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {

    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const registerUser = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5001/api/users/register',
                {
                    name: name,
                    email: email,
                    password: password,
                    role: 'User' // Hardcode to User, Admins cannot publicly register
                }
            );

            console.log(response.data);
            alert("Register Success");
            navigate('/');
        } catch (error) {
            console.log(error);
            alert("Register Failed");
        }
    };

    return (
        <div className="d-flex flex-column align-items-center min-vh-100 pt-5" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            <div className="mb-4 text-center mt-3">
                <img src={process.env.PUBLIC_URL + "/images/logo-circle.png"} alt="Eco-Hive" style={{ width: '150px' }} />
            </div>

            <div className="glass-panel p-4 rounded-4" style={{ width: '100%', maxWidth: '350px' }}>
                <h3 className="fw-bold mb-3">Create account</h3>

                <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Your name</label>
                    <input
                        type="text"
                        className="form-control bg-light border-0"
                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Email</label>
                    <input
                        type="email"
                        className="form-control bg-light border-0"
                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold small mb-1">Password</label>
                    <input
                        type="password"
                        className="form-control bg-light border-0"
                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className="btn w-100 mb-4 text-white shadow-sm"
                    style={{ backgroundColor: 'var(--accent-color, #1D9E75)', borderRadius: '8px', padding: '10px 0', fontSize: '15px', fontWeight: '500' }}
                    onClick={registerUser}
                >
                    Verify email
                </button>

                <p className="small text-muted mb-4" style={{ lineHeight: '1.4' }}>
                    By creating an account, you agree to Eco-Hive's <Link to="/legal" className="text-decoration-none">Conditions of Use</Link> and <Link to="/legal" className="text-decoration-none">Privacy Notice</Link>.
                </p>

                <div className="d-flex align-items-center mb-3">
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }}></div>
                </div>

                <div className="small">
                    Already have an account? <Link to="/" className="text-decoration-none">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;