import React from 'react';
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


const App = () => {
  return (
    <>
      <BrowserRouter>
        
        <Navbar/>
        <Routes>
          <Route element={<ProtectedRoute/>} >
            <Route path='/' element={<Home />}></Route>
            <Route path='/select-role' element={<SelectRole />}></Route>
            <Route path='/account' element={<Account />}></Route>
            <Route path='/cart' element={<Cart/>}></Route>
          </Route>
          <Route element={<PublicRoute/>} >
            <Route path='/login' element={<Login />}></Route>
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  )
}

export default App;