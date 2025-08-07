import React from 'react'
import {Signup, Login, Button} from "./Components/index"
import { Outlet, Link } from 'react-router-dom'


const App = () => {
  return (
    <div>
      <Link to={"/signup"}>Signup</Link>

      <Link to={"/login"}>Login</Link>
      <Outlet />
    </div>
  );
}

export default App
