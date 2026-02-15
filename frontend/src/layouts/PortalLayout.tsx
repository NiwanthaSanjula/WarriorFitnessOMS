import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { MdMenu } from "react-icons/md";


const PortalLayout = () => {

  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-warrior-dark overflow-hidden">
        {/* SIDEBAR: Desktop (fixed) & Mibile (Slide-in) */}
        <div
          className={` fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform
                      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex`}
        >
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* OVERLAY */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}


       <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-20 border-b border-neutral-700 flex items-center justify-between px-8 bg-warrior-dark/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-gray-400 p-2 hover:text-warrior-orange transition-colors cursor-pointer md:hidden"
                >
                  <MdMenu size={32} />
                </button>

                <div>
                  <div className="text-sm md:text-xl font-bold uppercase tracking-tight flex flex-col md:flex-row md:gap-2">
                    <h2 className=" text-gray-400">Welcome Back,</h2>
                    <h2 className="text-warrior-orange">{user?.name}</h2>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {user?.role} portal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* We can add notifications or profile mini-avatar here later */}
                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center text-warrior-orange font-bold text-2xl">
                  {user?.name.charAt(0)}
                </div>
              </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-8 bg-linear-to-r from-neutral-900 to-neutral-950">
            <Outlet/>
          </main>
       </div>
    </div>
  )
}

export default PortalLayout
