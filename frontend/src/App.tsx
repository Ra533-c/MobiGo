import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from './pages/Login';
import Home from './pages/Home';
import ProtectedRoute from './components/protectedRoute';
import PublicRoute from './components/publicRoute';
import SelectRole from './pages/SelectRole';
import Navbar from "./components/Navbar"
import Account from './pages/Account';
import Cart from './pages/Cart';
import { useAppData } from './context/AppContext';
import Restaurant from './pages/Restaurant';
import RestaurantPage from "./pages/RestaurantPage";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";


const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return <h1 className="text-2xl font-bold text-black text-center mt-56">Loading...</h1>
  }

  if (user && user.role === "seller") {
    return <Restaurant />
  }

  if (user && user.role === "rider") {
    return <RiderDashboard />
  }

  if (user && user.role === "admin") {
    return <Admin />
  }

  
  return (
    <>
      <BrowserRouter>

        <Navbar />
        <Routes>
          <Route element={<ProtectedRoute />} >
            <Route path='/' element={<Home />}></Route>
            <Route path='/paymentsuccess/:paymentId' element={<PaymentSuccess />}></Route>
            <Route path='/ordersuccess' element={<OrderSuccess />}></Route>
            <Route path='/orders' element={<Orders />}></Route>
            <Route path='/order/:id' element={<OrderPage />}></Route>
            <Route path="/checkout" element={<Checkout />}></Route>
            <Route path='/address' element={<AddAddressPage />}></Route>
            <Route path='/restaurant/:id' element={<RestaurantPage />}></Route>
            <Route path='/select-role' element={<SelectRole />}></Route>
            <Route path='/account' element={<Account />}></Route>
            <Route path='/cart' element={<Cart />}></Route>
          </Route>
          <Route element={<PublicRoute />} >
            <Route path='/login' element={<Login />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;