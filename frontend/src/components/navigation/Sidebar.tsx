import { Link, NavLink } from "react-router-dom";
import { SIDEBAR_LINKS } from "../../constants/navigation";
import { useAuth } from "../../context/AuthContext"
import { MdClose, MdLogout } from "react-icons/md";
import { assets } from "../../assets/assets";

interface SidebarProps {
    onClose?: () => void; // Function to close sidebar on mobile
}

const Sidebar = ({ onClose }: SidebarProps) => {

    const { user, logout } = useAuth();

    const filteredLinks = SIDEBAR_LINKS.filter(link => user?.role && link.roles.includes(user.role));
    
    return (
        <aside className="w-72 bg-warrior-grey h-full flex flex-col border-r border-warrior-orange/50  shadow-lg md:shadow-none shadow-warrior-orange/90">
            
            {/* Mobile close button */}
            <div className="p-4 flex justify-end md:hidden">
                <button 
                    onClick={onClose}
                    className="text-gray-400 border rounded hover:text-warrior-orange transition-colors cursor-pointer"
                >
                    <MdClose size={28} />
                </button>
            </div>

            
            <Link to="/" className="p-4 mb-4 flex items-center justify-start gap-3">
                <div className="w-14">
                    <img src={assets.LOGO} alt="" className="w-full h-full object-cover" />
                </div>

                <h1 className="text-warrior-red text-3xl font-bold italic">
                    WARRIOR <br /> <span className="text-white">FITNESS</span>
                </h1>
            </Link>

            <nav className="flex-1 px-4 space-y-1">
                {filteredLinks.map((link) => (
                    <NavLink 
                        key={link.path}
                        to={link.path}
                        onClick={onClose}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                            ${isActive 
                                ? 'bg-warrior-orange text-white shadow-md shadow-warrior-orange/20 scale-105'
                                : 'text-gray-300 hover:bg-neutral-700 hover:text-white hover:scale-105'
                            }
                        `}
                    >
                        <link.icon size={22} />
                        <span className="font-medium">{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t w-full border-neutral-700 flex items-center justify-center">
                <button
                    onClick={logout}
                    className="w-fit  flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                    <MdLogout size={22}/>
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>

        </aside>
    )
}

export default Sidebar
