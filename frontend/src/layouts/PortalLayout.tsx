import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";


const PortalLayout = () => {
  return (
    <div className="flex h-screen bg-warrior-dark overflow-hidden">
        {/* Sidebar - hide on mobile, show in md screens */}
        <div className="hidden md:flex md:w-64 flex-col">
            <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 w-full overflow-y-auto">
            {/* Mobile header here */}
            <main className="p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default PortalLayout
