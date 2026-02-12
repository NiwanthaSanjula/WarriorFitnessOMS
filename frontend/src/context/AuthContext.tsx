import React, { createContext, useContext, useState, useEffect} from 'react';
import { authService } from '../services/authService';
import type { loginData, User } from '../types/auth';

//TypeScript’s way of defining the shape of the context.
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: loginData) => Promise<void>;
    logout: () => void;
}

// Context default is undefined because it will only get a real value inside <AuthProvider>.
// If someone uses useAuth() outside the provider, we can detect it and throw an error.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // When the app loads, check if there is a valid cookie
    useEffect(() => {
      const checkUser = async () => {
        try {
            const res = await authService.getMe();
            setUser(res.data.user);

        } catch (error) {
            setUser(null);
            console.log(error);

        } finally {
            setLoading(false)
        }
      };
      checkUser();

    }, []);

    const login = async (data: loginData) => {
        const res = await authService.login(data);
        setUser(res.data.user);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout}}>
            { children }
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider"); 
}