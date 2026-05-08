import {Link} from 'react-router-dom';

function Navbar()
{
    return(

        <nav className='navbar navbar-dark bg-dark navbar-expand-lg'>

            <div className='container-fluid'>

                <Link className='navbar-brand' to='/dashboard'>
                    Eco-Hive
                </Link>

                <div>

                    <Link className='btn btn-outline-light m-2' to='/addorder'>
                        Add Order
                    </Link>

                    <Link className='btn btn-outline-light m-2' to='/orders'>
                        Orders
                    </Link>

                    <Link className='btn btn-outline-light m-2' to='/vehicle'>
                        Vehicles
                    </Link>

                </div>

            </div>

        </nav>
    )
}

export default Navbar;