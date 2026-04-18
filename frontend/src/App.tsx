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
import Progress from "./pages/member/Progress"
import CoachMemberProfile from "./pages/coach/CoachMemberProfile"
import WorkoutPlanForm from "./pages/coach/WorkoutPlanForm"
import NutritionPlanForm from "./pages/coach/NutritionPlanForm"
import WorkoutPlans from "./pages/coach/WorkoutPlans"
import NutritionPlans from "./pages/coach/NutritionPlans"
import MemberWorkoutPlan from "./pages/member/MemberWorkoutPlan"
import MemberNutritionPlan from "./pages/member/MemberNutritionPlan"
import MemberSubscription from "./pages/member/MemberSubscription"
import MemberAttendance from "./pages/member/MemberAttendance"
import FinancePage from "./pages/admin/FinancePage"
import ContentManager from "./pages/admin/ContentManager"






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

          {/* MEMBER ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['member']}/>}>
              <Route path="/my-progress" element={<Progress/>}/>
              <Route path="/member/workout-plan" element={<MemberWorkoutPlan />} />
              <Route path="/member/nutrition-plan" element={<MemberNutritionPlan />} />
              <Route path="/member/membership" element={<MemberSubscription />} />
              <Route path="/member/attendance" element={<MemberAttendance />} />
          </Route>

          {/* COACH ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['coach']}/>}>
            <Route path="/coach/my-clients"  element={<MyClients/>} />
            <Route path="/coach/members/:memberId" element={<CoachMemberProfile/>} />
            <Route path="/coach/plans/workout" element={<WorkoutPlans />} />
            <Route path="/coach/plans/workout/new" element={<WorkoutPlanForm />} />
            <Route path="/coach/plans/workout/:planId/edit" element={<WorkoutPlanForm />} />
            <Route path="/coach/plans/nutrition" element={<NutritionPlans />} />
            <Route path="/coach/plans/nutrition/new" element={<NutritionPlanForm />} />
            <Route path="/coach/plans/nutrition/:planId/edit" element={<NutritionPlanForm />} />
        </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/members" element={ <ManageUsers roleFilter="member"/> } />
            <Route path="/admin/coaches" element={ <ManageUsers roleFilter="coach"/> } />
            <Route path="/admin/members/:id" element={ <UserDetails/> } />
            <Route path="/admin/plans" element={ <ManagePlans/> } />
            <Route path="/admin/add-member" element={ <AddNewMember/> } />
            <Route path="/admin/members/edit/:id" element={ <AddNewMember/> } />
            <Route path="admin/payments" element={<FinancePage />} />
            <Route path="admin/content-manager" element={<ContentManager />} />

          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App;
