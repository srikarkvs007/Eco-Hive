import axios from 'axios';
import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';

function AdminLogin()
{
    const navigate = useNavigate();

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loginUser = async() => {
        setIsLoading(true);

        try
        {
            const res = await axios.post(
                'http://localhost:5001/api/users/login',
                { email, password }
            );

            if(res.data.token)
            {
                if (res.data.user.role !== 'Admin') {
                    setIsLoading(false);
                    alert("Access Denied: You do not have Administrator privileges.");
                    return;
                }

                localStorage.setItem('token',res.data.token);
                localStorage.setItem('userId',res.data.user.id);
                localStorage.setItem('role',res.data.user.role);
                localStorage.setItem('email',res.data.user.email);
                localStorage.setItem('name',res.data.user.name);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            }
            else
            {
                setIsLoading(false);
                alert(res.data.message);
            }
        }
        catch(error)
        {
            setIsLoading(false);
            alert("Backend not responding");
        }
    }

    return(
        <div className='d-flex flex-column align-items-center bg-dark min-vh-100 pt-5 position-relative'>
            <Link to="/" className="position-absolute text-decoration-none text-light d-flex align-items-center fw-medium" style={{ top: '25px', left: '25px', opacity: 0.8 }}>
                <span className="me-2" style={{ fontSize: '20px' }}>←</span> Go Back
            </Link>
            
            {/* Logo Section */}
            <div className="mb-4 text-center">
                <h2 className="fw-bolder text-white" style={{ letterSpacing: '-0.5px' }}>
                    <span className="text-success">🌿 Eco</span>-Hive
                </h2>
                <h6 className="text-muted text-uppercase tracking-wider">Logistics Control Center</h6>
            </div>

            {/* Login Card */}
            <div className='card p-4 rounded-4 bg-dark text-light border-secondary' style={{ width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <h3 className='fw-bold mb-4 text-center' style={{ fontSize: '24px' }}>Admin Authentication</h3>

                <div className="mb-3">
                    <label className="form-label fw-medium small mb-1 text-muted">Admin Email</label>
                    <input
                        type='email'
                        className='form-control bg-dark text-light border-secondary'
                        style={{ padding: '10px 15px' }}
                        onChange={(e)=>setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label fw-medium small mb-1 text-muted">Master Password</label>
                    <input
                        type='password'
                        className='form-control bg-dark text-light border-secondary'
                        style={{ padding: '10px 15px' }}
                        onChange={(e)=>setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <button
                    className='btn btn-success py-2 w-100 fw-bold mb-3'
                    onClick={loginUser}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Authenticating...
                        </>
                    ) : (
                        'Secure Login'
                    )}
                </button>

                <div className="text-center mt-3">
                    <Link to="/" className="text-muted small text-decoration-none hover-white">
                        ← Back to User Store
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin;
