import axios from 'axios';
import {useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';

function Login()
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
                {
                    email,
                    password
                }
            );

            console.log(res.data);

            if(res.data.token)
            {
                localStorage.setItem('token',res.data.token);
                localStorage.setItem('userId',res.data.user.id);
                localStorage.setItem('role',res.data.user.role);
                localStorage.setItem('email',res.data.user.email);
                localStorage.setItem('name',res.data.user.name);

                // Short delay so the user sees the smooth transition
                setTimeout(() => {
                    if (res.data.user.role === 'Admin') {
                        navigate('/dashboard');
                    } else {
                        navigate('/home');
                    }
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
            console.log(error);
            alert("Backend not responding");
        }
    }

    return(
        <div className='d-flex flex-column align-items-center bg-white min-vh-100 pt-5 position-relative'>
            <Link to="/admin-login" className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-4 rounded-pill fw-medium px-3 shadow-sm" style={{ transition: 'all 0.2s' }}>
                <span className="me-2">⚙️</span> Logistics Admin
            </Link>

            {/* Logo Section */}
            <div className="mb-4 text-center mt-3">
                <img src="/images/logo-circle.png" alt="Eco-Hive" style={{ width: '150px' }} />
            </div>

            {/* Login Card */}
            <div className='card p-4 rounded-3' style={{ width: '100%', maxWidth: '350px', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 className='fw-normal mb-3' style={{ fontSize: '28px' }}>Sign in</h3>

                <div className="mb-3">
                    <label className="form-label fw-bold small mb-1">Email or mobile phone number</label>
                    <input
                        type='email'
                        className='form-control'
                        style={{ border: '1px solid #a6a6a6', borderRadius: '3px', padding: '6px 10px' }}
                        onChange={(e)=>setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold small mb-1">Password</label>
                    <input
                        type='password'
                        className='form-control'
                        style={{ border: '1px solid #a6a6a6', borderRadius: '3px', padding: '6px 10px' }}
                        onChange={(e)=>setPassword(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <button
                    className='btn w-100 mb-3'
                    style={{ backgroundColor: '#FFD814', border: '1px solid #FCD200', borderRadius: '8px', boxShadow: '0 2px 5px rgba(213,217,217,.5)', padding: '6px 0', fontSize: '14px', color: '#0F1111' }}
                    onClick={loginUser}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Signing in...
                        </>
                    ) : (
                        'Continue'
                    )}
                </button>

                <p className="small text-muted mb-4" style={{ lineHeight: '1.4' }}>
                    By continuing, you agree to Eco-Hive's <Link to="/legal" className="text-decoration-none">Conditions of Use</Link> and <Link to="/legal" className="text-decoration-none">Privacy Notice</Link>.
                </p>

                <div className="d-flex align-items-center mb-3">
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }}></div>
                    <div className="px-2 small text-muted" style={{ fontSize: '12px' }}>New to Eco-Hive?</div>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e7e7e7' }}></div>
                </div>

                <button 
                    className="btn w-100" 
                    style={{ backgroundColor: '#fff', border: '1px solid #d5d9d9', borderRadius: '8px', boxShadow: '0 2px 5px rgba(213,217,217,.5)', padding: '6px 0', fontSize: '14px', color: '#0F1111' }}
                    onClick={() => navigate('/register')}
                >
                    Create your Eco-Hive account
                </button>
            </div>
        </div>
    )
}

export default Login;