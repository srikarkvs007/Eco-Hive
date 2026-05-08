import Navbar from '../components/Navbar';
import axios from 'axios';
import {useState} from 'react';

function AddOrder()
{
    const [pickupLocation,setPickupLocation] = useState('');
    const [dropLocation,setDropLocation] = useState('');
    const [packageType,setPackageType] = useState('');
    const [deliveryMode,setDeliveryMode] = useState('');

    const addOrder = async() => {

        await axios.post(
            'http://localhost:5001/api/orders/add',
            {
                pickupLocation,
                dropLocation,
                packageType,
                deliveryMode
            }
        );

        alert('Order Added');
    }

    return(

        <div>

            <Navbar/>

            <div className='container mt-5'>

                <div className='card p-4 shadow'>

                    <h2>Add Order</h2>

                    <input
                    type='text'
                    className='form-control mt-3'
                    placeholder='Pickup Location'
                    onChange={(e)=>setPickupLocation(e.target.value)}
                    />

                    <input
                    type='text'
                    className='form-control mt-3'
                    placeholder='Drop Location'
                    onChange={(e)=>setDropLocation(e.target.value)}
                    />

                    <input
                    type='text'
                    className='form-control mt-3'
                    placeholder='Package Type'
                    onChange={(e)=>setPackageType(e.target.value)}
                    />

                    <select
                    className='form-control mt-3'
                    onChange={(e)=>setDeliveryMode(e.target.value)}
                    >

                        <option>Select Delivery Mode</option>
                        <option>Van</option>
                        <option>Drone</option>

                    </select>

                    <button
                    className='btn btn-primary mt-3'
                    onClick={addOrder}>
                        Submit
                    </button>

                </div>

            </div>

        </div>
    )
}

export default AddOrder;