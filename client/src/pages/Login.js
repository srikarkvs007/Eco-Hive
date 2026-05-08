import axios from 'axios';
import {useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';

function Login()
{
    const navigate = useNavigate();

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');

    const loginUser = async() => {

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

                alert('Login Success');

                navigate('/dashboard');
            }
            else
            {
                alert(res.data.message);
            }
        }
        catch(error)
        {
            console.log(error);

            alert("Backend not responding");
        }
    }

    return(

        <div className='container mt-5'>

            <div className='card p-4 shadow'>

                <h2>Login</h2>

                <input
                type='email'
                className='form-control mt-3'
                placeholder='Email'
                onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                type='password'
                className='form-control mt-3'
                placeholder='Password'
                onChange={(e)=>setPassword(e.target.value)}
                />

                <button
                className='btn btn-primary mt-3'
                onClick={loginUser}>
                    Login
                </button>

                <Link to='/register' className='mt-3'>
                    New User? Register
                </Link>

            </div>

        </div>
    )
}

export default Login;