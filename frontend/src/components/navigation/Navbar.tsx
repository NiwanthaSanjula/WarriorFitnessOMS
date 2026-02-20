import { Link } from "react-router-dom"
import { assets } from "../../assets/assets"
import { useAuth } from "../../context/AuthContext"
import { MdDashboard, MdLogin } from "react-icons/md"



const Navbar = () => {

  const { user } = useAuth()

  //  Check if they are a fully active member (or admin/coach)
  const isActivated = user && user.status === 'active'

  return (
    <nav className="sticky top-0 z-50 bg-warrior-dark/80 backdrop-blur-xs border-b border-neutral-800 px-6 py-4 " >
      <div className="max-w-7xl mx-auto flex justify-between items-center ">

        {/*LOGO */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img src={assets.LOGO} alt="" className="w-8 md:w-12 lg:w-16" />
          <h3 className="text-xl md:text-3xl font-black italic uppercase text-warrior-red leading-7 ">
            WARRIOR <br /> <span className="text-white">FITNESS</span>
          </h3>
        </Link>

        

        {/* LINKS */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-warrior-orange transition-all duration-200" >
            HOME
          </Link>

          {isActivated && (
            <Link 
              to="/dashboard"
              className="text-sm flex items-center gap-2 font-bold bg-warrior-orange uppercase px-4 py-2 rounded-xl"
            > 
              <MdDashboard/>Dashboard
            </Link>
          )}

          {!user ? (
            <Link to="/login" className="flex items-center gap-2 bg-warrior-orange/20 text-warrior-orange border border-warrior-orange/40 px-4 py-2 rounded-lg text-sm font-bold uppercase shadow-md hover:shadow-warrior-orange/80 hover:scale-105 transition-all duration-300" >
              <MdLogin/> LOGIN
            </Link>
          ) : (
            <Link to="/profile" className="text-sm font-bold uppercase px-3 py-2 rounded-full text-white border border-warrior-orange">
              {user.name.charAt(0)}
            </Link>
          )}
        </div>


      </div> 
    </nav>
  )
}

export default Navbar
