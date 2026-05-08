import Navbar from '../components/Navbar';
import axios from 'axios';
import {useEffect,useState} from 'react';

function ViewOrders()
{
    const [orders,setOrders] = useState([]);

    useEffect(()=>{

        axios.get('http://localhost:5001/api/orders/all')
        .then((res)=>setOrders(res.data));

    },[])

    return(

        <div>

            <Navbar/>

            <div className='container mt-5'>

                <h2>Orders</h2>

                <table className='table table-bordered mt-4'>

                    <thead>

                        <tr>

                            <th>Pickup</th>
                            <th>Drop</th>
                            <th>Package</th>
                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            orders.map((order,index)=>(

                                <tr key={index}>

                                    <td>{order.pickupLocation}</td>
                                    <td>{order.dropLocation}</td>
                                    <td>{order.packageType}</td>
                                    <td>{order.status}</td>

                                </tr>
                            ))
                        }

                    </tbody>

                </table>

            </div>

        </div>
    )
}

export default ViewOrders;