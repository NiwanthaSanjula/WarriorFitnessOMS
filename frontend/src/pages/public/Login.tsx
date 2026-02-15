import { useState } from "react"
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import axios from "axios";
import { assets } from "../../assets/assets";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false)
 
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Call the login function from context
            await login({ email, password});

            //  On success, navigate to dashboard
            navigate('/dashboard');

        } catch (error: unknown) {
            //  Handle backend errors (e.g. invalid credentials)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Login failed. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-warrior-dark">
            <div className="max-w-md border border-neutral-700 w-full space-y-4 p-8 bg-warrior-grey rounded-xl">
                <div className="w-full flex items-center justify-center">
                    <img src={assets.LOGO} alt="" className="w-20" />
                </div>

                <h2 className="text-3xl text-white italic font-bold text-center">
                    <span className="text-warrior-red">WARRIOR </span>FITENSS
                </h2>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/75 text-red-600 p-3 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input 
                            type="email" 
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                         <Input 
                            type="password" 
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button
                        type="submit"
                        loading = {isSubmitting}
                    >
                        SIGN IN
                    </Button>
                </form>
            </div>
        </div>
  );
};

export default Login
