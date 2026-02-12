import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";


const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warrior-dark text-gray-300">
      <Navbar/>
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer here */}
    </div>
  )
}

export default PublicLayout

