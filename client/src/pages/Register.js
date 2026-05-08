import axios from 'axios';
import { useState } from 'react';

function Register() {

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
                    password: password
                }
            );

            console.log(response.data);

            alert("Register Success");

        }
        catch (error) {

            console.log(error);

            alert("Register Failed");
        }
    };

    return (

        <div className="container mt-5">

            <div className="card p-4">

                <h1>Register</h1>

                <input
                    type="text"
                    placeholder="Name"
                    className="form-control mt-3"
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="form-control mt-3"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="form-control mt-3"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="btn btn-success mt-3"
                    onClick={registerUser}
                >
                    Register
                </button>

            </div>

        </div>
    );
}

export default Register;