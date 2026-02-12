export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'coach' | 'member';
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