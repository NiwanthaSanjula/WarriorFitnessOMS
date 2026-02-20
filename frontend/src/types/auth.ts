export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'coach' | 'member';
    status: string
    isCheckedIn?: boolean;
    createdAt: string;
    coach?: {
        _id: string;
        name: string;
        email: string;
    } | string
}

export interface loginData {
    email : string;
    password? : string;
}

export interface AuthResponse {
    status: string;
    message?: string;
    data: {
        user: User;
    };
};

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: loginData) => Promise<void>;
    logout: () => void;
}