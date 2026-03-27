import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from './pages/Login';
import Home from './pages/Home';
import { Toaster } from "react-hot-toast"
import ProtectedRoute from './components/protectedRoute';
import PublicRoute from './components/publicRoute';
import SelectRole from './pages/SelectRole';
import Navbar from "./components/Navbar"
import Account from './pages/Account';
import Cart from './pages/Cart';
import { useAppData } from './context/AppContext';
import Restaurant from './pages/Restaurant';
import RestaurantPage from "./pages/RestaurantPage";


const App = () => {
  const { user } = useAppData();

  if (user && user.role === "seller") {
    return <Restaurant />
  }
  return (
    <>
      <BrowserRouter>

        <Navbar />
        <Routes>
          <Route element={<ProtectedRoute />} >
            <Route path='/' element={<Home />}></Route>
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