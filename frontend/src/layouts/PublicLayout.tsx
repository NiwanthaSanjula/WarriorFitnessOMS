import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-warrior-dark text-gray-300">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer/>
        </div>
    );
};

export default PublicLayout;