import Navbar from '../components/Navbar';

function Dashboard()
{
    return(

        <div>

            <Navbar/>

            <div className='container mt-5'>

                <div className='row'>

                    <div className='col-md-4'>

                        <div className='card p-4 shadow'>

                            <h3>Total Orders</h3>

                            <h1>120</h1>

                        </div>

                    </div>

                    <div className='col-md-4'>

                        <div className='card p-4 shadow'>

                            <h3>Active Vans</h3>

                            <h1>15</h1>

                        </div>

                    </div>

                    <div className='col-md-4'>

                        <div className='card p-4 shadow'>

                            <h3>Active Drones</h3>

                            <h1>8</h1>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Dashboard;