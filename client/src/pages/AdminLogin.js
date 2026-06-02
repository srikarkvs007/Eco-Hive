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
                'http://localhost:5001/api/v1/auth/login',
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
                
                const themePref = res.data.user.themePreference || 'light';
                localStorage.setItem('theme', themePref);
                if (themePref === 'dark') {
                    document.body.setAttribute('data-theme', 'dark');
                } else {
                    document.body.removeAttribute('data-theme');
                }

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
        <div className='d-flex flex-column align-items-center min-vh-100 pt-5 position-relative' style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            <Link to="/" className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-4 rounded-pill fw-medium px-3 shadow-sm" style={{ transition: 'all 0.2s' }}>
                <span className="me-2">←</span> Store Login
            </Link>

            {/* Logo Section */}
            <div className="mb-4 text-center mt-3">
                <img src="/images/logo-circle.png" alt="Eco-Hive" style={{ width: '150px' }} />
                <h6 className="text-muted text-uppercase tracking-wider mt-3" style={{ letterSpacing: '2px', fontSize: '12px' }}>Admin Portal</h6>
            </div>

            {/* Login Card */}
            <div className='glass-panel p-4 rounded-4' style={{ width: '100%', maxWidth: '350px' }}>
                <h3 className='fw-bold mb-3'>Admin Sign In</h3>

                <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Admin Email</label>
                    <input
                        type='email'
                        className='form-control bg-light border-0'
                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                        onChange={(e)=>setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold small mb-1">Master Password</label>
                    <input
                        type='password'
                        className='form-control bg-light border-0'
                        style={{ padding: '10px 14px', borderRadius: '8px' }}
                        onChange={(e)=>setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <button
                    className='btn w-100 mb-3 text-white shadow-sm'
                    style={{ backgroundColor: 'var(--accent-color, #1D9E75)', borderRadius: '8px', padding: '10px 0', fontSize: '15px', fontWeight: '500' }}
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

                <p className="small text-muted mb-0" style={{ lineHeight: '1.4' }}>
                    Access is restricted to authorized Eco-Hive administrators. All actions are logged and monitored.
                </p>
            </div>
        </div>
    )
}

export default AdminLogin;
