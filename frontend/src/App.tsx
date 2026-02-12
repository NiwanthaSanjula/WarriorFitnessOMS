import { Route, Routes } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import PortalLayout from "./layouts/PortalLayout"


// Simple placeholder pages for now
const Home = () => <div>Landing page</div>
const Login = () => <div>Login page</div>
const Dashboard = () => <div>User Dashboard</div>

const App = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES (No login required) */}
      <Route element={<PublicLayout/>}>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login/>} />
      </Route>

      {/* PROTECTED ROUTES (Login required)*/}
      <Route element={<ProtectedRoute/>}>
        <Route element={<PortalLayout/>}>
          <Route path="/dashboard" element={<Dashboard/>}/>

          {/* ADMIN ONLY ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={ <div>Admin Panel</div> } />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App;
