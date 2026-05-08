import {BrowserRouter,Routes,Route} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddOrder from './pages/AddOrder';
import ViewOrders from './pages/ViewOrders';
import AddVehicle from './pages/AddVehicle';

function App()
{
    return(

        <BrowserRouter>

            <Routes>

                <Route path='/' element={<Login/>}/>
                <Route path='/register' element={<Register/>}/>
                <Route path='/dashboard' element={<Dashboard/>}/>
                <Route path='/addorder' element={<AddOrder/>}/>
                <Route path='/orders' element={<ViewOrders/>}/>
                <Route path='/vehicle' element={<AddVehicle/>}/>

            </Routes>

        </BrowserRouter>
    )
}

export default App;