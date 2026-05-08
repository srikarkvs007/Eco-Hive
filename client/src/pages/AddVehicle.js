import Navbar from '../components/Navbar';
import axios from 'axios';
import {useState} from 'react';

function AddVehicle()
{
    const [vehicleNumber,setVehicleNumber] = useState('');
    const [driverName,setDriverName] = useState('');
    const [vehicleType,setVehicleType] = useState('');

    const addVehicle = async() => {

        await axios.post(
            'http://localhost:5001/api/vehicles/add',
            {
                vehicleNumber,
                driverName,
                vehicleType
            }
        );

        alert('Vehicle Added');
    }

    return(

        <div>

            <Navbar/>

            <div className='container mt-5'>

                <div className='card p-4 shadow'>

                    <h2>Add Vehicle</h2>

                    <input
                    type='text'
                    className='form-control mt-3'
                    placeholder='Vehicle Number'
                    onChange={(e)=>setVehicleNumber(e.target.value)}
                    />

                    <input
                    type='text'
                    className='form-control mt-3'
                    placeholder='Driver Name'
                    onChange={(e)=>setDriverName(e.target.value)}
                    />

                    <select
                    className='form-control mt-3'
                    onChange={(e)=>setVehicleType(e.target.value)}
                    >

                        <option>Select Vehicle</option>
                        <option>Van</option>
                        <option>Truck</option>

                    </select>

                    <button
                    className='btn btn-success mt-3'
                    onClick={addVehicle}>
                        Add Vehicle
                    </button>

                </div>

            </div>

        </div>
    )
}

export default AddVehicle;