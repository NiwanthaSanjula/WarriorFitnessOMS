import { Route, Routes } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import PortalLayout from "./layouts/PortalLayout"
import Login from "./pages/public/Login"
import Dashboard from "./pages/Dashboard"
import ManageUsers from "./pages/admin/ManageUsers"
import UserDetails from "./pages/UserDetails"
import MyClients from "./pages/coach/MyClients"
import ManagePlans from "./pages/admin/ManagePlans"
import Home from "./pages/public/Home"
import AddNewMember from "./pages/admin/AddNewMember"
import Profile from "./pages/Profile"



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
          <Route path="/profile" element={<Profile/>}/>

          {/* COACH ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['coach']}/>}>
              <Route path="/coach/my-clients"  element={<MyClients/>} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/members" element={ <ManageUsers roleFilter="member"/> } />
            <Route path="/admin/coaches" element={ <ManageUsers roleFilter="coach"/> } />
            <Route path="/admin/members/:id" element={ <UserDetails/> } />
            <Route path="/admin/plans" element={ <ManagePlans/> } />
            <Route path="/admin/add-member" element={ <AddNewMember/> } />
            <Route path="/admin/members/edit/:id" element={ <AddNewMember/> } />

          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App;
